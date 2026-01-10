'use strict';

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1) ia toate provider ids
    const [providers] = await queryInterface.sequelize.query(
      `SELECT id FROM "LLMProviders";`
    );

    // 2) ia provider ids care au deja chatroom
    const [existingRooms] = await queryInterface.sequelize.query(
      `SELECT llmProviderId FROM "ChatRooms";`
    );
    const existingSet = new Set(existingRooms.map(r => r.llmProviderId));

    // 3) construiește doar rândurile lipsă
    const now = new Date();
    const rowsToInsert = providers
      .filter(p => !existingSet.has(p.id))
      .map(p => ({
        llmProviderId: p.id,
        createdAt: now,
        updatedAt: now,
      }));

    if (rowsToInsert.length > 0) {
      await queryInterface.bulkInsert('ChatRooms', rowsToInsert, {});
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('ChatRooms', null, {});
  }
};
