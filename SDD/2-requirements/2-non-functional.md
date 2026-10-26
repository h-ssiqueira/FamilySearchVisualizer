# Non-functional requirements

Targets marked *(proposed)* are starting points to be confirmed.

| ID | Category | Requirement |
|----|----------|-------------|
| NFR-01 | Performance | First card (the root) visible within 2 s after FamilySearch login returns *(proposed)*. |
| NFR-02 | Performance | The first batch (proposed: 4 generations) fully rendered within 10 s on a normal connection when not throttled *(proposed)*. Deeper generations load incrementally; the UI stays responsive with thousands of nodes (virtualized/culled rendering). Request count per view follows the table in the objective. |
| NFR-03 | Reliability | Throttling (429/503 with `Retry-After`) pauses the queue and is shown to the user (FR-09). A network failure (no answer) is retried with exponential back-off: 1 s, 2 s, 4 s by default, then the person is shown as not loaded and can be retried (FR-33, TC-42). Neither crashes the app. |
| NFR-04 | Security | The FamilySearch session token is kept in memory only and never appears in URLs, logs or browser storage; no secrets in code. See section 5. |
| NFR-05 | Privacy | Family data stays in the browser. No analytics or third-party trackers by default. Living people's data must not be committed to the repository (fixtures anonymized). |
| NFR-06 | Accessibility | WCAG 2.1 AA: keyboard navigation of the tree, visible focus, text alternatives, sufficient contrast, no information by color alone (gender indicators need a non-color cue). |
| NFR-07 | Compatibility | Latest two versions of Chrome, Edge, Firefox, Safari; mobile viewport usable. |
| NFR-08 | Internationalization | UI strings externalized; languages: OQ-08. Dates formatted per locale. |
| NFR-09 | Maintainability | TypeScript `strict`; ESLint + Prettier in CI; unit-test coverage ≥ 80 % on domain/api layers *(proposed)*. |
| NFR-10 | Operability | Deployed automatically by GitHub Actions; rollback by re-running a previous successful deployment. |
| NFR-11 | Compliance | Respect FamilySearch's terms of use and throttling guidance; read-only usage; calls restricted to an allow-list of endpoints (ADR-10). |
| NFR-12 | Resilience to API change | All FamilySearch DTOs go through one mapping layer with runtime validation, so API changes fail loudly in one place. |
