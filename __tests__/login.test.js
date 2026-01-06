// toate fisierele din __tests__ trebuie sa aiba in denumire test pt ca jest sa poata sa faca match
// one happy path and one sad path
// avem un in memory databse pentru ca testele vor fi vizibile numai in baza de date nepersistenta
// cand procesul dispare, dispar si datele
// in config.json, models/index.js, package.json 
const db = require('../models');
const { app } = require('../app');
const { createTestUser, graphqlRequest } = require('./helpers');

// sectiunea de mutatie din altair
const LOGIN_MUTATION = `
        mutation Login($username: String!, $password: String!) {
            login(input: { username: $username, password: $password }) {
                ... on LoggedInUser {
                    id
                    token
                }
                ... on FailedAuthentication {
                    reason
                }
            }
        }
    `;


describe("Login Mutation", () => {
    beforeEach(async () => {
        await db.User.destroy({ where: {} });
    });

    // happy path
    test("Should successfuly log in the user given correct credentials", async () => {
        await createTestUser({
            username: 'test1',
            password: 'test1',
            role: 'user',
        });

        // este echivalentul sectiunii de variables din altair
        const response = await graphqlRequest(app, LOGIN_MUTATION, {
            username: 'test1',
            password: 'test1',
        });

        expect(response.status).toBe(200);
        expect(response.body.data.login.id).toBeDefined();
        console.log(typeof response.body.data.login.id);
        expect(typeof response.body.data.login.id).toBe('string'); // uuid
        expect(response.body.data.login.token).toBeDefined();
        expect(typeof response.body.data.login.token).toBe('string');
        expect(response.body.errors).toBeUndefined();
        expect(response.body.data.login.reason).toBeUndefined();
    });

    // sad path
    test("Should fail to log in with incorrect password", async () => {
        await createTestUser({
            username: 'test2',
            password: 'correctpass123',
            role: 'user',
        });

        const response = await graphqlRequest(app, LOGIN_MUTATION, {
            username: 'test2',
            password: 'wrongpass123',
        });

        expect(response.status).toBe(200);
        expect(response.body.data.login.id).toBeUndefined();
        expect(response.body.data.login.token).toBeUndefined();
        expect(response.body.data.login.reason).toBeDefined();
        expect(typeof response.body.data.login.reason).toBe('string');
        expect(response.body.errors).toBeUndefined();
    });
});