import { tokenStore } from '@/auth';
import { relayStore } from '@/relay/relayStore';
import { personCache } from './cache';
import { viewStore } from './viewStore';

let expired = false;

/** True after the FamilySearch session ended on its own (401), until the user signs out. */
export function isSessionExpired(): boolean {
  return expired;
}

/**
 * The FamilySearch session ended (SDD FR-04). The token and the relay go, but the loaded tree and
 * the open view stay in memory, so signing in again returns to the same view.
 */
export function expireSession(): void {
  tokenStore.clear();
  relayStore.disconnect();
  expired = true;
}

/** Explicit sign-out: everything from this session is wiped (SDD FR-03, TC-06). */
export function signOut(): void {
  tokenStore.clear();
  personCache.clear();
  relayStore.disconnect();
  viewStore.clear();
  expired = false;
}
