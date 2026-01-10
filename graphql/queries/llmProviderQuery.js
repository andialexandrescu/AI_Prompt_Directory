const { GraphQLList, GraphQLInt, GraphQLString } = require('graphql');
const LLMProviderType = require('../types/LLMProviderType');
const db = require('../../models');

const getAllLLMProviders = {
    type: new GraphQLList(LLMProviderType),
    args: {
        offset: { type: GraphQLInt, defaultValue: 0 },
        limit: { type: GraphQLInt, defaultValue: 50 },
        sortByRanking: { type: GraphQLString, defaultValue: 'asc' }
    },
    resolve: async (_, { offset, limit, sortByRanking }) => {
        const order = [];
        
        if (sortByRanking === 'asc' || sortByRanking === 'desc') {
            order.push([
                db.sequelize.fn('COALESCE', db.sequelize.col('ranking'), 999999), 
                sortByRanking.toUpperCase()
            ]);
        }
        order.push(['id', 'ASC']);
        
        return await db.LLMProvider.findAll({
            offset,
            limit,
            order,
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
