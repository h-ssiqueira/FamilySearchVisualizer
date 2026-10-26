import { tokenStore } from '@/auth';
import { relayStore } from '@/relay/relayStore';
import { personCache } from './cache';

/** Clears the token, the cached family data and the relay connection (SDD FR-03, TC-06). */
export function signOut(): void {
  tokenStore.clear();
  personCache.clear();
  relayStore.disconnect();
}
