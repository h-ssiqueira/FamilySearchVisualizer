# Scaffold checklist

Goal: an empty but **working, tested and deployable** app (Vite + React + TypeScript on GitHub Pages) that matches the SDD, so feature work can start on solid ground. Items reference SDD ids. `[ ]` = to do.

## 0. Decisions
- [x] **OQ-06**: use the endpoints exactly as in `8-attachments/examples.md` (ADR-10 not adopted). See [API findings](../4-design/6-api-findings.md).
- [x] **OQ-08**: English and pt-BR, extensible (ADR-11).
- [x] **OQ-12**: default GitHub Pages address of the repository, `https://h-ssiqueira.github.io/FamilySearchVisualizer/` (host to confirm); Vite `base` = `/FamilySearchVisualizer/`.
- [ ] **OQ-21 (blocks the auth and API-client tasks)**: how the SPA obtains the token (paste Bearer token, OAuth + PKCE, run on familysearch.org, or proxy). Everything else in this checklist can proceed.
- [ ] **OQ-11**: error reporting allowed or zero telemetry (default in the scaffold: zero telemetry).
- [ ] **A3 (urgent, do before anything else)**: `8-attachments/examples.md` contains a live token, personal data and real people. Sign out of FamilySearch everywhere, remove the file and purge it from Git history, replace it with a redacted sample. No fixture may be derived from the original.

## 1. Repository hygiene
- [ ] `.gitignore` (node_modules, dist, .env*, coverage, playwright-report) and `.editorconfig`
- [ ] `LICENSE` already present; confirm it is the intended one
- [ ] Root `README.md` for developers: what it is, requirements, run, test, build, env variables, link to `SDD/README.md`
- [ ] `.github/pull_request_template.md` (checklist: tests, a11y, no real personal data, SDD updated)
- [ ] Secret scanning and push protection enabled (security controls, section 3)

## 2. Tooling
- [ ] Node LTS pinned (`.nvmrc` + `engines` in `package.json`); npm; lock file committed
- [ ] Vite + React + TypeScript project created at the repository root
- [ ] `tsconfig`: `strict: true`, `noUncheckedIndexedAccess`, `noImplicitOverride`, path alias `@/` to `src/` (NFR-09)
- [ ] ESLint with TypeScript, `react-hooks`, `jsx-a11y` (NFR-06); rule banning `dangerouslySetInnerHTML` (security controls)
- [ ] ESLint **import-boundary** rules as in module design: `domain` imports nothing; `api` never imports React; `ui` never calls `fetch`
- [ ] Prettier configured and consistent with ESLint
- [ ] npm scripts: `dev`, `build`, `preview`, `typecheck`, `lint`, `format:check`, `test`, `test:coverage`, `test:e2e`

## 3. Folder structure (module design, section 1)
- [ ] `src/config`, `src/auth`, `src/api`, `src/domain`, `src/tree`, `src/state`, `src/ui`, `src/i18n`, `src/test`
- [ ] Each folder has an `index.ts` exposing only its public API
- [ ] `src/test/fixtures/` contains **synthetic** data only, with a README stating the anonymization rule (NFR-05)

## 4. Configuration (no secrets)
- [ ] `.env.example` with `VITE_BASE_PATH=/FamilySearchVisualizer/` and `VITE_FS_API_BASE=https://www.familysearch.org`; plus `VITE_FS_CLIENT_ID`, `VITE_FS_REDIRECT_URI`, `VITE_FS_AUTH_URL`, `VITE_FS_TOKEN_URL` **only if** OQ-21 chooses OAuth + PKCE
- [ ] Local dev URL follows the base path (`http://localhost:5173/FamilySearchVisualizer/`); production is `https://h-ssiqueira.github.io/FamilySearchVisualizer/`
- [ ] `src/config` reads and **validates** these at start-up and shows a clear error screen when something is missing
- [ ] No client secret anywhere (NFR-04); `client_id` is treated as public
- [ ] Vite `base` taken from `VITE_BASE_PATH` (`/FamilySearchVisualizer/`); assets and the router work under that sub-path (deploy, section 3)

## 5. Routing and OAuth redirect
- [ ] `HashRouter` (ADR-06)
- [ ] Only if OQ-21 chooses OAuth: the OAuth redirect returns `?code=...&state=...` in the **query string, before the `#`**: read it from `window.location.search` before the router starts, then clean the URL with `history.replaceState` (auth doc, section 4; TC-08)
- [ ] Routes: login, callback handling, tree view (V1/V2/V3), error/404

## 6. Security baseline
- [ ] CSP `<meta>` in `index.html` with the hosts from security controls, section 2 (check that the dev server still works; relax only in dev)
- [ ] `Referrer-Policy` meta, `rel="noopener noreferrer"` on external links, no inline scripts, no `eval`
- [ ] API client allow-list: only `GET` and only the listed URL patterns (NFR-11, TC-60)

## 7. Application skeleton (stubs with tests, no features yet)
- [ ] `domain`: types (`Person`, `PersonRef`, `Couple`, `LifeEvent`, `Gender`, `ViewTree`) from the data model
- [ ] `auth`: PKCE helpers (verifier, S256 challenge, `state`) with unit tests (TC-02); in-memory token store (ADR-07)
- [ ] `api`: `FamilySearchClient` interface for the two endpoints of `examples.md` (`users/current`, `tree-data/v8/person/{id}/details`) sending `Accept-Language` from the UI locale; mapper with a **field whitelist** (drops tokens, e-mail, phone, PIN, contributors; see API findings, section 7); `requestQueue` (concurrency limit, `Retry-After`, abort) with tests (TC-40, TC-41, TC-44); mapper skeleton with schema validation (ADR-08)
- [ ] `tree`: `TreeBuilder` interface and a V1 stub; layout stub
- [ ] `state`: session cache with `clear()` on logout (TC-06)
- [ ] `ui`: login screen ("Sign in with FamilySearch", TC-01), `PersonCard` with the four-line format (FR-17, TC-61), error boundary, loading and error states (FR-20)
- [ ] `i18n` (ADR-11): `src/i18n/locales/en.json` and `pt-BR.json`, `en` as fallback, language switcher, locale detection (saved choice, then `preferredLanguage` / `navigator.language`), adding a language = adding one file; no hard-coded visible strings (TC-57)
- [ ] Design tokens: card size 250 x 90, male/female/neutral colours, non-colour gender cue (FR-24, FR-27, UI spec)

## 8. Test infrastructure
- [ ] Vitest + React Testing Library + jsdom; coverage thresholds 80 % on `domain`, `api`, `tree` (test strategy, section 4)
- [ ] MSW with handlers for `users/current`, a person response, `429 + Retry-After`, `401`, `404`
- [ ] Playwright with one smoke test: the app loads and shows the login screen
- [ ] `axe` check on the login screen (TC-51)
- [ ] A test that `en.json` and `pt-BR.json` have exactly the same keys (fails when a locale is incomplete)
- [ ] A test that the mapper never returns fields outside the whitelist (no token, e-mail, phone, PIN, contributor data)
- [ ] First passing tests: PKCE (if OAuth), date formatter (TC-62), card format (TC-61), request queue

## 9. CI/CD (GitHub Actions)
- [ ] `ci.yml` on pull requests to `main`: checkout, setup-node with cache, `npm ci`, typecheck, lint, format check, tests with coverage, build, Playwright, dependency audit
- [ ] `deploy.yml` on push to `main`: same checks, build, `upload-pages-artifact`, `deploy-pages`
- [ ] Workflow `permissions:` minimal per job; `pages: write` and `id-token: write` only in the deploy job
- [ ] `concurrency` group so only one deployment runs at a time
- [ ] Third-party actions pinned by commit SHA
- [ ] `.github/dependabot.yml` for `npm` and `github-actions`
- [ ] Weekly scheduled workflow: audit + site canary (monitoring, section 1)

## 10. GitHub settings (manual)
- [ ] Pages: source = GitHub Actions; `github-pages` environment created
- [ ] Repository variables set for the `VITE_*` values of production (public values, not secrets)
- [ ] Branch protection on `main`: pull request required, required checks (`ci`), no force-push (backup and recovery, section 2)
- [ ] Dependabot alerts and security updates on

## 11. Documentation
- [ ] SDD updated: decisions taken in section 0 recorded, tool versions not pinned in the SDD (lock file is the source of truth)
- [ ] Open questions OQ-xx closed or re-labelled in `SDD/README.md`
- [ ] Deploy doc pre-go-live checklist reviewed against what was actually configured

## 12. Definition of done for the scaffold
- [ ] Fresh clone: `npm ci && npm run dev` shows the login screen
- [ ] `npm run typecheck && npm run lint && npm test && npm run build` pass locally
- [ ] A pull request runs `ci` and is green; merging to `main` deploys to GitHub Pages
- [ ] The deployed page loads over HTTPS with no console errors and no request to hosts other than FamilySearch (TC-54)
- [ ] No real personal data and no secret in the repository

## 13. Suggested order of pull requests
1. Tooling, folder structure, config validation, lint and test infrastructure (sections 1 to 4, 8)
2. CI and deployment (sections 9 and 10), with a placeholder login screen
3. Routing, token handling and login (sections 5 and 7: auth), **after OQ-21**
4. API client skeleton, request queue, whitelisting mappers (section 7: api)
5. Domain types, `PersonCard`, design tokens, i18n (section 7: domain, ui)

## Out of scope for the scaffold
Real FamilySearch calls, tree building for V1/V2/V3, layout algorithm, pan/zoom, export. They start after the scaffold is merged.
