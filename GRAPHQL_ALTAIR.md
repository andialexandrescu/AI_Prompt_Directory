## First workflow

After setting the authorization headers in Altair:

```graphql
query GetPromptById($id: String!) {
  getPromptById(id: $id) {
    id
    topic
    content
    labels {
      id
      name
      status
    }
  }
}
```

```graphql
query GetAllPrompts{
  getAllPrompts {
    id
    topic
    content
    labels {
      id
      name
      status
    }
  }
}
```

```graphql
query GetLabelById($id: Int!) {
  getLabelById(id: $id) {
    id
    name
    status
  }
}
```

```graphql
query GetAllLabels{
  getAllLabels {
    id
    name
    status
  }
}
```

```graphql
mutation {
  createPrompt(
    input: {
      topic: "Topic"
      content: "Content"
      notes: "Notes"
      existingLabelIds: [1, 2]
      newLabelNames: ["NewLabel1", "NewLabel2"]
    }
  ) {
    id
    topic
    content
    notes
    labels {
      id
      name
      status
    }
  }
}
```

```graphql
mutation {
  createLabel(name: "Label") {
    id
    name
    status
  }
}
```

```graphql
mutation ValidateLabel($id: Int!, $status: String!) {
  validateLabel(id: $id, status: $status) {
    id
    name
    status
  }
}

{
  "id": 19,
  "status": "approved"
}
```