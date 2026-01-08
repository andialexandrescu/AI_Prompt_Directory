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
    comments {
      id
      content
    }
    creator {
      username
    }
  }
}
```

```graphql
query GetAllPrompts {
  getAllPrompts {
    id
    topic
    content
    labels {
      id
      name
      status
    }
    comments {
      id
      content
    }
    creator {
      username
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
    prompts {
      id
      topic
      content
    }
  }
}
```

```graphql
query GetAllLabels {
  getAllLabels {
    id
    name
    status
    prompts {
      id
      topic
      content
    }
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

```graphql
query GetAllComments{
  getAllComments {
    id
    content
    createdAt
    updatedAt
    prompt {
      id
      topic
      content
      creator {
        username
      }
    }
    user {
      username
    }
  }
}
```

```graphql
query GetCommentById($id: Int!) {
  getCommentById(id: $id) {
    id
    content
    createdAt
    updatedAt
    prompt {
      id
      topic
      content
      creator {
        username
      }
    }
    user {
      username
    }
  }
}
```

```graphql
mutation {
  createComment(
    input: {
      content: "This is a great prompt! Very helpful."
      promptId: "f1fd0e46-bff5-4aab-86a4-beab4dfcbf42"
    }
  ) {
    id
    content
    createdAt
    updatedAt
    prompt {
      id
      topic
      content
    }
    user {
      id
      username
    }
  }
}
```

```graphql
query {
  getAllPrompts(offset: 0, limit: 5) {
    id
    topic
  }
  getAllLabels(offset: 10, limit: 20) {
    id
    name
  }
  getAllComments(limit: 15) {
    id
    content
  }
  getAllUsers {
    id
    username
  }
}
```