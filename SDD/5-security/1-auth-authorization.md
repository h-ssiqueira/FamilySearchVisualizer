# Authentication and authorization

## 1. Overview
The user signs in with Google through FamilySearch's identity service, at
`https://ident.familysearch.org/oauth2/authorization/google` (first lines of `8-attachments/examples.md`). The app has no Google client or SDK.

After that login the app needs the FamilySearch **session** to read the tree. Two ways reach it, in this order of preference:

1. **Relay (default, FR-34).** The app opens `https://www.familysearch.org/` in a window. The user clicks a bookmarklet on that tab. The bookmarklet runs `relay/fsv-relay.js` there, which answers the app's two read-only requests with the tab's own session, and only to the app's origin. The token never reaches the app.
2. **Bearer token (fallback, FR-02).** The user pastes a bearer token into the sign-in screen. It is kept in memory only.

## 2. Login flow (relay)
1. The user clicks "Open FamilySearch and connect". The app opens the FamilySearch window and starts a handshake (`hello`) with `postMessage`, to `https://www.familysearch.org` only.
2. The user signs in there if needed, then clicks the bookmarklet once on that tab.
3. The relay answers `ready`. The app then calls `users/current` and the person endpoints through the relay.
4. If the tab is closed or stops answering, the app says so and asks the user to connect again.

Opening the window is done inside the click, so the browser does not block it.

## 3. What was established by testing
- Logging in on familysearch.org ends on `https://www.familysearch.org/pt/home/portal/`: the login creates a session on FamilySearch and does **not** hand a token to the app. The earlier assumption (the token arrives through the redirect) is closed.
- Whether the session cookie alone authorises the two endpoints, and whether `www.familysearch.org` accepts calls from `github.io` directly, is still to be checked. The relay avoids the second question entirely, because the calls are made from familysearch.org.

## 4. Relay security
- Accepts messages only from `window.opener`, only from the listed app origins, and replies only to that origin.
- Answers only `GET` requests for the two endpoints of `examples.md` (the same list as the app, checked by a test). Anything else gets `403`.
- Keeps nothing: each reply is passed on and forgotten. The bookmarklet adds no UI to the FamilySearch page.
- Risk: the bookmarklet is code the user chooses to run on familysearch.org. It is short, in the repository (`relay/fsv-relay.js`), and can be read before installing.

## 5. Token handling (fallback and relay)
| Item | Storage | Lifetime |
|------|---------|----------|
| Pasted bearer token | JS memory only (ADR-07) | Tab session |
| Relay connection | JS memory only | Until the tab closes or the user signs out |
| Family data cache | JS memory | Tab session; wiped on sign-out |
| UI language choice | `localStorage` (not sensitive) | Persistent |

- The token is the whole session of the user's account: never put it in a URL, a log, an error message or browser storage, and send it only to `www.familysearch.org`.
- A pasted token is cleared from the field once used; `Bearer ` in front of it is accepted and removed.
- URL scrubbing (`scrubUrl`) removes any token-like parameter that arrives in the address before the router starts (TC-08).

## 6. Authorization model
- Single role: the signed-in FamilySearch user. The app is read-only; FamilySearch decides which persons are visible (restricted persons return 403/404 and are shown as "no data").
- Only `GET` requests, only to the endpoints of the allow-list (NFR-11, TC-60).
- Sign-out clears memory and closes the relay connection. It does not end the FamilySearch session; that is done on familysearch.org.

## 7. Open points
- Token lifetime and expiry: the relay will show `401` as a session end, which asks the user to connect again.
- Whether a page on `github.io` can call `www.familysearch.org` directly (CORS): not needed while the relay is used.
