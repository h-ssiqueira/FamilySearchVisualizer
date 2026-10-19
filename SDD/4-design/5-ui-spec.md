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
- Rectangle with square corners, fixed height **90 px**, width **250 px** (the filled example is **330 px** wide because of long place names).
- Gender by fill: **blue** gradient `#dae8fc → #7ea6e0`, stroke `#6c8ebf`; **pink/red** gradient `#f8cecc → #ea6b66`, stroke `#b85450`. Blue is used for men and pink for women (inferred from the layout; confirm).
- Unknown gender has no colour in the sketch (proposal: neutral grey, OQ-16).
- Text colour and alignment are not specified; the labels in the sketch are centred.

Field rules (proposal):
| Field | Rule |
|-------|------|
| Name | As returned; long names truncated with an ellipsis, full text in a tooltip |
| Dates | Display as `yyyy-MM-dd` when the date is complete. Dates come as GEDCOM X text and may be partial, approximate or a range: show the available part (`1800`, `1800-12`) or the raw text; never invent a day or month |
| Age | The API's `ageAtDeath` when present; otherwise computed when both dates are complete. Living people: see OQ-15 |
| Places | Full normalized text; if it does not fit, truncate with ellipsis + tooltip, or widen the card up to 330 px (OQ-19) |
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

Assumptions to confirm: the sketch shows only one child and one spouse, so how several children, several spouses and unknown partners are laid out is not defined (OQ-17); and the orientation (vertical, root at the bottom) is taken from this single example (OQ-18).

## 3. How the sketch maps to the views (proposal)
| View | What is drawn |
|------|---------------|
| V1 | The root at the bottom, each ancestor couple above with its marriage link, up to the generations loaded |
| V2 | Same, plus every child of each couple in a row below that couple (siblings of the ancestor on the line) |
| V3 | Same, plus each child's spouse on the right with a marriage link, and that union's children below |

## 4. Requirements and tests derived
New or changed items are in [functional requirements](../2-requirements/1-functional.md) (FR-17, FR-24 to FR-28) and [test cases](../6-tests/2-test-cases.md) (TC-61 to TC-67).

## 5. Open questions
| ID | Question |
|----|----------|
| OQ-15 | Age for living people: show the current age, or only birth date and no age? |
| OQ-16 | Colour for unknown gender (proposal: neutral grey with the same stroke weight)? |
| OQ-17 | Layout for several children, several spouses and a missing partner? |
| OQ-18 | Is the vertical orientation with the root at the bottom final, or should a horizontal pedigree also be offered? |
| OQ-19 | Fixed 250 px cards with truncation, or cards that grow up to 330 px for long place names? |
