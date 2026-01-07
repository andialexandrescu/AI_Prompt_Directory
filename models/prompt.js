'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Prompt extends Model {
    static associate(models) {
      Prompt.belongsToMany(models.Label, {
        through: models.PromptLabel,
        foreignKey: 'promptId',
        otherKey: 'labelId',
      });
      //Prompt.hasMany(models.Comment, { foreignKey: 'promptId' });
      Prompt.belongsTo(models.User, { foreignKey: 'createdByUserId', as: 'creator' });
    }
  }
  /* 1. (Many-to-Many) A prompt can have many labels and a label can be attached to many prompts with 
the link being stored in a join table, PromptLabel (promptId references a promp, same for labelId)
     2. (One-to-Many) A prompt can have many comments (each row stores a promptId)
     3. (Many-to-one) More prompts can have one user. A prompt has only one user
  */
  Prompt.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    topic: { type: DataTypes.STRING, allowNull: false }, 
    content: { type: DataTypes.TEXT, allowNull: false },
    state: {
      type: DataTypes.ENUM('draft', 'pending_approval', 'posted'),
      allowNull: false,
      defaultValue: 'draft',
    }, // if a prompt is being created / needs approval / is posted
    notes: { type: DataTypes.TEXT },
    createdByUserId: { type: DataTypes.UUID, allowNull: false }, // allowNull: false in order to inject the current user Id in the mutation
  }, {
    sequelize,
    modelName: 'Prompt',
    tableName: 'Prompts',
  });
  return Prompt;
};