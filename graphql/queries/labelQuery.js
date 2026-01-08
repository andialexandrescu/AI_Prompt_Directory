const { GraphQLList, GraphQLInt } = require('graphql');
const LabelType = require('../types/LabelType');
const db = require('../../models');

const getLabelById = {
    type: LabelType,
    args: {
        id: { type: GraphQLInt }
    },
    resolve: async (_, { id }) => {
        return db.Label.findByPk(id, { 
            include: { model: db.Prompt, through: { attributes: [] } }
        });
    }
};

const getAllLabels = {
    type: new GraphQLList(LabelType),
    args: {
        offset: { type: GraphQLInt, defaultValue: 0 },
        limit: { type: GraphQLInt, defaultValue: 10 }
    },
    resolve: async (_, { offset, limit }) => {
        return db.Label.findAll({ 
            offset,
            limit,
            include: { model: db.Prompt, through: { attributes: [] } }
        });
    }
};

module.exports = {
  getLabelById,
  getAllLabels
};
