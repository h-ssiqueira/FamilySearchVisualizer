# Authentication and authorization

## 1. Overview
Two sequential sign-ins, both in the browser:

| Step | Provider | Protocol | Purpose |
|------|----------|----------|---------|
| 1 | Google | OAuth2 / OIDC (Google Identity Services) | User authentication (mechanism: **OQ-01**, see section 2) |
| 2 | FamilySearch | OAuth2 authorization code + PKCE | Obtain an access token to read the user's tree |

## 2. Purpose of step 1 and a technical caveat
**Author's intent (OQ-01):** the Google login authenticates the user so that the app can integrate with the APIs and retrieve information.

**Caveat:** FamilySearch's API authorizes calls only with a **FamilySearch access token** (step 2). A Google credential cannot be exchanged for it by the app, and the app has no backend that could do such an exchange. So there are two ways to meet the intent:

| Option | How | Consequence |
|--------|-----|-------------|
| (a) Google as a sign-in method *on FamilySearch's own login page* | The app only runs the FamilySearch flow; the user may choose Google there (*to verify that FamilySearch offers this for the account type*) | Simplest and the most robust: one OAuth flow, one token, no Google client to maintain |
| (b) Separate Google sign-in inside the app, before the FamilySearch flow | As drawn in diagram 2 | Google gives identity only; it adds a second login and cannot protect data, because checks run in the visitor's browser and can be bypassed |

Recommendation: confirm (a) with the spike; keep (b) only if the app needs to know the Google identity (e.g. for future per-user settings). Until decided, the SDD keeps (b) as the working design.

## 3. FamilySearch OAuth2 + PKCE
- **Authorization endpoint**: `https://ident.familysearch.org/cis-web/oauth2/v3/authorization` (beta: `identbeta.familysearch.org`).
- **Token endpoint**: `https://identbeta.familysearch.org/cis-web/oauth2/v3/token` is documented for all environments; confirm the production host in the spike.
- **Request parameters**: `response_type=code`, `client_id` (the developer key), `redirect_uri` (must be pre-registered), `state`, `code_challenge`, `code_challenge_method=S256`, `scope` (documented examples use `openid`; confirm the minimum scope).
- **Token exchange**: `client_id`, `code`, `code_verifier` (+ `redirect_uri`); no client secret exists in this app.
- **Prerequisites**: developer key; redirect URIs registered by FamilySearch developer support — one for GitHub Pages, one for local development, one for the beta environment (OQ-07, OQ-12).

Sources: FamilySearch developer docs — Authorization Code Flow; Authorization resource; Access Token resource.

## 4. Token and state handling
| Item | Storage | Lifetime |
|------|---------|----------|
| `code_verifier`, `state` | `sessionStorage` | Until the redirect returns, then deleted |
| FamilySearch access token | JS memory only (ADR-07) | Tab session; lost on reload → silent re-login |
| Google credential | JS memory | Tab session |
| Family data cache | JS memory | Tab session; wiped on logout |

- `state` is random (CSPRNG), single-use, compared on return.
- Tokens are never placed in URLs, logs or error messages.
- After the redirect the URL is cleaned (`history.replaceState`) so the `code` is not left in history.
- `client_id` (developer key) is public by design and can live in the repository; no secret may ever be committed.

## 5. Authorization model
- Single role: **the signed-in FamilySearch user**. The app is read-only; FamilySearch decides which persons are visible (living or restricted persons may return 403/404 → rendered as "unavailable").
- No application-level roles, no admin, no server-side sessions.
- Only `GET` requests are issued to FamilySearch (enforced in the API client).

## 6. Open points
- Token lifetime / refresh for public clients (verify in the spike).
- Whether Google sign-in is a separate in-app step or part of FamilySearch's login page (OQ-01).
