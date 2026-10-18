# Flows

## F1 – First visit and login
1. User opens the app → login screen with one "Sign in with FamilySearch" button.
2. App creates PKCE verifier, challenge and `state`, stores verifier/state in `sessionStorage`, redirects to FamilySearch authorization. On FamilySearch's page the user signs in with a FamilySearch account or chooses Google.
3. FamilySearch redirects back with `code` and `state`; the app verifies `state`, exchanges the code (with `code_verifier`) for an access token, removes `code`/`state` from the URL, clears verifier/state from storage.
4. App calls `users/current`, stores the `personId` as root, opens V1.
Diagram: [authentication sequence](../3-architecture/2-diagrams.md).

Failure paths: user cancels on FamilySearch's page → stay on login; `state` mismatch → abort with error; user denies consent → show "access required"; token exchange fails → retry login.

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
- Logout → clear tokens, cache, view state, `sessionStorage`; return to the login screen.

## F7 – Cancel
Changing view/root, or pressing Stop, aborts in-flight requests (`AbortController`) and drops queued tasks; results of cancelled tasks are discarded.

## Open points
- Token lifetime and whether a refresh mechanism exists for public clients: verify in the spike (R-02).
