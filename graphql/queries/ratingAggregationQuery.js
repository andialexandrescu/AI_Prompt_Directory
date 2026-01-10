const { GraphQLInt } = require('graphql');
const RatingAggregationType = require('../types/RatingAggregationType');
const db = require('../../models');

const getRatingAggregationByModel = {
    type: RatingAggregationType,
    args: {
        llmModelId: { type: GraphQLInt }
    },
    resolve: async (_, { llmModelId }) => {
        const evaluations = await db.Evaluation.findAll({
            where: { llmModelId },
            attributes: ['rating']
        });

        if (evaluations.length === 0) {
            return {
                totalEvaluations: 0,
                averageRating: null,
                minRating: null,
                maxRating: null,
                distribution: []
            };
        }

        const ratings = evaluations.map(e => e.rating);
        const totalEvaluations = ratings.length;
        const averageRating = ratings.reduce((sum, r) => sum + r, 0) / totalEvaluations;
        const minRating = Math.min(...ratings);
        const maxRating = Math.max(...ratings);

        const distribution = [];
        for (let rating = 1; rating <= 10; rating++) { // distribution, count for each rating
            const count = ratings.filter(r => r === rating).length;
            if (count > 0) {
                distribution.push({ rating, count });
            }
        }

        return {
            totalEvaluations,
            averageRating,
            minRating,
            maxRating,
            distribution
        };
    }
};

const getRatingAggregationByProvider = {
    type: RatingAggregationType,
    args: {
        llmProviderId: { type: GraphQLInt }
    },
    resolve: async (_, { llmProviderId }) => {
        const models = await db.LLMModel.findAll({
            where: { llmProviderId },
            attributes: ['id']
        });

        if (models.length === 0) {
            return {
                totalEvaluations: 0,
                averageRating: null,
                minRating: null,
                maxRating: null,
                distribution: []
            };
        }

        const modelIds = models.map(m => m.id);

        const evaluations = await db.Evaluation.findAll({
            where: { llmModelId: modelIds },
            attributes: ['rating']
        });

        if (evaluations.length === 0) {
            return {
                totalEvaluations: 0,
                averageRating: null,
                minRating: null,
                maxRating: null,
                distribution: []
            };
        }

        const ratings = evaluations.map(e => e.rating);
        const totalEvaluations = ratings.length;
        const averageRating = ratings.reduce((sum, r) => sum + r, 0) / totalEvaluations;
        const minRating = Math.min(...ratings);
        const maxRating = Math.max(...ratings);

        const distribution = [];
        for (let rating = 1; rating <= 10; rating++) { // distribution, count for each rating
            const count = ratings.filter(r => r === rating).length;
            if (count > 0) {
                distribution.push({ rating, count });
            }
        }

        return {
            totalEvaluations,
            averageRating,
            minRating,
            maxRating,
            distribution
        };
    }
};

module.exports = {
    getRatingAggregationByModel,
    getRatingAggregationByProvider,
};