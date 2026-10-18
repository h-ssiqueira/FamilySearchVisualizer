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