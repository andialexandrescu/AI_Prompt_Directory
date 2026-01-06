const db = require('../models');
const { app } = require('../app');
const { createTestUser, graphqlRequest } = require('./helpers');

// prettify din altair
const GET_ALL_USERS_QUERY = `
  query GetAllUsers {
    getAllUsers {
      id
      username
      role
      createdAt
      updatedAt
    }
  }
`;

const GET_USER_BY_ID_QUERY = `
  query GetUserById($inputId: String!) {
    getUserById(id: $inputId) {
      id
      username
      role
      createdAt
      updatedAt
    }
  }
`;

describe("User Queries", () => {
    let testUser;

    beforeEach(async () => {
        await db.User.destroy({ where: {} });
        const result = await createTestUser({
            username: 'queryuser',
            password: 'querypass',
            role: 'user',
        });
        testUser = result.user;
    });

    test("Should return all users", async () => {
        await createTestUser({
                    username: 'user1',
                    password: 'pass1',
                    role: 'user',
                });
        await createTestUser({
                    username: 'user2',
                    password: 'pass2',
                    role: 'admin',
                });
        await createTestUser({
                    username: 'user3',
                    password: 'pass3',
                    role: 'admin',
                });
        const response = await graphqlRequest(app, GET_ALL_USERS_QUERY);

        expect(response.status).toBe(200);
        expect(response.body.data.getAllUsers.length).toBe(4);
        const usernames = response.body.data.getAllUsers.map(u => u.username);
        expect(usernames).toEqual(expect.arrayContaining(['queryuser', 'user1', 'user2', 'user3']));
    });

    test("Should return user by Id", async () => {
        const response = await graphqlRequest(app, GET_USER_BY_ID_QUERY, {
            inputId: testUser.id,
        });
        expect(response.status).toBe(200);
        expect(response.body.data.getUserById).toBeDefined();
        expect(response.body.data.getUserById.id).toBe(testUser.id);
        expect(response.body.data.getUserById.username).toBe('queryuser');
    });
});