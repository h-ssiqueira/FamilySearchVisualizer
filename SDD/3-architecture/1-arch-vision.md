# Architecture vision

## 1. Style
A **client-only single-page application** (SPA) delivered as static files from GitHub Pages. The browser talks directly to FamilySearch (login, token and API). There is no server we operate.

## 2. Principles
1. **Read-only and stateless**: the source of truth is always FamilySearch.
2. **Lazy by default**: fetch only what the current view needs; hydrate details on demand.
3. **One door to the outside**: every FamilySearch call passes through a single API client (auth header, throttling, retry, validation, mapping).
4. **Pure domain core**: tree building and layout have no React or network dependency, so they are unit-testable.
5. **Privacy by default**: no telemetry, no persistence of family data beyond the tab session.

## 3. Layers
```
UI (React components, views V1/V2/V3)
   ↓
View models & layout (tree building, positions)
   ↓
Domain (Person, Couple, Event, Place + rules)
   ↓
Data access (FamilySearch client, cache, throttling)   Auth (FamilySearch PKCE)
```
Dependencies point downward only. Details in [module design](../4-design/2-module-design.md).

## 4. Architecture decisions
| ID | Decision | Status | Rationale / consequences |
|----|----------|--------|--------------------------|
| ADR-01 | Pure client-side SPA on GitHub Pages | Decided | Zero hosting cost; but no secret storage, no CORS proxy, no server-side headers. |
| ADR-02 | FamilySearch OAuth2 authorization code + PKCE | Decided, **under review (OQ-21)** | Needs a `client_id`. The samples in `examples.md` use the website's session id as Bearer token, which a page on `github.io` cannot obtain this way. |
| ADR-03 | Google is used only as a sign-in method on FamilySearch's own login page; the app has no Google client or SDK | Decided | A Google credential cannot authorize FamilySearch API calls; only the FamilySearch token can. One login flow, one token, nothing extra to configure or secure. |
| ADR-04 | Two node weights: *light* (id, name, gender from a relative's response) and *full* (details response) | Proposed | Lets V2 render with no extra calls and bounds V3 cost. |
| ADR-05 | Request pipeline with bounded concurrency, `Retry-After` handling and in-memory cache | Proposed | FamilySearch throttles per user by processing time. |
| ADR-06 | Hash-based routing (`/#/...`) | Proposed | GitHub Pages has no SPA fallback; deep links/refresh keep working. |
| ADR-07 | Tokens kept in memory; `sessionStorage` only for the PKCE verifier/state during the redirect | Proposed | Limits exposure on XSS; user re-logs in after closing the tab. |
| ADR-08 | Runtime validation (schema) of every API response | Proposed | Detects API drift; important because one endpoint appears internal (R-01). |
| ADR-09 | Unlimited ancestor depth via incremental, cancellable, generation-by-generation loading | Decided (unlimited) / Proposed (mechanics) | Never block the UI; user controls how far to go; needs virtualized rendering and a visible progress/stop control. |
| ADR-10 | Use the documented FamilySearch endpoints (`ancestry`, `descendancy`) instead of the internal `tree-data/v8` endpoint | **Not adopted** (author's decision, OQ-06) | The app uses the endpoints exactly as in `examples.md`. The documented API remains a fallback if the internal endpoint changes or cannot be called from the browser; its larger multi-generation responses would also cut the request count. |
| ADR-11 | Internationalization: English and Brazilian Portuguese, extensible | Decided (OQ-08) | One JSON catalog per locale (`en`, `pt-BR`), `en` as fallback; adding a language means adding a file. Locale picked from the user's choice, then `preferredLanguage` / browser language. `Accept-Language` sent to FamilySearch follows the UI locale. |

## 5. Risks
| ID | Risk | Impact | Mitigation |
|----|------|--------|------------|
| R-01 | The endpoints from `examples.md` are the website's internal API (`service/tree/tree-data/v8/...`): they may change or stop working without notice. | High (accepted, OQ-06) | Isolate all endpoints behind the API client; schema validation and contract tests (ADR-08); documented API (ADR-10) kept as fallback. |
| R-02 | **Critical.** The samples are same-origin calls of the website, authorized with its session id. From `github.io` the calls are cross-origin: CORS headers from `www.familysearch.org` are unknown, the website's cookies are not sent, and it is unknown whether another kind of token is accepted. | Critical | Spike first (section 6); decide the token mechanism (OQ-21); if blocked, revisit ADR-01 (proxy) or run on familysearch.org. |
| R-03 | Throttling (429) and slow loads on large trees, now that depth is unlimited. | Medium | Lazy loading, bounded concurrency, auto-load only a first batch, user-driven continuation, `Retry-After`, cancellation. |
| R-04 | ~~Developer key / registration~~ Dropped: out of scope (author's decision). | – | – |
| R-05 | Personal data of living people exposed via samples in the public repo. | High | Anonymize fixtures (OQ-09). |
| R-06 | Pedigree collapse (same ancestor reached twice) breaks a strict binary tree. | Low | Node identity by person id; render duplicates with a "see above" marker. |
| R-07 | `examples.md` holds live credentials and personal data in the repository. | High | Action A3: sign out everywhere, remove from the branch and from history, replace with a redacted sample. |

## 6. Suggested first spike (before building views)
1. Decide how the token is obtained (OQ-21).
2. From a bare page served from `localhost` and then from `github.io`, call the two endpoints of `examples.md` with that token. Check the CORS preflight (`OPTIONS`), the status codes and the response shape against [API findings](../4-design/6-api-findings.md).
3. Measure payload size, latency per person and throttling behaviour (429/503) on a tree with a few generations.
