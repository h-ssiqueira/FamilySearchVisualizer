# Force-graph view (second page)

Status: **Proposed**, to be confirmed before code is written. The page is a second way of drawing the same family data; the tree page stays as it is.

## 1. Purpose
A second page shows the people and relations of the tree as a 2D force-directed graph, drawn on a canvas with the library [`force-graph`](https://github.com/vasturiano/force-graph) (MIT licence, built on `d3-force`). The graph is for exploring how relatives connect; the tree page remains the reference for reading the pedigree.

## 2. Scope
- In: a route `#/graph` (FR-41); the same views V1, V2 and V3 and the same data as the tree page; the same card content and colours (FR-43); selection, drag, pan and zoom (FR-44); an accessible list alternative (FR-45).
- Out (v1): exporting from the graph page (OQ-30); editing; any new FamilySearch request beyond what the tree page already loads (FR-41); saving the layout.

## 3. Data
The graph is built from the same `FamilyView` the tree page uses (`src/tree`). No new data is loaded.

| Graph element | Source |
|---------------|--------|
| Node | each `FamilyCard`; its size is `cardWidth(person)` by `CARD_HEIGHT` (90 px) |
| Parent-child link | each `FamilyCouple` of kind `parents` to each child in `childIds` |
| Marriage link | each `FamilyCouple` of kind `union` between its two partners (drawn dashed, with the marriage date and place) |
| Generation | `FamilyCard.row` (root 0, ancestors positive, descendants negative) |

## 4. Layout
A force simulation (the library's default, `d3-force`) with three additions:
1. **Generation force:** a `forceY` pulls every card towards the row of its generation, so ancestors stay above and descendants below (OQ-29). Strength and spacing are OQ-27.
2. **Couple force:** a `forceX` keeps two partners of one couple close, so the marriage link is short.
3. **Charge:** the default repulsion keeps cards apart; the card size is used for collision (no overlapping cards).

The simulation runs until it cools down and then stops; dragging a node reheats it for that node only.

## 5. Rendering
- The library draws on a canvas through a custom `nodeCanvasObject`: a rounded rectangle with the card colours (gender, FR-27), then the four lines of FR-17, truncated to the card width with an ellipsis. The text is the same as the tree's card text (`cardLines`).
- Colours come from the theme variables (`--text`, `--background`, ...) read at draw time, so the dark theme (FR-35) applies to the links and labels. Card colours by gender stay light in both themes, as on the tree page.
- Links: solid for parent-child, dashed for marriage.
- The canvas is redrawn by the library; React does not re-render on each tick. The graph is a child component that owns the library instance and updates it only when the data changes.

## 6. Interaction
- Pan and zoom, drag of a node: built into the library.
- Click on a node: selects it and opens the details panel of the tree page (FR-16). The same selection is kept when the user switches to the tree page.
- Hover: the full name in a tooltip.
- Keyboard and screen readers cannot use a canvas. Every person on the page is therefore also listed in an accessible list (FR-45); selecting a row selects the node.

## 7. Module placement
| Layer | Change | Dependency rule |
|-------|--------|-----------------|
| `src/graph/` (new) | pure functions: `FamilyView` to nodes and links; node size and label lines; the force settings | imports `domain` and `tree` only |
| `src/ui/GraphScreen.tsx` (new) | owns the `force-graph` instance and the accessible list | `ui` may import `graph` and `tree` |
| `src/App.tsx` | route `#/graph` | unchanged rules |
| `src/ui/TreeScreen.tsx` | link to the graph page | unchanged |

The library is the only new runtime dependency. It is pinned to an exact version in `package.json`, and its installed size is checked before the release (OQ-31 covers the decision to keep it in the main bundle or split it).

## 8. Security and privacy
- The library is bundled, not loaded from a CDN, so the existing CSP (`script-src 'self'`) holds (`5-security/2-security-controls.md`).
- It makes no network request. The graph page only uses the data already loaded (NFR-05).
- The library is a third-party dependency: it is covered by Dependabot and `npm audit` in CI, and its version is pinned. Before adoption, check that the version is maintained and that its licence (MIT) is accepted.

## 9. Accessibility (NFR-06)
Canvas output is not readable by assistive technology, so the accessible list (FR-45) is the alternative. The list is in document order, can be operated with the keyboard, and selects the same person as a click on the canvas.

## 10. Performance
- The graph must stay responsive with the first batch (proposed: 4 generations, up to 31 people in V1) and with V3. Measure with 300 and 1,000 nodes (TC-90).
- The simulation cools down; a large graph is not re-simulated on every render.
- Cards outside the viewport are drawn by the library anyway; if this is too slow at 1,000 nodes, switch to a viewport check in the node painter (OQ-28).

## 11. Risks
| ID | Risk | Mitigation |
|----|------|------------|
| R-G1 | A force layout does not keep reading order (ancestors may drift sideways) | Generation force (section 4) and the tree page stays available |
| R-G2 | Canvas is not accessible | Accessible list (FR-45) |
| R-G3 | Third-party library is abandoned or changes its API | Pinned version; the library is used through a small wrapper in `src/graph` |
| R-G4 | Text on canvas is blurry on high-density screens | Draw with the device pixel ratio (library option, checked in testing) |

## 12. Open questions
| ID | Question |
|----|----------|
| OQ-27 | Strength of the generation force and the distance between generations (proposed: 60 px between rows; to be tuned on a real tree). |
| OQ-28 | Viewport culling in the node painter: needed at 1,000 nodes, or not? Decide after measuring (TC-90). |
| OQ-29 | Generations forced into rows (proposed: yes, section 4), or a free layout that is less exact but more natural? |
| OQ-30 | Export from the graph page (PNG of the canvas, `canvas.toDataURL`): in this version or later? Proposed: later. |
| OQ-31 | Keep the library in the main bundle, or load the graph page as a separate chunk? Proposed: separate chunk, so the tree page does not pay for it. |
