'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const labels = [
      { name: 'API', status: 'approved', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Architecture', status: 'approved', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Debugging', status: 'approved', createdAt: new Date(), updatedAt: new Date() },
      { name: 'JavaScript', status: 'approved', createdAt: new Date(), updatedAt: new Date() },
      { name: 'React', status: 'approved', createdAt: new Date(), updatedAt: new Date() },
      { name: 'MVP', status: 'approved', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Full-Stack', status: 'approved', createdAt: new Date(), updatedAt: new Date() },
      { name: 'GraphQL', status: 'approved', createdAt: new Date(), updatedAt: new Date() },
      { name: 'REST', status: 'approved', createdAt: new Date(), updatedAt: new Date() },
      { name: 'QA', status: 'approved', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Testing', status: 'approved', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Documentation', status: 'approved', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Database', status: 'approved', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Python', status: 'approved', createdAt: new Date(), updatedAt: new Date() },
      { name: 'WebCrawling', status: 'approved', createdAt: new Date(), updatedAt: new Date() },
      { name: 'WebDev', status: 'approved', createdAt: new Date(), updatedAt: new Date() },
      { name: 'AI', status: 'approved', createdAt: new Date(), updatedAt: new Date() },
      { name: 'System-Design', status: 'approved', createdAt: new Date(), updatedAt: new Date() },

      // Some pending labels waiting for admin approval
      { name: 'Machine-Learning', status: 'pending', createdAt: new Date(), updatedAt: new Date() },
      { name: 'DevOps', status: 'pending', createdAt: new Date(), updatedAt: new Date() },

      // A rejected label
      { name: 'IHateJavaScript', status: 'rejected', createdAt: new Date(), updatedAt: new Date() },
    ];

    await queryInterface.bulkInsert('Labels', labels, {});

    const prompts = await queryInterface.sequelize.query(
      'SELECT id, topic FROM "Prompts" ORDER BY "createdAt" ASC'
    ); // Since I made sure the prompts are created in chronological order, I make use of this
    const promptRows = prompts[0];

    const labelResult = await queryInterface.sequelize.query(
      'SELECT id, name FROM "Labels" WHERE status = \'approved\' ORDER BY id ASC'
    );
    const labelMap = {};
    // Dictionary that maps label names to their database Ids
    labelResult[0].forEach(label => {
      labelMap[label.name] = label.id;
    });

    const promptLabels = [];
    promptRows.forEach((prompt) => {
      const topic = prompt.topic.toLowerCase();

      if (topic.includes('api') || topic.includes('documentation')) {
        if (labelMap['API']) {
          promptLabels.push({
            promptId: prompt.id,
            labelId: labelMap['API'],
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
        if (labelMap['Documentation']) {
          promptLabels.push({
            promptId: prompt.id,
            labelId: labelMap['Documentation'],
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
      }
      
      if (topic.includes('system') || topic.includes('arhitect')) {
        if (labelMap['Arhitecture']) {
          promptLabels.push({
            promptId: prompt.id,
            labelId: labelMap['Arhitecture'],
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
        if (labelMap['System-Design']) {
          promptLabels.push({
            promptId: prompt.id,
            labelId: labelMap['System-Design'],
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
      }

      if (topic.includes('debugging')) {
        if (labelMap['Debugging']) {
          promptLabels.push({
            promptId: prompt.id,
            labelId: labelMap['Debugging'],
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
        if (labelMap['JavaScript']) {
          promptLabels.push({
            promptId: prompt.id,
            labelId: labelMap['JavaScript'],
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
      }

      if (topic.includes('mvp')) {
        if (labelMap['MVP']) {
          promptLabels.push({
            promptId: prompt.id,
            labelId: labelMap['MVP'],
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
        if (labelMap['Full-Stack']) {
          promptLabels.push({
            promptId: prompt.id,
            labelId: labelMap['Full-Stack'],
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
        if (labelMap['API']) {
          promptLabels.push({
            promptId: prompt.id,
            labelId: labelMap['API'],
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
      }

      if (topic.includes('graphql') || topic.includes('rest')) {
        if (labelMap['GraphQL']) {
          promptLabels.push({
            promptId: prompt.id,
            labelId: labelMap['GraphQL'],
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
        if (labelMap['REST']) {
          promptLabels.push({
            promptId: prompt.id,
            labelId: labelMap['REST'],
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
        if (labelMap['API']) {
          promptLabels.push({
            promptId: prompt.id,
            labelId: labelMap['API'],
            createdAt: new Date(),
            updatedAt: new Date() });
        }
      }

      if (topic.includes('qa')) {
        if (labelMap['QA']) {
          promptLabels.push({
            promptId: prompt.id,
            labelId: labelMap['QA'],
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
        if (labelMap['AI']) {
          promptLabels.push({
            promptId: prompt.id,
            labelId: labelMap['AI'],
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
      }

    });

    await queryInterface.bulkInsert('PromptLabels', promptLabels, {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('PromptLabels', null, {});
    await queryInterface.bulkDelete('Labels', null, {});
  }
};
