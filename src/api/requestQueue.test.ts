import { afterEach, describe, expect, it, vi } from 'vitest';
import { RetryAfterError } from './errors';
import { RequestQueue } from './requestQueue';

afterEach(() => {
  vi.useRealTimers();
});

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

describe('RequestQueue', () => {
  it('never runs more tasks than the concurrency limit (TC-41)', async () => {
    const queue = new RequestQueue({ concurrency: 2 });
    const gates = Array.from({ length: 5 }, () => deferred<void>());
    let active = 0;
    let peak = 0;

    const results = gates.map((gate) =>
      queue.enqueue(async () => {
        active += 1;
        peak = Math.max(peak, active);
        await gate.promise;
        active -= 1;
        return 'done';
      }),
    );

    expect(queue.inFlight).toBe(2);
    gates.forEach((gate) => gate.resolve());
    await expect(Promise.all(results)).resolves.toEqual(Array(5).fill('done'));
    expect(peak).toBe(2);
    expect(queue.inFlight).toBe(0);
  });

  it('rejects a task whose signal is already aborted (TC-44)', async () => {
    const queue = new RequestQueue();
    const controller = new AbortController();
    controller.abort();
    const task = vi.fn(async () => 'x');
    await expect(queue.enqueue(task, controller.signal)).rejects.toMatchObject({
      name: 'AbortError',
    });
    expect(task).not.toHaveBeenCalled();
  });

  it('drops a waiting task that is aborted before it starts (TC-44)', async () => {
    const queue = new RequestQueue({ concurrency: 1 });
    const gate = deferred<void>();
    const first = queue.enqueue(async () => {
      await gate.promise;
      return 'first';
    });
    const controller = new AbortController();
    const secondTask = vi.fn(async () => 'second');
    const second = queue.enqueue(secondTask, controller.signal);

    controller.abort();
    gate.resolve();

    await expect(first).resolves.toBe('first');
    await expect(second).rejects.toMatchObject({ name: 'AbortError' });
    expect(secondTask).not.toHaveBeenCalled();
  });

  it('passes the abort signal to a running task', async () => {
    const queue = new RequestQueue();
    const controller = new AbortController();
    let received: AbortSignal | undefined;
    await queue.enqueue(async (signal) => {
      received = signal;
    }, controller.signal);
    expect(received).toBe(controller.signal);
  });

  it('pauses the whole queue for Retry-After and then retries (TC-40)', async () => {
    vi.useFakeTimers();
    const queue = new RequestQueue({ concurrency: 2, maxRetries: 2 });
    const throttled = vi
      .fn<() => Promise<string>>()
      .mockRejectedValueOnce(new RetryAfterError(5_000))
      .mockResolvedValue('ok');
    const other = vi.fn(async () => 'other');

    const first = queue.enqueue(throttled);
    await vi.advanceTimersByTimeAsync(0);
    // The queue is now paused: a task enqueued during the pause must wait too.
    const second = queue.enqueue(other);

    await vi.advanceTimersByTimeAsync(4_999);
    expect(throttled).toHaveBeenCalledTimes(1);
    expect(other).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1);
    await expect(first).resolves.toBe('ok');
    await expect(second).resolves.toBe('other');
    expect(throttled).toHaveBeenCalledTimes(2);
  });

  it('gives up after the maximum number of retries', async () => {
    vi.useFakeTimers();
    const queue = new RequestQueue({ maxRetries: 1 });
    const task = vi.fn<() => Promise<string>>().mockRejectedValue(new RetryAfterError(1_000));

    const result = queue.enqueue(task);
    const settled = expect(result).rejects.toBeInstanceOf(RetryAfterError);
    await vi.advanceTimersByTimeAsync(1_000);
    await settled;
    expect(task).toHaveBeenCalledTimes(2);
  });

  it('passes other errors through without retrying', async () => {
    const queue = new RequestQueue();
    const failure = new Error('boom');
    const task = vi.fn<() => Promise<string>>().mockRejectedValue(failure);
    await expect(queue.enqueue(task)).rejects.toBe(failure);
    expect(task).toHaveBeenCalledTimes(1);
  });
});
