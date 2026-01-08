'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class LLMModel extends Model {
    static associate(models) {
      LLMModel.belongsTo(models.LLMProvider, { foreignKey: 'llmProviderId' });
      LLMModel.hasMany(models.Evaluation, { foreignKey: 'llmModelId' });
    }
  }
  LLMModel.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    llmProviderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'LLMProviders', key: 'id' },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    contextWindow: { // number of tokens
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    speedTokensPerSec: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'LLMModel',
    tableName: 'LLMModels',
  });
  return LLMModel;
};