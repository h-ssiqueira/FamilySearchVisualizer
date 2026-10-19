# API findings from `8-attachments/examples.md`

Facts read from the two captured requests (current user, person details). **No values from the sample are copied here**; see the security warning in section 6.

## 1. Endpoints used (decision OQ-06: the app uses these, as in the samples)
| Purpose | Request |
|---------|---------|
| Current user | `GET https://www.familysearch.org/platform/users/current` |
| Person details | `GET https://www.familysearch.org/service/tree/tree-data/v8/person/{personId}/details` |

Request headers that matter: `Accept: application/json`, `Accept-Language` (the response text is **localized** to it, e.g. `pt`), and `Authorization: Bearer <token>`.

## 2. How the samples were captured (important for feasibility)
- They come from the **FamilySearch website itself**: same-origin requests (`Sec-Fetch-Site: same-origin`), sent with the site's cookies, from the website's own pages.
- The Bearer token in both requests has the **same value as the `fssessionid` cookie**: it is the website's login session id, not a token issued to a third-party application.
- Consequences for a static app on `github.io`: (1) cross-origin calls need CORS headers from `www.familysearch.org`, which is unknown; (2) the browser will not send the website's cookies to a different site; (3) it is unknown whether an OAuth access token is accepted by `tree-data/v8`. See R-02 and OQ-21.

## 3. Person details: fields the app uses
| App need | Field | Notes |
|----------|-------|-------|
| id, name | `id`, `name` | |
| gender | `gender` | `MALE` / `FEMALE`; anything else maps to *unknown* |
| living | `living` (boolean) | Drives the UI rule "living people: birth date only, no age" |
| birth / death date | `birth.details.date`, `death.details.date` | `formalText` is `+YYYY-MM-DD` (may be partial); `normalizedText` / `localizedText` are **localized prose** (e.g. "26 de setembro de 1908"), not ISO; `originalText` is what the contributor typed (ambiguous day/month order); `julianDateRange` is present only for exact dates. Marriage dates in the samples have `formalText: null`, so the fallback shows localized text as is |
| birth / death place | `birth.details.place.normalizedText` (also `localizedText`, `originalText`, `id`, `geoCode`) | |
| age | `ageAtDeath` | Present on the full person only |
| parents | `parents[*].parent1`, `parents[*].parent2` | Relatives as **light person** objects. In the samples `parent1` is the man and `parent2` the woman; do not rely on that for same-sex or unknown-gender couples |
| parents' marriage | `parents[*].event.details` | date and place, same shape as above |
| siblings | `parents[*].children[*].child` | Includes the person themselves (flagged `principlePerson: true`) |
| spouse | `spouses[*].parent1` / `parent2` | **The spouse is the one whose `id` differs from the person's id.** In the samples the spouse is `parent1` and `parent2` is a complete copy of the person (large, to be ignored) |
| marriage | `spouses[*].event.details` | |
| children | `spouses[*].children[*].child` | |
| several families | `hasMultipleFamiliesAsChild`, `hasMultipleFamiliesAsParent`, `parents[*].preferred`, `spouses[*].preferred` | Support OQ-04: show the preferred family and indicate that others exist |

This answers the open points of the data model: how `spouses[*]` is populated, and that `parents[*].children` includes the person.

## 4. Light persons (relatives inside another person's response)
Available: `id`, `name`, `gender`, `living`, `lifespan` (e.g. years separated by a dash), `fullLifespan` (localized prose), name parts (`givenPart`, `familyPart`).
**Not** available: ISO dates, places, age. Therefore:
- A V2 card built from light data can show the name and the **years** only. Full cards (dates, places, age) need one details request per person (OQ-05).
- `lifespan` / `fullLifespan` contain **localized words** instead of a year in some cases (for example the word for "deceased" or "living"). Do not display them raw: derive the years from the digits and use the `living` flag.
- `hasSpouseOrChildren` was `false` even for people who have spouses in the same response: **do not rely on it** to skip requests.

## 5. Payload size
One person with 8 siblings and 7 children produced a response of roughly 100 KB (the whole sample file, with both responses and the request headers, is 113 KB). Size grows with family size, and the spouse block repeats the full person. With unlimited depth (ADR-09) bandwidth matters: use the request queue, cache, and avoid refetching.

## 6. Sensitive data found in `examples.md` (action A3)
The file contains: a live-looking **Bearer token and session cookie**, other browser cookies and identifiers, the **user's e-mail, phone number, helper PIN, ids, name and birth date**, the user's IP address, contributors' user names and ids, real names of relatives and **a person flagged as living with a private tree**.
- Treat the token and cookies as **compromised**: sign out of FamilySearch on all devices (and change the password if in doubt).
- The file must not stay in the repository. Removing it from the branch tip is not enough: it remains in Git history (see action A3 in the README).
- The app must never log or store these fields (mapper whitelist; security controls section 4).

## 7. Mapper rules derived
1. **Whitelist** only the fields in section 3; drop everything else (contributors, e-mail, phone, PIN, cookies, ids of other users).
2. `users/current`: keep only `personId`, `displayName`, `gender`, `birthDate` and `preferredLanguage` (can pre-select the UI language).
3. Send `Accept-Language` matching the UI locale (`en`, `pt` for `pt-BR`) so places and dates come back localized.
4. Spouse = partner whose id differs from the person's id.
5. Dates: `formalText` first, else `normalizedText` as is; never parse `originalText`.
6. Living flag from `living`, not from the text of `lifespan`.
