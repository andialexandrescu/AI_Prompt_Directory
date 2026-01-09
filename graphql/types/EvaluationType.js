const { GraphQLObjectType, GraphQLString, GraphQLInt, GraphQLEnumType } = require('graphql');
const PromptType = require('./PromptType');
const UserType = require('./UserType');
const LLMModelType = require('./LLMModelType');
const db = require('../../models');

const EvaluationStatusEnum = new GraphQLEnumType({
    name: 'EvaluationStatus',
    values: {
        not_highlighted: { value: 'not_highlighted' },
        highlighted_by_admin: { value: 'highlighted_by_admin' },
    },
});

const EvaluationType = new GraphQLObjectType({
    name: 'Evaluation',
    fields: () => ({
        id: { type: GraphQLString },
        rating: { type: GraphQLInt },
        content: { type: GraphQLString },
        status: { type: EvaluationStatusEnum },
        createdAt: { type: GraphQLString },
        updatedAt: { type: GraphQLString },
        prompt: {
            type: PromptType,
            resolve: async (evaluation) => {
                const evaluation = await evaluation.getPrompt();
                return evaluation;
            }
        },
        evaluator: {
            type: UserType,
            resolve: async (evaluation) => {
                const user = await evaluation.getEvaluator();
                return user;
            }
        },
        llmModel: {
            type: LLMModelType,
            resolve: async (evaluation) => {
                const models = [];
                if (evaluation.LLMModel) {
                    models = evaluation.LLMModel;
                }

                models = await evaluation.getLLMModel();
                return models;
            }
        },
    }),
});

module.exports = EvaluationType;
