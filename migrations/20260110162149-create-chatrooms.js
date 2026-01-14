'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ChatRooms', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      llmProviderId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true, // 1:1 with LLMProviders
        references: { model: 'LLMProviders', key: 'id' },
        onDelete: 'CASCADE', // if provider is deleted, delete chatroom
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
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ChatRooms');
  }
};
