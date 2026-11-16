# Test cases

All test cases are written in Gherkin. Each scenario carries tags:

- `@TC-xx`: the test case ID (never reused).
- `@FR-xx`, `@NFR-xx`, `@R-xx`, `@OQ-xx`: the requirements the case covers.
- One level tag: `@unit`, `@component`, `@integration`, `@e2e` or `@manual`.
- Status tag, when needed: `@open` (not implemented or not tested yet), `@planned` (for a feature not built yet), `@removed` (the requirement was removed by decision).

A comment line under each scenario names the file that covers it (`# covered by: ...`). Scenarios without that line are not covered yet.

## Authentication

```gherkin
Feature: Authentication and session

  @TC-01 @FR-01 @component @e2e
  Scenario: Only the sign-in button is shown without a session
    Given there is no session
    When the app opens
    Then only the "Sign in with Google (FamilySearch)" button is shown

  @TC-02 @FR-01 @component
  Scenario: The login button goes to the configured login address and nowhere else
    Given the login address is configured as VITE_FS_LOGIN_URL
    When the user clicks the login button
    Then the browser navigates to the configured login address only

  @TC-03 @FR-02 @integration
  Scenario: API calls carry the bearer token and only go to the FamilySearch host
    Given a token is available
    When the app calls the FamilySearch API
    Then each call has the header "Authorization: Bearer"
    And each call goes to www.familysearch.org only

  @TC-04 @FR-02 @NFR-04 @integration
  Scenario: The token never appears in the URL, the console, the errors or the browser storage
    Given a token is in memory
    When the app runs a full session
    Then the token is not in the URL
    And the token is not in the console output or in error messages
    And the token is not in localStorage or sessionStorage

  @TC-05 @FR-01 @FR-34 @integration
  Scenario: The browser blocks the FamilySearch window
    Given the browser blocks pop-ups
    When the user clicks "Open FamilySearch and connect"
    Then a friendly message says the window was blocked
    # covered by: src/relay/LoginScreen.relay.test.tsx
  @TC-05 @open
  Scenario: The login at FamilySearch is cancelled or fails
    Given the user starts the login at FamilySearch
    When the user cancels the login or it fails
    Then the app shows a message and lets the user try again

  @TC-06 @FR-03 @integration
  Scenario: Sign-out clears everything from the session
    Given a session with a token, a cache, an open view and a relay connection
    When the user signs out
    Then memory, sessionStorage, the cache, the open view and the relay connection are cleared
    And the protected view is not reachable
    # covered by: src/state/session.test.ts

  @TC-07 @FR-04 @integration @open
  Scenario: A 401 keeps the tree and the view until the user signs in again
    Given the session is open on a view with a loaded tree
    When a person request returns 401
    Then the token and the relay connection are cleared
    And the login screen says the session ended
    And after signing in again the same view is shown
    # partly covered by: src/state/session.test.ts (the full flow is open)

  @TC-08 @NFR-04 @integration
  Scenario: A token in the address is removed before the router starts
    Given the address contains a token-like parameter
    When the app starts
    Then the parameter is taken into memory
    And the address bar no longer shows it
    # covered by: src/auth/auth.test.ts
```

## Data and mapping

```gherkin
Feature: Mapping FamilySearch responses to the domain model

  @TC-10 @FR-05 @unit
  Scenario: The current user is mapped to the domain model
    Given a users/current response
    When the response is mapped
    Then the result has the id, name, gender and birth date of the user

  @TC-11 @FR-07 @unit
  Scenario Outline: The date text comes from the formal text, then the normalized text, then unknown
    Given a date with <formal> and <normalized>
    When the date is shown
    Then the result is <shown>

    Examples:
      | formal     | normalized | shown   |
      | 1900       | 1900-01    | 1900    |
      | (none)     | 1900-01    | 1900-01 |
      | (none)     | (none)     | unknown |

  @TC-12 @FR-06 @unit
  Scenario: A person with no death shows no age
    Given a person with no death date
    When the person is mapped
    Then the age is not shown

  @TC-13 @FR-19 @unit
  Scenario: Several parent sets and spouses are kept, with the preferred flag
    Given a person with two parent sets and two spouses
    When the person is mapped
    Then both parent sets and both spouses are in the model
    And the preferred flag is kept for each
    # covered by: src/api/mappers.parentSets.test.ts; the families button: src/tree/family.families.test.ts
  @TC-13 @open
  Scenario: The indicator of the other parent families
    Given a person has another parent family
    When the tree is shown
    Then the other parent family is indicated

  @TC-14 @removed
  Scenario: Placeholders for missing parents
    # Removed with FR-11: missing parents are shown by the unavailable card (TC-43).

  @TC-15 @FR-36 @NFR-12 @component @unit
  Scenario: A response in an unexpected shape keeps the person on the tree, marked
    Given a parent whose data comes back in an unexpected shape
    When the tree is built
    Then the person keeps its place, marked as unexpected
    And the card says "Unexpected response" where the dates go
    And the rest of the tree is built
    And the parents of that person are not requested
    And a root in that state counts as a failure
    # covered by: src/tree/ancestors.invalid.test.ts, src/ui/PersonCard.invalid.test.tsx, src/api/schemaError.test.ts

  @TC-16 @FR-10 @unit
  Scenario: The same person is requested once per session
    Given a person was loaded
    When the person is requested again
    Then no new network call is made
    # covered by: src/state/personSource.test.ts
```

## Views

```gherkin
Feature: Views of the tree

  @TC-20 @unit
  Scenario: The direct line of three generations is a complete binary tree
    Given a complete pedigree of three generations
    When the direct line is built to depth 3
    Then the tree has 1, 2, 4 and 8 people per generation
    # covered by: src/tree/ancestors.test.ts
    # the requirement that owned this case (FR-11) was removed; the case stays as a builder regression test

  @TC-21 @unit @open
  Scenario: Unknown ancestors are drawn as unavailable cards and recursion stops
    Given some ancestors are unknown
    When the direct line is built
    Then each unknown ancestor is drawn as an unavailable card
    And no further generation is requested beyond it
    # placeholders without a card are removed with FR-11

  @TC-22 @R-06 @unit
  Scenario: An ancestor reached twice is one card with the repeat symbol
    Given an ancestor is the parent of two branches
    When the tree is built
    Then the ancestor is drawn once, marked with the repeat symbol
    And each child has an edge to that ancestor
    # covered by: src/tree/ancestors.repeated.test.ts, src/ui/PersonCard.markers.test.tsx
    # the requirement that owned the marker (FR-11) was removed; the graph page still requires it (FR-43)

  @TC-23 @FR-13 @unit
  Scenario: V2 shows every child of each couple, including the siblings of the root
    Given a couple shown in the tree
    When the view changes to V2
    Then every child of each couple is shown
    And the siblings of the root are shown under the root's parents
    # covered by: src/tree/family.test.ts

  @TC-24 @FR-13 @FR-37 @integration
  Scenario: V2 loads each relative once, from the cache when known
    Given the relatives shown in V2
    When the view changes to V2
    Then each relative gets one details request
    And relatives already known come from the cache
    And the people on the line are not requested again
    # covered by: src/tree/family.details.test.ts, src/ui/TreeScreen.test.tsx

  @TC-25 @FR-14 @unit
  Scenario: V3 shows the spouses of the children and their children
    Given a child shown in V2
    When the view changes to V3
    Then the spouses of that child are shown
    And their children are shown
    # covered by: src/tree/family.test.ts

  @TC-26 @FR-14 @integration
  Scenario: V3 makes one details request per child
    Given the children shown in V2
    When the view changes to V3
    Then exactly one details request is made per child
    # covered by: src/tree/family.test.ts

  @TC-27 @FR-15 @integration @open
  Scenario: Switching between V1, V2 and V3 does not repeat requests
    Given the views V3, V1 and V3 in that order
    When the user switches between them
    Then no request is repeated
    # covered by: src/ui/TreeScreen.test.tsx (the request count is open)

  @TC-28 @FR-12 @FR-31 @unit
  Scenario: Loading more generations fetches only the missing people in each branch
    Given some generations are loaded
    When the user loads the next generation or all generations
    Then only the missing people are fetched in each branch
    And loading stops when no branch has parents left
    # covered by: src/tree/ancestors.pending.test.ts

  @TC-29 @FR-17 @component
  Scenario: A card shows the name, the life span, the birth place, or "unknown"
    Given a person with name, dates and places
    When the card is shown
    Then the card shows the name, the life span and the birth place
    And a missing value is shown as "unknown"
    # covered by: src/ui/PersonCard.test.tsx

  @TC-30 @FR-18 @component
  Scenario: Expanding a light card fetches its details once
    Given a light card
    When the user expands the card
    Then one details request is made
    # covered by: src/ui/PersonPanel.test.tsx
```

## Resilience

```gherkin
Feature: Resilience to throttling, failures and interruptions

  @TC-40 @FR-09 @NFR-03 @integration
  Scenario: Throttling pauses every queued request and shows the seconds left
    Given FamilySearch answers 429 with Retry-After of 5 seconds
    When requests are queued
    Then all queued requests pause for about 5 seconds
    And the toolbar shows the seconds left
    And the requests resume afterwards
    # covered by: src/api/requestQueue.wait.test.ts, src/ui/TreeToolbar.wait.test.tsx

  @TC-41 @FR-23 @integration
  Scenario: No more requests are in flight than the limit
    Given a queue with a limit of N
    When more than N requests are queued
    Then no more than N requests are in flight at once
    # covered by: src/api/requestQueue.test.ts

  @TC-42 @NFR-03 @FR-33 @integration
  Scenario: A network failure is retried with back-off, then the person is marked as not loaded
    Given a network request fails without an answer
    When the client retries it
    Then the retries wait 1 s, 2 s and 4 s
    And after the last retry the person is shown as not loaded
    And the "retry" action requests that person again
    And an HTTP error answer is not retried by the client
    # covered by: src/api/familySearchClient.backoff.test.ts (UI part: TC-46)

  @TC-43 @FR-38 @unit @component
  Scenario: A restricted or missing person is shown as "Not available"
    Given a parent with no data
    When the tree is built
    Then the person is shown as an unavailable card in its place
    And the branch ends there
    # covered by: src/tree/ancestors.markers.test.ts, src/ui/PersonCard.markers.test.tsx

  @TC-44 @integration @open
  Scenario: A change of view or root during loading cancels the requests in flight
    Given the tree is loading
    When the user changes the view or the root
    Then the requests in flight are aborted
    And their late results are ignored
    # the builder abort is covered by src/tree/ancestors.test.ts; the UI flow is open

  @TC-45 @FR-33 @unit
  Scenario: One person's failure does not stop the other branches
    Given one person fails with a transient error
    When the tree is built
    Then the other branches keep loading
    And the failed person is listed as failed and as pending
    # covered by: src/tree/ancestors.failure.test.ts

  @TC-46 @FR-33 @component
  Scenario: The toolbar counts the people not loaded, and retry loads only them
    Given some people failed to load
    When the user presses "retry"
    Then the toolbar shows the count of people not loaded
    And only the failed people are requested again
    # covered by: src/ui/TreeScreen.retry.test.tsx

  @TC-47 @FR-33 @unit
  Scenario: An expired session stops the whole load; any other error only marks one person
    Given a request returns 401
    When the tree is built
    Then the whole load stops
    Given a request fails with any other error
    When the tree is built
    Then only that person is marked
    # covered by: src/tree/ancestors.failure.test.ts

  @TC-79 @FR-37 @FR-33 @unit
  Scenario: A relative whose details fail keeps its light card
    Given a relative whose details request fails
    When the details are loaded
    Then the relative keeps its light card
    And an expired session stops the detail loading
    # covered by: src/tree/family.details.test.ts

  @TC-83 @FR-39 @unit
  Scenario: A person who cannot be loaded is written to the console once per reason
    Given a person whose load fails, who has no data, or who has unexpected data
    When the tree is built
    Then the console gets one line with the id, the name and the reason
    And each reason is written once per load
    And a person that loads correctly writes nothing
    # covered by: src/tree/ancestors.logging.test.ts
```

## Relay

```gherkin
Feature: Relay to a FamilySearch tab

  @TC-48 @FR-34 @unit
  Scenario: The relay handshake goes only to the relay origin
    Given the user clicks "Open FamilySearch and connect"
    When the app starts the handshake
    Then the handshake is sent to the relay origin only
    And a "ready" message from another origin is ignored
    # covered by: src/relay/relayClient.test.ts

  @TC-49 @FR-34 @unit
  Scenario: A request is answered with the status, body and Retry-After of the relay
    Given a request through the relay
    When the relay answers
    Then the status, the body and the Retry-After are returned
    And a reply from another origin is ignored
    And no reply in time is a timeout
    # covered by: src/relay/relayClient.test.ts

  @TC-50b @FR-34 @unit
  Scenario: The relay script answers only the allowed requests
    Given the relay script runs in the FamilySearch tab
    When a request comes from an allowed origin and is a GET to an allowed endpoint
    Then the relay answers it
    And any other request gets 403 without calling FamilySearch
    # covered by: src/relay/relayScript.test.ts

  @TC-51b @FR-34 @NFR-11 @unit
  Scenario: The endpoint list in the relay script equals the app's allow-list
    Given the endpoint list of the app and of the relay script
    When both lists are compared
    Then they are identical
    # covered by: src/relay/relayScript.test.ts

  @TC-52b @FR-34 @manual @open
  Scenario: The session cookie alone authorises the endpoints through the relay
    Given a real session on familysearch.org
    When the relay answers the app
    Then the token fallback is not needed
    # open: check whether the session cookie alone authorises the endpoints
```

## Non-functional

```gherkin
Feature: Non-functional requirements

  @TC-50 @NFR-06 @e2e @open
  Scenario: The whole tree can be used with the keyboard alone
    Given the tree is shown
    When the user uses only the keyboard
    Then every element is reachable and the focus is visible
    # open: no keyboard navigation between cards

  @TC-51 @NFR-06 @e2e @open
  Scenario: No serious or critical accessibility violations on every screen
    Given the login, V1, V2 and V3 screens
    When axe checks each screen
    Then there are no serious or critical violations
    # open: only the login screen is checked (e2e/smoke.spec.ts)

  @TC-52 @NFR-06 @component
  Scenario: Gender is conveyed by more than colour
    Given male, female and unknown cards
    When the cards are shown
    Then each gender has a colour and a symbol
    # covered by: src/ui/PersonCard.test.tsx

  @TC-53 @NFR-02 @unit
  Scenario: The first batch of four generations asks for at most 31 people
    Given a complete pedigree
    When four generations are loaded
    Then at most 31 people are requested
    # covered by: src/tree/ancestors.budget.test.ts

  @TC-54 @NFR-05 @e2e
  Scenario: No request goes to a host other than FamilySearch
    Given the app runs
    When the pages load
    Then no request goes to any other host
    # covered by: e2e/smoke.spec.ts

  @TC-55 @security @component
  Scenario: Markup in a name is shown as text
    Given a name containing script or HTML
    When the card is shown
    Then the markup is shown as plain text
    # covered by: src/ui/security.test.tsx

  @TC-56 @NFR-07 @e2e
  Scenario: The login screen fits a 360 px phone without sideways scrolling
    Given a 360 px wide viewport
    When the login screen opens
    Then there is no sideways scrolling
    # covered by: e2e/smoke.spec.ts
  @TC-56 @open
  Scenario: The tree screens fit a 360 px phone
    Given a 360 px wide viewport
    When a tree screen opens
    Then there is no sideways scrolling

  @TC-57 @NFR-08 @component
  Scenario: Every visible string comes from the catalog, with the same keys in each language
    Given the en and pt-BR catalogs
    When the keys are compared
    Then both have the same keys
    And every visible string comes from a catalog
    # covered by: src/i18n/i18n.test.ts

  @TC-58 @FR-12 @integration @open
  Scenario: Stopping "load all" aborts the requests and keeps what is loaded
    Given "load all" is running
    When the user presses "stop"
    Then the requests in flight are aborted
    And the people already loaded stay visible

  @TC-59 @FR-12 @NFR-02 @component
  Scenario: A tree of more than 1,000 people draws only the visible cards
    Given a tree of 1,000 people
    When the tree is shown
    Then only the cards near the viewport are drawn
    # covered by: src/ui/TreeCanvas.culling.test.tsx
  @TC-59 @open
  Scenario: Pan and zoom respond smoothly on a large tree
    Given a tree of 1,000 people
    When the user pans and zooms
    Then the canvas responds without visible delay

  @TC-60 @NFR-11 @ADR-10 @unit
  Scenario: The API client refuses URLs outside the allow-list and non-GET methods
    Given a URL outside the allow-list, or a method other than GET
    When the client is asked to send it
    Then the client refuses the request
    # covered by: src/api/allowList.test.ts

  @TC-74 @NFR-08 @unit
  Scenario: Numbers follow the locale; complete dates do not change
    Given the numbers 1234 and the complete date 1800-12-31
    When they are shown in en and in pt-BR
    Then 1234 is shown as "1,234" in en and as "1.234" in pt-BR
    And the date is shown as "1800-12-31" in both
    And prose dates are shown as received
    # covered by: src/i18n/format.test.ts
```

## UI cards and layout

```gherkin
Feature: Cards and layout of the tree

  @TC-61 @FR-17 @FR-24 @component @unit
  Scenario: The example card shows four lines and grows with its text
    Given the example person John Example, with the dates and places of the sketch
    When the card is shown
    Then it shows the four lines: name, life span, places and id
    And the card is wider than 250 px, up to 360 px
    # covered by: src/tree/cardWidth.test.ts, src/tree/familyLayout.width.test.ts

  @TC-62 @FR-25 @unit
  Scenario Outline: Dates are shown in the form that the data allows
    Given a date of kind <kind>
    When the date is shown
    Then the result is <shown>
    # covered by: src/domain/dates.test.ts

    Examples:
      | kind          | shown          |
      | complete      | yyyy-MM-dd     |
      | year only     | 1800           |
      | approximate   | the raw text   |
      | none          | empty          |

  @TC-63 @FR-24 @component @unit
  Scenario: Long text is truncated above the maximum width, with the full text in a tooltip
    Given a card width between 250 and 360 px estimated from the text
    When the text is longer than the maximum width
    Then the text is truncated with an ellipsis
    And the tooltip shows the full text
    And the card height stays 90 px
    # covered by: src/tree/cardWidth.test.ts, src/ui/PersonCard.test.tsx

  @TC-64 @FR-27 @NFR-06 @component @open
  Scenario: Male, female and unknown cards differ by colour and by a non-colour cue
    Given male, female and unknown cards
    When the cards are shown
    Then each has a non-colour cue
    And the text contrast is at least 4.5 to 1
    # open: contrast is not checked

  @TC-65 @FR-26 @component
  Scenario: A couple shows a horizontal link with the marriage date and place
    Given a couple with a marriage date and place
    When the couple is drawn
    Then a horizontal link joins the partners
    And the link shows the date and the place
    And missing marriage data hides only the missing parts
    # covered by: src/tree/familyLayout.test.ts

  @TC-66 @FR-28 @unit
  Scenario: The man is drawn left of the woman, the child under the couple
    Given a parent couple of a man and a woman, with a child
    When the layout is computed
    Then the man is left of the woman
    And the child is under the couple
    And a spouse is drawn right of the person
    # covered by: src/tree/familyLayout.test.ts

  @TC-67 @FR-26 @component
  Scenario: Parent-child links are orthogonal, without arrowheads, meeting at the child's top centre
    Given a parent and a child
    When the link is drawn
    Then the link is orthogonal
    And it has no arrowhead
    And it meets the top centre of the child card
    # covered by: src/tree/familyLayout.test.ts

  @TC-68 @FR-29 @unit
  Scenario: Three children of a couple are in one row under the couple, without overlap
    Given a couple with three children
    When the layout is computed
    Then the children are in one row, from left to right
    And no two cards overlap
    # covered by: src/tree/familyLayout.test.ts

  @TC-69 @FR-29 @FR-30 @unit
  Scenario: A child without a spouse has no spouse card and no placeholder
    Given a child with no spouse
    When the layout is computed
    Then there is no spouse card and no placeholder
    And the child's slot is 250 px wide
    Given a child with a spouse
    When the layout is computed
    Then the slot is widened by the spouse area
    # covered by: src/tree/familyLayout.test.ts

  @TC-70 @FR-30 @unit
  Scenario: Two spouses are drawn to the right, on the same row, each with its own label
    Given a person with two spouses
    When the layout is computed
    Then both spouses are drawn right of the person on the same row
    And each has its own marriage label
    # covered by: src/tree/familyLayout.test.ts

  @TC-71 @FR-25 @unit
  Scenario: A living person shows the birth date only; a deceased person shows the age
    Given a living person
    When the card text is built
    Then only the birth date is shown, with no dash and no age
    Given a deceased person
    When the card text is built
    Then the age is shown
    # covered by: src/domain/cardText.test.ts

  @TC-75 @FR-26 @unit
  Scenario: No card crosses a marriage line, including the siblings of each partner
    Given a couple whose partners have siblings, and one sibling has a spouse
    When the layout is computed
    Then the siblings of the left partner are on its left
    And the siblings of the right partner are on its right
    And no card crosses the marriage line
    # covered by: src/tree/familyLayout.siblings.test.ts

  @TC-78 @FR-19 @unit
  Scenario: Only the flagged spouse is shown when one is preferred
    Given a person with two spouses
    When one spouse is flagged as preferred and V2 is shown
    Then only that spouse is shown
    When none is flagged
    Then both spouses are shown
    # covered by: src/tree/family.preferred.test.ts

  @TC-81 @FR-19 @OQ-25 @unit @component
  Scenario: The families button cycles through the spouse families of a card
    Given a person with several spouse families
    When the families button is pressed
    Then the next family is shown on the card
    And the button shows the number of families
    And the choice wraps around
    And a person with one family has no button
    # covered by: src/tree/family.families.test.ts, src/ui/TreeCanvas.families.test.tsx
  @TC-81 @open
  Scenario: The families button cycles through the parent families
    Given a person with another parent family
    When the families button is pressed
    Then the parent family is cycled too
```

## Export

```gherkin
Feature: Export of the tree

  @TC-80 @FR-22 @component
  Scenario: The three exports are offered, and disabled for an empty tree
    Given a tree with people
    When the export buttons are shown
    Then SVG, PNG and PDF are offered
    And SVG downloads "family-tree.svg"
    Given an empty tree
    When the export buttons are shown
    Then all three are disabled
    # covered by: src/ui/ExportButton.test.tsx
  @TC-80 @manual @open
  Scenario: The PNG and PDF downloads open in a browser
    Given a tree in the browser
    When the user exports PNG and PDF
    Then both files download and open

  @TC-82 @FR-22 @unit
  Scenario: The PDF has a valid structure
    Given a one-page PDF with one image
    When the file is read
    Then it has the PDF header and the image size
    And it has the flate filter
    And its cross-reference table has one entry per object
    And startxref points at that table
    And the RGB conversion drops the alpha channel
    # covered by: src/tree/pdf.test.ts
```

## Waiting indicator

```gherkin
Feature: Waiting indicator

  @TC-72 @FR-09 @unit
  Scenario: The queue exposes the pause while it lasts
    Given the queue is paused by Retry-After
    When the pause starts and ends
    Then the queue exposes the pause while it lasts
    And it notifies the listeners when it starts and when it ends
    # covered by: src/api/requestQueue.wait.test.ts

  @TC-73 @FR-09 @component
  Scenario: The toolbar says how long to wait, before the loading message
    Given the queue is paused for 7 seconds
    When the toolbar is shown
    Then it says "FamilySearch asked us to wait 7 s"
    Given nothing is waiting
    When the toolbar is shown
    Then the normal status is shown
    # covered by: src/ui/TreeToolbar.wait.test.tsx
```

## Dark theme

```gherkin
Feature: Dark theme

  @TC-76 @FR-35 @component
  Scenario: The theme button switches the theme and remembers the choice
    Given the light theme is shown
    When the user presses the dark-mode button
    Then the page is marked as dark
    And the choice is remembered
    When the user presses it again
    Then the page goes back to light
    # covered by: src/ui/theme.test.tsx

  @TC-77 @FR-35 @component
  Scenario: The system setting is followed, and the button is labelled in pt-BR
    Given the choice is "system"
    When the page is shown
    Then the page follows the operating system and has no explicit marker
    Given the language is pt-BR
    When the button is shown
    Then it is labelled "Modo escuro"
    # covered by: src/ui/theme.test.tsx
  @TC-77 @manual @open
  Scenario: The contrast of the dark theme is acceptable
    Given the dark theme is shown
    When the contrast is measured
    Then it meets the contrast requirement
```

## Graph page

```gherkin
Feature: Graph page (force-graph)

  @TC-84 @FR-41 @component
  Scenario: The graph page is at #/graph and links back to the tree
    Given the user is on the graph page
    When the user follows the link to the tree
    Then the tree page opens at #/
    # covered by: src/ui/GraphScreen.test.tsx (link back)
  @TC-84 @open
  Scenario: The view level is kept between the two pages
    Given the user selected V3 on the tree page
    When the user opens the graph page
    Then the graph shows V3

  @TC-85 @FR-41 @integration @open
  Scenario: Switching to the graph makes no new request for people already loaded
    Given the tree is loaded
    When the user opens the graph page
    Then no request is made for people already loaded

  @TC-86 @FR-40 @FR-42 @unit
  Scenario: The graph has a node per card and the tree's links
    Given a family view
    When the graph data is built
    Then every card is a node
    And every parent-child pair is a solid link
    And every couple is a dashed marriage link with the same endpoints as the tree
    And a link to a person that is not on the view is left out
    # covered by: src/graph/graphData.test.ts

  @TC-87 @FR-43 @unit
  Scenario: A node has the size and text of its card
    Given a card
    When the node is built
    Then its size is the card's size
    And its four lines are the card's lines
    And the notes appear as on the tree
    # covered by: src/graph/graphData.test.ts (the drawing is open: needs a browser)

  @TC-88 @FR-44 @component
  Scenario: Selecting a person opens the details panel
    Given the graph page with its list of people
    When the user selects a person from the list
    Then the details panel of that person opens
    # covered by: src/ui/GraphScreen.test.tsx
  @TC-88 @open
  Scenario: Clicking a node on the canvas selects that person
    Given the graph is drawn
    When the user clicks a node
    Then that person is selected

  @TC-89 @FR-45 @component
  Scenario: The accessible list has one row per person and opens the same panel
    Given the graph page
    When the list is shown
    Then there is one row per person
    And selecting a row opens that person's panel
    # covered by: src/ui/GraphScreen.test.tsx
  @TC-89 @open
  Scenario: The list works with the keyboard alone
    Given the list is focused
    When the user moves with the keyboard and presses Enter
    Then the person of that row is selected

  @TC-90 @NFR-02 @e2e @open
  Scenario: The graph stays responsive with 300 and 1,000 people
    Given a graph of 300 people, then of 1,000 people
    When the layout settles and the user pans and zooms
    Then the layout settles and the canvas responds
    # open: measure in the browser (OQ-28)

  @TC-91 @FR-40 @integration @open
  Scenario: The graph library is in its own chunk
    Given the production build
    When the tree page's bundle is inspected
    Then it does not contain the graph library
    # open: check in the build output

  @TC-92 @FR-42 @unit
  Scenario: The collision force separates overlapping cards and leaves the others alone
    Given two overlapping cards
    When the collision force runs
    Then the cards are pushed apart along the smaller overlap
    Given two separated cards
    When the collision force runs
    Then they are not moved
    # covered by: src/graph/collide.test.ts
```
