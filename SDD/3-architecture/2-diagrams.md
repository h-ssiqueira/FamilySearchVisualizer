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
> Note: the diagram above has no step where the app obtains a FamilySearch access token. Diagram 2 adds it.

## 2. Authentication sequence (proposed)
```
@startuml
actor User
participant "SPA (GitHub Pages)" as SPA
participant "Google Identity" as G
participant "FamilySearch Identity" as FSI
participant "FamilySearch API" as FSA

User -> SPA : open app
SPA -> G : sign-in request
G --> SPA : ID token (credential)
SPA -> SPA : check iss/aud/exp (OQ-01: is this a separate step or part of FamilySearch's own login page?)

SPA -> SPA : create code_verifier, code_challenge (S256), state
SPA -> FSI : redirect /authorization?client_id&redirect_uri\n&response_type=code&code_challenge&code_challenge_method=S256&state
User -> FSI : authenticate and consent
FSI --> SPA : redirect_uri?code&state
SPA -> SPA : verify state
SPA -> FSI : POST /token (grant_type=authorization_code, client_id, code, code_verifier, redirect_uri)
FSI --> SPA : access token
SPA -> FSA : GET users/current (Authorization: Bearer)
FSA --> SPA : personId, displayName, ...
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
cloud "Google Identity" as G
cloud "FamilySearch Identity + API" as FS
[Auth] --> G
[Auth] --> FS
[Request queue + cache] --> FS
@enduml
```
