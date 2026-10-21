let token: string | null = null;
const listeners = new Set<() => void>();

function emit(): void {
  listeners.forEach((listener) => listener());
}

/**
 * The FamilySearch session token lives here, in memory only (SDD ADR-07, NFR-04).
 * It is the full session of the user's account: never log it, never persist it.
 */
export const tokenStore = {
  get: (): string | null => token,
  set(value: string): boolean {
    const trimmed = value.trim();
    if (trimmed === '') return false;
    token = trimmed;
    emit();
    return true;
  },
  clear(): void {
    if (token === null) return;
    token = null;
    emit();
  },
  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};
