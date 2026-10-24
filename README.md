# FamilySearch Visualizer

A read-only, client-side web app that shows a FamilySearch family tree in progressively richer views, starting from the signed-in user. Vite + React + TypeScript, hosted on GitHub Pages, with no backend.

> **Status: feature complete for the first version, not yet run.** Login wiring, the API client, the three tree views (direct line, couples and children, extended family), pan and zoom, and SVG export exist and are covered by tests that have **not been executed yet** (see the open items). The design lives in the [SDD](SDD/README.md).

## What it does

- **Sign in** with Google through FamilySearch; the current user is the root of the tree.
- **V1 Direct line**: the ancestors as a vertical pedigree, root at the bottom. The first 4 generations load automatically; you can load the next generation, load all of them, or stop at any time (depth is unlimited).
- **V2 Couples and children**: adds every child of each couple shown (siblings of the people on the line), and the spouse(s) and children of the root. No extra requests.
- **V3 Extended family**: adds the spouses of those children and their children (one request per child, cached).
- **Cards** are 250 x 90 px with four lines (name, dates and age, places, id); living people show only the birth date. Gender is shown by colour and by a symbol.
- **Pan and zoom** by dragging, with the wheel, the buttons or the keyboard (arrows, plus, minus, zero). Cards far outside the viewport are not rendered.
- **Export** the current view as an SVG image.
- **English and Brazilian Portuguese**, extensible by adding a JSON catalog.

## Quick start

```bash
cp .env.example .env        # public build-time settings, no secrets
npm install                 # commit the generated package-lock.json
npm run dev                 # http://localhost:5173/FamilySearchVisualizer/
```

Node 22 is pinned in `.nvmrc` (`nvm use`).

## Scripts

| Script | What it does |
|--------|--------------|
| `npm run dev` / `build` / `preview` | Vite dev server, production build (type-check first), preview of the build |
| `npm run typecheck` | `tsc --noEmit` (strict) |
| `npm run lint` | ESLint, including the import-boundary rules of the module design |
| `npm run format` / `format:check` | Prettier |
| `npm test` / `test:coverage` | Vitest (unit, component, integration with MSW); coverage thresholds on `domain`, `api`, `tree` |
| `npm run test:e2e` | Playwright smoke test and axe accessibility check against the production build |

## Structure

```
src/
  config/   validated VITE_* settings
  auth/     in-memory token store, login navigation, URL scrubbing
  api/      endpoint allow-list, request queue, whitelisting mappers, FamilySearch client
  domain/   types, date and card rules, couple helpers, family view model (no imports from other layers)
  tree/     V1 ancestor builder, V2/V3 family views, vertical family layout, SVG export
  state/    session cache, cached person source, sign-out
  services.ts  wires client, queue, cache, token and language
  ui/       screens, canvas with pan/zoom, toolbar, person card (never call fetch)
  i18n/     en and pt-BR catalogs; add a language = add a JSON file
  test/     setup and synthetic fixtures
e2e/        Playwright tests
SDD/        software design document
```

## Configuration

All settings are public build-time values (see `.env.example`):

| Variable | Meaning |
|----------|---------|
| `VITE_BASE_PATH` | Sub-path of the site (`/FamilySearchVisualizer/` on GitHub Pages) |
| `VITE_FS_API_BASE` | FamilySearch API origin (`https://www.familysearch.org`) |
| `VITE_FS_LOGIN_URL` | Google login address of FamilySearch's identity service |

The app shows a configuration screen that names the invalid settings instead of failing silently.

## Security and privacy in short

- The FamilySearch session token is the whole session of the user's account: kept **in memory only**, never in a URL, log or browser storage, and only sent to `www.familysearch.org`.
- The API client refuses any request that is not a `GET` to one of the two known endpoints.
- Mappers keep only whitelisted fields: tokens, e-mail, phone, PIN and contributor data never reach the app.
- Fixtures are synthetic. Never commit real FamilySearch data, tokens or cookies.
- The SVG export is built in the browser and saved locally; it contains the names and dates shown on screen, so treat the file as personal data.

## Known open items

- **Nothing has been executed yet.** The code was written without network access: run `npm install`, `npm run typecheck`, `npm run lint`, `npm test` and `npm run test:e2e` and expect a few small fixes. The layout algorithm in particular should be tried on a real tree.
- **Token intake is unverified** (SDD OQ-21): how the token reaches a page on `github.io` must be confirmed by a spike; `scrubUrl` and `tokenStore` are the provisional pieces. Until then the signed-in screen can only be reached through that mechanism.
- **CI workflows** are staged in `.github/workflows-pending/` because the tool that created them could not write to `.github/workflows/`. Move them with `git mv .github/workflows-pending .github/workflows`.
- **Lock file and formatting**: run `npm install` and `npm run format` once and commit the results, then enable `cache: npm` and remove `continue-on-error` from the format step of the CI workflow.
- **Actions are pinned by tag, not by SHA** yet (SDD security controls, section 3).
- **Not built yet**: expanding a light card to its full details on click (FR-18), keyboard navigation between cards, PNG/PDF export, profile of a person (FR-16), showing several parent sets or spouses of line persons (FR-19), wrapping very large sibling groups (OQ-20).
