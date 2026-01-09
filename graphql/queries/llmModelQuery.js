const { GraphQLList, GraphQLInt } = require('graphql');
const LLMModelType = require('../types/LLMModelType');
const db = require('../../models');

const getAllLLMModels = {
    type: new GraphQLList(LLMModelType),
    args: {
        offset: { type: GraphQLInt, defaultValue: 0 },
        limit: { type: GraphQLInt, defaultValue: 100 }
    },
    resolve: async (_, { offset, limit }) => {
        return await db.LLMModel.findAll({
            offset,
            limit,
            include: [
                { model: db.LLMProvider },
                { model: db.Evaluation }
            ]
        });
    }
};

const getLLMModelById = {
    type: LLMModelType,
    args: {
        id: { type: GraphQLInt }
    },
    resolve: async (_, { id }) => {
        return await db.LLMModel.findByPk(id, {
            include: [
                { model: db.LLMProvider },
                { model: db.Evaluation }
            ]
        });
    }
};

module.exports = {
    getAllLLMModels,
    getLLMModelById,
};
