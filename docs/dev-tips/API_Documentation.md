# Steps to follow once a new feature is assigned for development

1. Create simple wireframe UX and have a list of questions ready
2. Document expected request APIs with method, API, description, parameters/body and response formats 
3. Create API GraphQL schema


`Sample API documentation`
# Duplicate Rules
## POST - /rest/v1/data_object/duplicateRules

Description:
Create/Update duplicate rules for data object type

Body Format:
```
{
  "api_key": "1552679244144731",
  "dataObjectId": "ci_aa82f4c085572d46",
  "rules": [
    // UPDATE - w/ "id" attribute
    {
      "id": "sample-id-1",
      "label": "Event",
      "description": "Should have unique event name and date",
      "fields": ["Activity Name", "Activity Date"]
    },
    // CREATE - w/o "id" attribute
    {
      "label": "Address",
      "description": "Should have unique addresses details",
      "fields": ["Street #", "Street Name", "City"]
    }
  ]
}
```

Response Format:
```
[
  {
    "id": "sample-id-1",
    "label": "Event",
    "description": "Should have unique event name and date",
    "fields": ["Activity Name", "Activity Date"]
  },
  {
    "id": "sample-id-2",
    "label": "Address",
    "description": "Should have unique addresses details",
    "fields": ["Street #", "Street Name", "City"]
  }
]
```


## GET - /rest/v1/data_object/duplicateRules?api_key=1552679244144731&groupId=ci_aa82f4c085572d46

Description:
Get all duplicate rules of data object type

Response Format:
```
[
  {
    "id": "sample-id-1",
    "label": "Event",
    "description": "Should have unique event name and date",
    "fields": ["Activity Name", "Activity Date"]
  },
  {
    "id": "sample-id-2",
    "label": "Address",
    "description": "Should have unique addresses details",
    "fields": ["Street #", "Street Name", "City"]
  }
]
```


## GET - /rest/v1/data_object/duplicateRules/sample-id-1?api_key=1552679244144731&groupId=ci_aa82f4c085572d46&Activity%20Name=Basketball&Activity%20Date=2023-02-01

Description:
Find matching duplicate data object based on rule id, group id and field values
Response should return **dataObjectId** and the display fields values

Response Format:
```
{
  "dataObjectId": "item_1",
  "Display Field 1": "Sample value 1",
  "Display Field 2": "Sample value 2"
}
```


## DELETE - /rest/v1/data_object/duplicateRules/sample-id-1

Description:
Create/Update duplicate rules for data object type

Body Format:
```
{
  "id": "sample-id-1"
}
```

Response Format:
```
{
  "status": true,
  "id": "sample-id-1"
}
```
