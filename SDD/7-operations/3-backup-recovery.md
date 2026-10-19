# Backup and recovery

## 1. What needs protection
| Asset | Where | Notes |
|-------|-------|-------|
| Source code, SDD, workflows | GitHub repository | Only asset owned by the project |
| Family data | FamilySearch | Not stored by this app; nothing to back up |
| OAuth `client_id` and redirect URIs | Build configuration (repository variables) | Public values; document them in the repository |
| Domain / Pages configuration | GitHub settings / DNS | Document settings |

## 2. Backup
- Git history is the backup; keep at least one additional copy (a local clone or a mirror/fork).
- Enable branch protection on `main`; forbid force-push.
- Keep a runbook (this file) with the configuration values (client id, redirect URIs), stored in the repository without secrets.
- Secrets: none required by the application. CI has no long-lived deploy secrets (Pages OIDC).

## 3. Recovery scenarios
| Scenario | Recovery | Target (proposed) |
|----------|----------|-------------------|
| Bad release | Revert the commit or re-run deployment of last good commit | < 30 min |
| GitHub Pages unavailable | Wait; or publish the built `dist` to an alternative static host (update the redirect URI configuration) | Best effort |
| Repository deleted/corrupted | Restore from mirror/clone; re-enable Pages and Actions | < 1 day |
| Redirect URI or `client_id` changed | Update the build variables and redeploy | < 1 hour |
| Site URL change (rename, custom domain) | Update the redirect URI configuration and the Vite `base` when switching | Plan ahead |
| Compromised dependency | Revert lock file, publish fixed build, rotate nothing (no secrets) but invalidate by logout notice if tokens could be exposed | Hours |

## 4. Data recovery for users
None needed: reloading re-reads everything from FamilySearch. Users who lose a session simply sign in again.
