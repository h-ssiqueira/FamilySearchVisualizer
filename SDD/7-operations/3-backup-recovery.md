# Backup and recovery

## 1. What needs protection
| Asset | Where | Notes |
|-------|-------|-------|
| Source code, SDD, workflows | GitHub repository | Only asset owned by the project |
| Family data | FamilySearch | Not stored by this app; nothing to back up |
| FamilySearch developer key and registered redirect URIs | FamilySearch developer account | Public client id; registration details must be documented (who owns the account, contact, registered URIs) |
| Google OAuth client configuration | Google Cloud project | Document project owner, authorized origins |
| Domain / Pages configuration | GitHub settings / DNS | Document settings |

## 2. Backup
- Git history is the backup; keep at least one additional copy (a local clone or a mirror/fork).
- Enable branch protection on `main`; forbid force-push.
- Keep a runbook (this file) with account ownership and registered URIs, stored in the repository without secrets.
- Secrets: none required by the application. CI has no long-lived deploy secrets (Pages OIDC).

## 3. Recovery scenarios
| Scenario | Recovery | Target (proposed) |
|----------|----------|-------------------|
| Bad release | Revert the commit or re-run deployment of last good commit | < 30 min |
| GitHub Pages unavailable | Wait; or publish the built `dist` to an alternative static host (needs new redirect URIs registered, see below) | Best effort |
| Repository deleted/corrupted | Restore from mirror/clone; re-enable Pages and Actions | < 1 day |
| Developer key revoked or redirect URI changed | Contact FamilySearch developer support, register the new URI, update build variables, redeploy | Days (external dependency) |
| Google OAuth client deleted | Recreate client, update client id and authorized origins, redeploy | < 1 day |
| Site URL change (rename, custom domain) | Register new redirect URI **before** switching; update Google origins and the Vite `base` | Plan ahead |
| Compromised dependency | Revert lock file, publish fixed build, rotate nothing (no secrets) but invalidate by logout notice if tokens could be exposed | Hours |

## 4. Data recovery for users
None needed: reloading re-reads everything from FamilySearch. Users who lose a session simply sign in again.
