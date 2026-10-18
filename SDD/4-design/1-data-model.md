## Retrieve current user information
GET https://www.familysearch.org/platform/users/current
* users[*].birthDate
* users[*].displayName
* users[*].gender
* users[*].personId
___
## Retrieve person information
GET https://www.familysearch.org/service/tree/tree-data/v8/person/GJ8L-919/details
### Data about the person
* ageAtDeath
* birth.details.date.formalText (fallback normalizedText)
* birth.details.place.id
* birth.details.place.normalizedText
* death.details.date.formalText (fallback normalizedText)
* death.details.place.id
* death.details.place.normalizedText
* gender
* id
* name
___
### Data about the person's parents
* parents[*].parent1.gender
* parents[*].parent1.id
* parents[*].parent1.name

* parents[*].parent2.gender
* parents[*].parent2.id
* parents[*].parent2.name
___
#### Parent's Marriage
* parents[*].event.details.date.formalText (fallback normalizedText)
* parents[*].event.details.place.id
* parents[*].event.details.place.normalizedText
___
#### Siblings
* parents[*].children[*].child.id
* parents[*].children[*].child.name
* parents[*].children[*].child.gender
___
### Data about the person's spouse/children
___
#### Marriage
* spouses[*].event.details.date.formalText (fallback normalizedText)
* spouses[*].event.details.place.id
* spouses[*].event.details.place.normalizedText
___
#### Spouse
* spouses[*].parent1.gender
* spouses[*].parent1.id
* spouses[*].parent1.name
___
#### Children
* spouses[*].children[*].child.id
* spouses[*].children[*].child.gender
* spouses[*].children[*].child.name