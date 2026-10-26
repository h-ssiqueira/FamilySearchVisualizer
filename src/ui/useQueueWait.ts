import { useEffect, useState } from 'react';
import type { RequestQueue } from '@/api';

/** Whole seconds left before the queue resumes after FamilySearch asked to wait (SDD FR-09). */
export function useQueueWait(queue: RequestQueue | undefined): number {
  const [until, setUntil] = useState(() => queue?.waitingUntil ?? 0);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!queue) return undefined;
    setUntil(queue.waitingUntil);
    return queue.subscribe(() => {
      setUntil(queue.waitingUntil);
      setNow(Date.now());
    });
  }, [queue]);

  useEffect(() => {
    if (until <= Date.now()) return undefined;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [until]);

  return Math.max(0, Math.ceil((until - now) / 1000));
}
