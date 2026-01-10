'use strict';
const bcrypt = require('bcryptjs');
const { faker } = require('@faker-js/faker');

const generateHash = (plaintextPassword) => bcrypt.hashSync(plaintextPassword, 3);

function createRandomUser() {
  const firstName = faker.name.firstName();
  const lastName = faker.name.lastName();

  return {
    id: faker.datatype.uuid(),
    username: faker.internet.userName(firstName, lastName),
    password: faker.internet.password(),
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
    const predefinedUsers = [
      {
        id: faker.datatype.uuid(),
        username: "adm_andi",
        password: generateHash("pass123"),
        role: "admin",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: faker.datatype.uuid(),
        username: "adm_davide",
        password: generateHash("pass123"),
        role: "admin",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: faker.datatype.uuid(),
        username: "adm_teo",
        password: generateHash("pass123"),
        role: "admin",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: faker.datatype.uuid(),
        username: "user_teo",
        password: generateHash("pass123"),
        role: "user",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: faker.datatype.uuid(),
        username: "user_andra",
        password: generateHash("pass123"),
        role: "user",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: faker.datatype.uuid(),
        username: "user_davide",
        password: generateHash("pass123"),
        role: "user",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    const randomUsers = Array.from({ length: 5 }, () => createRandomUser());
    const users = [...predefinedUsers, ...randomUsers];

    await queryInterface.bulkInsert('Users', users, {});
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete('Users', null, {});
  }
};
