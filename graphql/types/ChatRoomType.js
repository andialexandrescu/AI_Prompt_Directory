const {
  GraphQLObjectType,
  GraphQLInt,
  GraphQLList,
} = require('graphql');

const ChatMessageType = require('./ChatMessageType');
const LLMProviderType = require('./LLMProviderType');

module.exports = new GraphQLObjectType({
  name: 'ChatRoom',
  fields: () => ({
    id: { type: GraphQLInt },
    llmProvider: {
      type: LLMProviderType,
      resolve: (chatRoom, _, { db }) =>
        db.LLMProvider.findByPk(chatRoom.llmProviderId),
    },
    messages: {
      type: new GraphQLList(ChatMessageType),
      resolve: (chatRoom, _, { db }) =>
        db.ChatMessage.findAll({
          where: { chatRoomId: chatRoom.id },
          order: [['createdAt', 'DESC']],
        }),
    },
  }),
});
