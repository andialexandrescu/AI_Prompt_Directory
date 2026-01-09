const { GraphQLObjectType, GraphQLInt, GraphQLString, GraphQLFloat, GraphQLList } = require('graphql');
const db = require('../../models');

const LLMModelType = new GraphQLObjectType({
    name: 'LLMModel',
    fields: () => {
        // lazy require to avoid circular dependency considering llmprovider returns a list of llm model type objects already
        // this also applies to evaluation since one exact llm model is related to an evaluation
        // anticipating nested queries in which i should display the results of all evaluations tied to a specific llm model, i will also include in llm model's type all evaluations related
        const LLMProviderType = require('./LLMProviderType');
        const EvaluationType = require('./EvaluationType');

        return {
            id: { type: GraphQLInt },
            name: { type: GraphQLString },
            contextWindow: { type: GraphQLInt },
            speedTokensPerSec: { type: GraphQLInt },
            averageRating: { type: GraphQLFloat },
            createdAt: { type: GraphQLString },
            updatedAt: { type: GraphQLString },
            provider: {
                type: LLMProviderType,
                resolve: async (llmModel) => {
                    const llmprovider = await llmModel.getLLMProvider(); // sequelize getter method
                    return llmprovider;
                }
            },
            evaluations: {
                type: new GraphQLList(EvaluationType),
                resolve: async (llmModel) => {
                    const evaluations = [];
                    if (llmModel.Evaluations) { // eager loading in query/ mutation resolvers (to be implemented)
                        evaluations = llmModel.Evaluations;
                    }
                    
                    evaluations = await llmModel.getEvaluations(); // sequelize
                    return evaluations;
                }
            },
        };
    }
});

module.exports = LLMModelType;
