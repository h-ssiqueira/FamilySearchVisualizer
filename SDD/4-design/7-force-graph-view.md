# Software Design Document: force-graph view (second page)

Status: **Implemented, not executed.** Layout, bundle and export decisions are **Decided** (OQ-29, OQ-30, OQ-31). The people are drawn as circles, not as cards (FR-43). The spacing is set for a tree of about 200 people (OQ-27, first values).

## 1. Purpose
A second page shows the people and relations of the tree as a 2D force-directed network, drawn on a canvas with the library [`force-graph`](https://github.com/vasturiano/force-graph) (MIT licence, built on `d3-force`). The graph is for seeing how relatives connect; the tree page remains the reference for reading the pedigree with full cards.

## 2. Scope
- In: a route `#/graph` (FR-41); the same views V1, V2 and V3 and the same data as the tree page; a circle per person with its name (FR-43); the same connection rules as the tree (FR-42); selection, drag, pan and zoom (FR-44); an accessible list alternative (FR-45); a separate bundle chunk (OQ-31); a PNG export of the canvas (OQ-30).
- Out (v1): the cards on the graph page (they stay on the tree page); editing; any new FamilySearch request beyond what the tree page already loads (FR-41); saving the layout.

## 3. Data and connection rules
The graph is built from the same `FamilyView` the tree page uses (`src/tree`). No new data is loaded. The connection rules are the same as on the tree page (FR-42).

| Graph element | Source | Drawn as |
|---------------|--------|----------|
| Node | each `FamilyCard` (the person and their state) | circle with the name under it (section 5) |
| Parent-child link | each `FamilyCouple` of kind `parents` to each child in `childIds` | solid line, 1.5 px, in the line colour, from parent to child |
| Marriage link | each `FamilyCouple` of kind `union` between its two partners | solid line, 3.5 px, in the accent colour, labelled with the marriage date and place |
| Generation | `FamilyCard.row` (root 0, ancestors positive, descendants negative) | not a position: used only for the card data; the graph layout is free (OQ-29) |

The data mapping is in `src/graph/graphData.ts` (`toGraphData`, `nodeLines`). The node keeps the card, so the same notes and the same name are used as on the tree page.

## 4. Layout and spacing (free, OQ-29 decided; spacing OQ-27)
A free force simulation (the library's default, `d3-force`) with four forces:
1. **Link force:** each parent-child link has a target distance of **200 px**; the marriage link is shorter, **120 px**, so the partners sit close together. Longer parent-child links keep the names of a generation from overlapping.
2. **Couple force:** the two partners of a couple are pulled together by the marriage link.
3. **Charge:** people repel each other with a strength of **-300** (the library default is -30), so that unrelated people do not crowd each other.
4. **Collision:** a box collision force (`boxCollisionForce` in `src/graph/collide.ts`) keeps two people apart. Each person's box is the circle plus room for its name (`COLLIDE_SIZE`, **78 px**). It is O(n²); culling (OQ-28) is the next step if it is too slow.

The values are a first setting for a tree of about 200 people. They are constants in `src/ui/ForceGraphCanvas.tsx`, so they can be tuned on a real tree without changing the structure.

There is no force towards a generation row. Ancestors may end up beside their descendants; the connection rules, not the position, carry the relations. The tree page keeps the ordered view.

The simulation runs until it cools down and then stops; dragging a node reheats it for that node only.

## 5. Rendering
- Each person is a circle of radius 9 px, filled with the gender colour (blue, pink or grey) and outlined in a darker shade of the same colour. The gender is also shown by the symbol in the label (NFR-06).
- The label is written under the circle: the gender symbol, the name, and the repeat symbol for a repeated ancestor. It is cut with an ellipsis at 150 px. A person with unexpected or unavailable data has a white circle with a dashed outline, and the note is written after the name. The state is therefore shown by shape and text, not by colour alone (NFR-06).
- Links: a parent-child link is 1.5 px in the line colour; a marriage link is 3.5 px in the accent colour. Both are solid straight lines, so the marriage is told apart by its width and colour. The marriage link shows the date and place (section 3).
- The colours follow the theme: the label colour (`--text`), the line colour (`--line`) and the accent colour (`--accent`) are read again whenever the theme changes (FR-35).
- The canvas is redrawn by the library; React does not re-render on each tick. The graph is a child component that owns the library instance and updates it only when the data changes.

## 6. Interaction
- Pan and zoom, drag of a node: built into the library.
- Click on a node: selects it and opens the details panel of the tree page (FR-16). The same selection is kept when the user switches to the tree page.
- Hover: the full name in a tooltip (the library's node label).
- Keyboard and screen readers cannot use a canvas. Every person on the page is therefore also listed in an accessible list (FR-45); selecting a row selects the node. Moving between nodes with the arrow keys is not built (see the accessibility notes in `6-tests/4-accessibility.md`).
- Export: a PNG of the canvas, saved as `family-graph.png` (OQ-30). It contains only the canvas, not the list or the panel.

## 7. Module placement, bundle and dependency
| Layer | Change | Dependency rule |
|-------|--------|-----------------|
| `src/graph/` | pure functions: `FamilyView` to nodes and links; node text; the collision force | imports `domain` and `tree` only |
| `src/ui/GraphScreen.tsx`, `ForceGraphCanvas.tsx` | the page and the library instance; the accessible list; the spacing and link constants | `ui` may import `graph` and `tree` |
| `src/App.tsx` | route `#/graph`, loaded with `lazy()` | unchanged rules |
| `src/ui/TreeScreen.tsx` | link to the graph page | unchanged |

**Bundle (OQ-31 decided): separate chunk.** The graph page is loaded with a dynamic `import()` when the route is opened, so the tree page does not download the library. TC-91 checks it.

**Dependency: `force-graph`, pinned to `1.51.4`** in `package.json`. This pin comes from the library's documentation index; it is **not yet verified on npm**. Check it with `npm view force-graph version` and change the pin if needed. Then check its licence (MIT).

**Lock file.** `package-lock.json` must match `package.json`. Two ways to keep them in sync:
1. **Automatic (workflow `sync-lockfile.yml`, once it is committed):** when `package.json` changes on a branch other than `master`, the workflow runs `npm install --package-lock-only` and commits the updated lock file to the same branch. It can also be started by hand from the Actions tab. The commit is made with `GITHUB_TOKEN`, so it does not start the CI of that commit: the next push runs it.
2. **Manual:** `npm install`, then `npm ci` to check, then commit both files.

The CI installs with `npm ci` when the lock file exists. A mismatch fails the install with `Missing ... from lock file`; the sync workflow prevents that for branches where it runs.

## 8. Security and privacy
- The library is bundled, not loaded from a CDN, so the existing CSP (`script-src 'self'`) holds (`5-security/2-security-controls.md`).
- It makes no network request. The graph page only uses the data already loaded (NFR-05).
- The library is a third-party dependency: it is covered by Dependabot and `npm audit` in CI, and its version is pinned. Before adoption, check that the version is maintained and that its licence (MIT) is accepted.

## 9. Accessibility (NFR-06)
Canvas output is not readable by assistive technology, so the accessible list (FR-45) is the alternative. The list is in document order, can be operated with the keyboard, and selects the same person as a click on the canvas. The gender, the state and the kind of link are in the label text or in the line width and colour, not only in the colour of a single element.

## 10. Performance
- The graph must stay responsive with the first batch (proposed: 4 generations, up to 31 people in V1) and with V3. Measure with 300 and 1,000 people (TC-90).
- The simulation cools down; a large graph is not re-simulated on every render.
- The collision force is O(n²). If it is too slow at 1,000 people, add a spatial index for the collision and a viewport check in the node painter (OQ-28).
- A larger spacing makes the graph wider, so panning and zooming matter more. The spacing values are checked together with TC-90.

## 11. Risks
| ID | Risk | Mitigation |
|----|------|------------|
| R-G1 | A free layout may place ancestors beside their descendants and hide the generations | The connection rules are the same; the tree page keeps the ordered view; the accessible list keeps the order |
| R-G2 | Canvas is not accessible | Accessible list (FR-45) |
| R-G3 | Third-party library is abandoned or changes its API | Pinned version; the library is used through one interface (`GraphHandle`) in `ForceGraphCanvas.tsx` |
| R-G4 | Text on canvas is blurry on high-density screens | Draw with the device pixel ratio (library option, checked in testing) |
| R-G5 | The version pin does not exist on npm, or the lock file is out of sync | Section 7: `npm view`, then `npm install` and `npm ci` before commit |
| R-G6 | Long names overlap on dense graphs | The labels are cut at 150 px; the spacing and the collision force keep the circles apart; hover shows the full name |
| R-G7 | A larger spacing makes the graph too wide to see at once | Pan and zoom; the initial zoom fits the graph; the tree page remains for the detailed reading |
| R-G8 | Parent-child and marriage lines look alike at a small size | Different width (1.5 px and 3.5 px) and colour (line and accent); the marriage line carries the date and place |

## 12. Open questions
| ID | Question | Status |
|----|----------|--------|
| OQ-27 | Distances of the link and couple forces, and the charge strength. | **Decided for the first version:** 200 px parent-child, 120 px marriage, charge -300, collision box 78 px. Tune on a real tree of about 200 people |
| OQ-28 | Viewport culling and a spatial index for the collision force: needed at 1,000 people, or not? | Open, decide after measuring (TC-90) |
| OQ-29 | Layout: generations forced into rows, or free? | **Decided: free force layout**, with the same connection rules |
| OQ-30 | Export from the graph page (PNG of the canvas). | **Decided: after the first implementation**; PNG implemented (section 6) |
| OQ-31 | Bundle: main, or separate chunk? | **Decided: separate chunk** (section 7) |
