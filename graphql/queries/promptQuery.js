const { GraphQLList, GraphQLString } = require('graphql');
const PromptType = require('../types/PromptType');
const db = require('../../models');

const getAllPrompts = {
  type: new GraphQLList(PromptType),
  resolve: async () => {
    return db.Prompt.findAll({
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
