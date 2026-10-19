# Authentication and authorization

## 1. Overview
**Decision (author, OQ-21):** the token is obtained as described in the first lines of `8-attachments/examples.md`: the user logs in with Google through FamilySearch's identity service at

`https://ident.familysearch.org/oauth2/authorization/google`

After the login the app holds the FamilySearch **session token** and sends it as `Authorization: Bearer <token>` to the two endpoints of the samples ([API findings](../4-design/6-api-findings.md), sections 1 and 2). The app has no Google client or SDK, no OAuth client id, no redirect URI to register and no PKCE code: the earlier OAuth2 + PKCE design is **superseded** by this decision.

## 2. Login flow
1. The user clicks "Sign in with Google (FamilySearch)".
2. The app sends the browser to the configured login address (`VITE_FS_LOGIN_URL`, default as above). It is a fixed, allow-listed address.
3. FamilySearch's identity service redirects to Google; the user authenticates; Google returns to FamilySearch; FamilySearch creates the session.
4. The app obtains the token (section 3).
5. The app calls `users/current` with the Bearer token to learn the person id of the user (root of the tree) and the preferred language.

Diagram: [authentication sequence](../3-architecture/2-diagrams.md).

## 3. Unverified: how the token reaches the SPA
The login address could not be opened for inspection (the site blocks automated access) and it is not part of FamilySearch's documented OAuth flow. In the samples the Bearer token has the same value as the website's session cookie, and a page on `github.io` cannot read cookies of `familysearch.org`. The SDD therefore **assumes** that the login yields a token the app can use, and the first spike must prove it: where the user lands after login, what the redirect carries, and whether any token is exposed to a page served from `github.io`.

If the spike shows the token cannot reach the SPA, the fallbacks are, in this order:
1. **Paste the token**: after logging in on familysearch.org the user copies the Bearer token and pastes it into the app (masked field, kept in memory only).
2. **Run on familysearch.org** (bookmarklet, user script or extension), where calls are same-origin.
3. **Small proxy** (reverses ADR-01).

Whatever the mechanism, the rules of section 4 apply.

## 4. Token handling
| Item | Storage | Lifetime |
|------|---------|----------|
| FamilySearch session token | JS memory only (ADR-07) | Tab session; lost on reload, the user logs in again |
| Family data cache | JS memory | Tab session; wiped on logout |
| UI language choice | `localStorage` (not sensitive) | Persistent |

- The token is **the full session of the user's account**: treat it like a password.
- Never put it in a URL, log, error message, `localStorage` or `sessionStorage`; never send it anywhere except to `www.familysearch.org`.
- If it arrives in the URL (query or fragment), remove it at once with `history.replaceState` (TC-08).
- A pasted token goes in a masked input and is cleared from the field after use.
- Show a short privacy notice on the login screen explaining that the token stays in the browser tab.

## 5. Authorization model
- Single role: **the signed-in FamilySearch user**. The app is read-only; FamilySearch decides which persons are visible (living or restricted persons may return 403/404 and are rendered as "unavailable").
- No application-level roles, no admin, no server-side sessions.
- Only `GET` requests are issued to FamilySearch (enforced in the API client).
- Logout clears memory in the app. It does not end the FamilySearch session; the user signs out on familysearch.org for that.

## 6. Risks and open points
- A leaked token gives access to the whole FamilySearch account (not only to read-only data): XSS must be prevented (security controls, section 2) and the token never stored.
- Token lifetime and expiry behaviour are unknown (401 handling, FR-04).
- Token intake mechanism: OQ-21, R-02, action A2.
