## 1. System overview (original, kept as is)
* Sequence diagram of system overview and integrations
```
@startuml
Actor User
box Current project
participant FamilySearchViewer
end box

User -> FamilySearchViewer ++ : Access

FamilySearchViewer -> Google ++ : Oauth2 login
return Login successful

FamilySearchViewer -> Family_Search ++ : GET https://www.familysearch.org/platform/users/current
return 200 OK

return Information loaded

User -> FamilySearchViewer ++ : Choose a view option

loop Retrieve people data
    FamilySearchViewer -> Family_Search ++ : GET https://www.familysearch.org/service/tree/tree-data/v8/person/{personId}/details
    return 200 OK
end
FamilySearchViewer -> FamilySearchViewer : Process

return Display tree results
@enduml
```
> Note: the diagram above has no step where the app obtains a FamilySearch access token, and Google is shown as a separate login of the app. Diagram 2 corrects both: Google is only the sign-in behind FamilySearch's identity service.

## 2. Authentication sequence (decided by the author, OQ-21)
Google is used through FamilySearch's identity service; the app never talks to Google.
```
@startuml
actor User
participant "SPA (GitHub Pages)" as SPA
participant "FamilySearch Identity" as FSI
participant "Google" as G
participant "FamilySearch API" as FSA

User -> SPA : open app, click "Sign in"
SPA -> FSI : navigate to /oauth2/authorization/google
FSI -> G : redirect to Google sign-in
User -> G : authenticate
G --> FSI : identity confirmed
FSI --> User : session established (token)
note over SPA, FSI : Unverified (OQ-21): how the token reaches the SPA
SPA -> FSA : GET users/current (Authorization: Bearer token)
FSA --> SPA : personId, displayName, preferredLanguage, ...
@enduml
```

## 3. Progressive loading of a view (proposed)
```
@startuml
actor User
participant UI
participant TreeBuilder
participant Cache
participant "Request queue" as Q
participant "FamilySearch API" as FSA

User -> UI : choose view (V1/V2/V3); next generation / load all
UI -> TreeBuilder : build(rootId, view, options)
loop each generation / expansion step
  TreeBuilder -> Cache : get(personId)
  alt cache miss
    TreeBuilder -> Q : enqueue details(personId)
    Q -> FSA : GET person details (max N in flight)
    alt 429 / 503
      FSA --> Q : Retry-After
      Q -> Q : wait, retry
    end
    FSA --> Q : details
    Q -> Cache : put(person)
  end
  TreeBuilder --> UI : partial tree (render progressively)
end
@enduml
```

## 4. Component diagram (proposed)
```
@startuml
package "Browser SPA" {
  [UI / Views] --> [View models & layout]
  [View models & layout] --> [Domain]
  [View models & layout] --> [FamilySearch client]
  [FamilySearch client] --> [Request queue + cache]
  [FamilySearch client] --> [Mappers + validation]
  [Mappers + validation] --> [Domain]
  [UI / Views] --> [Auth]
  [FamilySearch client] --> [Auth] : access token
}
cloud "FamilySearch Identity + API" as FS
[Auth] --> FS
[Request queue + cache] --> FS
@enduml
```
