# Authentication and authorization

## 1. Overview
**One sign-in, on FamilySearch's own page.** The app redirects the browser to FamilySearch's authorization endpoint (OAuth2 authorization code + PKCE). On that page the user signs in with a FamilySearch account or, if offered, with Google. FamilySearch then returns an authorization code that the app exchanges for the access token required by the API.

## 2. Google
- Google is only an identity provider **inside FamilySearch's login flow**. The app does not integrate with Google: no Google client, no Google SDK, no Google credential in the browser (ADR-03, OQ-01 resolved).
- The author supplied the address `https://ident.familysearch.org/oauth2/authorization/google`. It could not be inspected (the site blocks automated access) and it is not part of the documented OAuth flow. The app should **not** call it directly: starting at the documented authorization endpoint lets the user pick Google on FamilySearch's page and guarantees the code/token return to the app.
- To verify in the sandbox: that the Google option is shown for the user's account type.

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
- Whether a public (secret-less) client type exists: newer FamilySearch developer pages mention a client ID **and client secret**, which a browser app cannot keep (OQ-14).

## 7. Getting an app key (prerequisite, R-04)
Based on the FamilySearch developer guides:
1. **Developer account.** Creating it gives access to the **integration** (sandbox) environment, which holds test data. A separate app key is needed for each type of app.
2. **Register the app** and its redirect URIs (localhost and the GitHub Pages URL). Redirect URIs must be pre-registered by FamilySearch.
3. **Beta and production keys** need the *compatibility review*: signed agreements (compatible product affiliate agreement, security assessment, production app key request and use agreement), demonstration of the product, and use of **documented APIs only**. After acceptance the key is enabled for production data.
4. Until step 3 is done, users can only see test data. Plan the project in two phases: build and test on sandbox, then apply for production (OQ-13).

Sources: FamilySearch developer docs — Getting Started; Compatible Review Process; Authorization Code Flow.
