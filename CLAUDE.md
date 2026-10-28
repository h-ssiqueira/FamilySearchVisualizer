# CLAUDE.md

Guidance for Claude (and any coding agent) working in this repository.

## What this is
FamilySearch Visualizer: a read-only, client-side React app that shows a FamilySearch family tree in three views (V1 direct line, V2 couples and children, V3 extended family). Hosted on GitHub Pages, no backend. The design lives in [`SDD/`](SDD/README.md); the SDD is the source of truth for requirements (FR/NFR), decisions (ADR), open questions (OQ), risks (R) and test cases (TC).

## Stack
- Vite, React 19, TypeScript (`strict`, `noUncheckedIndexedAccess`), react-router (HashRouter), zod for runtime validation of API responses.
- Vitest + Testing Library + MSW (unit, component, integration); Playwright + axe (e2e).
- Node version pinned in `.nvmrc` (22). Lock file: `package-lock.json`.

## Commands
```bash
npm ci                 # install from the lock file (use npm install only if the lock file is missing)
npm run dev            # http://localhost:5173/FamilySearchVisualizer/
npm run typecheck      # tsc --noEmit
npm run lint           # ESLint, includes import-boundary rules
npm run format:check   # Prettier (non-blocking in CI until the codebase is formatted)
npm run test           # Vitest
npm run test:coverage  # Vitest with coverage thresholds (domain, api, tree)
npm run build          # type-check then Vite build
npm run test:e2e       # Playwright against the production build
```
Before calling work done: `typecheck`, `lint`, `test` and `build` must pass. Run `test:e2e` when touching the login screen, the CSP or the build.

## Architecture (layers and dependency rules)
```
src/
  domain/    types, date and card rules, couple helpers, family view model. Imports nothing from other layers.
  api/       endpoint allow-list, request queue, whitelisting zod mappers, FamilySearch client. Never imports React or UI.
  tree/      V1 ancestor builder, V2/V3 family views, layout, SVG export. Depends on domain only.
  state/     session cache, person source, sign-out, session expiry, view memory.
  relay/     client side of the FamilySearch-tab relay (postMessage) and the bookmarklet.
  auth/      in-memory token store, login navigation, URL scrubbing.
  config/    validated VITE_* build-time settings.
  i18n/      en and pt-BR JSON catalogs, locale detection, number formatting.
  ui/        screens and components, theme (light/dark). Never calls fetch directly.
  services.ts wires client, queue, cache, token and language.
relay/fsv-relay.js  script that runs on familysearch.org in the tab opened by the app (bookmarklet).
```
ESLint enforces the boundaries: `domain` imports nothing, `api` never imports React, `ui` never calls `fetch`.

## Hard rules (security and privacy)
- **Never commit real FamilySearch data, tokens, cookies, e-mails, phone numbers, PINs or names of living people.** Fixtures are synthetic (`src/test/fixtures/`, names like "John Example", ids like `XXXX-XXX`). `8-attachments/examples.md` contains real data and live credentials: do not copy from it, do not quote its values, and do not write it into code or tests.
- The FamilySearch session token is kept in memory only. Never write it to the URL, logs, error messages, `localStorage` or `sessionStorage`.
- The API client only issues `GET` requests to the two endpoints of the allow-list (`src/api/allowList.ts`). The relay script keeps an identical copy; a test enforces it. Changing one means changing both.
- Untrusted text (names, places) is rendered as React text only. Never use `dangerouslySetInnerHTML`.
- Logs never contain payloads or personal data: log the error class and HTTP status only.
- No analytics, trackers or third-party scripts.

## Conventions
- Code and comments in English. UI strings only through the i18n catalogs (`src/i18n/locales/en.json` and `pt-BR.json`); both must have the same keys (there is a test).
- Colours only through the theme variables in `src/ui/styles.css` (light and dark). Do not hard-code colours in components or in the stylesheet outside the variables; card colours by gender are the only exception.
- Dates: complete dates are shown as `yyyy-MM-dd` in every locale (FR-25). Prose dates come localized from FamilySearch through `Accept-Language`; show them as received, never re-parse them. Counts use `formatNumber` (NFR-08).
- Reference requirement and test IDs in comments or test titles (`FR-xx`, `TC-xx`, `NFR-xx`). When a test covers a case, reference the TC id.
- Tests live next to the code (`*.test.ts(x)`). New behaviour gets a test in the same change.
- Keep the SDD in step with the code: when a requirement, decision or test case changes, update the matching file under `SDD/` in the same change.
- Branches: `feature/<name>`; stacked branches are allowed when a change builds on another. The default branch is `master`.

## Current state (keep this section up to date)
- Implemented: login (relay and token fallback), V1/V2/V3 views, layout with no card on marriage lines, pan and zoom, SVG export, progressive loading, partial failures with retry (FR-33), waiting indicator (FR-09), session expiry keeping the view (FR-04), network back-off (NFR-03), number formatting (NFR-08), dark theme following the system with a toggle (FR-35).
- Not implemented yet: placeholders for unknown parents (FR-11), "unavailable" card for restricted people (TC-43), pedigree-collapse marker (TC-22), several parent sets shown to the user (FR-19), keyboard navigation between cards (TC-50), PNG/PDF export (FR-22), wrapping of very large sibling groups (OQ-20).
- Never executed as a whole: the code was written without running install, tests or build. First real run: `npm ci`, then `typecheck`, `lint`, `test`, `build`, and send the errors back.
- Unverified: whether the FamilySearch session cookie alone authorises the two endpoints when called through the relay (TC-52b). If not, the token fallback is the path.
- CI workflows live in `.github/workflows-pending/` until they are moved to `.github/workflows/` (`git mv`). The GitHub connector cannot write there.
- Open decisions are in `SDD/README.md` (OQ list). OQ-11 (telemetry) and OQ-20 are still open.

## Where to look first
- Requirements: `SDD/2-requirements/`. Test cases: `SDD/6-tests/2-test-cases.md`.
- Relay protocol and security: `SDD/5-security/1-auth-authorization.md` and `relay/fsv-relay.js`.
- Layout rules: `SDD/4-design/5-ui-spec.md` and `src/tree/familyLayout.ts`.
- API facts observed from the samples: `SDD/4-design/6-api-findings.md` (no values copied here).
- Theme: `src/ui/theme.ts` (choice and storage), `src/ui/styles.css` (variables).
