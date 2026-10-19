# UI specification

Derived from the draw.io sketch in [`3-interfaces.md`](3-interfaces.md) (SVG 862×431 px with the diagram source embedded). The sketch shows one **family unit**: a couple, their child, the child's spouse, and one filled-in example card. Its sample data is synthetic ("John Example", id `XXXX-XXX`).

> Housekeeping: about 99 % of that file is base64 fallback images of the text labels. Consider keeping the diagram as a `.drawio` (or plain `.svg`) file in `8-attachments/` and linking it, so the Markdown stays readable.

## 1. Person card
Four lines, in this order:

| Line | Content | Example |
|------|---------|---------|
| 1 | Name | John Example |
| 2 | birth date (yyyy-MM-dd) – death date (yyyy-MM-dd) (age) | 1800-12-31 - 1900-01-01 (99) |
| 3 | birth place – death place | São Paulo, São Paulo, Brazil - São Paulo, São Paulo, Brazil |
| 4 | FamilySearch person id | XXXX-XXX |

Visual rules read from the sketch:
- Rectangle with square corners, fixed size **250 × 90 px**. The sketch's filled example is 330 px wide because of long place names; **decided: cards stay fixed at 250 px and long text is truncated** (OQ-19).
- Gender by fill: **blue** gradient `#dae8fc → #7ea6e0`, stroke `#6c8ebf`; **pink/red** gradient `#f8cecc → #ea6b66`, stroke `#b85450`. Blue is used for men and pink for women (inferred from the layout; confirm).
- Unknown gender has no colour in the sketch; **decided: neutral grey** with the same stroke weight (OQ-16).
- Text colour and alignment are not specified; the labels in the sketch are centred.

Field rules (proposal):
| Field | Rule |
|-------|------|
| Name | As returned; long names truncated with an ellipsis, full text in a tooltip |
| Dates | Living person: only the birth date (no dash, no death part, no age). Display as `yyyy-MM-dd` when the date is complete. Dates come as GEDCOM X text and may be partial, approximate or a range: show the available part (`1800`, `1800-12`) or the raw text; never invent a day or month |
| Age | Shown only for deceased people: the API's `ageAtDeath` when present, otherwise computed when both dates are complete. **Living people: no age** (OQ-15) |
| Places | Full normalized text, truncated with an ellipsis when it does not fit the fixed 250 px width; the tooltip shows the full text (OQ-19). The sketch's example (`São Paulo, São Paulo, Brazil - São Paulo, São Paulo, Brazil`) therefore shows truncated |
| Id | Shown as text; links to the person page on familysearch.org (FR-18) |
| Missing data | The line stays (fixed height) with a dash or stays empty; never shows "undefined" |

## 2. Family unit layout (as drawn)
```
 [ Father  (blue) ] ──── marriage date / place ──── [ Mother (pink) ]
          │                                                │
          └───────────────────┬────────────────────────┘
                              │
                     [ Child (pink) ] ──── marriage date / place ──── [ Spouse (blue) ]
```
Geometry in the sketch (px, inside an 860×430 frame):

| Element | x | y | Size |
|---------|---|---|------|
| Father card | 10 | 10 | 250×90 |
| Mother card | 450 | 10 | 250×90 |
| Child card | 190 | 160 | 250×90 |
| Child's spouse card | 600 | 165 | 250×90 |
| Example filled card | 340 | 310 | 330×90 |

Rules read from the sketch:
1. **Couple link**: a horizontal line between the partners, without arrowheads, carrying a two-line label: *Marriage date (yyyy-MM-dd)* and *Marriage location*. The gap between partners is about 190 px, which is the room for that label.
2. **Parent–child link**: orthogonal lines from the bottom centre of each parent down to the top centre of the child; both lines meet at the child (about 60 px of vertical space).
3. **Ancestors above, descendants below**: the root of V1 sits at the bottom, parents above it.
4. **Partner order**: man on the left, woman on the right in the parents' row (this answers OQ-10 as drawn).
5. **Spouse of the child**: placed to the right of the child, joined by the same kind of marriage link, regardless of gender (the pink child has a blue spouse on the right).
6. The child is roughly centred under the couple.

### Several children and several spouses (decided, OQ-17)
7. **Several children** are drawn **side by side** in one row below their parents' couple, left to right. Each child has a *slot*; the slot is as wide as the child's card plus, **only if spouses exist**, room for each spouse.
8. **Spouses** are drawn to the right of the person, at the **same level** (same row), each joined by its own marriage link and label. **Several spouses** follow the same rule: one after another to the right, same row.
9. **No spouse, no card**: when a person has no known spouse, no spouse card and no empty placeholder is drawn and the slot is not widened.
10. Slot width = 250 + n × (160 + 250) px for a person with *n* spouses (160 px being the room for the marriage label in the sketch). The row grows to the right; very wide families are handled by pan/zoom (OQ-20 for wrapping).

Orientation (vertical, root at the bottom) is **final** (OQ-18).

## 3. How the sketch maps to the views (proposal)
| View | What is drawn |
|------|---------------|
| V1 | The root at the bottom, each ancestor couple above with its marriage link, up to the generations loaded |
| V2 | Same, plus every child of each couple, side by side in a row below that couple (siblings of the ancestor on the line) |
| V3 | Same, plus each child's spouse(s) on the right at the same level with marriage links (only if they exist), and each union's children below |

## 4. Requirements and tests derived
New or changed items are in [functional requirements](../2-requirements/1-functional.md) (FR-17, FR-24 to FR-30) and [test cases](../6-tests/2-test-cases.md) (TC-61 to TC-71).

## 5. Decisions and open questions
| ID | Topic | Status |
|----|-------|--------|
| OQ-15 | Age for living people | **Decided:** no age (and no death part) |
| OQ-16 | Unknown gender colour | **Decided:** neutral grey |
| OQ-17 | Several children / spouses / no spouse | **Decided:** children side by side with room for spouses if they exist; several spouses at the same level; no spouse means no card |
| OQ-18 | Orientation | **Decided:** vertical, root at the bottom |
| OQ-19 | Card width | **Decided:** fixed 250 px, truncation with tooltip |
| OQ-20 | Families with very many children (e.g. 15+) in one row: keep one long row with pan/zoom, or wrap into several rows? | Open (proposal: one row, pan/zoom) |
