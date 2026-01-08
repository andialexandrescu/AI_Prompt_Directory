'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('Labels', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: { type: Sequelize.STRING, allowNull: false, unique: true },
      status: {
        type: Sequelize.ENUM('approved', 'pending', 'rejected'),
        allowNull: false,
        defaultValue: 'pending',
      },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE },
    });
    await queryInterface.createTable('PromptLabels', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      promptId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'Prompts', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      labelId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Labels', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE },
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('PromptLabels');
    await queryInterface.dropTable('Labels');
  }
};
