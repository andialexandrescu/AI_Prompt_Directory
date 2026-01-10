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

## Second workflow

```graphql
# Get all evaluations with full nesting
query GetAllEvaluations {
  getAllEvaluations(offset: 0, limit: 10) {
    id
    rating
    content
    status
    createdAt
    updatedAt
    prompt {
      id
      topic
      content
      state
      notes
      creator {
        username
      }
      labels {
        id
        name
        status
      }
    }
    evaluator {
      username
    }
    llmModel {
      id
      name
      contextWindow
      speedTokensPerSec
      averageRating
      provider {
        id
        name
        description
        ranking
        averageRating
      }
    }
  }
}
```

```graphql
# Get all evaluations with full nesting
query GetEvaluationById($id: String!) {
  getEvaluationById(id: $id) {
    id
    rating
    content
    status
    createdAt
    updatedAt
    prompt {
      id
      topic
      content
      state
      notes
      creator {
        username
      }
      labels {
        id
        name
        status
      }
    }
    evaluator {
      username
    }
    llmModel {
      id
      name
      contextWindow
      speedTokensPerSec
      averageRating
      provider {
        id
        name
        description
        ranking
        averageRating
      }
    }
  }
}
```

```graphql
query GetAllLLMModels {
  getAllLLMModels(offset: 0, limit: 4) {
    id
    name
    contextWindow
    speedTokensPerSec
    averageRating
    createdAt
    updatedAt
    provider {
      id
      name
      description
      ranking
      averageRating
      createdAt
      updatedAt
    }
    evaluations {
      id
      rating
      content
      status
      createdAt
      evaluator {
        username
      }
      prompt {
        id
        topic
        content
      }
    }
  }
}
```

```graphql
query GetLLMModelById($id: Int!) {
  getLLMModelById(id: $id) {
    id
    name
    contextWindow
    speedTokensPerSec
    averageRating
    createdAt
    updatedAt
    provider {
      id
      name
      description
      ranking
      averageRating
      models {
        id
        name
        averageRating
      }
    }
    evaluations {
      id
      rating
      content
      status
      evaluator {
        id
        username
      }
      prompt {
        id
        topic
      }
    }
  }
}
```

```graphql
query GetAllLLMProviders {
  getAllLLMProviders(offset: 0, limit: 50, sortByRanking: "asc") {
    id
    name
    description
    ranking
    averageRating
    createdAt
    updatedAt
    models {
      id
      name
      contextWindow
      speedTokensPerSec
      averageRating
      evaluations {
        id
        rating
        status
        content
        evaluator {
          username
        }
        prompt {
          id
          topic
          content
          creator {
            username
          }
        }
      }
    }
  }
}
```

```graphql
query GetLLMProviderById($id: Int!) {
  getLLMProviderById(id: $id) {
    id
    name
    description
    ranking
    averageRating
    createdAt
    updatedAt
    models {
      id
      name
      contextWindow
      speedTokensPerSec
      averageRating
      createdAt
      updatedAt
      evaluations {
        id
        rating
        content
        status
        createdAt
        evaluator {
          username
        }
        prompt {
          id
          topic
          content
          creator {
            username
          }
        }
      }
    }
  }
}
```

```graphql
mutation CreateEvaluation {
  createEvaluation(input: {
    promptId: "16f046ab-0535-43aa-9204-c9824e2ef5a2"
    llmModelId: 1
    rating: 9
    content: "Excellent response!"
  }) {
    id
    rating
    content
    status
    createdAt
    updatedAt
    prompt {
      id
      topic
    }
    evaluator {
      username
    }
    llmModel {
      id
      name
      contextWindow
      speedTokensPerSec
      averageRating
      provider {
        id
        name
        averageRating
      }
    }
  }
}
```

```graphql
mutation HighlightEvaluation($id: String!) {
  updateEvaluationHighlight(id: $id, highlight: true) {
    id
    status
    rating
    content
    llmModel {
      name
      averageRating
    }
    evaluator {
      username
    }
  }
}
```

```graphql
mutation UnhighlightEvaluation($id: String!) {
  updateEvaluationHighlight(id: $id, highlight: false) {
    id
    status
    rating
    content
    llmModel {
      name
    }
    evaluator {
      username
    }
  }
}
```

```graphql
query GetUnhighlightedForModel {
  getHighlightedEvaluationsByModel(llmModelId: 1, limit: 10, highlighted: false) {
    id
    rating
    content
    createdAt
    evaluator {
      username
    }
    prompt {
      topic
    }
    llmModel {
      name
    }
  }
}
```

```graphql
query GetHighlightedForProvider {
  getHighlightedEvaluationsByProvider(llmProviderId: 1, limit: 10) {
    id
    rating
    content
    createdAt
    evaluator {
      username
    }
    llmModel {
      name
      contextWindow
    }
  }
}
```

```graphql
query getLLMModelsGTEContextWindowSpeedTokensPerSec{
  getAllLLMModels(
    contextWindowMin: 200000,
    speedTokensPerSecMin: 100,
    sortBy: "speedTokensPerSec",
    sortOrder: "desc"
  ) {
    id
    name
    contextWindow
    speedTokensPerSec
    averageRating
  }
}
```