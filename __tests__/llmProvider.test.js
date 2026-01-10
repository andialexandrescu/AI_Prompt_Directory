const db = require('../models');
const { app } = require('../app');
const { createTestUser, graphqlRequest } = require('./helpers');

const GET_ALL_LLM_PROVIDERS_QUERY = `
    query GetAllLLMProviders(
        $offset: Int,
        $limit: Int,
        $sortByRanking: String
    ) {
        getAllLLMProviders(
            offset: $offset,
            limit: $limit,
            sortByRanking: $sortByRanking
        ) {
            id
            name
            description
            ranking
            averageRating
            models {
                id
                name
            }
        }
    }
`;

const GET_LLM_PROVIDER_BY_ID_QUERY = `
    query GetLLMProviderById($id: Int!) {
        getLLMProviderById(id: $id) {
            id
            name
            description
            ranking
            averageRating
            models {
                id
                name
                contextWindow
                speedTokensPerSec
            }
        }
    }
`;

const GET_RATING_AGGREGATION_BY_PROVIDER_QUERY = `
    query GetRatingAggregationByProvider($llmProviderId: Int!) {
        getRatingAggregationByProvider(llmProviderId: $llmProviderId) {
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

const GET_HIGHLIGHTED_EVALUATIONS_BY_PROVIDER_QUERY = `
    query GetHighlightedEvaluationsByProvider(
        $llmProviderId: Int!,
        $limit: Int,
        $highlighted: Boolean
    ) {
        getHighlightedEvaluationsByProvider(
            llmProviderId: $llmProviderId,
            limit: $limit,
            highlighted: $highlighted
        ) {
            id
            rating
            content
            status
            llmModel {
                name
            }
        }
    }
`;

describe('LLM Provider Queries', () => {
    let provider1Id;
    let provider2Id;
    let provider3Id;
    let model1Id;
    let model2Id;
    let model3Id;
    let userId;
    let promptId;

    beforeEach(async () => {
        await db.Evaluation.destroy({ where: {} });
        await db.LLMModel.destroy({ where: {} });
        await db.LLMProvider.destroy({ where: {} });
        await db.Prompt.destroy({ where: {} });
        await db.User.destroy({ where: {} });

        const { user } = await createTestUser({
            username: 'test_user',
            password: 'pass123',
            role: 'user',
        });
        userId = user.id;

        const prompt = await db.Prompt.create({
            topic: 'Test Prompt',
            content: 'Test content',
            state: 'posted',
            createdByUserId: userId,
        });
        promptId = prompt.id;

        const provider1 = await db.LLMProvider.create({
            name: 'Top Provider',
            description: 'Best provider',
            ranking: 1,
            averageRating: 9.5,
        });
        provider1Id = provider1.id;

        const provider2 = await db.LLMProvider.create({
            name: 'Mid Provider',
            description: 'Good provider',
            ranking: 2,
            averageRating: 8.0,
        });
        provider2Id = provider2.id;

        const provider3 = await db.LLMProvider.create({
            name: 'New Provider',
            description: 'New provider without ratings',
            ranking: null,
            averageRating: null,
        });
        provider3Id = provider3.id;

        const model1 = await db.LLMModel.create({
            name: 'Top Model',
            contextWindow: 100000,
            speedTokensPerSec: 120,
            averageRating: 9.5,
            llmProviderId: provider1Id,
        });
        model1Id = model1.id;

        const model2 = await db.LLMModel.create({
            name: 'Mid Model',
            contextWindow: 50000,
            speedTokensPerSec: 80,
            averageRating: 8.0,
            llmProviderId: provider2Id,
        });
        model2Id = model2.id;

        const model3 = await db.LLMModel.create({
            name: 'New Model',
            contextWindow: 8000,
            speedTokensPerSec: 60,
            llmProviderId: provider3Id,
        });
        model3Id = model3.id;
    });

    test('Should get LLM provider by Id', async () => {
        const response = await graphqlRequest(
            app,
            GET_LLM_PROVIDER_BY_ID_QUERY,
            { id: provider1Id }
        );

        expect(response.status).toBe(200);
        expect(response.body.data.getLLMProviderById).toBeDefined();
        expect(response.body.data.getLLMProviderById.id).toBe(provider1Id);
        expect(response.body.data.getLLMProviderById.name).toBe('Top Provider');
        expect(response.body.data.getLLMProviderById.ranking).toBe(1);
        expect(response.body.data.getLLMProviderById.models).toBeDefined();
        expect(response.body.data.getLLMProviderById.models.length).toBe(1);
    });

    test('Should sort providers by ranking ascending', async () => {
        const response = await graphqlRequest(
            app,
            GET_ALL_LLM_PROVIDERS_QUERY,
            { sortByRanking: 'asc' }
        );

        expect(response.status).toBe(200);
        expect(response.body.data.getAllLLMProviders).toBeDefined();
        expect(response.body.data.getAllLLMProviders.length).toBe(3);
        expect(response.body.data.getAllLLMProviders[0].name).toBe('Top Provider');
        expect(response.body.data.getAllLLMProviders[1].name).toBe('Mid Provider');
        expect(response.body.data.getAllLLMProviders[2].name).toBe('New Provider');
    });

    test('Should get rating aggregation by provider', async () => {
        await db.Evaluation.bulkCreate([
            { promptId, userId, llmModelId: model1Id, rating: 9, status: 'not_highlighted' },
            { promptId, userId, llmModelId: model1Id, rating: 10, status: 'not_highlighted' },
            { promptId, userId, llmModelId: model1Id, rating: 9, status: 'highlighted_by_admin' },
        ]);

        const response = await graphqlRequest(
            app,
            GET_RATING_AGGREGATION_BY_PROVIDER_QUERY,
            { llmProviderId: provider1Id }
        );

        expect(response.status).toBe(200);
        expect(response.body.data.getRatingAggregationByProvider).toBeDefined();
        expect(response.body.data.getRatingAggregationByProvider.totalEvaluations).toBe(3);
        expect(response.body.data.getRatingAggregationByProvider.minRating).toBe(9);
        expect(response.body.data.getRatingAggregationByProvider.maxRating).toBe(10);
        expect(response.body.data.getRatingAggregationByProvider.distribution).toBeDefined();
    });

    test('Should return zero evaluations for provider without evaluations', async () => {
        const response = await graphqlRequest(
            app,
            GET_RATING_AGGREGATION_BY_PROVIDER_QUERY,
            { llmProviderId: provider3Id }
        );

        expect(response.status).toBe(200);
        expect(response.body.data.getRatingAggregationByProvider).toBeDefined();
        expect(response.body.data.getRatingAggregationByProvider.totalEvaluations).toBe(0);
        expect(response.body.data.getRatingAggregationByProvider.averageRating).toBeNull();
    });

    test('Should get highlighted evaluations by provider', async () => {
        await db.Evaluation.bulkCreate([
            {
                promptId,
                userId,
                llmModelId: model1Id,
                rating: 10,
                content: 'Excellent!',
                status: 'highlighted_by_admin',
            },
            {
                promptId,
                userId,
                llmModelId: model1Id,
                rating: 9,
                content: 'Great!',
                status: 'highlighted_by_admin',
            },
            {
                promptId,
                userId,
                llmModelId: model1Id,
                rating: 8,
                content: 'Good',
                status: 'not_highlighted',
            },
        ]);

        const response = await graphqlRequest(
            app,
            GET_HIGHLIGHTED_EVALUATIONS_BY_PROVIDER_QUERY,
            {
                llmProviderId: provider1Id,
                highlighted: true,
            }
        );

        expect(response.status).toBe(200);
        expect(response.body.data.getHighlightedEvaluationsByProvider).toBeDefined();
        expect(response.body.data.getHighlightedEvaluationsByProvider.length).toBe(2);
        expect(
            response.body.data.getHighlightedEvaluationsByProvider.every(
                e => e.status === 'highlighted_by_admin'
            )
        ).toBe(true);
    });

    test('Should automatically update provider ranking when evaluation is created', async () => {
        await db.Evaluation.create({
            promptId,
            userId,
            llmModelId: model3Id,
            rating: 10,
            status: 'not_highlighted',
        });

        const provider = await db.LLMProvider.findByPk(provider3Id);
        expect(provider.averageRating).toBe(10);
        expect(provider.ranking).toBe(1);

        const previousTop = await db.LLMProvider.findByPk(provider1Id);
        expect(previousTop.ranking).toBe(2);
    });

    test('Should handle multiple models per provider in aggregation', async () => {
        const additionalModel = await db.LLMModel.create({
            name: 'TopModel2',
            contextWindow: 80000,
            speedTokensPerSec: 100,
            llmProviderId: provider1Id,
        });

        await db.Evaluation.bulkCreate([
            { promptId, userId, llmModelId: model1Id, rating: 9, status: 'not_highlighted' },
            { promptId, userId, llmModelId: additionalModel.id, rating: 7, status: 'not_highlighted' },
        ]);

        const response = await graphqlRequest(
            app,
            GET_RATING_AGGREGATION_BY_PROVIDER_QUERY,
            { llmProviderId: provider1Id }
        );

        expect(response.status).toBe(200);
        expect(response.body.data.getRatingAggregationByProvider.totalEvaluations).toBe(2);
        expect(response.body.data.getRatingAggregationByProvider.averageRating).toBe(8);
    });
});