const { GraphQLList, GraphQLString, GraphQLInt } = require('graphql');
const EvaluationType = require('../types/EvaluationType');
const db = require('../../models');

const getAllEvaluations = {
    type: new GraphQLList(EvaluationType),
    args: {
        offset: { type: GraphQLInt, defaultValue: 0 },
        limit: { type: GraphQLInt, defaultValue: 10 }
    },
    resolve: async (_, { offset, limit }) => {
        return await db.Evaluation.findAll({
            offset,
            limit,
            include: [
                { model: db.Prompt },
                { model: db.User, as: 'evaluator' },
                { model: db.LLMModel }
            ]
        });
    }
};

const getEvaluationById = {
    type: EvaluationType,
    args: {
        id: { type: GraphQLString }
    },
    resolve: async (_, { id }) => {
        return await db.Evaluation.findByPk(id, {
            include: [
                { model: db.Prompt },
                { model: db.User, as: 'evaluator' },
                { model: db.LLMModel }
            ]
        });
    }
};

module.exports = {
    getAllEvaluations,
    getEvaluationById,
};
