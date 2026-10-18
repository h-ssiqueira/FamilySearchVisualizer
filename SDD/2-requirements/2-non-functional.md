# Non-functional requirements

| ID | Category | Requirement |
|----|----------|-------------|
| NFR-01 | Performance | First card (the root) visible within 2 s after FamilySearch login returns. |
| NFR-02 | Performance | The first batch (proposed: 4 generations) fully rendered within 10 s on a normal connection when not throttled. Deeper generations load incrementally; the UI stays responsive with thousands of nodes (virtualized/culled rendering). Request count per view follows the table in the objective. |
| NFR-03 | Reliability | Throttling (429/503 + `Retry-After`) and transient network errors never crash the app; retries use bounded exponential back-off. |
| NFR-04 | Security | OAuth2 with PKCE and `state`; no client secret in code; tokens never in URLs or logs. See section 5. |
| NFR-05 | Privacy | Family data stays in the browser. No analytics or third-party trackers by default. Living people's data must not be committed to the repository (fixtures anonymized). |
| NFR-06 | Accessibility | WCAG 2.1 AA: keyboard navigation of the tree, visible focus, text alternatives, sufficient contrast, no information by color alone (gender indicators need a non-color cue). |
| NFR-07 | Compatibility | Latest two versions of Chrome, Edge, Firefox, Safari; mobile viewport usable. |
| NFR-08 | Internationalization | UI strings externalized; languages: OQ-08. Dates formatted per locale. |
| NFR-09 | Maintainability | TypeScript `strict`; ESLint + Prettier in CI; unit-test coverage ≥ 80 % on domain/api layers. |
| NFR-10 | Operability | Deployed automatically by GitHub Actions; rollback by re-running a previous successful deployment. |
| NFR-11 | Compliance | Respect FamilySearch developer terms and throttling guidance; read-only usage; call **documented endpoints only** (undocumented ones can get the app key disabled). |
| NFR-12 | Resilience to API change | All FamilySearch DTOs go through one mapping layer with runtime validation, so API changes fail loudly in one place. |
