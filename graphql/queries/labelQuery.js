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
    resolve: async () => {
        return db.Label.findAll({ 
            include: { model: db.Prompt, through: { attributes: [] } }
        });
    }
};

module.exports = {
  getLabelById,
  getAllLabels
};
