/* The relay script, as text, for the bookmarklet (SDD FR-34). */
import relaySource from '../../relay/fsv-relay.js?raw';

/** A `javascript:` link the user drags to the bookmarks bar; clicking it on familysearch.org starts the relay. */
export function bookmarkletHref(): string {
  return `javascript:${encodeURIComponent(relaySource)}`;
}
