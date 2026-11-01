# FamilySearch Visualizer

A read-only, client-side web app that shows a FamilySearch family tree in progressively richer views, starting from the signed-in user. Vite + React + TypeScript, hosted on GitHub Pages, with no backend.

> **Status: scaffold.** Login, the API client, the V1 ancestor builder and the person card exist as tested building blocks; the tree screens (V1 to V3) are still to be built. The design lives in the [SDD](SDD/README.md); the scaffold checklist is in [`SDD/7-operations/4-scaffold-checklist.md`](SDD/7-operations/4-scaffold-checklist.md).

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
  domain/   types, date and card rules, couple helpers (no imports from other layers)
  tree/     V1 ancestor builder and pedigree layout
  state/    session cache, cached person source, sign-out
  ui/       screens and components (never call fetch)
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

## Known open items

- **Token intake is unverified** (SDD OQ-21): how the token reaches a page on `github.io` must be confirmed by a spike; `scrubUrl` and `tokenStore` are the provisional pieces.
- **CI workflows** are staged in `.github/workflows-pending/` because the tool that created them could not write to `.github/workflows/`. Move them with `git mv .github/workflows-pending .github/workflows`.
- **Lock file and formatting**: run `npm install` and `npm run format` once and commit the results, then enable `cache: npm` and remove `continue-on-error` from the format step of the CI workflow.
- **Actions are pinned by tag, not by SHA** yet (SDD security controls, section 3).
