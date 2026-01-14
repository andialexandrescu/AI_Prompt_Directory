'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ChatMessages', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      expiresAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      chatRoomId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'ChatRooms', key: 'id' },
        onDelete: 'CASCADE', // delete messages if chatroom deleted
        onUpdate: 'CASCADE',
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'Users', key: 'id' },
        onDelete: 'CASCADE', // if user deleted, delete their messages
        onUpdate: 'CASCADE',
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      }
    });

    // Index util pentru query-urile tale (cleanup + list active messages)
    await queryInterface.addIndex('ChatMessages', ['chatRoomId', 'expiresAt']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('ChatMessages', ['chatRoomId', 'expiresAt']);
    await queryInterface.dropTable('ChatMessages');
  }
};
