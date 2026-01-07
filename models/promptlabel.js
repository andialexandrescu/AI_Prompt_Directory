'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PromptLabel extends Model {
    static associate() {
      // This is a join table, associations are defined in Prompt and Label models
    }
  }
  
  PromptLabel.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    promptId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    labelId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'PromptLabel',
    tableName: 'PromptLabels',
  });
  return PromptLabel;
};
