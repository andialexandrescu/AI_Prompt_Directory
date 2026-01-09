const { GraphQLList, GraphQLInt, GraphQLNonNull, GraphQLBoolean } = require('graphql');
const EvaluationType = require('../types/EvaluationType');
const db = require('../../models');

const getHighlightedEvaluationsByModel = {
    type: new GraphQLList(EvaluationType),
    args: {
        llmModelId: { type: new GraphQLNonNull(GraphQLInt) },
        limit: { type: GraphQLInt, defaultValue: 10 },
        highlighted: { type: GraphQLBoolean, defaultValue: true } // true for highlighted, false for not_highlighted
    },
    resolve: async (_, { llmModelId, limit, highlighted }) => {
        const status = highlighted ? 'highlighted_by_admin' : 'not_highlighted';
        return await db.Evaluation.findAll({ // get top most recent evaluations for a specific llm model
            where: { 
                llmModelId,
                status
            },
            order: [['createdAt', 'DESC']],
            limit,
            include: [
                { model: db.Prompt },
                { model: db.User, as: 'evaluator' },
                { model: db.LLMModel }
            ]
        });
    }
};

const getHighlightedEvaluationsByProvider = {
    type: new GraphQLList(EvaluationType),
    args: {
        llmProviderId: { type: new GraphQLNonNull(GraphQLInt) },
        limit: { type: GraphQLInt, defaultValue: 10 },
        highlighted: { type: GraphQLBoolean, defaultValue: true } // true for highlighted, false for not_highlighted
    },
    resolve: async (_, { llmProviderId, limit, highlighted }) => {
        const status = highlighted ? 'highlighted_by_admin' : 'not_highlighted';
        return await db.Evaluation.findAll({ // get top most recent evaluations across all models for a provider
            where: { 
                status
            },
            order: [['createdAt', 'DESC']],
            limit,
            include: [
                { model: db.Prompt },
                { model: db.User, as: 'evaluator' },
                { 
                    model: db.LLMModel,
                    where: { llmProviderId },
                    include: [{ model: db.LLMProvider }]
                }
            ]
        });
    }
};

module.exports = {
    getHighlightedEvaluationsByModel,
    getHighlightedEvaluationsByProvider,
};
