# Security controls

## 1. Threats and controls (STRIDE-lite)
| Threat | Example | Control |
|--------|---------|---------|
| Spoofing | Phishing link or fake login page | The app only navigates to the configured FamilySearch login address (fixed, allow-listed); the privacy notice tells the user to check the address |
| Tampering | Modified third-party script | Few dependencies, lock file, Dependabot, SRI for any external script (prefer none) |
| Information disclosure | Token or family data leaked | Token in memory, no PII in logs, no analytics by default, `Referrer-Policy: no-referrer` (via `<meta>`) |
| XSS | Malicious text inside a FamilySearch name or place (user-generated content) | Render via React text nodes only; ban `dangerouslySetInnerHTML` (ESLint); strict CSP |
| Token injection | An attacker makes the app use the attacker's token | Token accepted only through the defined intake path and validated with `users/current` |
| Denial of service (self-inflicted) | Request storm triggers throttling for the user | Concurrency limit, depth limit, `Retry-After`, cancellation |
| Elevation of privilege | Use of the token for writes | Client exposes GET only; the token itself is the account's full session, so it is never stored or sent anywhere except `www.familysearch.org` |
| Session token theft | XSS steals the token and takes over the FamilySearch account | Strict CSP, no third-party scripts, React text rendering only, token in memory only |
| Repudiation | n/a (no server) | – |

## 2. Browser hardening
GitHub Pages cannot send custom response headers, so use `<meta>` where possible:
- CSP (meta): `default-src 'self'`; `script-src 'self'` (no external scripts); `connect-src 'self' https://www.familysearch.org`; `frame-src 'none'`; `object-src 'none'`; `base-uri 'none'`. Finalize after the spike (exact hosts).
- No inline scripts; no `eval`.
- `rel="noopener noreferrer"` on external links.
- Note: `frame-ancestors` and some headers are not enforceable via `<meta>`; if clickjacking protection is needed, put the site behind a proxy/CDN that can set headers (e.g. custom domain via a CDN).

## 3. Supply chain and CI
- Dependabot for npm and GitHub Actions; `npm audit` (or equivalent) in CI.
- Pin third-party GitHub Actions by commit SHA; least-privilege `permissions:` per job; Pages deployment via the official Pages actions with OIDC (no deploy tokens).
- Protected `master` branch (the default branch): required reviews/checks.
- Secret scanning and push protection enabled on the repository.

## 4. Privacy
- The app is a **pass-through viewer**: family data goes from FamilySearch to the browser and nowhere else.
- No cookies of our own; no analytics/trackers (OQ-11 if telemetry is wanted).
- Fixtures in the repo must be anonymized or synthetic; no real names, ids or places of living people (OQ-09, NFR-05).
- Logout clears memory and storage.
- Show a short privacy notice on the login page (what is read, that nothing is stored).

## 5. Compliance
- Follow FamilySearch's terms of use; read-only, honor throttling.
- **Endpoint allow-list**: the API client only calls a fixed list of URL patterns (R-01, ADR-10, OQ-06).
