# Test strategy

## 1. Pyramid
| Level | Scope | Tools (proposed) | Share |
|-------|-------|------------------|-------|
| Unit | domain rules, mappers (date fallback, missing parents), PKCE helpers, tree builder, layout | Vitest | Most |
| Component | `PersonCard`, `TreeCanvas`, Login, error/loading states, keyboard navigation | Vitest + React Testing Library | Many |
| Contract | FamilySearch responses vs. schemas (using anonymized fixtures) | Vitest + Zod schemas | Some |
| Integration | auth flow and view building against a mocked API (throttling, 401, 404) | MSW | Some |
| End-to-end | login redirect (mocked identity), V1→V2→V3 navigation | Playwright | Few |
| Non-functional | accessibility (axe), request-count budget per view, bundle size | axe-core, Playwright, CI checks | Targeted |

## 2. Test data
- Fixtures are **synthetic or anonymized** versions of the samples in `8-attachments/examples.md` and `4-design/3-interfaces.md` (OQ-09). Never commit real personal data.
- Hand-built edge-case fixtures: single parent, unknown parents, several parent sets, several marriages, pedigree collapse, person without dates, deceased vs living, restricted person (403/404), large family (20+ children).

## 3. Mocking external systems
- FamilySearch API: MSW handlers; scripted `429 + Retry-After`, `401`, `5xx`, slow responses.
- FamilySearch identity: stubbed in unit/integration tests; in E2E the redirect is intercepted and a fake code returned.
- Real systems are exercised only in a **manual smoke test** against the integration (sandbox) or beta environment (needs credentials; not automated in CI).

## 4. Quality gates (CI)
- `tsc --noEmit`, ESLint, Prettier check.
- Unit/component/integration tests must pass; coverage ≥ 80 % on `domain`, `api`, `tree` *(proposed)*.
- Playwright E2E on pull requests to `main`.
- axe accessibility checks on main screens: zero serious/critical violations.
- Dependency audit: no known high/critical vulnerabilities.

## 5. Manual checks before release
- Real login on integration/beta with a test FamilySearch account (including the Google option); V1/V2/V3 on a real tree.
- Throttling behavior (FamilySearch offers a throttling test resource for this purpose).
- Keyboard-only walkthrough; screen reader smoke test; mobile viewport.
