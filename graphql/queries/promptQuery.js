const { GraphQLList, GraphQLString, GraphQLInt } = require('graphql');
const PromptType = require('../types/PromptType');
const db = require('../../models');

const getAllPrompts = {
  type: new GraphQLList(PromptType),
  args: {
    offset: { type: GraphQLInt, defaultValue: 0 },
    limit: { type: GraphQLInt, defaultValue: 10 }
  },
  resolve: async (_, { offset, limit }) => {
    return db.Prompt.findAll({
      offset,
      limit,
      include: [
        { model: db.Label, through: { attributes: [] } }, // The through: { attributes: [] } option is only needed for many to many relationships
        { model: db.Comment },
        { model: db.User, as: 'creator' },
      ], // Eager-loads labels and comments
    });
  }
};

const getPromptById = {
  type: PromptType,
  args: { id: { type: GraphQLString } },
  resolve: async (_, { id }) => {
    return db.Prompt.findByPk(id, {
      include: [
        { model: db.Label, through: { attributes: [] } },
        { model: db.Comment },
        { model: db.User, as: 'creator' },
      ], // Eager-loads labels and comments
    });
  }
};

module.exports = { getAllPrompts, getPromptById };