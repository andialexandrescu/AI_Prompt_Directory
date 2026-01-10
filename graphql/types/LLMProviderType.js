const { GraphQLObjectType, GraphQLInt, GraphQLString, GraphQLFloat, GraphQLList } = require('graphql');
const db = require('../../models');

const LLMProviderType = new GraphQLObjectType({
    name: 'LLMProvider',
    fields: () => {
        const LLMModelType = require('./LLMModelType'); // avoiding circular dependency

        return {
            id: { type: GraphQLInt },
            name: { type: GraphQLString },
            description: { type: GraphQLString },
            ranking: { type: GraphQLInt },
            averageRating: { type: GraphQLFloat },
            createdAt: { type: GraphQLString },
            updatedAt: { type: GraphQLString },
            models: {
                type: new GraphQLList(LLMModelType),
                resolve: async (llmProvider) => {
                    if (llmProvider.LLMModels) {
                        return llmProvider.LLMModels;
                    }
                    if (llmProvider.getLLMModels) {
                        return await llmProvider.getLLMModels();
                    }
                }
            }
        };
    }
});

module.exports = LLMProviderType;
