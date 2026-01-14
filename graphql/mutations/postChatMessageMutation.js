const { GraphQLNonNull } = require('graphql');
const ChatMessageType = require('../types/ChatMessageType');
const PostChatMessageInput = require('../inputTypes/PostChatMessageInput');
const db = require('../../models');

const postChatMessage = {
  type: ChatMessageType,
  args: {
    input: { type: new GraphQLNonNull(PostChatMessageInput) },
  },
  resolve: async (_, { input }, context) => {
    if (!context.user) throw new Error('Unauthorized');

    const expiresAt = new Date(Date.now() + 3 * 60 * 1000);

    return db.ChatMessage.create({
      content: input.content,
      chatRoomId: input.chatRoomId,
      userId: context.user.id,
      expiresAt,
    });
  },
};

module.exports = postChatMessage;
