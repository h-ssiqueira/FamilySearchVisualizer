# 2. Objective

## 2.1 Goals
1. Show the user's family tree in a **simple, binary-tree-like layout** starting from the signed-in person.
2. Let the user **expand detail in steps** (V1 → V2 → V3) without leaving the page.
3. Stay **free to run**: static hosting, no backend, no stored user data.
4. Be **respectful of the FamilySearch API**: lazy loading, bounded concurrency, honoring throttling.

## 2.2 Non-goals
- Replace the FamilySearch tree UI or edit data.
- Persist or share family data outside the user's browser.

## 2.3 Views
The root of every view is the current user (later: any selected person).

| View | Name | Content | Status |
|------|------|---------|--------|
| V1 | Direct line | Root, their two parents, each parent's parents, … drawn as a binary tree (every node has up to 2 parents). Despite the "binary search tree" analogy, there is no ordering by value; only the shape is binary. | Decided |
| V2 | Couples & children | V1 **plus**, for each couple in the tree, all of their children. For ancestors this adds the siblings of the person on the direct line; for the root it adds their own spouse(s) and children. | Decided |
| V3 | Extended family | V2 **plus** the spouse(s) of each of those children, and the children of each of those unions. One level only. | Decided |

### Cost of each view (drives lazy loading)
Counts below assume the person-details endpoint used in the prototype. With the documented API (ADR-10, OQ-06) ancestry/descendancy queries return several generations per call and the counts drop sharply (see data model).

One details request returns the person's parents, siblings, spouses and children (id, name, gender), but dates/places only for the person themselves.

| View | Needs a details request for | Calls for depth *d* |
|------|------------------------------|---------------------|
| V1 | every ancestor shown (to find their parents and show dates) | up to 2^(d+1) − 1 (d=4 → 31, d=6 → 127); depth is unlimited, so cost grows until ancestors run out (pedigree collapse and missing data usually end it earlier) |
| V2 | nothing extra for names (children appear in the parent's response); one per child only to show dates | +0 (names) / +C (dates) |
| V3 | every child shown (to learn spouses and grandchildren) | +C, C = children shown |

## 2.4 Success criteria
- SC-1: a new user reaches a rendered V1 within a few clicks after signing in.
- SC-2: V1's first batch of generations renders without any 429 error under normal conditions; deeper loading never freezes the UI and can always be stopped.
- SC-3: no family data is sent anywhere except FamilySearch.
- SC-4: deployments are fully automated from `master` (the repository's default branch).
