'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('LLMModels', 'averageRating', {
      type: Sequelize.FLOAT,
      allowNull: true,
      defaultValue: null,
    });

    await queryInterface.addColumn('LLMProviders', 'averageRating', {
      type: Sequelize.FLOAT,
      allowNull: true,
      defaultValue: null,
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('LLMModels', 'averageRating');
    await queryInterface.removeColumn('LLMProviders', 'averageRating');
  }
};