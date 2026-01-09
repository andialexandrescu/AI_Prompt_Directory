# AI Prompt Directory

## Product Vision

**AI Prompt Directory** is a backend API service for a community-driven platform dedicated to sharing code-focused AI prompts, in order to help developers find the most effective prompts for their use cases.

Like Goodreads for developers, it provides endpoints for browsing and rating prompts by topic, comparing performance across major LLM providers (OpenAI, Claude, etc.), and engaging in provider-specific discussion threads.

**The technology stack** consists of a Node.js backend API using Express.js as the http server framework, JWT auth and role-based access control, GraphQL API, and Sequelize ORM with SQLite for structured data and relationship management. Interacting with the API is possible via Altair for GraphQL queries.

[The type of database chosen is a persistent database, since kept in-memory database would only make sense if we decided to implement GitHub Automated testing (the case for the db_sequelize_assignment)]

## Features
There will be two user roles: admin (dealing with posts to delete them (if they are offensive) or to make a normal user an admin or to aprove prompt suggestion labels specific for each post)

## Prompt suggestion and review workflow

### User creates a prompt suggestion => If only existing labels are used: prompt is posted immediately/ If a new label is proposed: prompt enters pending approval state => (optional) Admin reviews and approves the new label, once approved the prompt is posted and visible to all => Other users can view and comment on the prompt

1. Users can submit prompt suggestions each including:
- topic preview/title - **Topic**
- actual prompt text - **Content**
- published state - **State** (see below)
- optional: notes describing use cases, effectiveness, and comparisons to similar prompts - **Notes**
- optional relationship: prompt post labels - many-to-many connection with Label entity (see below)

2. Each prompt must have at least one label, representing a specific programming language or programming task (such as #Python #WebCrawling):
- users select from existing labels or submit a new label

3. If a new label is submitted, it requires admin approval before the prompt post is published (visible for non-admin users). While awaiting label approval, the prompt remains in a **pending approval** state. Other prompt states are **Draft** (user is still editing) and **Posted** (visible to all users once all labels are approved).

4. Each prompt post features a one-level (non-nested) comment section for discussion, as suggested by coordinator professor.

## LLM provider ranking workflow

### User creates one or more evaluation posts based on existing prompt post => Admin highlights interesting evaluations, which are displayed for each LLM models => Results are aggregated based on user's evaluation rating (1-10) => LLM providers have an assigned ranking number based on evaluation results ratings => LLM Models can be sorted asc or desc based on contextWindow and speedTokensPerSec parameters

1. Imagine a user giving the same prompt to multiple LLM models, that prompt will be evaluated for each one, therefore there will be multiple evaluations for one single prompt post, which will then be used to rank LLM providers. Any user can submit an evaluation based on a posted prompt, regardless if they represent the prompt's author or not. Only after user posts the prompt suggestion (posted state), the user is able to create one or more LLM-evaluation prompt results,  linked to an existing LLM model.

2. An admin highlights evaluations, whose statuses will change from **not_highlighted** to **highlighted_by_admin**. These evaluation posts appear for each LLM model, showing only the top 10 most recent ones highlighted by admins for that provider.

3. Results are aggregated based on user's evaluation rating (1-10)

4. LLM providers have an assigned ranking number based on evaluation results ratings. Since ratings are assigned to individual LLM models, each provider's ranking is calculated by averaging the ratings of all its associated models.

## LLM provider chatroom workflow

### User enters the chat room for a specific LLM provider => User submits a simple text message => The message is displayed in the chat room and is visible to all users for 3 minutes => After 3 minutes, the message automatically disappears from the chat room (is deleted from the DB) => (optional) Admin can moderate chat rooms and remove inappropriate messages before the 3-minute expiration if needed

1. Each user can submit a disappearing simple text message which will only be visible for 3 minutes and displayed for each LLM provider linked with that chatroom (the only one-to-one relationship in this project).

3. Admin can delete messages under the 3 minute rule is inappropiate.