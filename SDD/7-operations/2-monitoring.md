# Monitoring

There is no server, so there are no server logs or metrics. Monitoring focuses on **build health, site availability, dependencies and the external APIs**.

## 1. What to watch
| Area | Signal | How |
|------|--------|-----|
| Delivery | CI/CD success | GitHub Actions status, failure notifications by email/Slack |
| Availability | Site reachable, bundle loads | Scheduled GitHub Actions canary (HTTP 200 on the site, expected asset present) |
| Dependencies | Known vulnerabilities, outdated actions | Dependabot alerts, `npm audit` |
| FamilySearch API drift | Response shape changes, 4xx/5xx rise | Contract tests on fixtures (CI); periodic manual smoke test with a test account, since automated checks would need user credentials |
| Developer key | Key/redirect URI still valid and not disabled (undocumented API use can disable it) | Smoke test after any change; calendar reminder for key renewal if applicable |
| Client errors | Unhandled exceptions | React error boundary with friendly message; optional reporting only if OQ-11 allows |

## 2. Client-side diagnostics (privacy-safe)
- Central logger with levels; debug logs only in development.
- Never log tokens, names, ids of people or places; log error class, HTTP status, endpoint *pattern* (not the id).
- A "Copy diagnostics" button in the error screen that the user can paste into a GitHub issue (app version, browser, error code, no personal data).

## 3. Alerting and response
| Event | Response |
|-------|----------|
| Canary fails | Check Pages status; re-run deployment |
| Schema validation errors reported | Compare with the latest API response; update schemas/mappers; contract-test fixture added |
| Sustained 429 | Review concurrency/depth defaults |
| Security advisory | Dependabot PR, fast-track merge |

## 4. Service levels
Best effort. The app depends on GitHub Pages and FamilySearch availability; none is under our control.
