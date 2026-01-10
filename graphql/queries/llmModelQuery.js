const { GraphQLList, GraphQLInt, GraphQLString } = require('graphql');
const LLMModelType = require('../types/LLMModelType');
const db = require('../../models');
const { Op } = require('sequelize');

const getAllLLMModels = {
    type: new GraphQLList(LLMModelType),
    args: {
        offset: { type: GraphQLInt, defaultValue: 0 },
        limit: { type: GraphQLInt, defaultValue: 20 },
        contextWindowMin: { type: GraphQLInt }, // contextWindow >= this value
        contextWindowMax: { type: GraphQLInt }, // contextWindow <= this value
        speedTokensPerSecMin: { type: GraphQLInt }, // speedTokensPerSec >= this value
        speedTokensPerSecMax: { type: GraphQLInt }, // speedTokensPerSec <= this value
        sortBy: { type: GraphQLString }, // contextWindow or speedTokensPerSec
        sortOrder: { type: GraphQLString, defaultValue: 'asc' } // asc or desc
    },
    resolve: async (_, { offset, limit, contextWindowMin, contextWindowMax, speedTokensPerSecMin, speedTokensPerSecMax, sortBy, sortOrder }) => {
        const where = {};
        
        // when a graphql argument is not provided its value is undefined, not null
        // since null will chcek for both null and undefined
        if (contextWindowMin !== undefined || contextWindowMax !== undefined) {
            where.contextWindow = {};
            if (contextWindowMin !== undefined) {
                where.contextWindow[Op.gte] = contextWindowMin; // greater than or equal
            }
            if (contextWindowMax !== undefined) {
                where.contextWindow[Op.lte] = contextWindowMax; // less than or equal
            }
        }
        
        if (speedTokensPerSecMin !== undefined || speedTokensPerSecMax !== undefined) {
            where.speedTokensPerSec = {};
            if (speedTokensPerSecMin !== undefined) {
                where.speedTokensPerSec[Op.gte] = speedTokensPerSecMin;
            }
            if (speedTokensPerSecMax !== undefined) {
                where.speedTokensPerSec[Op.lte] = speedTokensPerSecMax;
            }
        }
        
        const order = [];
        if (sortBy === 'contextWindow' || sortBy === 'speedTokensPerSec') {
            const sortDirection = sortOrder.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
            order.push([sortBy, sortDirection]);
        }
        order.push(['id', 'ASC']);
        
        return await db.LLMModel.findAll({
            where,
            offset,
            limit,
            order,
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