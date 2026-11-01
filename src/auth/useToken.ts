import { useSyncExternalStore } from 'react';
import { tokenStore } from './tokenStore';

export function useToken(): string | null {
  return useSyncExternalStore(tokenStore.subscribe, tokenStore.get, tokenStore.get);
}
