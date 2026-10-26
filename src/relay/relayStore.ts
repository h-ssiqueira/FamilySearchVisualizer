import { useSyncExternalStore } from 'react';
import {
  connectRelay,
  RelayClosedError,
  RelayUnavailableError,
  type RelayConnection,
  type RelayOptions,
} from './relayClient';

export type RelayFailure = 'popup' | 'timeout' | 'closed' | 'unknown';

export type RelayState =
  | { status: 'idle' }
  | { status: 'connecting' }
  | { status: 'connected'; connection: RelayConnection }
  | { status: 'failed'; reason: RelayFailure };

let state: RelayState = { status: 'idle' };
let attempt = 0;
const listeners = new Set<() => void>();

function setState(next: RelayState): void {
  state = next;
  listeners.forEach((listener) => listener());
}

function reasonOf(error: unknown): RelayFailure {
  if (error instanceof RelayUnavailableError) return error.reason;
  if (error instanceof RelayClosedError) return 'closed';
  return 'unknown';
}

/**
 * The relay connection of the app, as a store: the sign-in screen starts it from a click and the
 * signed-in screen uses its `fetch`. Only one attempt is live at a time.
 */
export const relayStore = {
  get: (): RelayState => state,
  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  /** Must be called from a click: the FamilySearch window is opened synchronously. */
  connect(options?: RelayOptions): void {
    if (state.status === 'connecting' || state.status === 'connected') return;
    attempt += 1;
    const current = attempt;
    setState({ status: 'connecting' });
    connectRelay(options).then(
      (connection) => {
        if (current !== attempt) {
          connection.close();
          return;
        }
        connection.onClose(() => {
          if (current === attempt && state.status === 'connected') {
            setState({ status: 'failed', reason: 'closed' });
          }
        });
        setState({ status: 'connected', connection });
      },
      (error: unknown) => {
        if (current !== attempt) return;
        setState({ status: 'failed', reason: reasonOf(error) });
      },
    );
  },
  disconnect(): void {
    attempt += 1;
    const previous = state;
    setState({ status: 'idle' });
    if (previous.status === 'connected') previous.connection.close();
  },
};

export function useRelayState(): RelayState {
  return useSyncExternalStore(relayStore.subscribe, relayStore.get, relayStore.get);
}
