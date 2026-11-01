# Flows

## F1 – First visit and login
1. User opens the app → login screen with one "Sign in with Google (FamilySearch)" button and the privacy notice.
2. The app sends the browser to the configured login address; the user authenticates with Google at FamilySearch.
3. The app obtains the token (mechanism to verify in the spike, OQ-21), keeps it in memory only and removes any token from the URL.
4. App calls `users/current`, stores the `personId` as root, picks the UI language from `preferredLanguage` unless the user chose one, opens V1.
Diagram: [authentication sequence](../3-architecture/2-diagrams.md).

Failure paths: user cancels at Google/FamilySearch → stay on login; token not available → explain and offer the fallback decided after the spike (for example paste the token); 401 later → F6.

## F2 – Build and show V1
1. The first batch of generations loads automatically (proposed: 4).
2. `treeBuilder.build(root, "V1", { generations })` → generation-by-generation fetches (see algorithm in module design).
3. UI renders every emitted `ViewTree`; pending nodes show skeleton cards, with a progress indicator and a **Stop** control.
4. The user can choose "next generation" or "load all remaining" (unlimited depth); loading ends by itself when no more parents are known.

## F3 – Switch to V2 / V3
1. User selects V2 → builder reuses cached V1 data, adds children of every couple from already-loaded responses (no calls for names).
2. User selects V3 → builder queues details for each child (C requests), adds partners and their children as they arrive.
3. Switching back to V1 does not discard cache.

## F4 – Expand a card
Light node → request full details if not cached → show dates, places, marriages, link to familysearch.org.

## F5 – Throttling
Queue receives 429/503 → read `Retry-After` → pause **all** queued requests for that period (throttling is per user, not per request) → resume. Show "FamilySearch asked us to wait N s".

## F6 – Token expiry / logout
- 401 → mark session expired → login prompt, keep `rootId`, `view` and loaded generations in memory → after re-login, resume.
- Logout → clear the token, cache and view state from memory; return to the login screen.

## F7 – Cancel
Changing view/root, or pressing Stop, aborts in-flight requests (`AbortController`) and drops queued tasks; results of cancelled tasks are discarded.

## Open points
- Token lifetime and expiry behaviour: verify in the spike (R-02).
