const { GraphQLInt } = require('graphql');
const ChatRoomType = require('../types/ChatRoomType');
const db = require('../../models');
const { Op } = require('sequelize'); // <-- ADD

const getChatRoomByProvider = {
  type: ChatRoomType,
  args: {
    llmProviderId: { type: GraphQLInt },
  },
  resolve: async (_, { llmProviderId }) => {
    // 1) DELETE expired messages (cleanup)
    await db.ChatMessage.destroy({
      where: {
        expiresAt: { [Op.lte]: new Date() }, // expired = expiresAt <= now
      },
    });

    // 2) return chatroom
    return db.ChatRoom.findOne({
      where: { llmProviderId },
    });
  },
};

module.exports = { getChatRoomByProvider };


