const { GraphQLNonNull } = require('graphql');
const GraphQLBoolean = require('graphql').GraphQLBoolean;
const DeleteChatMessageInput = require('../inputTypes/DeleteChatMessageInput');
const db = require('../../models');

const deleteChatMessage = {
  type: GraphQLBoolean,
  args: {
    input: { type: new GraphQLNonNull(DeleteChatMessageInput) },
  },
  resolve: async (_, { input }, context) => {
    if (!context.user || context.user.role !== 'admin') {
      throw new Error('Forbidden');
    }

    await db.ChatMessage.destroy({
      where: { id: input.messageId },
    });

    return true;
  },
};

module.exports = deleteChatMessage;
