const db = require('../models');
const { app } = require('../app');
const { createTestUser, graphqlRequest } = require('./helpers');

const CREATE_EVALUATION_MUTATION = `
    mutation CreateEvaluation($input: EvaluationInputType!) {
        createEvaluation(input: $input) {
            id
            rating
            content
            status
            prompt {
                id
                topic
            }
            llmModel {
                id
                name
            }
            evaluator {
                id
                username
            }
        }
    }
`;

const GET_ALL_EVALUATIONS_QUERY = `
    query GetAllEvaluations($offset: Int, $limit: Int) {
        getAllEvaluations(offset: $offset, limit: $limit) {
            id
            rating
            content
            status
        }
    }
`;

const GET_EVALUATION_BY_ID_QUERY = `
    query GetEvaluationById($id: String!) {
        getEvaluationById(id: $id) {
            id
            rating
            content
            status
            prompt {
                id
                topic
            }
            llmModel {
                id
                name
            }
        }
    }
`;

const UPDATE_EVALUATION_HIGHLIGHT_MUTATION = `
    mutation UpdateEvaluationHighlight($id: String!, $highlight: Boolean!) {
        updateEvaluationHighlight(id: $id, highlight: $highlight) {
            id
            status
        }
    }
`;

const GET_RATING_AGGREGATION_BY_MODEL_QUERY = `
    query GetRatingAggregationByModel($llmModelId: Int!) {
        getRatingAggregationByModel(llmModelId: $llmModelId) {
            totalEvaluations
            averageRating
            minRating
            maxRating
            distribution {
                rating
                count
            }
        }
    }
`;

describe('Evaluation Mutations and Queries', () => {
    let userToken;
    let userId;
    let adminToken;
    let adminId;
    let promptId;
    let llmProviderId;
    let llmModelId;

    beforeEach(async () => {
        await db.Evaluation.destroy({ where: {} });
        await db.LLMModel.destroy({ where: {} });
        await db.LLMProvider.destroy({ where: {} });
        await db.Prompt.destroy({ where: {} });
        await db.User.destroy({ where: {} });

        const { user, token } = await createTestUser({
            username: 'test_user',
            password: 'pass123',
            role: 'user',
        });
        userToken = token;
        userId = user.id;

        const { user: admin, token: aToken } = await createTestUser({
            username: 'test_admin',
            password: 'pass123',
            role: 'admin',
        });
        adminToken = aToken;
        adminId = admin.id;

        const prompt = await db.Prompt.create({
            topic: 'Test Prompt',
            content: 'Test prompt content',
            state: 'posted',
            createdByUserId: userId,
        });
        promptId = prompt.id;

        const provider = await db.LLMProvider.create({
            name: 'Test Provider',
            description: 'Test provider',
        });
        llmProviderId = provider.id;

        const model = await db.LLMModel.create({
            name: 'Test Model',
            contextWindow: 8000,
            speedTokensPerSec: 50,
            llmProviderId: llmProviderId,
        });
        llmModelId = model.id;
    });

    test('Should create evaluation with valid data', async () => {
        const response = await graphqlRequest(
            app,
            CREATE_EVALUATION_MUTATION,
            {
                input: {
                    promptId: promptId,
                    llmModelId: llmModelId,
                    rating: 8,
                    content: 'Great model performance!',
                },
            },
            userToken
        );

        expect(response.status).toBe(200);
        expect(response.body.data.createEvaluation).toBeDefined();
        expect(response.body.data.createEvaluation.rating).toBe(8);
        expect(response.body.data.createEvaluation.content).toBe('Great model performance!');
        expect(response.body.data.createEvaluation.status).toBe('not_highlighted');
        expect(response.body.data.createEvaluation.prompt.id).toBe(promptId);
        expect(response.body.data.createEvaluation.llmModel.id).toBe(llmModelId);
    });

    test('Should fail to create evaluation for non-posted prompt', async () => {
        const draftPrompt = await db.Prompt.create({
            topic: 'Draft Prompt',
            content: 'Draft content',
            state: 'draft',
            createdByUserId: userId,
        });

        const response = await graphqlRequest(
            app,
            CREATE_EVALUATION_MUTATION,
            {
                input: {
                    promptId: draftPrompt.id,
                    llmModelId: llmModelId,
                    rating: 7,
                    content: 'Test evaluation',
                },
            },
            userToken
        );

        expect(response.status).toBe(200);
        expect(response.body.errors).toBeDefined();
        expect(response.body.errors[0].message).toContain('posted');
    });

    test('Should get all evaluations', async () => {
        await db.Evaluation.create({
            promptId: promptId,
            userId: userId,
            llmModelId: llmModelId,
            rating: 7,
            content: 'Evaluation 1',
            status: 'not_highlighted',
        });

        await db.Evaluation.create({
            promptId: promptId,
            userId: userId,
            llmModelId: llmModelId,
            rating: 9,
            content: 'Evaluation 2',
            status: 'highlighted_by_admin',
        });

        const response = await graphqlRequest(app, GET_ALL_EVALUATIONS_QUERY);

        expect(response.status).toBe(200);
        expect(response.body.data.getAllEvaluations).toBeDefined();
        expect(response.body.data.getAllEvaluations.length).toBe(2);
    });

    test('Should highlight evaluation, admin only', async () => {
        const evaluation = await db.Evaluation.create({
            promptId: promptId,
            userId: userId,
            llmModelId: llmModelId,
            rating: 9,
            content: 'Excellent!',
            status: 'not_highlighted',
        });

        const response = await graphqlRequest(
            app,
            UPDATE_EVALUATION_HIGHLIGHT_MUTATION,
            {
                id: evaluation.id,
                highlight: true,
            },
            adminToken
        );

        expect(response.status).toBe(200);
        expect(response.body.data.updateEvaluationHighlight).toBeDefined();
        expect(response.body.data.updateEvaluationHighlight.status).toBe('highlighted_by_admin');
    });

    test('Should get rating aggregation by model', async () => {
        await db.Evaluation.bulkCreate([
            { promptId, userId, llmModelId, rating: 7, status: 'not_highlighted' },
            { promptId, userId, llmModelId, rating: 8, status: 'not_highlighted' },
            { promptId, userId, llmModelId, rating: 9, status: 'not_highlighted' },
            { promptId, userId, llmModelId, rating: 8, status: 'not_highlighted' },
        ]);

        const response = await graphqlRequest(
            app,
            GET_RATING_AGGREGATION_BY_MODEL_QUERY,
            { llmModelId }
        );

        expect(response.status).toBe(200);
        expect(response.body.data.getRatingAggregationByModel).toBeDefined();
        expect(response.body.data.getRatingAggregationByModel.totalEvaluations).toBe(4);
        expect(response.body.data.getRatingAggregationByModel.averageRating).toBe(8);
        expect(response.body.data.getRatingAggregationByModel.minRating).toBe(7);
        expect(response.body.data.getRatingAggregationByModel.maxRating).toBe(9);
        expect(response.body.data.getRatingAggregationByModel.distribution).toBeDefined();
    });

    test('Should automatically update model averageRating when evaluation is created', async () => {
        await graphqlRequest(
            app,
            CREATE_EVALUATION_MUTATION,
            {
                input: {
                    promptId: promptId,
                    llmModelId: llmModelId,
                    rating: 8,
                },
            },
            userToken
        );

        const model = await db.LLMModel.findByPk(llmModelId);
        expect(model.averageRating).toBe(8);
    });
});
