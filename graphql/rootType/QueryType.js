const { GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLList, GraphQLInt } = require('graphql');
const UserType = require('../types/UserType');
const db = require('../../models');
const { getAllUsers, getUserById } = require('../queries/userQuery');
const { getAllPrompts, getPromptById } = require('../queries/promptQuery');
const { getLabelById, getAllLabels } = require('../queries/labelQuery');
const { getCommentById, getAllComments } = require('../queries/commentQuery');
const { getAllEvaluations, getEvaluationById } = require('../queries/evaluationQuery');
const { getAllLLMModels, getLLMModelById } = require('../queries/llmModelQuery');
const { getAllLLMProviders, getLLMProviderById } = require('../queries/llmProviderQuery');
const { getChatRoomByProvider } = require('../queries/chatRoomQuery');
const { getHighlightedEvaluationsByModel, getHighlightedEvaluationsByProvider } = require('../queries/highlightedEvaluationQuery');
// locul in care se adauga toate query-urile pe care le voi defini, pentru ca logica sa fie inclusa in app.js const graphQLHandler

const QueryType = new GraphQLObjectType({
    name: 'Query',
    fields: {
        _empty: {
            type: GraphQLString,
            resolve: () => 'API is running',
        },
        getAllUsers,
        getUserById,
        getAllPrompts,
        getPromptById,
        getLabelById,
        getAllLabels,
        getCommentById,
        getAllComments,
        getAllEvaluations,
        getAllUsers,
        getChatRoomByProvider,
        getEvaluationById,
        getAllLLMModels,
        getLLMModelById,
        getAllLLMProviders,
        getLLMProviderById,
        getHighlightedEvaluationsByModel,
        getHighlightedEvaluationsByProvider,
    },
});

module.exports = QueryType;