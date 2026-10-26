import type { ViewLevel } from '@/domain';

let level: ViewLevel = 'V1';

/**
 * The view the user had open. It survives a session expiry, so that signing in again returns to
 * the same view (SDD FR-04). It is cleared on sign-out.
 */
export const viewStore = {
  get: (): ViewLevel => level,
  set(next: ViewLevel): void {
    level = next;
  },
  clear(): void {
    level = 'V1';
  },
};
