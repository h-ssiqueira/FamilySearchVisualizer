# Test cases: loading states, pause, empty state, per-person retry, graph hover

This file adds the cases for FR-12, FR-20 and FR-44 in Gherkin. It complements `2-test-cases.md`.

**Supersedes TC-58 in `2-test-cases.md`:** the control is now called *Pause* (FR-12), not *Stop*. The scenario below replaces it.

```gherkin
Feature: Loading states of the tree and the graph

  @TC-58 @TC-93 @FR-12 @component @integration
  Scenario: Pausing the loading keeps what is loaded and stops the requests
    Given "load all" is running
    When the user presses "Pause"
    Then the requests in flight are aborted
    And the people already loaded stay visible
    And "Load next generation" resumes the loading
    # covered by: src/ui/TreeToolbar.test.tsx (the pause button), src/ui/TreeToolbar.progress.test.tsx
    # the abort of the requests is covered by src/tree/ancestors.test.ts; the end-to-end flow is open

  @TC-93 @FR-12 @component
  Scenario: While loading, the toolbar shows the generations and the people loaded so far
    Given the tree is loading with 2 generations and 5 people
    When the toolbar is shown
    Then it says "Loading: 2 generations, 5 people"
    # covered by: src/ui/TreeToolbar.progress.test.tsx

  @TC-94 @FR-20 @component
  Scenario: A person with no parents on record sees a message saying so
    Given a root person with no parents recorded
    When the tree page is shown
    Then it says "No parents are recorded for this person."
    # covered by: src/ui/TreeScreen.states.test.tsx

  @TC-95 @FR-20 @FR-33 @component
  Scenario: Each person that could not be loaded has its own "try again" action
    Given a parent whose details failed to load
    When the tree page is shown
    Then the person is listed under "People not loaded"
    And it has an action "Try again: <id>"
    When the user presses that action
    Then the person is requested again
    And the people already loaded are not requested again
    # covered by: src/ui/TreeScreen.states.test.tsx
  @TC-95 @open
  Scenario: The per-person action names the person, not only the id
    Given a parent whose details failed to load
    When the list is shown
    Then the action names the person
    # open: the failed list keeps the id only; the name comes from the parent entry

  @TC-96 @FR-44 @component @open
  Scenario: Hovering a node on the graph shows its full name
    Given the graph page is drawn
    When the user hovers a node
    Then a tooltip shows the full name of that person
    # the tooltip is set in src/ui/ForceGraphCanvas.tsx (nodeLabel); the drawing is open: needs a browser
```
