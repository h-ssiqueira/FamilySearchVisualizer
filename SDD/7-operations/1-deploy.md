* Github actions + pages

---
## Details (proposed)

## 1. Environments
| Environment | Host | Purpose |
|-------------|------|---------|
| Local | `http://localhost:5173/FamilySearchVisualizer/` | Development and tests |
| Production | GitHub Pages `https://h-ssiqueira.github.io/FamilySearchVisualizer/` | Users |

The base path and the login/API addresses (`VITE_BASE_PATH`, `VITE_FS_LOGIN_URL`, `VITE_FS_API_BASE`) are injected at **build time** through public environment variables (they are not secrets). No OAuth client id or redirect URI is needed.

**Default branch:** the repository's default branch is `master`. Whatever this document says about "the main line" means `master`; the deploy workflow must trigger on it.

## 2. Pipeline (GitHub Actions)
| Trigger | Jobs |
|---------|------|
| Pull request (any base branch, so stacked PRs are checked) | install (cached) → type-check → lint → unit/component/integration tests → build → Playwright E2E → dependency audit |
| Push to `master` | same checks → build → upload Pages artifact → deploy to GitHub Pages |
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
- Trunk-based: short-lived branches (like `feature/sdd_setup`) merged by PR; stacked PRs are allowed when a branch builds on another one.
- Tag releases (`vX.Y.Z`) for traceability; deployment itself follows `master`.
- Changelog generated from PR titles (optional).

## 5. Rollback
Re-run the deployment workflow of the last good commit (or revert the commit on `master`). Details in [backup & recovery](3-backup-recovery.md).

## 6. Pre-go-live checklist
- [ ] `VITE_BASE_PATH`, `VITE_FS_LOGIN_URL` and `VITE_FS_API_BASE` set for production
- [ ] Workflows live in `.github/workflows/` and the deploy trigger names the default branch (`master`)
- [ ] Endpoint allow-list test passes
- [ ] CSP finalized with actual hosts
- [ ] No real personal data in the repository
- [ ] Smoke test passed with a real account
