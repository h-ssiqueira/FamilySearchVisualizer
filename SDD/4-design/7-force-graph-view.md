# Software Design Document: force-graph view (second page)

Status: **Implemented, not executed.** Layout, bundle and export decisions are **Decided** (OQ-29, OQ-30, OQ-31).

## 1. Purpose
A second page shows the people and relations of the tree as a 2D force-directed graph, drawn on a canvas with the library [`force-graph`](https://github.com/vasturiano/force-graph) (MIT licence, built on `d3-force`). The graph is for exploring how relatives connect; the tree page remains the reference for reading the pedigree.

## 2. Scope
- In: a route `#/graph` (FR-41); the same views V1, V2 and V3 and the same data as the tree page; the same card content and colours (FR-43); the same connection rules as the tree (FR-42); selection, drag, pan and zoom (FR-44); an accessible list alternative (FR-45); a separate bundle chunk (OQ-31); a PNG export of the canvas (OQ-30).
- Out (v1): editing; any new FamilySearch request beyond what the tree page already loads (FR-41); saving the layout.

## 3. Data and connection rules
The graph is built from the same `FamilyView` the tree page uses (`src/tree`). No new data is loaded. The connection rules are the same as on the tree page (FR-42).

| Graph element | Source | Drawn as |
|---------------|--------|----------|
| Node | each `FamilyCard`; its size is `cardWidth(person)` by 90 px | rounded card (section 5) |
| Parent-child link | each `FamilyCouple` of kind `parents` to each child in `childIds` | solid line, from parent to child |
| Marriage link | each `FamilyCouple` of kind `union` between its two partners | dashed line, with the marriage date and place |
| Generation | `FamilyCard.row` (root 0, ancestors positive, descendants negative) | not a position: used only to choose the link direction and the colour cue of the generation (none in v1) |

The data mapping is in `src/graph/graphData.ts` (`toGraphData`, `nodeLines`).

## 4. Layout (free, OQ-29 decided)
A free force simulation (the library's default, `d3-force`) with four forces:
1. **Link force:** each parent-child and marriage link has a target distance, so related people sit near each other. The parent-child distance is longer than the marriage distance.
2. **Couple force:** the two partners of a couple are pulled together, so the marriage link is short.
3. **Charge:** people repel each other.
4. **Collision:** a box collision force (`boxCollisionForce` in `src/graph/collide.ts`) pushes apart two cards whose boxes overlap, along the axis of the smaller overlap, with an 8 px margin. It is O(n²); culling (OQ-28) is the next step if it is too slow.

There is no force towards a generation row. Ancestors may end up beside their descendants; the connection rules, not the position, carry the relations. The tree page keeps the ordered view for reading the pedigree.

The simulation runs until it cools down and then stops; dragging a node reheats it for that node only.

## 5. Rendering
- The library draws on a canvas through a custom `nodeCanvasObject`: a rectangle with the card colours (gender, FR-27), then the four lines of FR-17, truncated to the card width with an ellipsis. The text is the same as the tree's card text (`nodeLines`). Notes (unexpected, unavailable) and the repeat symbol are drawn as on the tree (FR-36, FR-38).
- Link colour: read from the `--line` variable, and read again whenever the theme changes (FR-35). Card colours by gender stay light in both themes, as on the tree page.
- Links: solid for parent-child, dashed for marriage (section 3).
- The canvas is redrawn by the library; React does not re-render on each tick. The graph is a child component that owns the library instance and updates it only when the data changes.

## 6. Interaction
- Pan and zoom, drag of a node: built into the library.
- Click on a node: selects it and opens the details panel of the tree page (FR-16). The same selection is kept when the user switches to the tree page.
- Hover: the full name in a tooltip (open).
- Keyboard and screen readers cannot use a canvas. Every person on the page is therefore also listed in an accessible list (FR-45); selecting a row selects the node.
- Export: a PNG of the canvas, saved as `family-graph.png` (OQ-30). It contains only the canvas, not the list or the panel.

## 7. Module placement, bundle and dependency
| Layer | Change | Dependency rule |
|-------|--------|-----------------|
| `src/graph/` | pure functions: `FamilyView` to nodes and links; node text; the collision force | imports `domain` and `tree` only |
| `src/ui/GraphScreen.tsx`, `ForceGraphCanvas.tsx` | the page and the library instance; the accessible list | `ui` may import `graph` and `tree` |
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
Canvas output is not readable by assistive technology, so the accessible list (FR-45) is the alternative. The list is in document order, can be operated with the keyboard, and selects the same person as a click on the canvas.

## 10. Performance
- The graph must stay responsive with the first batch (proposed: 4 generations, up to 31 people in V1) and with V3. Measure with 300 and 1,000 nodes (TC-90).
- The simulation cools down; a large graph is not re-simulated on every render.
- Cards outside the viewport are drawn by the library anyway, and the collision force is O(n²). If this is too slow at 1,000 nodes, add a viewport check in the node painter and a spatial index for the collision (OQ-28).

## 11. Risks
| ID | Risk | Mitigation |
|----|------|------------|
| R-G1 | A free layout may place ancestors beside their descendants and hide the generations | The connection rules are the same; the tree page keeps the ordered view; the accessible list keeps the order |
| R-G2 | Canvas is not accessible | Accessible list (FR-45) |
| R-G3 | Third-party library is abandoned or changes its API | Pinned version; the library is used through one interface (`GraphHandle`) in `ForceGraphCanvas.tsx` |
| R-G4 | Text on canvas is blurry on high-density screens | Draw with the device pixel ratio (library option, checked in testing) |
| R-G5 | The version pin does not exist on npm, or the lock file is out of sync | Section 7: `npm view`, then `npm install` and `npm ci` before commit |

## 12. Open questions
| ID | Question | Status |
|----|----------|--------|
| OQ-27 | Distances of the link and couple forces (proposed: parent-child longer than marriage; values tuned on a real tree). | Open, tune after the first run |
| OQ-28 | Viewport culling and a spatial index for the collision force: needed at 1,000 nodes, or not? | Open, decide after measuring (TC-90) |
| OQ-29 | Layout: generations forced into rows, or free? | **Decided: free force layout**, with the same connection rules |
| OQ-30 | Export from the graph page (PNG of the canvas). | **Decided: after the first implementation**; PNG implemented (section 6) |
| OQ-31 | Bundle: main, or separate chunk? | **Decided: separate chunk** (section 7) |
