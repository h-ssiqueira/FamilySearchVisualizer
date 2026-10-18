* Github actions + pages

---
## Details (proposed)

## 1. Environments
| Environment | Host | FamilySearch | Purpose |
|-------------|------|--------------|---------|
| Local | `http://localhost:<port>` | Beta (`identbeta`) | Development |
| Production | GitHub Pages (URL: OQ-12) | Production (`ident`) | Users |

Each environment needs its own **registered redirect URI** with FamilySearch (OQ-07). Client ids and base URLs are injected at **build time** through public environment variables (they are not secrets).

## 2. Pipeline (GitHub Actions)
| Trigger | Jobs |
|---------|------|
| Pull request → `main` | install (cached) → type-check → lint → unit/component/integration tests → build → Playwright E2E → dependency audit |
| Push to `main` | same checks → build → upload Pages artifact → deploy to GitHub Pages |
| Schedule (weekly) | dependency audit, deployed-site canary (see monitoring) |

Workflow rules:
- `permissions:` minimal per job; deployment job gets `pages: write` and `id-token: write` only.
- Third-party actions pinned by SHA; Dependabot keeps them updated.
- Use the `github-pages` environment (optionally with required reviewers for production).
- Concurrency group so only one deployment runs at a time.

## 3. Build specifics for GitHub Pages
- Set the bundler `base` to the repository path (e.g. `/FamilySearchVisualizer/`) for a project page; `/` for a user page or custom domain.
- Hash routing (ADR-06) avoids 404 on refresh; alternatively copy `index.html` to `404.html`.
- Source maps: decide whether to publish (they expose source, which is public anyway).
- Immutable, hashed asset file names; GitHub Pages cache headers are not configurable.

## 4. Release and versioning
- Trunk-based: short-lived branches (like `feature/sdd_setup`) merged by PR.
- Tag releases (`vX.Y.Z`) for traceability; deployment itself follows `main`.
- Changelog generated from PR titles (optional).

## 5. Rollback
Re-run the deployment workflow of the last good commit (or revert the commit on `main`). Details in [backup & recovery](3-backup-recovery.md).

## 6. Pre-go-live checklist
- [ ] FamilySearch developer key approved for production, redirect URI registered
- [ ] Google OAuth client configured with the production origin
- [ ] CSP finalized with actual hosts
- [ ] No real personal data in the repository
- [ ] Beta smoke test passed with a real account
