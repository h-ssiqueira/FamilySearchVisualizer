# Monitoring

There is no server, so there are no server logs or metrics. Monitoring focuses on **build health, site availability, dependencies and the external APIs**.

## 1. What to watch
| Area | Signal | How |
|------|--------|-----|
| Delivery | CI/CD success | GitHub Actions status, failure notifications by email/Slack |
| Availability | Site reachable, bundle loads | Scheduled GitHub Actions canary (HTTP 200 on the site, expected asset present) |
| Dependencies | Known vulnerabilities, outdated actions | Dependabot alerts, `npm audit` |
| FamilySearch API drift | Response shape changes, 4xx/5xx rise | Contract tests on fixtures (CI); periodic manual smoke test with a test account, since automated checks would need user credentials |
| Login | The login address still works and a token can be obtained | Manual smoke test with a real account after any change |
| Client errors | Unhandled exceptions, people that cannot be loaded | React error boundary with friendly message; the browser console lists each person that could not be loaded (FR-39); optional reporting only if OQ-11 allows (decided: zero telemetry) |

## 2. Client-side diagnostics (privacy-safe)
- Each person that cannot be loaded is written to the browser console: the person's **id**, the **name** when the parent entry gave it, and the **reason** (error class and message, for example `HttpError: Unexpected HTTP status 500`). This is the only place where ids and names are logged (FR-39). The console belongs to the user's own browser; nothing is sent anywhere.
- Never log tokens, response payloads, or place names. Log the error class, HTTP status and endpoint *pattern* (not the id) for anything else.
- Debug logs only in development.
- A "Copy diagnostics" button in the error screen that the user can paste into a GitHub issue (app version, browser, error code, no personal data) is **not built yet**.

## 3. Alerting and response
| Event | Response |
|-------|----------|
| Canary fails | Check Pages status; re-run deployment |
| Schema validation errors reported | Compare with the latest API response; update schemas/mappers; contract-test fixture added |
| Sustained 429 | Review concurrency/depth defaults |
| Security advisory | Dependabot PR, fast-track merge |

## 4. Service levels
Best effort. The app depends on GitHub Pages and FamilySearch availability; none is under our control.
