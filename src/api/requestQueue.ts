import { RetryAfterError } from './errors';

export type QueueTask<T> = (signal: AbortSignal) => Promise<T>;

export interface QueueOptions {
  /** Maximum requests in flight (SDD FR-23, default 4). */
  concurrency?: number;
  /** How many times a throttled task is retried. */
  maxRetries?: number;
}

interface Job {
  run: QueueTask<unknown>;
  signal: AbortSignal | undefined;
  resolve: (value: unknown) => void;
  reject: (reason: unknown) => void;
  attempts: number;
}

const NEVER_ABORTED = new AbortController().signal;

function abortError(): DOMException {
  return new DOMException('The request was aborted', 'AbortError');
}

/**
 * Bounded concurrency, cancellation and `Retry-After` handling. Throttling is per user, so a
 * RetryAfterError pauses the whole queue, not only the task that hit it (SDD flow F5).
 */
export class RequestQueue {
  private readonly concurrency: number;
  private readonly maxRetries: number;
  private readonly pending: Job[] = [];
  private running = 0;
  private pausedUntil = 0;
  private timer: ReturnType<typeof setTimeout> | undefined;

  constructor(options: QueueOptions = {}) {
    this.concurrency = Math.max(1, options.concurrency ?? 4);
    this.maxRetries = Math.max(0, options.maxRetries ?? 3);
  }

  get inFlight(): number {
    return this.running;
  }

  enqueue<T>(task: QueueTask<T>, signal?: AbortSignal): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      if (signal?.aborted) {
        reject(abortError());
        return;
      }
      this.pending.push({
        run: task,
        signal,
        resolve: resolve as (value: unknown) => void,
        reject,
        attempts: 0,
      });
      this.pump();
    });
  }

  private pump(): void {
    const wait = this.pausedUntil - Date.now();
    if (wait > 0) {
      this.schedule(wait);
      return;
    }
    while (this.running < this.concurrency) {
      const job = this.pending.shift();
      if (!job) return;
      if (job.signal?.aborted) {
        job.reject(abortError());
        continue;
      }
      this.running += 1;
      void this.execute(job);
    }
  }

  private schedule(ms: number): void {
    if (this.timer !== undefined) clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.timer = undefined;
      this.pump();
    }, ms);
  }

  private async execute(job: Job): Promise<void> {
    try {
      job.resolve(await job.run(job.signal ?? NEVER_ABORTED));
    } catch (error) {
      if (error instanceof RetryAfterError && job.attempts < this.maxRetries) {
        job.attempts += 1;
        this.pausedUntil = Math.max(this.pausedUntil, Date.now() + error.retryAfterMs);
        this.pending.unshift(job);
      } else {
        job.reject(error);
      }
    } finally {
      this.running -= 1;
      this.pump();
    }
  }
}
