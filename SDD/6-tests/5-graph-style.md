# Test cases: graph style (circles with labels)

This file replaces the graph node check of TC-87 in `2-test-cases.md`. The node is no longer a card: it is a circle with the name under it (FR-43).

**Supersedes TC-87:** a node keeps the person's card in its data, but the graph does not draw the card.

```gherkin
Feature: Graph nodes as circles with labels

  @TC-87 @FR-43 @unit
  Scenario: The graph data keeps each person's state for the labels
    Given a card with unexpected, unavailable or repeated data
    When the graph data is built
    Then the node keeps the state, so that the label can name it
    And the label carries the same text as the tree card's name and notes
    # covered by: src/graph/graphData.test.ts (nodeLines)
    # the drawing of the circle is open: needs a browser

  @TC-98 @FR-43 @component @open
  Scenario: A person is drawn as a circle coloured by gender, with the name under it
    Given a family graph with a man, a woman and a person of unknown gender
    When the graph is drawn
    Then each person is a circle of the gender colour
    And the gender symbol and the name are written under the circle
    # open: check in the browser

  @TC-99 @FR-43 @NFR-06 @component @open
  Scenario: A person with unexpected or unavailable data is drawn hollow, with the note
    Given a person whose data is unexpected, and a person with no data
    When the graph is drawn
    Then each is a dashed hollow circle
    And the note is written after the name
    # open: check in the browser

  @TC-100 @FR-43 @open
  Scenario: Long names are cut, and the full name appears on hover
    Given a person with a long name
    When the graph is drawn and the user hovers the circle
    Then the label is cut with an ellipsis
    And the full name is shown
    # open: check in the browser
```
