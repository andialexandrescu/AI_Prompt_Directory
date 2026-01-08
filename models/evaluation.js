'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Evaluation extends Model {
    static associate(models) {
      Evaluation.belongsTo(models.Prompt, { foreignKey: 'promptId' });
      Evaluation.belongsTo(models.User, { foreignKey: 'userId', as: 'evaluator' });
      Evaluation.belongsTo(models.LLMModel, { foreignKey: 'llmModelId' });
    }
  }
  Evaluation.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    promptId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'Prompts', key: 'id' }
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'Users', key: 'id' }
    },
    llmModelId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'LLMModels', key: 'id' }
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1, max: 10 }
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('not_highlighted', 'highlighted_by_admin'),
      defaultValue: 'not_highlighted',
      allowNull: false,
    }
  }, {
    sequelize,
    modelName: 'Evaluation',
    tableName: 'Evaluations',
  });
  return Evaluation;
};