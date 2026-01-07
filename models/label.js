'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Label extends Model {
    static associate(models) {
      Label.belongsToMany(models.Prompt, {
        through: models.PromptLabel,
        foreignKey: 'labelId',
        otherKey: 'promptId',
      });
    }
  }
  /* The label is like an instagram / facebook hashtag (#) where it has a designeted "category"
such as Python, JavaScript, Rust as coding languages or a field like WebDev, WebCrawling, Ml.
A label can belong to many prompts. If a label already exists the prompt doesn't need approval (doesn't
mean it won't get moderated). If not an admin needs to approve it to make sure it's not gibberish and
allow a chain reaction where more people use it.
  */
  Label.init({
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
      validateUnique: true,
    },
    status: {
      type: DataTypes.ENUM('approved', 'pending', 'rejected'),
      allowNull: false,
      defaultValue: 'pending',
    },
  }, {
    sequelize,
    modelName: 'Label',
    tableName: 'Labels',
  });
  return Label;
};
