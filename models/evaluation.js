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
    hooks: {
      afterCreate: async (evaluation) => {
        await updateModelAndProviderRatings(evaluation.llmModelId); // since the llm model is connected to llm provider it's easier to just determine the provider based on the llm model's id
      },
      afterUpdate: async (evaluation) => {
        await updateModelAndProviderRatings(evaluation.llmModelId);
      },
      afterDestroy: async (evaluation) => {
        await updateModelAndProviderRatings(evaluation.llmModelId);
      },
    },
  });

  // the main reason for this is that hooks work at runtime, meaning they will be useful only when creating evaluations via a graphql mutation
  // however for seeders it isn't runtime and bulkinsert bypasses the hooks
  async function updateModelAndProviderRatings(llmModelId) { // using sequelize orm
    const { LLMModel, LLMProvider, Evaluation } = require('./index');

    const model = await LLMModel.findByPk(llmModelId);

    const modelResult = await Evaluation.findAll({
      where: { llmModelId: model.id },
      attributes: [
        [sequelize.fn('AVG', sequelize.col('rating')), 'averageRating'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'evalCount']
      ],
      raw: true
    });

    const modelAverage = modelResult[0].evalCount > 0 ? parseFloat(modelResult[0].averageRating) : null;

    await model.update({ averageRating: modelAverage }, { hooks: false }); // prevents recursion

    const provider = await LLMProvider.findByPk(model.llmProviderId);

    const providerModels = await LLMModel.findAll({ // same approach for the aggregation, however the provider's rating is based on all models associated
      where: { llmProviderId: provider.id },
      attributes: ['id']
    });

    const modelIds = providerModels.map(m => m.id);

    if (modelIds.length === 0) {
      await provider.update({ averageRating: null, ranking: null }, { hooks: false });
      return;
    }

    const providerResult = await Evaluation.findAll({ // similar to in clause for join sql query
      where: { llmModelId: modelIds },
      attributes: [
        [sequelize.fn('AVG', sequelize.col('rating')), 'averageRating'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'evalCount']
      ],
      raw: true
    });

    const providerAverage = providerResult[0].evalCount > 0 ? parseFloat(providerResult[0].averageRating) : null;

    await provider.update({ averageRating: providerAverage }, { hooks: false });

    await updateAllProviderRankings(); // recalculate rankings for ALL providers
  }

  async function updateAllProviderRankings() { // recalculate rankings for all providers based on averageRating
    const { LLMProvider } = require('./index');

    const providers = await LLMProvider.findAll({ // all providers with their average ratings ordered by rating desc
      order: [
        [sequelize.fn('COALESCE', sequelize.col('averageRating'), 0), 'DESC'], // null ratings go to bottom
        ['id', 'ASC'] // in case two averageRating values are equal sort asc by id
      ]
    });

    let currentRank = 1;
    for (const provider of providers) {
      const ranking = provider.averageRating !== null ? currentRank : null;
      await provider.update({ ranking }, { hooks: false });
      if (provider.averageRating !== null) {
        currentRank++;
      }
    }
  }

  return Evaluation;
};