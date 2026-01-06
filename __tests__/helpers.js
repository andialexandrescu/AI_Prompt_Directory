const db = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET_KEY } = require('../constants');
const request = require('supertest');

const createTestUser = async (userData = {}) => {
    const defaultData = {
        username: 'testuser',
        password: 'password123',
        role: 'user',
    };

    const data = { ...defaultData, ...userData };
    const hashedPassword = await bcrypt.hash(data.password, 3);

    const user = await db.User.create({
        username: data.username,
        password: hashedPassword,
        role: data.role,
    });

    const token = jwt.sign({ sub: user.id }, JWT_SECRET_KEY);

    return { user, token, plainPassword: data.password };
};

const graphqlRequest = (app, query, variables = {}, token = null) => {
    const req = request(app)
        .post('/graphql')
        .send({
            query,
            variables,
    });

    if (token) {
        req.set('Authorization', `Bearer ${token}`);
    }

    return req;
};

module.exports = {
    createTestUser,
    graphqlRequest
}