# Glossary

| Term | Meaning |
|------|---------|
| ADR | Architecture Decision Record |
| Ahnen number | Ahnentafel number: position of an ancestor in a pedigree (1 = root; father = 2n, mother = 2n+1); returned by the ancestry query |
| Ancestry / Descendancy query | Documented FamilySearch endpoints returning a pedigree up or down for a number of generations |
| App key / developer key | FamilySearch identifier of the application, used as OAuth2 `client_id`; public for browser apps |
| ARK | FamilySearch persistent URL form for resources; not to be used as permanent id |
| Binary tree (here) | Layout where each person has at most two parents (left/right); not a search tree |
| Compatibility review | FamilySearch process (agreements, security assessment, demonstration) required for beta and production app keys; undocumented APIs are not allowed |
| Couple | Two persons linked as parents of children and/or as spouses; also holds the marriage event |
| d'Aboville number | Position of a descendant in a descendancy (spouses get a `-S#` suffix) |
| Direct line | The user's ancestors: parents, grandparents, etc. (view V1) |
| Full person | Person loaded from their own details endpoint (dates, places, relatives) |
| GEDCOM X | Genealogical data model/format family used by FamilySearch; `formalText` dates follow its date notation |
| Integration (sandbox) | FamilySearch environment with test data, available to every developer account |
| Light person / PersonRef | Id, name and gender of a relative as embedded in another person's response |
| OIDC | OpenID Connect, identity layer on OAuth2 |
| Pedigree collapse | Same ancestor appears more than once in a tree (e.g. cousins marrying) |
| PersonId | FamilySearch person identifier, e.g. `GJ8L-919` |
| PKCE | Proof Key for Code Exchange: protects the authorization code flow for clients that cannot keep a secret |
| Redirect URI | URL where FamilySearch sends the user back after login; must be pre-registered |
| Retry-After | HTTP header telling how many seconds to wait after 429/503 |
| SPA | Single-page application |
| Throttling | FamilySearch per-user rate limiting based on processing time; signaled by 429 |
| V1 / V2 / V3 | The three tree views defined in the objective |
