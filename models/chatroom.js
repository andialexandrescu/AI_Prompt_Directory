// mesaje din chatroom 
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ChatRoom extends Model {
    static associate(models) {
      // 1:1 ChatRoom <-> LLMProvider
      //relatie 1(1) chatroom cu llmprovider
      ChatRoom.belongsTo(models.LLMProvider, { foreignKey: 'llmProviderId' });

      // 1(M) chatroom cu chatmessage
      ChatRoom.hasMany(models.ChatMessage, { foreignKey: 'chatRoomId' });
    }
  }

  ChatRoom.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      llmProviderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true, // forteaza sa fie 1(1) pentru ca un provider are un singur chatroom
        references: { model: 'LLMProviders', key: 'id' },
      },
    },
    {
      sequelize,
      modelName: 'ChatRoom',
      tableName: 'ChatRooms',
    }
  );

  return ChatRoom;
};
