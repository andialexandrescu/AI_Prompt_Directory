const { GraphQLList, GraphQLInt } = require('graphql');
const LabelType = require('../types/LabelType');
const db = require('../../models');

const getLabelById = {
  type: LabelType,
  args: {
    id: { type: GraphQLInt }
  },
  resolve: async (_, { id }) => {
    return db.Label.findByPk(id);
  }
};

const getAllLabels = {
  type: new GraphQLList(LabelType),
  resolve: async () => {
    return db.Label.findAll();
  }
};

module.exports = {
  getLabelById,
  getAllLabels
};
