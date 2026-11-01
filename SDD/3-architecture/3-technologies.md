* Typescript + React

---
## Proposed additions (to be confirmed)

| Concern | Proposal | Alternatives / notes |
|---------|----------|----------------------|
| Build / dev server | Vite | Create React App is deprecated |
| Language | TypeScript with `strict` | – |
| Routing | `react-router` with `HashRouter` (ADR-06) | – |
| Server-state, cache, retries | TanStack Query | Own queue (see ADR-05); either way must honor `Retry-After` |
| UI state | React state / Zustand | Keep small: selected view, depth, root person |
| Tree layout | `d3-hierarchy` (layout only) rendered as SVG by React | React Flow if interactive node editing/zoom is wanted out of the box |
| Sign-in | Navigate to FamilySearch's Google login address; no OAuth, Google or PKCE library | Small in-house token module (in-memory) |
| Validation | Zod (runtime schema of API responses) | Valibot |
| Styling | CSS Modules or Tailwind | Pick one; accessibility tokens (contrast, focus) shared |
| i18n | `react-i18next` or `LinguiJS` (OQ-08) | – |
| Unit / component tests | Vitest + React Testing Library | – |
| API mocking | MSW (Mock Service Worker) | – |
| End-to-end | Playwright | Cypress |
| Quality | ESLint, Prettier, `tsc --noEmit` | – |
| Supply chain | Dependabot, `npm audit` in CI | – |
| CI/CD | GitHub Actions + GitHub Pages (see [deploy](../7-operations/1-deploy.md)) | – |

Versions are intentionally not pinned here; the lock file is the source of truth.
