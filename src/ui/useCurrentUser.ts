import { useEffect, useState } from 'react';
import type { FamilySearchClient } from '@/api';
import type { CurrentUser } from '@/domain';

export type CurrentUserState =
  | { status: 'loading' }
  | { status: 'ready'; user: CurrentUser }
  | { status: 'error'; error: unknown };

/** Loads `users/current`: its person id is the root of the tree (SDD FR-05). */
export function useCurrentUser(client: FamilySearchClient): CurrentUserState {
  const [state, setState] = useState<CurrentUserState>({ status: 'loading' });

  useEffect(() => {
    const controller = new AbortController();
    setState({ status: 'loading' });
    client
      .getCurrentUser(controller.signal)
      .then((user) => {
        if (!controller.signal.aborted) setState({ status: 'ready', user });
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setState({ status: 'error', error });
      });
    return () => controller.abort();
  }, [client]);

  return state;
}
