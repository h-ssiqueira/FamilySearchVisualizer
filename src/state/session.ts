import { tokenStore } from '@/auth';
import { personCache } from './cache';

/** Clears the token and every cached family datum from memory (SDD FR-03, TC-06). */
export function signOut(): void {
  tokenStore.clear();
  personCache.clear();
}
