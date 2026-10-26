import { describe, expect, it, vi } from 'vitest';
import { RetryAfterError } from './errors';
import { RequestQueue } from './requestQueue';

describe('RequestQueue waiting (FR-09)', () => {
  it('exposes the pause and notifies when it starts and when it ends', async () => {
    vi.useFakeTimers();
    try {
      const queue = new RequestQueue({ concurrency: 1, maxRetries: 1 });
      const seen: number[] = [];
      queue.subscribe(() => seen.push(queue.waitingUntil));
      const task = vi
        .fn<() => Promise<string>>()
        .mockRejectedValueOnce(new RetryAfterError(3000))
        .mockResolvedValue('ok');

      const result = queue.enqueue(task);
      await vi.advanceTimersByTimeAsync(0);
      expect(queue.waitingUntil).toBeGreaterThan(Date.now());

      await vi.advanceTimersByTimeAsync(3000);
      await expect(result).resolves.toBe('ok');
      expect(queue.waitingUntil).toBe(0);
      expect(seen[0]).toBeGreaterThan(0);
      expect(seen.at(-1)).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });

  it('reports no pause when nothing was throttled', async () => {
    const queue = new RequestQueue();
    await queue.enqueue(async () => 'ok');
    expect(queue.waitingUntil).toBe(0);
  });
});
