# Examples
## Google OAuth2 login
[url](https://ident.familysearch.org/oauth2/authorization/google)
___
## Requests
* Minimum headers:
    * Authorization (`Authorization: Bearer <Token>`)
    * User-Agent (`User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36`)
### Current user information
* Request:
```bash
curl --url 'https://www.familysearch.org/platform/users/current' \
  -H 'Accept: application/json, text/plain, */*' \
  -H 'Accept-Language: pt' \
  -H 'Authorization: Bearer p0-eprZR2I0J7o.kZFrmiuY8kv' \
  -H 'Connection: keep-alive' \
  -b 'visid_incap_2852034=gSoz1pl1Ri+Dsv6iwED/9gCyy2oAAAAAQUIPAAAAAAAJ0jrVTbxAkqShK2mNcCKi; visid_incap_2876314=Q8r96IcyR8miH76QS6y7UAayy2oAAAAAQUIPAAAAAADiYE316uwFxc2xy2Z/6zWN; fs_anid=548f324e-aa15-4325-b49f-ad5e24b62474; fsgeo=177.45.181.92; nlbi_2852034=s1LDe5+dVEP1TskQFzy7qAAAAADkhkPG+eh4+aCMs5s0ZQjy; incap_ses_684_2852034=yISoBTLJFm0/ADlpCg9+CYbu1GoAAAAAhh5VWRKy4LsBolADuL/CHA==; nlbi_2876314=uy/rBfViGhSpdkw/Uri0/wAAAACeFTQSibC2JlWPtUEOPkTo; incap_ses_684_2876314=bVfQB4fjDmVmMTlpCg9+CZLu1GoAAAAArMVHanXgA95laBIP7ncNJQ==; ab.storage.deviceId.b13c8f6a-7657-43fb-84ac-34900c38bb29=g%3A365cb438-ce3c-fc9b-3258-9394388aab89%7Ce%3Aundefined%7Cc%3A1731267711108%7Cl%3A1792340846074; ab.storage.userId.b13c8f6a-7657-43fb-84ac-34900c38bb29=g%3AMM3H-KM18%7Ce%3Aundefined%7Cc%3A1731267711103%7Cl%3A1792340846074; rt-promo-dismissed=1772984437170; reese84=3:5+UhI9YLp5p2xygD+/CnrQ==:fVgZzR2JuvMfHlhaQTvhvEGmUuZchmeFe3kZnPcJgX7GagZSTgFFiH6lCpHr5kxhDpx7yBRxLAprAPZzbkUKfke/xrQvwjOGq/fHQX68wYLTEj6u5GH4RDyMBL2fy+LQYj/5FREvDr3Er15a7Qh6FfHTXJlR7egMoroIKxWrMsk=:YETZIypOyZDAhWCfabpK3aIXofqKao6HW9A3G2lgPQ8=:0JLFMQAfguaubfJ4G9ndlEttwXZmPcpxgkatyePLGJPOz2SLf0OmYPBOERwXKfr2fCU8S0WYEJC3HtHVl2GhIhcF7f36NA4ci0mOolcux/har0DDvaVkR9Nu5lyGcQCgIWCHGu7z/E8F3tQVspPBJ01GxAH1koP64Dr4CV7E5j3fSa0S5jdFtxKbSy+wIz4brEZYxJ6H074pbef9yZicaYSrKavII/c88RY8qf0qI9pW2tvcWe7WTcwLwgFqG65pUypjB4VlmQeRmXwmAUQv2WypseSSqZOFm/tjzsnS8kKcUnCbpwLoXymrSdUukxNEraoCczBHizUnCnMzUTSzxm5w2jP4VmoZSpQqo6Rv3S6QJ5DG3Q==:; TAsessionID=92f7d3fd-63ab-4d7e-a5e9-9170b41e7835|NEW; nlbi_2876314_2147483392=WzLXV2HzeHKCZbgzUri0/wAAAABLsR2oi9mckiS+KxV+gT3g; fssessionid=p0-eprZR2I0J7o.kZFrmiuY8kv; fs_experiments=u%3Dh_ssiqueira%2Ca%3Dshared-ui%2Cs%3D327d490beb016ef2fcfa6c23943c420d%2Cv%3D1111101111000000000000000001110100010011100100110011011111000001001011111111101111111110110000010010101111110000110010111111011111111%2Cb%3D25%26a%3Dtree-person-r9%2Cs%3Dc7a8be410386432bf07b4e07d60b8805%2Cv%3D0000%2Cb%3D9%26a%3Dtree-r9%2Cs%3D8b9ff0dddf204d4d127ac40bb91dd83e%2Cv%3D0000000%2Cb%3D88%26a%3Dsearch-react%2Cs%3Deff782958de047324da74636c04fc226%2Cv%3D11100000000000000000000000000%2Cb%3D35%26a%3Dshared-image-viewer%2Cs%3D06ddd6273e05fac7067489c19fad334f%2Cv%3D00011001%2Cb%3D37%26a%3Dhelp-react%2Cs%3D0796b084ecbfe3661a50ab0dd5588214%2Cv%3D0001111%2Cb%3D69%26a%3Dzion-cms%2Cs%3D2d2594fe0c03087d7b1704832b3c44b1%2Cv%3D0000000%2Cb%3D72%26a%3Dnotifications%2Cs%3Dcff450d2a352ba045a72dce131bbab7e%2Cv%3D00%2Cb%3D25%26a%3Dcampaign-react%2Cs%3D166fb3bd61cd805f009780a5e709b76e%2Cv%3D00%2Cb%3D14%26a%3Dget-involved%2Cs%3Dc20940fa4627a013f8098691f4778bcb%2Cv%3D10011000000%2Cb%3D63%26a%3Dhf-inj-react%2Cs%3Da419e7de6b6ce4a7b6a8829e118bccad%2Cv%3D1100%2Cb%3D51%26a%3Dsettings-react%2Cs%3D38eda0316791d1b656bda3326a414ca0%2Cv%3D0%2Cb%3D26%26a%3Dmemories-react%2Cs%3Dd34b140d4babca89fe771abf526781fa%2Cv%3D0001000%2Cb%3D78%26a%3Dtree-overview%2Cs%3D5bda64e146a9bf18b8cb8ebf6778cd46%2Cv%3D00111%2Cb%3D21%26a%3Dfollow-lists%2Cs%3D29210a8509a962402a5e4b0d79a131bc%2Cv%3D0101%2Cb%3D65%26a%3Dhome-portal%2Cs%3D6247d5f6298b5f965b3fa9bb575b013f%2Cv%3D000%2Cb%3D90; nlbi_2852034_2147483392=GqlsQEfi2BAvXSkhFzy7qAAAAAATNrNAK3+Y61GQPXvtKxFL; ab.storage.sessionId.b13c8f6a-7657-43fb-84ac-34900c38bb29=g%3Ad257034e-db3a-ea56-3038-a82d88344d36%7Ce%3A1792343638381%7Cc%3A1792340846073%7Cl%3A1792341838381; notice_behavior=implied|eu' \
  -H 'DNT: 1' \
  -H 'FS-User-Agent-Chain: settings-react-prod (/pt/profile/account; zion-user)' \
  -H 'Referer: https://www.familysearch.org/pt/profile/account' \
  -H 'Sec-Fetch-Dest: empty' \
  -H 'Sec-Fetch-Mode: cors' \
  -H 'Sec-Fetch-Site: same-origin' \
  -H 'Sec-GPC: 1' \
  -H 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36' \
  -H 'sec-ch-ua: "Brave";v="155", "Chromium";v="155", "Not(A:Brand";v="24"' \
  -H 'sec-ch-ua-mobile: ?0' \
  -H 'sec-ch-ua-platform: "Windows"'
```
* Response:
```json
{
  "users" : [ {
    "birthDate" : "2000-08-31",
    "contactName" : "henrique_ssiqueira",
    "country" : "BRA",
    "displayName" : "Henrique Sartori Siqueira",
    "email" : "hss@outlook.com.br",
    "familyName" : "Sartori Siqueira",
    "gender" : "MALE",
    "givenName" : "Henrique",
    "helperAccessPin" : "73846",
    "id" : "cis.user.MM3H-KM18",
    "links" : {
      "person" : {
        "href" : "https://www.familysearch.org/platform/tree/persons/GB71-2PF?flag=fsh"
      },
      "self" : {
        "href" : "https://www.familysearch.org/platform/users/current?flag=fsh"
      },
      "artifacts" : {
        "href" : "https://www.familysearch.org/platform/memories/users/cis.user.MM3H-KM18/memories?flag=fsh"
      }
    },
    "mobilePhoneNumber" : "19981507426",
    "personId" : "GB71-2PF",
    "preferredLanguage" : "pt",
    "treeUserId" : "9QZR-N8Z"
  } ]
}
```
___
### Person information
* Request:
```bash
curl --url 'https://www.familysearch.org/service/tree/tree-data/v8/person/GJ8L-919/details' \
  -H 'Accept: application/json, text/plain, */*' \
  -H 'Accept-Language: pt' \
  -H 'Authorization: Bearer p0-tU30Nmj_v7v._abLvvbQrsD' \
  -H 'Connection: keep-alive' \
  -b 'visid_incap_2852034=gSoz1pl1Ri+Dsv6iwED/9gCyy2oAAAAAQUIPAAAAAAAJ0jrVTbxAkqShK2mNcCKi; visid_incap_2876314=Q8r96IcyR8miH76QS6y7UAayy2oAAAAAQUIPAAAAAADiYE316uwFxc2xy2Z/6zWN; fs_anid=548f324e-aa15-4325-b49f-ad5e24b62474; fsgeo=177.45.181.92; nlbi_2852034=s1LDe5+dVEP1TskQFzy7qAAAAADkhkPG+eh4+aCMs5s0ZQjy; incap_ses_684_2852034=yISoBTLJFm0/ADlpCg9+CYbu1GoAAAAAhh5VWRKy4LsBolADuL/CHA==; nlbi_2876314=uy/rBfViGhSpdkw/Uri0/wAAAACeFTQSibC2JlWPtUEOPkTo; incap_ses_684_2876314=bVfQB4fjDmVmMTlpCg9+CZLu1GoAAAAArMVHanXgA95laBIP7ncNJQ==; nlbi_2876314_2147483392=7FDDDuPF3Dq9gwKpUri0/wAAAADXZlSG3WPiYSd4IJW+KDYX; reese84=3:HrfdulH8NwJEg/CS1eQqVw==:JPzOF/duOeN4lr5WUemPHnrZcVPSPDu4wwQTWs9+N5d0zqujPBFK8DK1aVKGpX6IhC0EMv6sfuvNcx/wcoYonPbF4Bi8pw31+sOU45v8xwxAwzbQqt00erZvFKU8XUZuMgnjxU6g7g7sSMEsVGixhpFn+KfIPuIBY10kQjWzit4=:pZt0szaheQnvy0QZk585tWXd9/8wJTcR/9Y5NLvvDvg=:fBu2W+tnEspSOMHtXJxTJ9hU2nw3FR8dG1Q/NC/eergU2x0a7n4+b9/+scFOMHRXgabyERSLDUvw9PQkJ2crvYsyJ0Epx9IQBSf8kLgfQJTJYFAu32U/0iZ5mIjw9y9EjzfTOhQGPtdyJkTxHGo8cOy+Xi0soI7+/wwZZy3p2jnqgprPejKpPsxd9zgsG27FVpNBJFF06dbl2Qi7qBuMLytwNRDh8Z41WAUucEtXqN0VVvOGl+Qmj6zo5IFxG0G2sMR3f9MUmZagG6Bf1CBAI7k/fEQVQzucRxccG2BR4oJvHjyfYbY0kL3bedSA66v2zo1brZ1n/Jll4NWukO47HCMs9U7qrx7qyPnTQqQf:; fssessionid=p0-tU30Nmj_v7v._abLvvbQrsD; fs_experiments=u%3Dh_ssiqueira%2Ca%3Dshared-ui%2Cs%3D327d490beb016ef2fcfa6c23943c420d%2Cv%3D1111101111000000000000000001110100010011100100110011011111000001001011111111101111111110110000010010101111110000110010111111011111111%2Cb%3D35%26a%3Dtree-person-r9%2Cs%3Dc7a8be410386432bf07b4e07d60b8805%2Cv%3D0000%2Cb%3D29%26a%3Dtree-r9%2Cs%3D8b9ff0dddf204d4d127ac40bb91dd83e%2Cv%3D0000000%2Cb%3D36%26a%3Dsearch-react%2Cs%3Deff782958de047324da74636c04fc226%2Cv%3D11100000000000000000000000000%2Cb%3D35%26a%3Dshared-image-viewer%2Cs%3D06ddd6273e05fac7067489c19fad334f%2Cv%3D00011001%2Cb%3D37%26a%3Dhelp-react%2Cs%3D0796b084ecbfe3661a50ab0dd5588214%2Cv%3D0001111%2Cb%3D69%26a%3Dzion-cms%2Cs%3D2d2594fe0c03087d7b1704832b3c44b1%2Cv%3D0000000%2Cb%3D72%26a%3Dnotifications%2Cs%3Dcff450d2a352ba045a72dce131bbab7e%2Cv%3D00%2Cb%3D25%26a%3Dcampaign-react%2Cs%3D166fb3bd61cd805f009780a5e709b76e%2Cv%3D00%2Cb%3D14%26a%3Dget-involved%2Cs%3Dc20940fa4627a013f8098691f4778bcb%2Cv%3D10011000000%2Cb%3D63%26a%3Dhf-inj-react%2Cs%3Da419e7de6b6ce4a7b6a8829e118bccad%2Cv%3D1100%2Cb%3D51%26a%3Dsettings-react%2Cs%3D38eda0316791d1b656bda3326a414ca0%2Cv%3D0%2Cb%3D75%26a%3Dmemories-react%2Cs%3Dd34b140d4babca89fe771abf526781fa%2Cv%3D0001000%2Cb%3D78%26a%3Dtree-overview%2Cs%3D5bda64e146a9bf18b8cb8ebf6778cd46%2Cv%3D00111%2Cb%3D21%26a%3Dfollow-lists%2Cs%3D29210a8509a962402a5e4b0d79a131bc%2Cv%3D0101%2Cb%3D65%26a%3Dhome-portal%2Cs%3D6247d5f6298b5f965b3fa9bb575b013f%2Cv%3D000%2Cb%3D90; nlbi_2852034_2147483392=EQBNOUj9/0gdWYSBFzy7qAAAAACCB58kGbUXv1orzkNegoqA; ab.storage.sessionId.b13c8f6a-7657-43fb-84ac-34900c38bb29=g%3Ad257034e-db3a-ea56-3038-a82d88344d36%7Ce%3A1792342646073%7Cc%3A1792340846073%7Cl%3A1792340846073; ab.storage.deviceId.b13c8f6a-7657-43fb-84ac-34900c38bb29=g%3A365cb438-ce3c-fc9b-3258-9394388aab89%7Ce%3Aundefined%7Cc%3A1731267711108%7Cl%3A1792340846074; ab.storage.userId.b13c8f6a-7657-43fb-84ac-34900c38bb29=g%3AMM3H-KM18%7Ce%3Aundefined%7Cc%3A1731267711103%7Cl%3A1792340846074; rt-promo-dismissed=1772984437170' \
  -H 'DNT: 1' \
  -H 'FS-User-Agent-Chain: tree-r9-prod (/pt/tree/pedigree/portrait/GB71-2PF; zion-cache-service)' \
  -H 'Referer: https://www.familysearch.org/pt/tree/pedigree/portrait/GB71-2PF' \
  -H 'Sec-Fetch-Dest: empty' \
  -H 'Sec-Fetch-Mode: cors' \
  -H 'Sec-Fetch-Site: same-origin' \
  -H 'Sec-GPC: 1' \
  -H 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36' \
  -H 'sec-ch-ua: "Brave";v="155", "Chromium";v="155", "Not(A:Brand";v="24"' \
  -H 'sec-ch-ua-mobile: ?0' \
  -H 'sec-ch-ua-platform: "Windows"'
```
* Response:
```json
{
    "ageAtDeath": 73,
    "birth": {
        "contributor": {
            "cisId": "cis.user.MM36-2NHB",
            "date": "6 de maio de 2026",
            "dateMs": 1778070046200,
            "id": "9QGJ-799",
            "name": "Paolo9431",
            "timestamp": "2026-05-06T12:20:46+00:00"
        },
        "details": {
            "detailsType": "EventDetails",
            "date": {
                "formalText": "+1908-09-26",
                "julianDateRange": {
                    "earliestDay": 2418211,
                    "latestDay": 2418211
                },
                "localizedText": "26 de setembro de 1908",
                "modifier": null,
                "normalizedText": "26 de setembro de 1908",
                "originalText": "26/09/1908"
            },
            "deceasedFlag": null,
            "description": null,
            "place": {
                "geoCode": {
                    "latitude": -22.9095,
                    "longitude": -47.0626
                },
                "id": 3052675,
                "localizedText": "Campinas, São Paulo, Brasil",
                "normalizedText": "Campinas, São Paulo, Brasil",
                "originalText": "Campinas, São Paulo, Brasile"
            },
            "sourceCount": 3,
            "title": "",
            "type": "BIRTH"
        },
        "id": "82a5946d-0d49-4d57-9645-14d2bbf4290f",
        "justification": null,
        "multiValued": false,
        "type": "BIRTH"
    },
    "collaborateCount": 0,
    "death": {
        "contributor": {
            "cisId": "cis.user.MM36-2NHB",
            "date": "6 de maio de 2026",
            "dateMs": 1778070074446,
            "id": "9QGJ-799",
            "name": "Paolo9431",
            "timestamp": "2026-05-06T12:21:14+00:00"
        },
        "details": {
            "detailsType": "EventDetails",
            "date": {
                "formalText": "+1982-05-23",
                "julianDateRange": {
                    "earliestDay": 2445113,
                    "latestDay": 2445113
                },
                "localizedText": "23 de maio de 1982",
                "modifier": null,
                "normalizedText": "23 de maio de 1982",
                "originalText": "23/05/1982"
            },
            "deceasedFlag": null,
            "description": null,
            "place": {
                "geoCode": {
                    "latitude": -22.9095,
                    "longitude": -47.0626
                },
                "id": 3052675,
                "localizedText": "Campinas, São Paulo, Brasil",
                "normalizedText": "Campinas, São Paulo, Brasil",
                "originalText": "Campinas, São Paulo, Brasil"
            },
            "sourceCount": 1,
            "title": "",
            "type": "DEATH"
        },
        "id": "623dc6e0-f88a-4193-9d18-7077485e7416",
        "justification": null,
        "multiValued": false,
        "type": "DEATH"
    },
    "deleted": false,
    "descendant": false,
    "discussionCount": 0,
    "fullLifespan": "26 de setembro de 1908 – 23 de maio de 1982",
    "gender": "FEMALE",
    "genderConclusion": {
        "contributor": {
            "cisId": "cis.user.MMSL-9548",
            "date": "1 de dezembro de 2022",
            "dateMs": 1669906416367,
            "id": "93M4-WQM",
            "name": "Álvaro Cristiano",
            "timestamp": "2022-12-01T14:53:36+00:00"
        },
        "details": {
            "detailsType": "GenderDetails",
            "gender": "FEMALE",
            "sourceCount": 10
        },
        "id": "0fdc072a-f7f4-4f17-ace0-3dcaa1c42b85",
        "justification": null,
        "multiValued": false,
        "type": "GENDER"
    },
    "hasMultipleFamiliesAsChild": false,
    "hasMultipleFamiliesAsParent": false,
    "hasSpouseOrChildren": false,
    "id": "GJ8L-919",
    "lifespan": "1908–1982",
    "living": false,
    "memoryCount": 0,
    "name": "Olga Boccaletti",
    "nameConclusion": {
        "contributor": {
            "cisId": "cis.user.MM3H-KM18",
            "date": "16 de fevereiro de 2025",
            "dateMs": 1739715526589,
            "id": "9QZR-N8Z",
            "name": "henrique_ssiqueira",
            "timestamp": "2025-02-16T14:18:46+00:00"
        },
        "details": {
            "detailsType": "NameDetails",
            "fullText": "Olga Boccaletti",
            "nameForms": [
                {
                    "familyPart": "Boccaletti",
                    "fullText": "Olga Boccaletti",
                    "givenPart": "Olga",
                    "lang": "pt",
                    "prefixPart": null,
                    "suffixPart": null
                }
            ],
            "nameType": "BIRTH",
            "preferredName": true,
            "sourceCount": 16,
            "style": "EUROTYPIC"
        },
        "id": "c5f6cf33-2e86-40aa-a836-dde343364627",
        "justification": null,
        "multiValued": false,
        "type": "NAME"
    },
    "noteCount": 0,
    "otherConclusions": [
        {
            "contributor": {
                "cisId": "cis.user.MM36-2NHB",
                "date": "6 de maio de 2026",
                "dateMs": 1778070117129,
                "id": "9QGJ-799",
                "name": "Paolo9431",
                "timestamp": "2026-05-06T12:21:57+00:00"
            },
            "details": {
                "detailsType": "NameDetails",
                "fullText": "Carolina",
                "nameForms": [
                    {
                        "familyPart": null,
                        "fullText": "Carolina",
                        "givenPart": "Carolina",
                        "lang": "it",
                        "prefixPart": null,
                        "suffixPart": null
                    }
                ],
                "nameType": "AKA",
                "preferredName": false,
                "sourceCount": 0,
                "style": "EUROTYPIC"
            },
            "id": "a594fd9c-fda1-43e7-a4d6-402a3f434dd7",
            "justification": null,
            "multiValued": true,
            "type": "ALTERNATE_NAME"
        },
        {
            "contributor": {
                "cisId": "cis.user.MM3H-KM18",
                "date": "21 de setembro de 2024",
                "dateMs": 1726923739576,
                "id": "9QZR-N8Z",
                "name": "henrique_ssiqueira",
                "timestamp": "2024-09-21T13:02:19+00:00"
            },
            "details": {
                "detailsType": "CharacteristicDetails",
                "date": null,
                "description": "brasileira",
                "place": null,
                "sourceCount": 0,
                "title": "",
                "type": "NATIONAL_ORIGIN"
            },
            "id": "5863615a-68c8-4315-940f-8a7b4ff58ca2",
            "justification": null,
            "multiValued": false,
            "type": "NATIONAL_ORIGIN"
        },
        {
            "contributor": {
                "cisId": "cis.user.MM3H-KM18",
                "date": "16 de fevereiro de 2025",
                "dateMs": 1739713898395,
                "id": "9QZR-N8Z",
                "name": "henrique_ssiqueira",
                "timestamp": "2025-02-16T13:51:38+00:00"
            },
            "details": {
                "detailsType": "EventDetails",
                "date": null,
                "deceasedFlag": null,
                "description": "domestica",
                "place": null,
                "sourceCount": 1,
                "title": "",
                "type": "OCCUPATION"
            },
            "id": "8b38bece-7aff-403e-a59a-ee8d82ca1ac0",
            "justification": null,
            "multiValued": true,
            "type": "OCCUPATION"
        }
    ],
    "parents": [
        {
            "children": [
                {
                    "child": {
                        "collaborateCount": 0,
                        "deleted": false,
                        "descendant": false,
                        "discussionCount": 0,
                        "fullLifespan": "18 de julho de 1895 – 14 de fevereiro de 1954",
                        "gender": "FEMALE",
                        "hasMultipleFamiliesAsChild": false,
                        "hasMultipleFamiliesAsParent": false,
                        "hasSpouseOrChildren": false,
                        "id": "G3H8-J78",
                        "lifespan": "1895–1954",
                        "living": false,
                        "memoryCount": 0,
                        "name": "Hygina Boccaletti",
                        "nameConclusion": {
                            "contributor": null,
                            "details": {
                                "detailsType": "NameDetails",
                                "fullText": "Hygina Boccaletti",
                                "nameForms": [
                                    {
                                        "familyPart": "Boccaletti",
                                        "fullText": "Hygina Boccaletti",
                                        "givenPart": "Hygina",
                                        "lang": "pt",
                                        "prefixPart": null,
                                        "suffixPart": null
                                    }
                                ],
                                "nameType": "",
                                "preferredName": true,
                                "sourceCount": 0,
                                "style": "EUROTYPIC"
                            },
                            "id": null,
                            "justification": "",
                            "multiValued": false,
                            "type": "NAME"
                        },
                        "noteCount": 0,
                        "principlePerson": false,
                        "readOnly": false,
                        "size": "CUSTOM_NON_CACHEABLE",
                        "skeleton": false,
                        "sourceCount": 12,
                        "treeType": "PUBLIC",
                        "visibleToAll": true,
                        "visibleToAllWhenUsingFamilySearchApps": true
                    },
                    "id": "9H2D-D3D",
                    "lineageConclusions": []
                },
                {
                    "child": {
                        "collaborateCount": 0,
                        "deleted": false,
                        "descendant": false,
                        "discussionCount": 0,
                        "fullLifespan": "7 de janeiro de 1896 – Falecido",
                        "gender": "MALE",
                        "hasMultipleFamiliesAsChild": false,
                        "hasMultipleFamiliesAsParent": false,
                        "hasSpouseOrChildren": false,
                        "id": "GWHB-16X",
                        "lifespan": "1896–Falecido",
                        "living": false,
                        "memoryCount": 0,
                        "name": "Quirino Boccaletti",
                        "nameConclusion": {
                            "contributor": null,
                            "details": {
                                "detailsType": "NameDetails",
                                "fullText": "Quirino Boccaletti",
                                "nameForms": [
                                    {
                                        "familyPart": "Boccaletti",
                                        "fullText": "Quirino Boccaletti",
                                        "givenPart": "Quirino",
                                        "lang": "pt",
                                        "prefixPart": null,
                                        "suffixPart": null
                                    }
                                ],
                                "nameType": "",
                                "preferredName": true,
                                "sourceCount": 0,
                                "style": "EUROTYPIC"
                            },
                            "id": null,
                            "justification": "",
                            "multiValued": false,
                            "type": "NAME"
                        },
                        "noteCount": 0,
                        "principlePerson": false,
                        "readOnly": false,
                        "size": "CUSTOM_NON_CACHEABLE",
                        "skeleton": false,
                        "sourceCount": 10,
                        "treeType": "PUBLIC",
                        "visibleToAll": true,
                        "visibleToAllWhenUsingFamilySearchApps": true
                    },
                    "id": "9DC4-Q3X",
                    "lineageConclusions": []
                },
                {
                    "child": {
                        "collaborateCount": 0,
                        "deleted": false,
                        "descendant": false,
                        "discussionCount": 0,
                        "fullLifespan": "27 de setembro de 1898 – 30 de janeiro de 1966",
                        "gender": "MALE",
                        "hasMultipleFamiliesAsChild": false,
                        "hasMultipleFamiliesAsParent": false,
                        "hasSpouseOrChildren": false,
                        "id": "GWHB-V5T",
                        "lifespan": "1898–1966",
                        "living": false,
                        "memoryCount": 0,
                        "name": "Romeu Boccaletti",
                        "nameConclusion": {
                            "contributor": null,
                            "details": {
                                "detailsType": "NameDetails",
                                "fullText": "Romeu Boccaletti",
                                "nameForms": [
                                    {
                                        "familyPart": "Boccaletti",
                                        "fullText": "Romeu Boccaletti",
                                        "givenPart": "Romeu",
                                        "lang": "pt",
                                        "prefixPart": null,
                                        "suffixPart": null
                                    }
                                ],
                                "nameType": "",
                                "preferredName": true,
                                "sourceCount": 0,
                                "style": "EUROTYPIC"
                            },
                            "id": null,
                            "justification": "",
                            "multiValued": false,
                            "type": "NAME"
                        },
                        "noteCount": 0,
                        "principlePerson": false,
                        "readOnly": false,
                        "size": "CUSTOM_NON_CACHEABLE",
                        "skeleton": false,
                        "sourceCount": 3,
                        "treeType": "PUBLIC",
                        "visibleToAll": true,
                        "visibleToAllWhenUsingFamilySearchApps": true
                    },
                    "id": "9DC4-9XK",
                    "lineageConclusions": []
                },
                {
                    "child": {
                        "collaborateCount": 0,
                        "deleted": false,
                        "descendant": false,
                        "discussionCount": 0,
                        "fullLifespan": "13 de abril de 1899 – Falecido",
                        "gender": "MALE",
                        "hasMultipleFamiliesAsChild": false,
                        "hasMultipleFamiliesAsParent": false,
                        "hasSpouseOrChildren": false,
                        "id": "GX8Y-7SX",
                        "lifespan": "1899–Falecido",
                        "living": false,
                        "memoryCount": 0,
                        "name": "Antonio Boccaletti",
                        "nameConclusion": {
                            "contributor": null,
                            "details": {
                                "detailsType": "NameDetails",
                                "fullText": "Antonio Boccaletti",
                                "nameForms": [
                                    {
                                        "familyPart": "Boccaletti",
                                        "fullText": "Antonio Boccaletti",
                                        "givenPart": "Antonio",
                                        "lang": "pt",
                                        "prefixPart": null,
                                        "suffixPart": null
                                    }
                                ],
                                "nameType": "",
                                "preferredName": true,
                                "sourceCount": 0,
                                "style": "EUROTYPIC"
                            },
                            "id": null,
                            "justification": "",
                            "multiValued": false,
                            "type": "NAME"
                        },
                        "noteCount": 0,
                        "principlePerson": false,
                        "readOnly": false,
                        "size": "CUSTOM_NON_CACHEABLE",
                        "skeleton": false,
                        "sourceCount": 5,
                        "treeType": "PUBLIC",
                        "visibleToAll": true,
                        "visibleToAllWhenUsingFamilySearchApps": true
                    },
                    "id": "9LC5-15S",
                    "lineageConclusions": []
                },
                {
                    "child": {
                        "collaborateCount": 0,
                        "deleted": false,
                        "descendant": false,
                        "discussionCount": 0,
                        "fullLifespan": "5 de setembro de 1902 – 12 de agosto de 1962",
                        "gender": "FEMALE",
                        "hasMultipleFamiliesAsChild": false,
                        "hasMultipleFamiliesAsParent": false,
                        "hasSpouseOrChildren": false,
                        "id": "P38H-QQN",
                        "lifespan": "1902–1962",
                        "living": false,
                        "memoryCount": 0,
                        "name": "Celina Boccaletti",
                        "nameConclusion": {
                            "contributor": null,
                            "details": {
                                "detailsType": "NameDetails",
                                "fullText": "Celina Boccaletti",
                                "nameForms": [
                                    {
                                        "familyPart": "Boccaletti",
                                        "fullText": "Celina Boccaletti",
                                        "givenPart": "Celina",
                                        "lang": "pt",
                                        "prefixPart": null,
                                        "suffixPart": null
                                    }
                                ],
                                "nameType": "",
                                "preferredName": true,
                                "sourceCount": 0,
                                "style": "EUROTYPIC"
                            },
                            "id": null,
                            "justification": "",
                            "multiValued": false,
                            "type": "NAME"
                        },
                        "noteCount": 0,
                        "principlePerson": false,
                        "readOnly": false,
                        "size": "CUSTOM_NON_CACHEABLE",
                        "skeleton": false,
                        "sourceCount": 18,
                        "treeType": "PUBLIC",
                        "visibleToAll": true,
                        "visibleToAllWhenUsingFamilySearchApps": true
                    },
                    "id": "SFJC-22S",
                    "lineageConclusions": []
                },
                {
                    "child": {
                        "collaborateCount": 0,
                        "deleted": false,
                        "descendant": false,
                        "discussionCount": 0,
                        "fullLifespan": "29 de dezembro de 1906 – 7 de julho de 1982",
                        "gender": "FEMALE",
                        "hasMultipleFamiliesAsChild": false,
                        "hasMultipleFamiliesAsParent": false,
                        "hasSpouseOrChildren": false,
                        "id": "G33M-39K",
                        "lifespan": "1906–1982",
                        "living": false,
                        "memoryCount": 0,
                        "name": "Irma Boccaletti",
                        "nameConclusion": {
                            "contributor": null,
                            "details": {
                                "detailsType": "NameDetails",
                                "fullText": "Irma Boccaletti",
                                "nameForms": [
                                    {
                                        "familyPart": "Boccaletti",
                                        "fullText": "Irma Boccaletti",
                                        "givenPart": "Irma",
                                        "lang": "pt",
                                        "prefixPart": null,
                                        "suffixPart": null
                                    }
                                ],
                                "nameType": "",
                                "preferredName": true,
                                "sourceCount": 0,
                                "style": "EUROTYPIC"
                            },
                            "id": null,
                            "justification": "",
                            "multiValued": false,
                            "type": "NAME"
                        },
                        "noteCount": 0,
                        "principlePerson": false,
                        "readOnly": false,
                        "size": "CUSTOM_NON_CACHEABLE",
                        "skeleton": false,
                        "sourceCount": 14,
                        "treeType": "PUBLIC",
                        "visibleToAll": true,
                        "visibleToAllWhenUsingFamilySearchApps": true
                    },
                    "id": "98YN-5RN",
                    "lineageConclusions": []
                },
                {
                    "child": {
                        "collaborateCount": 0,
                        "deleted": false,
                        "descendant": false,
                        "discussionCount": 0,
                        "fullLifespan": "26 de setembro de 1908 – 23 de maio de 1982",
                        "gender": "FEMALE",
                        "hasMultipleFamiliesAsChild": false,
                        "hasMultipleFamiliesAsParent": false,
                        "hasSpouseOrChildren": false,
                        "id": "GJ8L-919",
                        "lifespan": "1908–1982",
                        "living": false,
                        "memoryCount": 0,
                        "name": "Olga Boccaletti",
                        "nameConclusion": {
                            "contributor": null,
                            "details": {
                                "detailsType": "NameDetails",
                                "fullText": "Olga Boccaletti",
                                "nameForms": [
                                    {
                                        "familyPart": "Boccaletti",
                                        "fullText": "Olga Boccaletti",
                                        "givenPart": "Olga",
                                        "lang": "pt",
                                        "prefixPart": null,
                                        "suffixPart": null
                                    }
                                ],
                                "nameType": "",
                                "preferredName": true,
                                "sourceCount": 0,
                                "style": "EUROTYPIC"
                            },
                            "id": null,
                            "justification": "",
                            "multiValued": false,
                            "type": "NAME"
                        },
                        "noteCount": 0,
                        "principlePerson": true,
                        "readOnly": false,
                        "size": "CUSTOM_NON_CACHEABLE",
                        "skeleton": false,
                        "sourceCount": 21,
                        "treeType": "PUBLIC",
                        "visibleToAll": true,
                        "visibleToAllWhenUsingFamilySearchApps": true
                    },
                    "id": "95WW-WHS",
                    "lineageConclusions": []
                },
                {
                    "child": {
                        "collaborateCount": 0,
                        "deleted": false,
                        "descendant": false,
                        "discussionCount": 0,
                        "fullLifespan": "19 de novembro de 1914 – 2 de julho de 1995",
                        "gender": "MALE",
                        "hasMultipleFamiliesAsChild": false,
                        "hasMultipleFamiliesAsParent": false,
                        "hasSpouseOrChildren": false,
                        "id": "G3GZ-L77",
                        "lifespan": "1914–1995",
                        "living": false,
                        "memoryCount": 0,
                        "name": "Júlio Boccaletti",
                        "nameConclusion": {
                            "contributor": null,
                            "details": {
                                "detailsType": "NameDetails",
                                "fullText": "Júlio Boccaletti",
                                "nameForms": [
                                    {
                                        "familyPart": "Boccaletti",
                                        "fullText": "Júlio Boccaletti",
                                        "givenPart": "Júlio",
                                        "lang": "pt",
                                        "prefixPart": null,
                                        "suffixPart": null
                                    }
                                ],
                                "nameType": "",
                                "preferredName": true,
                                "sourceCount": 0,
                                "style": "EUROTYPIC"
                            },
                            "id": null,
                            "justification": "",
                            "multiValued": false,
                            "type": "NAME"
                        },
                        "noteCount": 0,
                        "principlePerson": false,
                        "readOnly": false,
                        "size": "CUSTOM_NON_CACHEABLE",
                        "skeleton": false,
                        "sourceCount": 11,
                        "treeType": "PUBLIC",
                        "visibleToAll": true,
                        "visibleToAllWhenUsingFamilySearchApps": true
                    },
                    "id": "9DC4-Q29",
                    "lineageConclusions": []
                }
            ],
            "coupleId": "G3H8-NS3_G3H8-GK4",
            "dismissedSuggestions": {
                "dataQualityList": [],
                "empty": false,
                "researchSuggestionList": [
                    {
                        "category": "RESEARCH_SUGGESTION",
                        "contextId": null,
                        "entityId": "MGNR-GNF",
                        "id": "d6c34985-ee04-41e5-b853-07a1ba89febb",
                        "justification": null,
                        "type": {
                            "name": "POSSIBLE_CHILD_GAP_IN_MIDDLE",
                            "canBeDismissed": true,
                            "context": "COUPLE",
                            "category": "RESEARCH_SUGGESTION"
                        }
                    }
                ]
            },
            "event": {
                "contributor": null,
                "details": {
                    "detailsType": "EventDetails",
                    "date": {
                        "formalText": null,
                        "julianDateRange": null,
                        "localizedText": "2 de julho de 1893",
                        "modifier": null,
                        "normalizedText": "2 de julho de 1893",
                        "originalText": "02/07/1893"
                    },
                    "deceasedFlag": null,
                    "description": null,
                    "place": {
                        "geoCode": null,
                        "id": 7064850,
                        "localizedText": "San Benedetto Po, Mantova, Lombardia, Itália",
                        "normalizedText": "San Benedetto Po, Mantova, Lombardia, Itália",
                        "originalText": "San Benedetto Po, Mantova, Lombardia, Itália"
                    },
                    "sourceCount": 0,
                    "title": null,
                    "type": null
                },
                "id": null,
                "justification": "",
                "multiValued": false,
                "type": "MARRIAGE"
            },
            "hasChildren": false,
            "id": "MGNR-GNF",
            "parent1": {
                "collaborateCount": 0,
                "deleted": false,
                "descendant": false,
                "discussionCount": 0,
                "fullLifespan": "18 de abril de 1874 – 24 de novembro de 1935",
                "gender": "MALE",
                "hasMultipleFamiliesAsChild": false,
                "hasMultipleFamiliesAsParent": false,
                "hasSpouseOrChildren": false,
                "id": "G3H8-NS3",
                "lifespan": "1874–1935",
                "living": false,
                "memoryCount": 0,
                "name": "Primo Ippolito Boccaletti",
                "nameConclusion": {
                    "contributor": null,
                    "details": {
                        "detailsType": "NameDetails",
                        "fullText": "Primo Ippolito Boccaletti",
                        "nameForms": [
                            {
                                "familyPart": "Boccaletti",
                                "fullText": "Primo Ippolito Boccaletti",
                                "givenPart": "Primo Ippolito",
                                "lang": "pt",
                                "prefixPart": null,
                                "suffixPart": null
                            }
                        ],
                        "nameType": "",
                        "preferredName": true,
                        "sourceCount": 0,
                        "style": "EUROTYPIC"
                    },
                    "id": null,
                    "justification": "",
                    "multiValued": false,
                    "type": "NAME"
                },
                "noteCount": 0,
                "principlePerson": false,
                "readOnly": false,
                "size": "CUSTOM_NON_CACHEABLE",
                "skeleton": false,
                "sourceCount": 24,
                "treeType": "PUBLIC",
                "visibleToAll": true,
                "visibleToAllWhenUsingFamilySearchApps": true
            },
            "parent2": {
                "collaborateCount": 0,
                "deleted": false,
                "descendant": false,
                "discussionCount": 0,
                "fullLifespan": "21 de março de 1874 – 7 de setembro de 1944",
                "gender": "FEMALE",
                "hasMultipleFamiliesAsChild": false,
                "hasMultipleFamiliesAsParent": false,
                "hasSpouseOrChildren": false,
                "id": "G3H8-GK4",
                "lifespan": "1874–1944",
                "living": false,
                "memoryCount": 0,
                "name": "Selene Fortunata Marmondi",
                "nameConclusion": {
                    "contributor": null,
                    "details": {
                        "detailsType": "NameDetails",
                        "fullText": "Selene Fortunata Marmondi",
                        "nameForms": [
                            {
                                "familyPart": "Marmondi",
                                "fullText": "Selene Fortunata Marmondi",
                                "givenPart": "Selene Fortunata",
                                "lang": "pt",
                                "prefixPart": null,
                                "suffixPart": null
                            }
                        ],
                        "nameType": "",
                        "preferredName": true,
                        "sourceCount": 0,
                        "style": "EUROTYPIC"
                    },
                    "id": null,
                    "justification": "",
                    "multiValued": false,
                    "type": "NAME"
                },
                "noteCount": 0,
                "principlePerson": false,
                "readOnly": false,
                "size": "CUSTOM_NON_CACHEABLE",
                "skeleton": false,
                "sourceCount": 25,
                "treeType": "PUBLIC",
                "visibleToAll": true,
                "visibleToAllWhenUsingFamilySearchApps": true
            },
            "preferred": true
        }
    ],
    "principlePerson": false,
    "readOnly": false,
    "size": "FULL",
    "skeleton": false,
    "sourceCount": 21,
    "spouses": [
        {
            "children": [
                {
                    "child": {
                        "collaborateCount": 0,
                        "deleted": false,
                        "descendant": false,
                        "discussionCount": 0,
                        "fullLifespan": "aproximadamente 1929 – Falecida",
                        "gender": "FEMALE",
                        "hasMultipleFamiliesAsChild": false,
                        "hasMultipleFamiliesAsParent": false,
                        "hasSpouseOrChildren": false,
                        "id": "GR36-JNC",
                        "lifespan": "1929–Falecida",
                        "living": false,
                        "memoryCount": 0,
                        "name": "Maria Denise Vieira",
                        "nameConclusion": {
                            "contributor": null,
                            "details": {
                                "detailsType": "NameDetails",
                                "fullText": "Maria Denise Vieira",
                                "nameForms": [
                                    {
                                        "familyPart": "Vieira",
                                        "fullText": "Maria Denise Vieira",
                                        "givenPart": "Maria Denise",
                                        "lang": "pt",
                                        "prefixPart": null,
                                        "suffixPart": null
                                    }
                                ],
                                "nameType": "",
                                "preferredName": true,
                                "sourceCount": 0,
                                "style": "EUROTYPIC"
                            },
                            "id": null,
                            "justification": "",
                            "multiValued": false,
                            "type": "NAME"
                        },
                        "noteCount": 0,
                        "principlePerson": false,
                        "readOnly": false,
                        "size": "CUSTOM_NON_CACHEABLE",
                        "skeleton": false,
                        "sourceCount": 5,
                        "treeType": "PUBLIC",
                        "visibleToAll": true,
                        "visibleToAllWhenUsingFamilySearchApps": true
                    },
                    "id": "SSXG-PSH",
                    "lineageConclusions": []
                },
                {
                    "child": {
                        "collaborateCount": 0,
                        "deleted": false,
                        "descendant": false,
                        "discussionCount": 0,
                        "fullLifespan": "13 de julho de 1930 – 16 de abril de 2013",
                        "gender": "FEMALE",
                        "hasMultipleFamiliesAsChild": false,
                        "hasMultipleFamiliesAsParent": false,
                        "hasSpouseOrChildren": false,
                        "id": "GD3B-N5K",
                        "lifespan": "1930–2013",
                        "living": false,
                        "memoryCount": 0,
                        "name": "Nilva Vieira",
                        "nameConclusion": {
                            "contributor": null,
                            "details": {
                                "detailsType": "NameDetails",
                                "fullText": "Nilva Vieira",
                                "nameForms": [
                                    {
                                        "familyPart": "Vieira",
                                        "fullText": "Nilva Vieira",
                                        "givenPart": "Nilva",
                                        "lang": "pt",
                                        "prefixPart": null,
                                        "suffixPart": null
                                    }
                                ],
                                "nameType": "",
                                "preferredName": true,
                                "sourceCount": 0,
                                "style": "EUROTYPIC"
                            },
                            "id": null,
                            "justification": "",
                            "multiValued": false,
                            "type": "NAME"
                        },
                        "noteCount": 0,
                        "principlePerson": false,
                        "readOnly": false,
                        "size": "CUSTOM_NON_CACHEABLE",
                        "skeleton": false,
                        "sourceCount": 3,
                        "treeType": "PUBLIC",
                        "visibleToAll": true,
                        "visibleToAllWhenUsingFamilySearchApps": true
                    },
                    "id": "95W7-F6M",
                    "lineageConclusions": []
                },
                {
                    "child": {
                        "collaborateCount": 0,
                        "deleted": false,
                        "descendant": false,
                        "discussionCount": 0,
                        "fullLifespan": "1 de abril de 1933 – Falecida",
                        "gender": "FEMALE",
                        "hasMultipleFamiliesAsChild": false,
                        "hasMultipleFamiliesAsParent": false,
                        "hasSpouseOrChildren": false,
                        "id": "GQW8-KPS",
                        "lifespan": "1933–Falecida",
                        "living": false,
                        "memoryCount": 0,
                        "name": "Edméa Vieira",
                        "nameConclusion": {
                            "contributor": null,
                            "details": {
                                "detailsType": "NameDetails",
                                "fullText": "Edméa Vieira",
                                "nameForms": [
                                    {
                                        "familyPart": "Vieira",
                                        "fullText": "Edméa Vieira",
                                        "givenPart": "Edméa",
                                        "lang": "pt",
                                        "prefixPart": null,
                                        "suffixPart": null
                                    }
                                ],
                                "nameType": "",
                                "preferredName": true,
                                "sourceCount": 0,
                                "style": "EUROTYPIC"
                            },
                            "id": null,
                            "justification": "",
                            "multiValued": false,
                            "type": "NAME"
                        },
                        "noteCount": 0,
                        "principlePerson": false,
                        "readOnly": false,
                        "size": "CUSTOM_NON_CACHEABLE",
                        "skeleton": false,
                        "sourceCount": 5,
                        "treeType": "PUBLIC",
                        "visibleToAll": true,
                        "visibleToAllWhenUsingFamilySearchApps": true
                    },
                    "id": "95WW-WHM",
                    "lineageConclusions": []
                },
                {
                    "child": {
                        "collaborateCount": 0,
                        "deleted": false,
                        "descendant": false,
                        "discussionCount": 0,
                        "fullLifespan": "2 de maio de 1936 – 6 de junho de 1936",
                        "gender": "MALE",
                        "hasMultipleFamiliesAsChild": false,
                        "hasMultipleFamiliesAsParent": false,
                        "hasSpouseOrChildren": false,
                        "id": "GX4G-YLV",
                        "lifespan": "1936–1936",
                        "living": false,
                        "memoryCount": 0,
                        "name": "Edney Primo Vieira",
                        "nameConclusion": {
                            "contributor": null,
                            "details": {
                                "detailsType": "NameDetails",
                                "fullText": "Edney Primo Vieira",
                                "nameForms": [
                                    {
                                        "familyPart": "Primo Vieira",
                                        "fullText": "Edney Primo Vieira",
                                        "givenPart": "Edney",
                                        "lang": "pt",
                                        "prefixPart": null,
                                        "suffixPart": null
                                    }
                                ],
                                "nameType": "",
                                "preferredName": true,
                                "sourceCount": 0,
                                "style": "EUROTYPIC"
                            },
                            "id": null,
                            "justification": "",
                            "multiValued": false,
                            "type": "NAME"
                        },
                        "noteCount": 0,
                        "principlePerson": false,
                        "readOnly": false,
                        "size": "CUSTOM_NON_CACHEABLE",
                        "skeleton": false,
                        "sourceCount": 1,
                        "treeType": "PUBLIC",
                        "visibleToAll": true,
                        "visibleToAllWhenUsingFamilySearchApps": true
                    },
                    "id": "95WW-W41",
                    "lineageConclusions": []
                },
                {
                    "child": {
                        "collaborateCount": 0,
                        "deleted": false,
                        "descendant": false,
                        "discussionCount": 0,
                        "fullLifespan": "8 de outubro de 1937 – Falecida",
                        "gender": "FEMALE",
                        "hasMultipleFamiliesAsChild": false,
                        "hasMultipleFamiliesAsParent": false,
                        "hasSpouseOrChildren": false,
                        "id": "G2KF-G2Y",
                        "lifespan": "1937–Falecida",
                        "living": false,
                        "memoryCount": 0,
                        "name": "Sulamita Vieira",
                        "nameConclusion": {
                            "contributor": null,
                            "details": {
                                "detailsType": "NameDetails",
                                "fullText": "Sulamita Vieira",
                                "nameForms": [
                                    {
                                        "familyPart": "Vieira",
                                        "fullText": "Sulamita Vieira",
                                        "givenPart": "Sulamita",
                                        "lang": "pt",
                                        "prefixPart": null,
                                        "suffixPart": null
                                    }
                                ],
                                "nameType": "",
                                "preferredName": true,
                                "sourceCount": 0,
                                "style": "EUROTYPIC"
                            },
                            "id": null,
                            "justification": "",
                            "multiValued": false,
                            "type": "NAME"
                        },
                        "noteCount": 0,
                        "principlePerson": false,
                        "readOnly": false,
                        "size": "CUSTOM_NON_CACHEABLE",
                        "skeleton": false,
                        "sourceCount": 3,
                        "treeType": "PUBLIC",
                        "visibleToAll": true,
                        "visibleToAllWhenUsingFamilySearchApps": true
                    },
                    "id": "9Y29-PC1",
                    "lineageConclusions": []
                },
                {
                    "child": {
                        "collaborateCount": 0,
                        "deleted": false,
                        "descendant": false,
                        "discussionCount": 0,
                        "fullLifespan": "22 de maio de 1939 – Viva",
                        "gender": "FEMALE",
                        "hasMultipleFamiliesAsChild": false,
                        "hasMultipleFamiliesAsParent": false,
                        "hasSpouseOrChildren": false,
                        "id": "GB71-CPJ",
                        "lifespan": "1939–Viva",
                        "living": true,
                        "memoryCount": 0,
                        "name": "Neusa de Cássia Vieira",
                        "nameConclusion": {
                            "contributor": null,
                            "details": {
                                "detailsType": "NameDetails",
                                "fullText": "Neusa de Cássia Vieira",
                                "nameForms": [
                                    {
                                        "familyPart": "Vieira",
                                        "fullText": "Neusa de Cássia Vieira",
                                        "givenPart": "Neusa de Cássia",
                                        "lang": "pt",
                                        "prefixPart": null,
                                        "suffixPart": null
                                    }
                                ],
                                "nameType": "",
                                "preferredName": true,
                                "sourceCount": 0,
                                "style": "EUROTYPIC"
                            },
                            "id": null,
                            "justification": "",
                            "multiValued": false,
                            "type": "NAME"
                        },
                        "noteCount": 0,
                        "principlePerson": false,
                        "readOnly": false,
                        "size": "CUSTOM_NON_CACHEABLE",
                        "skeleton": false,
                        "sourceCount": 5,
                        "treeType": "PRIVATE",
                        "visibleToAll": false,
                        "visibleToAllWhenUsingFamilySearchApps": false
                    },
                    "id": "S73M-DH9",
                    "lineageConclusions": []
                },
                {
                    "child": {
                        "collaborateCount": 0,
                        "deleted": false,
                        "descendant": false,
                        "discussionCount": 0,
                        "fullLifespan": "1942 – 5 de maio de 1945",
                        "gender": "MALE",
                        "hasMultipleFamiliesAsChild": false,
                        "hasMultipleFamiliesAsParent": false,
                        "hasSpouseOrChildren": false,
                        "id": "GNDX-85N",
                        "lifespan": "1942–1945",
                        "living": false,
                        "memoryCount": 0,
                        "name": "José Antonio Vieira",
                        "nameConclusion": {
                            "contributor": null,
                            "details": {
                                "detailsType": "NameDetails",
                                "fullText": "José Antonio Vieira",
                                "nameForms": [
                                    {
                                        "familyPart": "Vieira",
                                        "fullText": "José Antonio Vieira",
                                        "givenPart": "José Antonio",
                                        "lang": "und",
                                        "prefixPart": null,
                                        "suffixPart": null
                                    }
                                ],
                                "nameType": "",
                                "preferredName": true,
                                "sourceCount": 0,
                                "style": "EUROTYPIC"
                            },
                            "id": null,
                            "justification": "",
                            "multiValued": false,
                            "type": "NAME"
                        },
                        "noteCount": 0,
                        "principlePerson": false,
                        "readOnly": false,
                        "size": "CUSTOM_NON_CACHEABLE",
                        "skeleton": false,
                        "sourceCount": 3,
                        "treeType": "PUBLIC",
                        "visibleToAll": true,
                        "visibleToAllWhenUsingFamilySearchApps": true
                    },
                    "id": "95WW-W4R",
                    "lineageConclusions": []
                }
            ],
            "coupleId": "G4ND-JDM_GJ8L-919",
            "dismissedSuggestions": {
                "dataQualityList": [],
                "empty": true,
                "researchSuggestionList": []
            },
            "event": {
                "contributor": null,
                "details": {
                    "detailsType": "EventDetails",
                    "date": {
                        "formalText": null,
                        "julianDateRange": null,
                        "localizedText": "28 de abril de 1928",
                        "modifier": null,
                        "normalizedText": "28 de abril de 1928",
                        "originalText": "28/04/1928"
                    },
                    "deceasedFlag": null,
                    "description": null,
                    "place": {
                        "geoCode": null,
                        "id": 10307497,
                        "localizedText": "Arquidiocese de Campinas, Brasil",
                        "normalizedText": "Arquidiocese de Campinas, Brasil",
                        "originalText": "Campinas, São Paulo, Brasil"
                    },
                    "sourceCount": 0,
                    "title": null,
                    "type": null
                },
                "id": null,
                "justification": "",
                "multiValued": false,
                "type": "MARRIAGE"
            },
            "hasChildren": false,
            "id": "M1Z6-88X",
            "parent1": {
                "collaborateCount": 0,
                "deleted": false,
                "descendant": false,
                "discussionCount": 0,
                "fullLifespan": "20 de março de 1906 – 21 de junho de 1998",
                "gender": "MALE",
                "hasMultipleFamiliesAsChild": false,
                "hasMultipleFamiliesAsParent": false,
                "hasSpouseOrChildren": false,
                "id": "G4ND-JDM",
                "lifespan": "1906–1998",
                "living": false,
                "memoryCount": 0,
                "name": "Tércio Vieira",
                "nameConclusion": {
                    "contributor": null,
                    "details": {
                        "detailsType": "NameDetails",
                        "fullText": "Tércio Vieira",
                        "nameForms": [
                            {
                                "familyPart": "Vieira",
                                "fullText": "Tércio Vieira",
                                "givenPart": "Tércio",
                                "lang": "pt",
                                "prefixPart": null,
                                "suffixPart": null
                            }
                        ],
                        "nameType": "",
                        "preferredName": true,
                        "sourceCount": 0,
                        "style": "EUROTYPIC"
                    },
                    "id": null,
                    "justification": "",
                    "multiValued": false,
                    "type": "NAME"
                },
                "noteCount": 0,
                "principlePerson": false,
                "readOnly": false,
                "size": "CUSTOM_NON_CACHEABLE",
                "skeleton": false,
                "sourceCount": 23,
                "treeType": "PUBLIC",
                "visibleToAll": true,
                "visibleToAllWhenUsingFamilySearchApps": true
            },
            "parent2": {
                "ageAtDeath": 73,
                "birth": {
                    "contributor": {
                        "cisId": "cis.user.MM36-2NHB",
                        "date": "6 de maio de 2026",
                        "dateMs": 1778070046200,
                        "id": "9QGJ-799",
                        "name": "Paolo9431",
                        "timestamp": "2026-05-06T12:20:46+00:00"
                    },
                    "details": {
                        "detailsType": "EventDetails",
                        "date": {
                            "formalText": "+1908-09-26",
                            "julianDateRange": {
                                "earliestDay": 2418211,
                                "latestDay": 2418211
                            },
                            "localizedText": "26 de setembro de 1908",
                            "modifier": null,
                            "normalizedText": "26 de setembro de 1908",
                            "originalText": "26/09/1908"
                        },
                        "deceasedFlag": null,
                        "description": null,
                        "place": {
                            "geoCode": {
                                "latitude": -22.9095,
                                "longitude": -47.0626
                            },
                            "id": 3052675,
                            "localizedText": "Campinas, São Paulo, Brasil",
                            "normalizedText": "Campinas, São Paulo, Brasil",
                            "originalText": "Campinas, São Paulo, Brasile"
                        },
                        "sourceCount": 3,
                        "title": "",
                        "type": "BIRTH"
                    },
                    "id": "82a5946d-0d49-4d57-9645-14d2bbf4290f",
                    "justification": null,
                    "multiValued": false,
                    "type": "BIRTH"
                },
                "collaborateCount": 0,
                "death": {
                    "contributor": {
                        "cisId": "cis.user.MM36-2NHB",
                        "date": "6 de maio de 2026",
                        "dateMs": 1778070074446,
                        "id": "9QGJ-799",
                        "name": "Paolo9431",
                        "timestamp": "2026-05-06T12:21:14+00:00"
                    },
                    "details": {
                        "detailsType": "EventDetails",
                        "date": {
                            "formalText": "+1982-05-23",
                            "julianDateRange": {
                                "earliestDay": 2445113,
                                "latestDay": 2445113
                            },
                            "localizedText": "23 de maio de 1982",
                            "modifier": null,
                            "normalizedText": "23 de maio de 1982",
                            "originalText": "23/05/1982"
                        },
                        "deceasedFlag": null,
                        "description": null,
                        "place": {
                            "geoCode": {
                                "latitude": -22.9095,
                                "longitude": -47.0626
                            },
                            "id": 3052675,
                            "localizedText": "Campinas, São Paulo, Brasil",
                            "normalizedText": "Campinas, São Paulo, Brasil",
                            "originalText": "Campinas, São Paulo, Brasil"
                        },
                        "sourceCount": 1,
                        "title": "",
                        "type": "DEATH"
                    },
                    "id": "623dc6e0-f88a-4193-9d18-7077485e7416",
                    "justification": null,
                    "multiValued": false,
                    "type": "DEATH"
                },
                "deleted": false,
                "descendant": false,
                "discussionCount": 0,
                "fullLifespan": "26 de setembro de 1908 – 23 de maio de 1982",
                "gender": "FEMALE",
                "genderConclusion": {
                    "contributor": {
                        "cisId": "cis.user.MMSL-9548",
                        "date": "1 de dezembro de 2022",
                        "dateMs": 1669906416367,
                        "id": "93M4-WQM",
                        "name": "Álvaro Cristiano",
                        "timestamp": "2022-12-01T14:53:36+00:00"
                    },
                    "details": {
                        "detailsType": "GenderDetails",
                        "gender": "FEMALE",
                        "sourceCount": 10
                    },
                    "id": "0fdc072a-f7f4-4f17-ace0-3dcaa1c42b85",
                    "justification": null,
                    "multiValued": false,
                    "type": "GENDER"
                },
                "hasMultipleFamiliesAsChild": false,
                "hasMultipleFamiliesAsParent": false,
                "hasSpouseOrChildren": false,
                "id": "GJ8L-919",
                "lifespan": "1908–1982",
                "living": false,
                "memoryCount": 0,
                "name": "Olga Boccaletti",
                "nameConclusion": {
                    "contributor": {
                        "cisId": "cis.user.MM3H-KM18",
                        "date": "16 de fevereiro de 2025",
                        "dateMs": 1739715526589,
                        "id": "9QZR-N8Z",
                        "name": "henrique_ssiqueira",
                        "timestamp": "2025-02-16T14:18:46+00:00"
                    },
                    "details": {
                        "detailsType": "NameDetails",
                        "fullText": "Olga Boccaletti",
                        "nameForms": [
                            {
                                "familyPart": "Boccaletti",
                                "fullText": "Olga Boccaletti",
                                "givenPart": "Olga",
                                "lang": "pt",
                                "prefixPart": null,
                                "suffixPart": null
                            }
                        ],
                        "nameType": "BIRTH",
                        "preferredName": true,
                        "sourceCount": 16,
                        "style": "EUROTYPIC"
                    },
                    "id": "c5f6cf33-2e86-40aa-a836-dde343364627",
                    "justification": null,
                    "multiValued": false,
                    "type": "NAME"
                },
                "noteCount": 0,
                "otherConclusions": [
                    {
                        "contributor": {
                            "cisId": "cis.user.MM36-2NHB",
                            "date": "6 de maio de 2026",
                            "dateMs": 1778070117129,
                            "id": "9QGJ-799",
                            "name": "Paolo9431",
                            "timestamp": "2026-05-06T12:21:57+00:00"
                        },
                        "details": {
                            "detailsType": "NameDetails",
                            "fullText": "Carolina",
                            "nameForms": [
                                {
                                    "familyPart": null,
                                    "fullText": "Carolina",
                                    "givenPart": "Carolina",
                                    "lang": "it",
                                    "prefixPart": null,
                                    "suffixPart": null
                                }
                            ],
                            "nameType": "AKA",
                            "preferredName": false,
                            "sourceCount": 0,
                            "style": "EUROTYPIC"
                        },
                        "id": "a594fd9c-fda1-43e7-a4d6-402a3f434dd7",
                        "justification": null,
                        "multiValued": true,
                        "type": "ALTERNATE_NAME"
                    },
                    {
                        "contributor": {
                            "cisId": "cis.user.MM3H-KM18",
                            "date": "21 de setembro de 2024",
                            "dateMs": 1726923739576,
                            "id": "9QZR-N8Z",
                            "name": "henrique_ssiqueira",
                            "timestamp": "2024-09-21T13:02:19+00:00"
                        },
                        "details": {
                            "detailsType": "CharacteristicDetails",
                            "date": null,
                            "description": "brasileira",
                            "place": null,
                            "sourceCount": 0,
                            "title": "",
                            "type": "NATIONAL_ORIGIN"
                        },
                        "id": "5863615a-68c8-4315-940f-8a7b4ff58ca2",
                        "justification": null,
                        "multiValued": false,
                        "type": "NATIONAL_ORIGIN"
                    },
                    {
                        "contributor": {
                            "cisId": "cis.user.MM3H-KM18",
                            "date": "16 de fevereiro de 2025",
                            "dateMs": 1739713898395,
                            "id": "9QZR-N8Z",
                            "name": "henrique_ssiqueira",
                            "timestamp": "2025-02-16T13:51:38+00:00"
                        },
                        "details": {
                            "detailsType": "EventDetails",
                            "date": null,
                            "deceasedFlag": null,
                            "description": "domestica",
                            "place": null,
                            "sourceCount": 1,
                            "title": "",
                            "type": "OCCUPATION"
                        },
                        "id": "8b38bece-7aff-403e-a59a-ee8d82ca1ac0",
                        "justification": null,
                        "multiValued": true,
                        "type": "OCCUPATION"
                    }
                ],
                "parents": [
                    {
                        "children": [
                            {
                                "child": {
                                    "collaborateCount": 0,
                                    "deleted": false,
                                    "descendant": false,
                                    "discussionCount": 0,
                                    "fullLifespan": "18 de julho de 1895 – 14 de fevereiro de 1954",
                                    "gender": "FEMALE",
                                    "hasMultipleFamiliesAsChild": false,
                                    "hasMultipleFamiliesAsParent": false,
                                    "hasSpouseOrChildren": false,
                                    "id": "G3H8-J78",
                                    "lifespan": "1895–1954",
                                    "living": false,
                                    "memoryCount": 0,
                                    "name": "Hygina Boccaletti",
                                    "nameConclusion": {
                                        "contributor": null,
                                        "details": {
                                            "detailsType": "NameDetails",
                                            "fullText": "Hygina Boccaletti",
                                            "nameForms": [
                                                {
                                                    "familyPart": "Boccaletti",
                                                    "fullText": "Hygina Boccaletti",
                                                    "givenPart": "Hygina",
                                                    "lang": "pt",
                                                    "prefixPart": null,
                                                    "suffixPart": null
                                                }
                                            ],
                                            "nameType": "",
                                            "preferredName": true,
                                            "sourceCount": 0,
                                            "style": "EUROTYPIC"
                                        },
                                        "id": null,
                                        "justification": "",
                                        "multiValued": false,
                                        "type": "NAME"
                                    },
                                    "noteCount": 0,
                                    "principlePerson": false,
                                    "readOnly": false,
                                    "size": "CUSTOM_NON_CACHEABLE",
                                    "skeleton": false,
                                    "sourceCount": 12,
                                    "treeType": "PUBLIC",
                                    "visibleToAll": true,
                                    "visibleToAllWhenUsingFamilySearchApps": true
                                },
                                "id": "9H2D-D3D",
                                "lineageConclusions": []
                            },
                            {
                                "child": {
                                    "collaborateCount": 0,
                                    "deleted": false,
                                    "descendant": false,
                                    "discussionCount": 0,
                                    "fullLifespan": "7 de janeiro de 1896 – Falecido",
                                    "gender": "MALE",
                                    "hasMultipleFamiliesAsChild": false,
                                    "hasMultipleFamiliesAsParent": false,
                                    "hasSpouseOrChildren": false,
                                    "id": "GWHB-16X",
                                    "lifespan": "1896–Falecido",
                                    "living": false,
                                    "memoryCount": 0,
                                    "name": "Quirino Boccaletti",
                                    "nameConclusion": {
                                        "contributor": null,
                                        "details": {
                                            "detailsType": "NameDetails",
                                            "fullText": "Quirino Boccaletti",
                                            "nameForms": [
                                                {
                                                    "familyPart": "Boccaletti",
                                                    "fullText": "Quirino Boccaletti",
                                                    "givenPart": "Quirino",
                                                    "lang": "pt",
                                                    "prefixPart": null,
                                                    "suffixPart": null
                                                }
                                            ],
                                            "nameType": "",
                                            "preferredName": true,
                                            "sourceCount": 0,
                                            "style": "EUROTYPIC"
                                        },
                                        "id": null,
                                        "justification": "",
                                        "multiValued": false,
                                        "type": "NAME"
                                    },
                                    "noteCount": 0,
                                    "principlePerson": false,
                                    "readOnly": false,
                                    "size": "CUSTOM_NON_CACHEABLE",
                                    "skeleton": false,
                                    "sourceCount": 10,
                                    "treeType": "PUBLIC",
                                    "visibleToAll": true,
                                    "visibleToAllWhenUsingFamilySearchApps": true
                                },
                                "id": "9DC4-Q3X",
                                "lineageConclusions": []
                            },
                            {
                                "child": {
                                    "collaborateCount": 0,
                                    "deleted": false,
                                    "descendant": false,
                                    "discussionCount": 0,
                                    "fullLifespan": "27 de setembro de 1898 – 30 de janeiro de 1966",
                                    "gender": "MALE",
                                    "hasMultipleFamiliesAsChild": false,
                                    "hasMultipleFamiliesAsParent": false,
                                    "hasSpouseOrChildren": false,
                                    "id": "GWHB-V5T",
                                    "lifespan": "1898–1966",
                                    "living": false,
                                    "memoryCount": 0,
                                    "name": "Romeu Boccaletti",
                                    "nameConclusion": {
                                        "contributor": null,
                                        "details": {
                                            "detailsType": "NameDetails",
                                            "fullText": "Romeu Boccaletti",
                                            "nameForms": [
                                                {
                                                    "familyPart": "Boccaletti",
                                                    "fullText": "Romeu Boccaletti",
                                                    "givenPart": "Romeu",
                                                    "lang": "pt",
                                                    "prefixPart": null,
                                                    "suffixPart": null
                                                }
                                            ],
                                            "nameType": "",
                                            "preferredName": true,
                                            "sourceCount": 0,
                                            "style": "EUROTYPIC"
                                        },
                                        "id": null,
                                        "justification": "",
                                        "multiValued": false,
                                        "type": "NAME"
                                    },
                                    "noteCount": 0,
                                    "principlePerson": false,
                                    "readOnly": false,
                                    "size": "CUSTOM_NON_CACHEABLE",
                                    "skeleton": false,
                                    "sourceCount": 3,
                                    "treeType": "PUBLIC",
                                    "visibleToAll": true,
                                    "visibleToAllWhenUsingFamilySearchApps": true
                                },
                                "id": "9DC4-9XK",
                                "lineageConclusions": []
                            },
                            {
                                "child": {
                                    "collaborateCount": 0,
                                    "deleted": false,
                                    "descendant": false,
                                    "discussionCount": 0,
                                    "fullLifespan": "13 de abril de 1899 – Falecido",
                                    "gender": "MALE",
                                    "hasMultipleFamiliesAsChild": false,
                                    "hasMultipleFamiliesAsParent": false,
                                    "hasSpouseOrChildren": false,
                                    "id": "GX8Y-7SX",
                                    "lifespan": "1899–Falecido",
                                    "living": false,
                                    "memoryCount": 0,
                                    "name": "Antonio Boccaletti",
                                    "nameConclusion": {
                                        "contributor": null,
                                        "details": {
                                            "detailsType": "NameDetails",
                                            "fullText": "Antonio Boccaletti",
                                            "nameForms": [
                                                {
                                                    "familyPart": "Boccaletti",
                                                    "fullText": "Antonio Boccaletti",
                                                    "givenPart": "Antonio",
                                                    "lang": "pt",
                                                    "prefixPart": null,
                                                    "suffixPart": null
                                                }
                                            ],
                                            "nameType": "",
                                            "preferredName": true,
                                            "sourceCount": 0,
                                            "style": "EUROTYPIC"
                                        },
                                        "id": null,
                                        "justification": "",
                                        "multiValued": false,
                                        "type": "NAME"
                                    },
                                    "noteCount": 0,
                                    "principlePerson": false,
                                    "readOnly": false,
                                    "size": "CUSTOM_NON_CACHEABLE",
                                    "skeleton": false,
                                    "sourceCount": 5,
                                    "treeType": "PUBLIC",
                                    "visibleToAll": true,
                                    "visibleToAllWhenUsingFamilySearchApps": true
                                },
                                "id": "9LC5-15S",
                                "lineageConclusions": []
                            },
                            {
                                "child": {
                                    "collaborateCount": 0,
                                    "deleted": false,
                                    "descendant": false,
                                    "discussionCount": 0,
                                    "fullLifespan": "5 de setembro de 1902 – 12 de agosto de 1962",
                                    "gender": "FEMALE",
                                    "hasMultipleFamiliesAsChild": false,
                                    "hasMultipleFamiliesAsParent": false,
                                    "hasSpouseOrChildren": false,
                                    "id": "P38H-QQN",
                                    "lifespan": "1902–1962",
                                    "living": false,
                                    "memoryCount": 0,
                                    "name": "Celina Boccaletti",
                                    "nameConclusion": {
                                        "contributor": null,
                                        "details": {
                                            "detailsType": "NameDetails",
                                            "fullText": "Celina Boccaletti",
                                            "nameForms": [
                                                {
                                                    "familyPart": "Boccaletti",
                                                    "fullText": "Celina Boccaletti",
                                                    "givenPart": "Celina",
                                                    "lang": "pt",
                                                    "prefixPart": null,
                                                    "suffixPart": null
                                                }
                                            ],
                                            "nameType": "",
                                            "preferredName": true,
                                            "sourceCount": 0,
                                            "style": "EUROTYPIC"
                                        },
                                        "id": null,
                                        "justification": "",
                                        "multiValued": false,
                                        "type": "NAME"
                                    },
                                    "noteCount": 0,
                                    "principlePerson": false,
                                    "readOnly": false,
                                    "size": "CUSTOM_NON_CACHEABLE",
                                    "skeleton": false,
                                    "sourceCount": 18,
                                    "treeType": "PUBLIC",
                                    "visibleToAll": true,
                                    "visibleToAllWhenUsingFamilySearchApps": true
                                },
                                "id": "SFJC-22S",
                                "lineageConclusions": []
                            },
                            {
                                "child": {
                                    "collaborateCount": 0,
                                    "deleted": false,
                                    "descendant": false,
                                    "discussionCount": 0,
                                    "fullLifespan": "29 de dezembro de 1906 – 7 de julho de 1982",
                                    "gender": "FEMALE",
                                    "hasMultipleFamiliesAsChild": false,
                                    "hasMultipleFamiliesAsParent": false,
                                    "hasSpouseOrChildren": false,
                                    "id": "G33M-39K",
                                    "lifespan": "1906–1982",
                                    "living": false,
                                    "memoryCount": 0,
                                    "name": "Irma Boccaletti",
                                    "nameConclusion": {
                                        "contributor": null,
                                        "details": {
                                            "detailsType": "NameDetails",
                                            "fullText": "Irma Boccaletti",
                                            "nameForms": [
                                                {
                                                    "familyPart": "Boccaletti",
                                                    "fullText": "Irma Boccaletti",
                                                    "givenPart": "Irma",
                                                    "lang": "pt",
                                                    "prefixPart": null,
                                                    "suffixPart": null
                                                }
                                            ],
                                            "nameType": "",
                                            "preferredName": true,
                                            "sourceCount": 0,
                                            "style": "EUROTYPIC"
                                        },
                                        "id": null,
                                        "justification": "",
                                        "multiValued": false,
                                        "type": "NAME"
                                    },
                                    "noteCount": 0,
                                    "principlePerson": false,
                                    "readOnly": false,
                                    "size": "CUSTOM_NON_CACHEABLE",
                                    "skeleton": false,
                                    "sourceCount": 14,
                                    "treeType": "PUBLIC",
                                    "visibleToAll": true,
                                    "visibleToAllWhenUsingFamilySearchApps": true
                                },
                                "id": "98YN-5RN",
                                "lineageConclusions": []
                            },
                            {
                                "child": {
                                    "collaborateCount": 0,
                                    "deleted": false,
                                    "descendant": false,
                                    "discussionCount": 0,
                                    "fullLifespan": "26 de setembro de 1908 – 23 de maio de 1982",
                                    "gender": "FEMALE",
                                    "hasMultipleFamiliesAsChild": false,
                                    "hasMultipleFamiliesAsParent": false,
                                    "hasSpouseOrChildren": false,
                                    "id": "GJ8L-919",
                                    "lifespan": "1908–1982",
                                    "living": false,
                                    "memoryCount": 0,
                                    "name": "Olga Boccaletti",
                                    "nameConclusion": {
                                        "contributor": null,
                                        "details": {
                                            "detailsType": "NameDetails",
                                            "fullText": "Olga Boccaletti",
                                            "nameForms": [
                                                {
                                                    "familyPart": "Boccaletti",
                                                    "fullText": "Olga Boccaletti",
                                                    "givenPart": "Olga",
                                                    "lang": "pt",
                                                    "prefixPart": null,
                                                    "suffixPart": null
                                                }
                                            ],
                                            "nameType": "",
                                            "preferredName": true,
                                            "sourceCount": 0,
                                            "style": "EUROTYPIC"
                                        },
                                        "id": null,
                                        "justification": "",
                                        "multiValued": false,
                                        "type": "NAME"
                                    },
                                    "noteCount": 0,
                                    "principlePerson": true,
                                    "readOnly": false,
                                    "size": "CUSTOM_NON_CACHEABLE",
                                    "skeleton": false,
                                    "sourceCount": 21,
                                    "treeType": "PUBLIC",
                                    "visibleToAll": true,
                                    "visibleToAllWhenUsingFamilySearchApps": true
                                },
                                "id": "95WW-WHS",
                                "lineageConclusions": []
                            },
                            {
                                "child": {
                                    "collaborateCount": 0,
                                    "deleted": false,
                                    "descendant": false,
                                    "discussionCount": 0,
                                    "fullLifespan": "19 de novembro de 1914 – 2 de julho de 1995",
                                    "gender": "MALE",
                                    "hasMultipleFamiliesAsChild": false,
                                    "hasMultipleFamiliesAsParent": false,
                                    "hasSpouseOrChildren": false,
                                    "id": "G3GZ-L77",
                                    "lifespan": "1914–1995",
                                    "living": false,
                                    "memoryCount": 0,
                                    "name": "Júlio Boccaletti",
                                    "nameConclusion": {
                                        "contributor": null,
                                        "details": {
                                            "detailsType": "NameDetails",
                                            "fullText": "Júlio Boccaletti",
                                            "nameForms": [
                                                {
                                                    "familyPart": "Boccaletti",
                                                    "fullText": "Júlio Boccaletti",
                                                    "givenPart": "Júlio",
                                                    "lang": "pt",
                                                    "prefixPart": null,
                                                    "suffixPart": null
                                                }
                                            ],
                                            "nameType": "",
                                            "preferredName": true,
                                            "sourceCount": 0,
                                            "style": "EUROTYPIC"
                                        },
                                        "id": null,
                                        "justification": "",
                                        "multiValued": false,
                                        "type": "NAME"
                                    },
                                    "noteCount": 0,
                                    "principlePerson": false,
                                    "readOnly": false,
                                    "size": "CUSTOM_NON_CACHEABLE",
                                    "skeleton": false,
                                    "sourceCount": 11,
                                    "treeType": "PUBLIC",
                                    "visibleToAll": true,
                                    "visibleToAllWhenUsingFamilySearchApps": true
                                },
                                "id": "9DC4-Q29",
                                "lineageConclusions": []
                            }
                        ],
                        "coupleId": "G3H8-NS3_G3H8-GK4",
                        "dismissedSuggestions": {
                            "dataQualityList": [],
                            "empty": false,
                            "researchSuggestionList": [
                                {
                                    "category": "RESEARCH_SUGGESTION",
                                    "contextId": null,
                                    "entityId": "MGNR-GNF",
                                    "id": "d6c34985-ee04-41e5-b853-07a1ba89febb",
                                    "justification": null,
                                    "type": {
                                        "name": "POSSIBLE_CHILD_GAP_IN_MIDDLE",
                                        "canBeDismissed": true,
                                        "context": "COUPLE",
                                        "category": "RESEARCH_SUGGESTION"
                                    }
                                }
                            ]
                        },
                        "event": {
                            "contributor": null,
                            "details": {
                                "detailsType": "EventDetails",
                                "date": {
                                    "formalText": null,
                                    "julianDateRange": null,
                                    "localizedText": "2 de julho de 1893",
                                    "modifier": null,
                                    "normalizedText": "2 de julho de 1893",
                                    "originalText": "02/07/1893"
                                },
                                "deceasedFlag": null,
                                "description": null,
                                "place": {
                                    "geoCode": null,
                                    "id": 7064850,
                                    "localizedText": "San Benedetto Po, Mantova, Lombardia, Itália",
                                    "normalizedText": "San Benedetto Po, Mantova, Lombardia, Itália",
                                    "originalText": "San Benedetto Po, Mantova, Lombardia, Itália"
                                },
                                "sourceCount": 0,
                                "title": null,
                                "type": null
                            },
                            "id": null,
                            "justification": "",
                            "multiValued": false,
                            "type": "MARRIAGE"
                        },
                        "hasChildren": false,
                        "id": "MGNR-GNF",
                        "parent1": {
                            "collaborateCount": 0,
                            "deleted": false,
                            "descendant": false,
                            "discussionCount": 0,
                            "fullLifespan": "18 de abril de 1874 – 24 de novembro de 1935",
                            "gender": "MALE",
                            "hasMultipleFamiliesAsChild": false,
                            "hasMultipleFamiliesAsParent": false,
                            "hasSpouseOrChildren": false,
                            "id": "G3H8-NS3",
                            "lifespan": "1874–1935",
                            "living": false,
                            "memoryCount": 0,
                            "name": "Primo Ippolito Boccaletti",
                            "nameConclusion": {
                                "contributor": null,
                                "details": {
                                    "detailsType": "NameDetails",
                                    "fullText": "Primo Ippolito Boccaletti",
                                    "nameForms": [
                                        {
                                            "familyPart": "Boccaletti",
                                            "fullText": "Primo Ippolito Boccaletti",
                                            "givenPart": "Primo Ippolito",
                                            "lang": "pt",
                                            "prefixPart": null,
                                            "suffixPart": null
                                        }
                                    ],
                                    "nameType": "",
                                    "preferredName": true,
                                    "sourceCount": 0,
                                    "style": "EUROTYPIC"
                                },
                                "id": null,
                                "justification": "",
                                "multiValued": false,
                                "type": "NAME"
                            },
                            "noteCount": 0,
                            "principlePerson": false,
                            "readOnly": false,
                            "size": "CUSTOM_NON_CACHEABLE",
                            "skeleton": false,
                            "sourceCount": 24,
                            "treeType": "PUBLIC",
                            "visibleToAll": true,
                            "visibleToAllWhenUsingFamilySearchApps": true
                        },
                        "parent2": {
                            "collaborateCount": 0,
                            "deleted": false,
                            "descendant": false,
                            "discussionCount": 0,
                            "fullLifespan": "21 de março de 1874 – 7 de setembro de 1944",
                            "gender": "FEMALE",
                            "hasMultipleFamiliesAsChild": false,
                            "hasMultipleFamiliesAsParent": false,
                            "hasSpouseOrChildren": false,
                            "id": "G3H8-GK4",
                            "lifespan": "1874–1944",
                            "living": false,
                            "memoryCount": 0,
                            "name": "Selene Fortunata Marmondi",
                            "nameConclusion": {
                                "contributor": null,
                                "details": {
                                    "detailsType": "NameDetails",
                                    "fullText": "Selene Fortunata Marmondi",
                                    "nameForms": [
                                        {
                                            "familyPart": "Marmondi",
                                            "fullText": "Selene Fortunata Marmondi",
                                            "givenPart": "Selene Fortunata",
                                            "lang": "pt",
                                            "prefixPart": null,
                                            "suffixPart": null
                                        }
                                    ],
                                    "nameType": "",
                                    "preferredName": true,
                                    "sourceCount": 0,
                                    "style": "EUROTYPIC"
                                },
                                "id": null,
                                "justification": "",
                                "multiValued": false,
                                "type": "NAME"
                            },
                            "noteCount": 0,
                            "principlePerson": false,
                            "readOnly": false,
                            "size": "CUSTOM_NON_CACHEABLE",
                            "skeleton": false,
                            "sourceCount": 25,
                            "treeType": "PUBLIC",
                            "visibleToAll": true,
                            "visibleToAllWhenUsingFamilySearchApps": true
                        },
                        "preferred": true
                    }
                ],
                "principlePerson": false,
                "readOnly": false,
                "size": "CUSTOM_NON_CACHEABLE",
                "skeleton": false,
                "sourceCount": 21,
                "treeType": "PUBLIC",
                "visibleToAll": true,
                "visibleToAllWhenUsingFamilySearchApps": true
            },
            "preferred": true
        }
    ],
    "treeType": "PUBLIC",
    "visibleToAll": true,
    "visibleToAllWhenUsingFamilySearchApps": true
}
```