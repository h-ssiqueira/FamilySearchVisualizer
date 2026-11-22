# Test cases: accessibility (NFR-06)

This file covers NFR-06 in Gherkin. It complements `2-test-cases.md`. It supersedes TC-50 in that file.

```gherkin
Feature: Accessibility of the tree

  @TC-50 @NFR-06 @component
  Scenario: The arrow keys move the focus to the nearest card in that direction
    Given the tree is shown with a child and its two parents
    When the user focuses the child and presses the up arrow
    Then the focus moves to one of the parents
    Given the focus is on the father
    When the user presses the right arrow
    Then the focus moves to the mother
    Given the focus is on the mother
    When the user presses the right arrow and there is no card that way
    Then the focus stays on the mother
    # covered by: src/ui/TreeCanvas.keyboard.test.tsx

  @TC-50 @NFR-06 @e2e @open
  Scenario: The whole tree is operable with the keyboard alone in the browser
    Given the tree is shown in a browser
    When the user only uses Tab, the arrow keys, Enter and the zoom keys
    Then every card, button and control is reached and operated
    And the focus is visible on each of them
    # open: check in the browser; the focus style is in src/ui/styles.css (focus-visible)

  @TC-51 @NFR-06 @e2e @open
  Scenario: No serious or critical accessibility violations on the tree screens
    Given the V1, V2 and V3 tree screens and the graph page
    When axe checks each screen
    Then there are no serious or critical violations
    # open: only the login screen is checked (e2e/smoke.spec.ts)

  @TC-64 @NFR-06 @FR-27 @component @open
  Scenario: Text on the cards has a contrast of at least 4.5 to 1
    Given the male, female and unknown cards in the light theme and in the dark theme
    When the contrast of the text on each card is measured
    Then it is at least 4.5 to 1
    # open: contrast is not measured

  @TC-52 @NFR-06 @FR-27 @component
  Scenario: Gender is conveyed by more than colour
    Given male, female and unknown cards
    When the cards are shown
    Then each gender has a colour and a symbol with a text alternative
    # covered by: src/ui/PersonCard.test.tsx

  @TC-77 @NFR-06 @FR-35 @manual @open
  Scenario: The dark theme keeps the text readable
    Given the dark theme is shown
    When the text and the controls are inspected
    Then the contrast meets the requirement
    # open: visual check (see TC-64)
```
