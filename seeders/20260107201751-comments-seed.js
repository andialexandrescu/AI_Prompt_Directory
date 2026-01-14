'use strict';
const { faker } = require('@faker-js/faker');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const prompts = await queryInterface.sequelize.query(
      'SELECT id FROM "Prompts"'
    );
    const users = await queryInterface.sequelize.query(
      'SELECT id FROM "Users"'
    );
    const promptRows = prompts[0];
    const userRows = users[0];

    const predefinedComments = [
      'Great prompt, very useful!',
      'I tried this and it worked perfectly',
      'Can you add more details for beginners?',
      'This helped me solve a real issue',
      'Thanks!'
    ];

    let comments = [];
    for (const prompt of promptRows) {
      const predefinedUser = faker.helpers.arrayElement(userRows); // A different random user for each comment
      const predefinedText = faker.helpers.arrayElement(predefinedComments);
      comments.push({
        content: predefinedText,
        promptId: prompt.id,
        userId: predefinedUser.id,
        createdAt: faker.date.past({ years: 0.5 }),
        updatedAt: new Date()
      });

      const numFakerComments = faker.datatype.number({ min: 1, max: 4 });
      for (let i = 0; i < numFakerComments; i++) {
        const user = faker.helpers.arrayElement(userRows);
        comments.push({
          content: faker.lorem.sentences({ min: 1, max: 3 }),
          promptId: prompt.id,
          userId: user.id,
          createdAt: faker.date.past({ years: 0.5 }),
          updatedAt: new Date()
        });
      }
    }
    await queryInterface.bulkInsert('Comments', comments, {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Comments', null, {});
  }
};
