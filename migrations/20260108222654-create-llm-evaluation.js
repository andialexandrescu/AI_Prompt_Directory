'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('LLMProviders', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      ranking: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
    });

    await queryInterface.createTable('LLMModels', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      llmProviderId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'LLMProviders', key: 'id' },
        onDelete: 'CASCADE', // if an llm provider is deleted, its related llm models are deleted
        onUpdate: 'CASCADE',
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      contextWindow: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      speedTokensPerSec: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
    });

    await queryInterface.createTable('Evaluations', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      promptId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'Prompts', key: 'id' },
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'Users', key: 'id' },
      },
      llmModelId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'LLMModels', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      rating: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      content: { type: Sequelize.TEXT, allowNull: true },
      status: {
        type: Sequelize.ENUM('not_highlighted', 'highlighted_by_admin'),
        defaultValue: 'not_highlighted',
        allowNull: false,
      },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Evaluations');
    await queryInterface.dropTable('LLMModels');
    await queryInterface.dropTable('LLMProviders');
  },
};
