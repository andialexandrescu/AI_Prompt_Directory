const db = require('../models');
const { app } = require('../app');
const { createTestUser, graphqlRequest } = require('./helpers');

const CREATE_PROMPT_MUTATION = `
    mutation CreatePrompt($input: PromptInputType!) {
        createPrompt(input: $input) {
            id
            topic
            content
            notes
            state
            labels {
                id
                name
                status
            }
        }
    }
`;

const GET_ALL_PROMPTS_QUERY = `
    query GetAllPrompts($offset: Int, $limit: Int) {
        getAllPrompts(offset: $offset, limit: $limit) {
            id
            topic
            content
            state
            labels {
                id
                name
                status
            }
        }
    }
`;

const GET_PROMPT_BY_ID_QUERY = `
    query GetPromptById($id: String!) {
        getPromptById(id: $id) {
            id
            topic
            content
            state
            labels {
                id
                name
                status
            }
            creator {
                id
                username
            }
        }
    }
`;

describe('Prompt Mutations', () => {
    let userToken;
    let userId;

    beforeEach(async () => {
        await db.Prompt.destroy({ where: {} });
        await db.Label.destroy({ where: {} });
        await db.User.destroy({ where: {} });

        const { user, token } = await createTestUser({
            username: 'promptuser',
            password: 'pass123',
            role: 'user',
        });
        userToken = token;
        userId = user.id;
    });

    test('Should create prompt with both existing and new labels', async () => {
        const existingLabel = await db.Label.create({ name: 'NodeJS', status: 'approved' });

        const response = await graphqlRequest(
            app,
            CREATE_PROMPT_MUTATION,
            {
                input: {
                    topic: 'Node.js and Express',
                    content: 'Build a REST API with Express',
                    existingLabelIds: [existingLabel.id],
                    newLabelNames: ['ExpressJS', 'BestPractices'],
                }
            },
            userToken
        );

        expect(response.status).toBe(200);
        expect(response.body.data.createPrompt.state).toBe('pending_approval');
        const statuses = response.body.data.createPrompt.labels.map(l => l.status);
        expect(statuses).toContain('pending');
        expect(statuses).toContain('approved');
        expect(response.body.data.createPrompt.labels.length).toBeGreaterThanOrEqual(2);
    });

    test('Should fail to create prompt with invalid token (non-existent user)', async () => {
        const fakeToken = "whatever-fake_token"

        const response = await graphqlRequest(
            app,
            CREATE_PROMPT_MUTATION,
            {
                input: {
                    topic: 'Should fail',
                    content: 'This prompt should not be created',
                }
            },
            fakeToken
        );

        expect(response.status).toBe(200);
        expect(response.body.errors).toBeDefined();
        expect(response.body.errors[0].message).toContain('Unauthorized');
    });
});
