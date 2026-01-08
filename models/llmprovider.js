'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class LLMProvider extends Model {
    static associate(models) {
      LLMProvider.hasMany(models.Evaluation, { foreignKey: 'llmProviderId' });
    }
  }
  LLMProvider.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    ranking: {
      type: DataTypes.INTEGER,
      allowNull: true, // computed based on evalutaion posts later
    }
  }, {
    sequelize,
    modelName: 'LLMProvider',
    tableName: 'LLMProviders',
  });
  return LLMProvider;
};