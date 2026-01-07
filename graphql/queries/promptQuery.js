const { GraphQLList, GraphQLString } = require('graphql');
const PromptType = require('../types/PromptType');
const db = require('../../models');

const getAllPrompts = {
  type: new GraphQLList(PromptType),
  resolve: async () => {
    return db.Prompt.findAll({
      include: [
        { model: db.Label, through: { attributes: [] } },
      ], // This eager-loads the labels via the join table, so each returned prompt already has a Labels array
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
      ], // Eager-loading
    });
  }
};

module.exports = { getAllPrompts, getPromptById };
