const db = require('../models');
const { app } = require('../app');
const { graphqlRequest } = require('./helpers');

const GET_ALL_LLM_MODELS_QUERY = `
    query GetAllLLMModels(
        $offset: Int,
        $limit: Int,
        $contextWindowMin: Int,
        $contextWindowMax: Int,
        $speedTokensPerSecMin: Int,
        $speedTokensPerSecMax: Int,
        $sortBy: String,
        $sortOrder: String
    ) {
        getAllLLMModels(
            offset: $offset,
            limit: $limit,
            contextWindowMin: $contextWindowMin,
            contextWindowMax: $contextWindowMax,
            speedTokensPerSecMin: $speedTokensPerSecMin,
            speedTokensPerSecMax: $speedTokensPerSecMax,
            sortBy: $sortBy,
            sortOrder: $sortOrder
        ) {
            id
            name
            contextWindow
            speedTokensPerSec
            averageRating
            provider {
                id
                name
            }
        }
    }
`;

const GET_LLM_MODEL_BY_ID_QUERY = `
    query GetLLMModelById($id: Int!) {
        getLLMModelById(id: $id) {
            id
            name
            contextWindow
            speedTokensPerSec
            averageRating
            provider {
                id
                name
            }
            evaluations {
                id
                rating
            }
        }
    }
`;

describe('LLM Model Queries', () => {
    let provider1Id;
    let provider2Id;
    let model1Id;
    let model2Id;
    let model3Id;

    beforeEach(async () => {
        await db.Evaluation.destroy({ where: {} });
        await db.LLMModel.destroy({ where: {} });
        await db.LLMProvider.destroy({ where: {} });

        const provider1 = await db.LLMProvider.create({
            name: 'Fast Provider',
            description: 'Fast models',
        });
        provider1Id = provider1.id;

        const provider2 = await db.LLMProvider.create({
            name: 'Large Provider',
            description: 'Large context models',
        });
        provider2Id = provider2.id;

        const model1 = await db.LLMModel.create({
            name: 'Fast Model',
            contextWindow: 8000,
            speedTokensPerSec: 150,
            averageRating: 8.5,
            llmProviderId: provider1Id,
        });
        model1Id = model1.id;

        const model2 = await db.LLMModel.create({
            name: 'Large Context Model',
            contextWindow: 200000,
            speedTokensPerSec: 50,
            averageRating: 9.0,
            llmProviderId: provider2Id,
        });
        model2Id = model2.id;

        const model3 = await db.LLMModel.create({
            name: 'Balanced Model',
            contextWindow: 32000,
            speedTokensPerSec: 100,
            averageRating: 7.5,
            llmProviderId: provider1Id,
        });
        model3Id = model3.id;
    });

    test('Should get all LLM models', async () => {
        const response = await graphqlRequest(app, GET_ALL_LLM_MODELS_QUERY);

        expect(response.status).toBe(200);
        expect(response.body.data.getAllLLMModels).toBeDefined();
        expect(response.body.data.getAllLLMModels.length).toBe(3);
    });

    test('Should filter models by contextWindow minimum', async () => {
        const response = await graphqlRequest(
            app,
            GET_ALL_LLM_MODELS_QUERY,
            { contextWindowMin: 30000 }
        );

        expect(response.status).toBe(200);
        expect(response.body.data.getAllLLMModels).toBeDefined();
        expect(response.body.data.getAllLLMModels.length).toBe(2);
        expect(response.body.data.getAllLLMModels.every(m => m.contextWindow >= 30000)).toBe(true);
    });

    test('Should filter models by contextWindow range', async () => {
        const response = await graphqlRequest(
            app,
            GET_ALL_LLM_MODELS_QUERY,
            {
                contextWindowMin: 10000,
                contextWindowMax: 100000,
            }
        );

        expect(response.status).toBe(200);
        expect(response.body.data.getAllLLMModels).toBeDefined();
        expect(response.body.data.getAllLLMModels.length).toBe(1);
        expect(response.body.data.getAllLLMModels[0].name).toBe('Balanced Model');
    });

    test('Should filter models by speedTokensPerSec maximum', async () => {
        const response = await graphqlRequest(
            app,
            GET_ALL_LLM_MODELS_QUERY,
            { speedTokensPerSecMax: 60 }
        );

        expect(response.status).toBe(200);
        expect(response.body.data.getAllLLMModels).toBeDefined();
        expect(response.body.data.getAllLLMModels.length).toBe(1);
        expect(response.body.data.getAllLLMModels[0].name).toBe('Large Context Model');
    });

    test('Should sort models by contextWindow ascending', async () => {
        const response = await graphqlRequest(
            app,
            GET_ALL_LLM_MODELS_QUERY,
            {
                sortBy: 'contextWindow',
                sortOrder: 'asc',
            }
        );

        expect(response.status).toBe(200);
        expect(response.body.data.getAllLLMModels).toBeDefined();
        expect(response.body.data.getAllLLMModels.length).toBe(3);
        expect(response.body.data.getAllLLMModels[0].name).toBe('Fast Model');
        expect(response.body.data.getAllLLMModels[1].name).toBe('Balanced Model');
        expect(response.body.data.getAllLLMModels[2].name).toBe('Large Context Model');
    });

    test('Should sort models by speedTokensPerSec descending', async () => {
        const response = await graphqlRequest(
            app,
            GET_ALL_LLM_MODELS_QUERY,
            {
                sortBy: 'speedTokensPerSec',
                sortOrder: 'desc',
            }
        );

        expect(response.status).toBe(200);
        expect(response.body.data.getAllLLMModels).toBeDefined();
        expect(response.body.data.getAllLLMModels[0].name).toBe('Fast Model');
        expect(response.body.data.getAllLLMModels[1].name).toBe('Balanced Model');
        expect(response.body.data.getAllLLMModels[2].name).toBe('Large Context Model');
    });

    test('Should combine filters and sorting', async () => {
        const response = await graphqlRequest(
            app,
            GET_ALL_LLM_MODELS_QUERY,
            {
                contextWindowMin: 10000,
                speedTokensPerSecMin: 60,
                sortBy: 'speedTokensPerSec',
                sortOrder: 'desc',
            }
        );

        expect(response.status).toBe(200);
        expect(response.body.data.getAllLLMModels).toBeDefined();
        expect(response.body.data.getAllLLMModels.length).toBe(1);
        expect(response.body.data.getAllLLMModels[0].name).toBe('Balanced Model');
    });

    test('Should return empty array when no models match filter', async () => {
        const response = await graphqlRequest(
            app,
            GET_ALL_LLM_MODELS_QUERY,
            {
                contextWindowMin: 500000,
            }
        );

        expect(response.status).toBe(200);
        expect(response.body.data.getAllLLMModels).toBeDefined();
        expect(response.body.data.getAllLLMModels.length).toBe(0);
    });
});
