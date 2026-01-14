'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ChatMessage extends Model {
    static associate(models) {
      ChatMessage.belongsTo(models.ChatRoom, { foreignKey: 'chatRoomId' });
      ChatMessage.belongsTo(models.User, { foreignKey: 'userId' });
    }
  }

  ChatMessage.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      chatRoomId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'ChatRooms', key: 'id' },
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'Users', key: 'id' },
      },
    },
    {
      sequelize,
      modelName: 'ChatMessage',
      tableName: 'ChatMessages',
    }
  );

  return ChatMessage;
};
