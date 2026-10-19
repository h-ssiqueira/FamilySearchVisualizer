# Authentication and authorization

## 1. Overview
**One sign-in, on FamilySearch's own page.** The app redirects the browser to FamilySearch's authorization endpoint (OAuth2 authorization code + PKCE). On that page the user signs in with a FamilySearch account or, if offered, with Google. FamilySearch then returns an authorization code that the app exchanges for the access token required by the API.

## 2. Google
- Google is only an identity provider **inside FamilySearch's login flow**. The app does not integrate with Google: no Google client, no Google SDK, no Google credential in the browser (ADR-03, OQ-01 resolved).
- The author supplied the address `https://ident.familysearch.org/oauth2/authorization/google`. It could not be inspected (the site blocks automated access) and it is not part of the documented OAuth flow. The app should **not** call it directly: starting at the documented authorization endpoint lets the user pick Google on FamilySearch's page and guarantees the code/token return to the app.
- To verify during the spike: that the Google option is shown for the user's account type.

## 3. FamilySearch OAuth2 + PKCE
- **Authorization endpoint**: `https://ident.familysearch.org/cis-web/oauth2/v3/authorization` (beta: `identbeta.familysearch.org`).
- **Token endpoint**: `https://identbeta.familysearch.org/cis-web/oauth2/v3/token` is documented for all environments; confirm the production host in the spike.
- **Request parameters**: `response_type=code`, `client_id`, `redirect_uri` (must match the configured value), `state`, `code_challenge`, `code_challenge_method=S256`, `scope` (documented examples use `openid`; confirm the minimum scope).
- **Token exchange**: `client_id`, `code`, `code_verifier` (+ `redirect_uri`); no client secret exists in this app.
- **Configuration**: `client_id` and the redirect URIs (GitHub Pages, local development) are build-time settings (OQ-12); how they are obtained is out of scope of this SDD.

Sources: FamilySearch developer docs — Authorization Code Flow; Authorization resource; Access Token resource.

## 4. Token and state handling
| Item | Storage | Lifetime |
|------|---------|----------|
| `code_verifier`, `state` | `sessionStorage` | Until the redirect returns, then deleted |
| FamilySearch access token | JS memory only (ADR-07) | Tab session; lost on reload → silent re-login |
| Family data cache | JS memory | Tab session; wiped on logout |

- `state` is random (CSPRNG), single-use, compared on return.
- Tokens are never placed in URLs, logs or error messages.
- After the redirect the URL is cleaned (`history.replaceState`) so the `code` is not left in history.
- `client_id` is public by design and can live in the repository; no secret may ever be committed.

## 5. Authorization model
- Single role: **the signed-in FamilySearch user**. The app is read-only; FamilySearch decides which persons are visible (living or restricted persons may return 403/404 → rendered as "unavailable").
- No application-level roles, no admin, no server-side sessions.
- Only `GET` requests are issued to FamilySearch (enforced in the API client).

## 6. Open points
- Token lifetime / refresh for public clients (verify in the spike).
