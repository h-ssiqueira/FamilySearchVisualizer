# Backup and recovery

## 1. What needs protection
| Asset | Where | Notes |
|-------|-------|-------|
| Source code, SDD, workflows | GitHub repository | Only asset owned by the project |
| Family data | FamilySearch | Not stored by this app; nothing to back up |
| Build configuration (`VITE_*` values) | Repository variables | Public values; document them in the repository |
| Domain / Pages configuration | GitHub settings / DNS | Document settings |

## 2. Backup
- Git history is the backup; keep at least one additional copy (a local clone or a mirror/fork).
- Enable branch protection on `master` (the default branch); forbid force-push.
- Keep a runbook (this file) with the configuration values (`VITE_*`), stored in the repository without secrets.
- Secrets: none required by the application. CI has no long-lived deploy secrets (Pages OIDC).

## 3. Recovery scenarios
| Scenario | Recovery | Target (proposed) |
|----------|----------|-------------------|
| Bad release | Revert the commit or re-run deployment of last good commit | < 30 min |
| GitHub Pages unavailable | Wait; or publish the built `dist` to an alternative static host | Best effort |
| Repository deleted/corrupted | Restore from mirror/clone; re-enable Pages and Actions | < 1 day |
| FamilySearch changes the login address, an endpoint or the response format | Update the build variables and, if needed, the mapper; redeploy | Hours to days (external dependency) |
| Site URL change (rename, custom domain) | Update the Vite `base` when switching | Plan ahead |
| Compromised dependency | Revert lock file, publish fixed build, rotate nothing (no secrets) but invalidate by logout notice if tokens could be exposed | Hours |

## 4. Data recovery for users
None needed: reloading re-reads everything from FamilySearch. Users who lose a session simply sign in again.
