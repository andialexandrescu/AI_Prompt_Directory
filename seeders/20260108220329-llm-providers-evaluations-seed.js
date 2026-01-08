'use strict';
const { faker } = require('@faker-js/faker');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const now = new Date();

    const providerSeed = [
      {
        name: 'OpenAI',
        description: 'OpenAI API (GPT models)',
        ranking: null,
        createdAt: now,
        updatedAt: now
      },
      {
        name: 'Anthropic',
        description: 'Anthropic Claude models',
        ranking: null,
        createdAt: now,
        updatedAt: now
      },
      {
        name: 'Google',
        description: 'Google Gemini models',
        ranking: null,
        createdAt: now,
        updatedAt: now
      },
      {
        name: 'xAI',
        description: 'Grok models',
        ranking: null,
        createdAt: now,
        updatedAt: now
      },
      {
        name: 'DeepSeek',
        description: 'DeepSeek models',
        ranking: null,
        createdAt: now,
        updatedAt: now
      },
      {
        name: 'Mixture-of-Experts',
        description: 'Meta models',
        ranking: null,
        createdAt: now,
        updatedAt: now
      }
    ];
    await queryInterface.bulkInsert('LLMProviders', providerSeed);

    const [providers] = await queryInterface.sequelize.query(
      `SELECT id, name FROM "LLMProviders" ORDER BY id;`
    );

    const providerMap = {};
    providers.forEach(p => { providerMap[p.name] = p.id; });


    const modelSeed = [
      { llmProviderId: providerMap['OpenAI'],
        name: 'OpenAI o3',
        contextWindow: 200000,
        speedTokensPerSec: 94,
        createdAt: now,
        updatedAt: now
      },
      { llmProviderId: providerMap['OpenAI'],
        name: 'OpenAI o4-mini',
        contextWindow: 200000,
        speedTokensPerSec: 135,
        createdAt: now,
        updatedAt: now
      },
      { llmProviderId: providerMap['xAI'],
        name: 'Grok 4',
        contextWindow: 256000,
        speedTokensPerSec: 52,
        createdAt: now,
        updatedAt: now
      },
      { llmProviderId: providerMap['Anthropic'],
        name: 'Claude 4 Sonnet',
        contextWindow: 200000,
        speedTokensPerSec: null,
        createdAt: now,
        updatedAt: now
      },
      { llmProviderId: providerMap['Google'],
        name: 'Gemini 3 Pro',
        contextWindow: 10000000,
        speedTokensPerSec: 128,
        createdAt: now,
        updatedAt: now
      },
      { llmProviderId: providerMap['DeepSeek'],
        name: 'DeepSeek-R1',
        contextWindow: 128000,
        speedTokensPerSec: 24,
        createdAt: now,
        updatedAt: now
      },
      { llmProviderId: providerMap['Mixture-of-Experts'],
        name: 'Llama 4 Scout',
        contextWindow: 10000000,
        speedTokensPerSec: 2600,
        createdAt: now,
        updatedAt: now
      },
      { llmProviderId: providerMap['Mixture-of-Experts'],
        name: 'Llama 4 Scout',
        contextWindow: 128000,
        speedTokensPerSec: 969,
        createdAt: now,
        updatedAt: now
      },
    ];
    await queryInterface.bulkInsert('LLMModels', modelSeed);

    const [prompts] = await queryInterface.sequelize.query(
      `SELECT id FROM "Prompts" ORDER BY "createdAt" DESC LIMIT 10;`
    );
    const [users] = await queryInterface.sequelize.query(
      `SELECT id FROM "Users" ORDER BY "createdAt" ASC LIMIT 10;`
    );
    const [models] = await queryInterface.sequelize.query(
      `SELECT id FROM "LLMModels" ORDER BY id;`
    );

    const modelIds = models.map(m => m.id);
    const evaluations = [];
    function createRandomEvaluation(promptId, userId, llmModelId) {
      const createdAt = faker.date.past({ years: 0.5 });
      const updatedAt = faker.date.between({ from: createdAt, to: new Date() });
      return {
        id: faker.string.uuid(),
        promptId: promptId,
        userId: userId,
        llmModelId: llmModelId,
        rating: faker.number.int({ min: 1, max: 10 }),
        content: faker.lorem.paragraph(),
        status: faker.helpers.arrayElement(['not_highlighted', 'highlighted_by_admin']),
        createdAt: createdAt,
        updatedAt: updatedAt,
      };
    }

    const predefinedEvaluations = [
      {
        id: faker.string.uuid(),
        promptId: prompts[0].id,
        userId: users[0].id,
        llmModelId: modelIds[0],
        rating: 9,
        content: 'Excellent response quality. The model understood the context perfectly and provided detailed, accurate information. Response time was impressive.',
        status: 'highlighted_by_admin',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: faker.string.uuid(),
        promptId: prompts[1].id,
        userId: users[1].id,
        llmModelId: modelIds[1],
        rating: 7,
        content: 'Good overall performance but occasionally misunderstood nuanced questions. Still very helpful for most use cases.',
        status: 'highlighted_by_admin',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: faker.string.uuid(),
        promptId: prompts[2].id,
        userId: users[2].id,
        llmModelId: modelIds[2],
        rating: 8,
        content: 'Fast and reliable. Great for technical questions and coding tasks. Could improve on creative writing prompts.',
        status: 'highlighted_by_admin',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: faker.string.uuid(),
        promptId: prompts[3].id,
        userId: users[3].id,
        llmModelId: modelIds[3],
        rating: 6,
        content: 'Decent performance but slower than competitors. Accuracy is acceptable but not outstanding. Needs improvement in follow-up questions.',
        status: 'not_highlighted',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: faker.string.uuid(),
        promptId: prompts[4].id,
        userId: users[4].id,
        llmModelId: modelIds[4],
        rating: 10,
        content: 'Outstanding model! Best in class for reasoning tasks. Handles complex multi-step problems with ease. Highly recommended.',
        status: 'highlighted_by_admin',
        createdAt: now,
        updatedAt: now,
      },
    ];
    
    evaluations.push(...predefinedEvaluations);

    // 3 auto-generated evaluations per prompt with different models
    prompts.forEach((prompt, i) => {
      const modelsForPrompt = faker.helpers.arrayElements(modelIds, 3);
      modelsForPrompt.forEach((modelId, j) => {
        evaluations.push(
          createRandomEvaluation(
            prompt.id,
            users[(i + j) % users.length].id, // avoids same user for all evaluations
            modelId
          )
        );
      });
    });

    await queryInterface.bulkInsert('Evaluations', evaluations);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Evaluations', null, {});
    await queryInterface.bulkDelete('LLMModels', null, {});
    await queryInterface.bulkDelete('LLMProviders', null, {});
  }
};
