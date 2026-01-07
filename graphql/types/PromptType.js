const { GraphQLObjectType, GraphQLString, GraphQLList, GraphQLEnumType } = require('graphql');
const LabelType = require('./LabelType');
const UserType = require('./UserType');
const db = require('../../models');

const PromptStateEnum = new GraphQLEnumType({
  name: 'PromptState',
  values: {
    draft: { value: 'draft' },
    pending_approval: { value: 'pending_approval' },
    posted: { value: 'posted' },
  },
});

const PromptType = new GraphQLObjectType({
  name: 'Prompt',
  fields: () => ({
    id: { type: GraphQLString },
    topic: { type: GraphQLString },
    content: { type: GraphQLString },
    state: { type: PromptStateEnum },
    notes: { type: GraphQLString },
    creator: {
      type: UserType,
      // Because of Prompt.belongsTo(User, { as: 'creator' }) sequelize creates a getCreator() method
      resolve: async (prompt) => {
        const creator = await prompt.getCreator(); // returns a promise
        return creator;
        // return await db.User.findByPk(prompt.createdByUserId);
      }
    },
    labels: {
      type: new GraphQLList(LabelType),
      resolve: async (prompt) => {
        // If labels were eagerly loaded, I reuse them
        if (prompt.Labels) { // no sync operation since it's already loaded data
          return prompt.Labels;
        }
        // For any sequelize instance, use its getter
        if (prompt.getLabels) { 
          return await prompt.getLabels(); // returns a promise
        }
        // Initial approach, however now prompts usually have labels
        // return await db.Prompt.findByPk(prompt.id);
      }
    },
  }),
});

module.exports = PromptType;
