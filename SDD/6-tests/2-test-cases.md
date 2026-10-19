# Test cases

Format: Given / When / Then. Level: U unit, C component, I integration, E end-to-end, M manual.

## Authentication
| ID | Req | Level | Case |
|----|-----|-------|------|
| TC-01 | FR-01 | C/E | Given no session, when the app opens, then only the "Sign in with FamilySearch" button is shown |
| TC-02 | FR-02 | U | PKCE: `code_challenge` equals base64url(SHA-256(verifier)); verifier length/charset valid |
| TC-03 | FR-02 | I | Redirect with matching `state` → token exchange sent with `code_verifier` |
| TC-04 | FR-02, NFR-04 | I | Redirect with wrong/missing `state` → flow aborted, no token request |
| TC-05 | FR-02 | I | User denies consent (`error` param) → friendly message, retry possible |
| TC-06 | FR-03 | I | Logout → memory, `sessionStorage` and cache cleared; protected view not reachable |
| TC-07 | FR-04 | I | 401 on a person request → re-login prompt; after login, same view and loaded generations resumed |
| TC-08 | NFR-04 | I | After redirect the `code` is not present in the URL/history |

## Data and mapping
| ID | Req | Level | Case |
|----|-----|-------|------|
| TC-10 | FR-05 | U | `users/current` mapped to `CurrentUser` (id, name, gender, birthDate) |
| TC-11 | FR-07 | U | `formalText` present → used; absent → `normalizedText`; both absent → unknown |
| TC-12 | FR-06 | U | Person with no death → no `ageAtDeath` shown |
| TC-13 | FR-19 | U | Two parent sets → both kept in the model; first used by views |
| TC-14 | data model | U | Parent with only `parent1` → placeholder for the missing parent |
| TC-15 | NFR-12 | C | Response violating the schema → node shows "unexpected response", app continues |
| TC-16 | FR-10 | U | Same person requested twice → one network call |

## Views
| ID | Req | Level | Case |
|----|-----|-------|------|
| TC-20 | FR-11 | U | V1 depth 3 for a complete tree → 1+2+4+8 nodes, binary structure |
| TC-21 | FR-11 | U | Unknown ancestors → placeholders; recursion stops |
| TC-22 | FR-11, R-06 | U | Pedigree collapse: same ancestor on two branches → one node, second reference marked |
| TC-23 | FR-13 | U | V2: for each couple shown, all its children appear; siblings of root appear under root's parents |
| TC-24 | FR-13 | U | V2 adds no network call beyond V1 for names |
| TC-25 | FR-14 | U | V3: each child's spouse(s) and their children appear |
| TC-26 | FR-14 | I | V3 makes exactly one details request per child |
| TC-27 | FR-15 | I | Switch V3→V1→V3 → no repeated requests |
| TC-28 | FR-12 | U | "Next generation" / "load all" fetch only missing generations; loading stops when no parents remain |
| TC-29 | FR-17 | C | Card shows name, life span, birth place; "unknown" fallback |
| TC-30 | FR-18 | C | Expanding a light card fetches details once |

## Resilience
| ID | Req | Level | Case |
|----|-----|-------|------|
| TC-40 | FR-09, NFR-03 | I | 429 with `Retry-After: 5` → all queued requests pause ~5 s then resume |
| TC-41 | FR-23 | I | Never more than N requests in flight |
| TC-42 | NFR-03 | I | Transient network error → back-off retries, then per-node retry control |
| TC-43 | design | I | 403/404 for one person → node "unavailable", tree still renders |
| TC-44 | F7 | I | Change view/root during loading → in-flight requests aborted, stale results ignored |

## Non-functional
| ID | Req | Level | Case |
|----|-----|-------|------|
| TC-50 | NFR-06 | E | Whole tree reachable and operable with keyboard only; focus visible |
| TC-51 | NFR-06 | E | axe: no serious/critical violations on login, V1, V2, V3 |
| TC-52 | NFR-06 | C | Gender conveyed by more than color |
| TC-53 | NFR-02 | I | Request count for the first batch of 4 generations ≤ 31 |
| TC-54 | NFR-05 | I | No network request to hosts other than FamilySearch |
| TC-55 | security | U | Name containing `<script>` or HTML renders as text |
| TC-56 | NFR-07 | E | Layout usable at 360 px width |
| TC-57 | NFR-08 | C | All visible strings come from the i18n catalog |
| TC-58 | FR-12 | I | Stop during "load all" aborts in-flight requests; already loaded nodes stay visible |
| TC-59 | FR-12, NFR-02 | C | Tree with 1,000+ nodes: only visible nodes are rendered; pan/zoom stays responsive |
| TC-60 | NFR-11, ADR-10 | U | API client refuses any URL not on the documented-endpoint allow-list and any non-GET method |

## UI cards and layout
| ID | Req | Level | Case |
|----|-----|-------|------|
| TC-61 | FR-17 | C | The sketch's example renders exactly four lines: `John Example` / `1800-12-31 - 1900-01-01 (99)` / `São Paulo, São Paulo, Brazil - São Paulo, São Paulo, Brazil` / `XXXX-XXX` |
| TC-62 | FR-25 | U | Complete date → `yyyy-MM-dd`; year only → `1800`; approximate/range text → raw text; none → empty |
| TC-63 | FR-24 | C | Very long place names are truncated with an ellipsis; tooltip shows the full text; card height stays 90 px |
| TC-64 | FR-27, NFR-06 | C | Male, female and unknown cards differ by colour **and** by a non-colour cue; text contrast ≥ 4.5:1 |
| TC-65 | FR-26 | C | A couple shows a horizontal link with marriage date and place; missing marriage data hides only the missing parts |
| TC-66 | FR-28 | U | Parent couple: male card left of female card; child placed under the couple; spouse right of the person |
| TC-67 | FR-26 | C | Parent–child links are orthogonal, have no arrowheads, and meet at the top centre of the child card |
