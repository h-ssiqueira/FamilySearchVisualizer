# CLAUDE.md

Guidance for Claude (and any coding agent) working in this repository.

## What this is
FamilySearch Visualizer: a read-only, client-side React app that shows a FamilySearch family tree in three views (V1 direct line, V2 couples and children, V3 extended family), and a second page with the same data drawn as a force-directed graph. Hosted on GitHub Pages, no backend. The design lives in [`SDD/`](SDD/README.md); the SDD is the source of truth for requirements (FR/NFR), decisions (ADR), open questions (OQ), risks (R) and test cases (TC).

## Stack
- Vite, React 19, TypeScript (`strict`, `noUncheckedIndexedAccess`), react-router (HashRouter), zod for runtime validation of API responses.
- `force-graph` (pinned, MIT) for the graph page, loaded as a separate chunk.
- Vitest + Testing Library + MSW (unit, component, integration); Playwright + axe (e2e).
- Node version pinned in `.nvmrc` (26). Lock file: `package-lock.json`, kept in sync with `package.json` (by the `sync-lockfile` workflow or by hand).

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
  tree/      V1 ancestor builder, V2/V3 family views, layout, card width, SVG and PDF writers. Depends on domain only.
  graph/     data of the graph page (nodes, links, node text) and the collision force. Depends on domain and tree only.
  state/     session cache, person source, sign-out, session expiry, view memory.
  relay/     client side of the FamilySearch-tab relay (postMessage) and the bookmarklet.
  auth/      in-memory token store, login navigation, URL scrubbing.
  config/    validated VITE_* build-time settings.
  i18n/      en and pt-BR JSON catalogs, locale detection, number formatting.
  ui/        screens and components, theme (light/dark), export (download, rasterize), the graph canvas. Never calls fetch directly.
  services.ts wires client, queue, cache, token and language.
relay/fsv-relay.js  script that runs on familysearch.org in the tab opened by the app (bookmarklet).
```
ESLint enforces the boundaries: `domain` imports nothing, `api` never imports React, `ui` never calls `fetch`.

## Hard rules (security and privacy)
- **Never commit real FamilySearch data, tokens, cookies, e-mails, phone numbers, PINs or names of living people.** Fixtures are synthetic (`src/test/fixtures/`, names like "John Example", ids like `XXXX-XXX`). `8-attachments/examples.md` contains real data and live credentials: do not copy from it, do not quote its values, and do not write it into code or tests.
- The FamilySearch session token is kept in memory only. Never write it to the URL, logs, error messages, `localStorage` or `sessionStorage`.
- The API client only issues `GET` requests to the two endpoints of the allow-list (`src/api/allowList.ts`). The relay script keeps an identical copy; a test enforces it. Changing one means changing both.
- Untrusted text (names, places) is rendered as React text only. Never use `dangerouslySetInnerHTML`.
- Console logs: a person that cannot be loaded is logged with its id, name and reason (FR-39, the only exception to the rule below). Never log tokens, response payloads or places. Other errors: error class and HTTP status only.
- No analytics, trackers, third-party scripts or telemetry (NFR-05, decided).

## Conventions
- Code and comments in English. UI strings only through the i18n catalogs (`src/i18n/locales/en.json` and `pt-BR.json`); both must have the same keys (there is a test).
- Colours only through the theme variables in `src/ui/styles.css` (light and dark). Do not hard-code colours in components or in the stylesheet outside the variables; card colours by gender are the only exception.
- Dates: complete dates are shown as `yyyy-MM-dd` in every locale (FR-25). Prose dates come localized from FamilySearch through `Accept-Language`; show them as received, never re-parse them. Counts use `formatNumber` (NFR-08).
- Reference requirement and test IDs in comments or test titles (`FR-xx`, `TC-xx`, `NFR-xx`). When a test covers a case, reference the TC id.
- Tests live next to the code (`*.test.ts(x)`). New behaviour gets a test in the same change.
- Keep the SDD in step with the code: when a requirement, decision or test case changes, update the matching file under `SDD/` in the same change.
- Requirement numbers that were removed are not reused (FR-11 is removed).
- Branches: `feature/<name>`; stacked branches are allowed when a change builds on another. The default branch is `master`.

## Current state (keep this section up to date)
- Implemented: login (relay and token fallback), V1/V2/V3 views, layout with no card on marriage lines, flexible card width (250 to 360 px, from the text), pan and zoom, export as SVG, PNG and PDF (no external library for the PDF), progressive loading, partial failures with retry (FR-33), console report of people that cannot be loaded (FR-39), unexpected-data card (FR-36), unavailable card (FR-38), repeat symbol for a repeated ancestor (TC-22), families button for spouse families (FR-19, OQ-25), waiting indicator (FR-09), session expiry keeping the view (FR-04), network back-off (NFR-03), number formatting (NFR-08), preferred spouse family (FR-19), dark theme following the system with a toggle (FR-35), graph page with force-graph (FR-40 to FR-45): free layout, collision force, link colour that follows the theme, PNG export.
- Removed: placeholders for unknown parents (FR-11 removed; the unavailable card is used instead).
- Not implemented yet: families button for parent families (other parent sets), keyboard navigation between cards in the tree (TC-50), copy-diagnostics button (monitoring section 2), viewport culling for the graph (OQ-28).
- Never executed as a whole: the code was written without running install, tests or build. The `package-lock.json` must be regenerated after the `force-graph` change (`sync-lockfile` workflow, or `npm install` locally). First real run: `npm ci`, then `typecheck`, `lint`, `test`, `build`, and send the errors back.
- Unverified: the `force-graph@1.51.4` pin on npm; whether the FamilySearch session cookie alone authorises the two endpoints through the relay (TC-52b).
- Exports need a browser to be tested (TC-80, TC-87 drawing, TC-90).
- CI workflows live in `.github/workflows/`; the `sync-lockfile` workflow is in `.github/workflows/sync-lockfile.yml` once committed.
- Open decisions are in `SDD/README.md` (OQ list). OQ-27 and OQ-28 are open.

## Where to look first
- Requirements: `SDD/2-requirements/`. Test cases: `SDD/6-tests/2-test-cases.md`.
- Relay protocol and security: `SDD/5-security/1-auth-authorization.md` and `relay/fsv-relay.js`.
- Layout rules: `SDD/4-design/5-ui-spec.md`, `src/tree/familyLayout.ts` and `src/tree/cardWidth.ts`.
- Graph page: `SDD/4-design/7-force-graph-view.md`, `src/graph/`, `src/ui/GraphScreen.tsx`, `src/ui/ForceGraphCanvas.tsx`.
- API facts observed from the samples: `SDD/4-design/6-api-findings.md` (no values copied here).
- Theme: `src/ui/theme.ts` (choice and storage), `src/ui/styles.css` (variables).
- Export: `src/tree/exportSvg.ts`, `src/tree/pdf.ts`, `src/ui/exportImage.ts`, `src/ui/ExportButton.tsx`.
- Console report: `src/tree/ancestors.ts` (`report`).
