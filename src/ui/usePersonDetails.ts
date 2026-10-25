import { useEffect, useState } from 'react';
import type { Person, PersonRef, PersonSource } from '@/domain';

export type DetailsState =
  | { status: 'loading' }
  | { status: 'ready'; person: Person | PersonRef }
  | { status: 'unavailable' };

/**
 * The full details of a person: a full person is ready at once; a light one (relative of someone
 * else) is fetched through the cached source (SDD FR-18).
 */
export function usePersonDetails(person: Person | PersonRef, source: PersonSource): DetailsState {
  const [state, setState] = useState<DetailsState>(
    'parentSets' in person ? { status: 'ready', person } : { status: 'loading' },
  );

  useEffect(() => {
    if ('parentSets' in person) {
      setState({ status: 'ready', person });
      return;
    }
    const controller = new AbortController();
    setState({ status: 'loading' });
    source
      .getPerson(person.id, controller.signal)
      .then((full) => {
        if (controller.signal.aborted) return;
        setState(full ? { status: 'ready', person: full } : { status: 'unavailable' });
      })
      .catch(() => {
        if (!controller.signal.aborted) setState({ status: 'unavailable' });
      });
    return () => controller.abort();
  }, [person, source]);

  return state;
}
