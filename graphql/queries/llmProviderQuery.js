const { GraphQLList, GraphQLInt } = require('graphql');
const LLMProviderType = require('../types/LLMProviderType');
const db = require('../../models');

const getAllLLMProviders = {
    type: new GraphQLList(LLMProviderType),
    args: {
        offset: { type: GraphQLInt, defaultValue: 0 },
        limit: { type: GraphQLInt, defaultValue: 50 }
    },
    resolve: async (_, { offset, limit }) => {
        return await db.LLMProvider.findAll({
            offset,
            limit,
            include: [
                { model: db.LLMModel }
            ]
        });
    }
};

const getLLMProviderById = {
    type: LLMProviderType,
    args: {
        id: { type: GraphQLInt }
    },
    resolve: async (_, { id }) => {
        return await db.LLMProvider.findByPk(id, {
            include: [
                { model: db.LLMModel }
            ]
        });
    }
};

module.exports = {
    getAllLLMProviders,
    getLLMProviderById,
};
