const { GraphQLList, GraphQLString, GraphQLInt } = require('graphql');
const UserType = require('../types/UserType');
const db = require('../../models');

const getAllUsers = {
    type: new GraphQLList(UserType),
    args: {
        offset: { type: GraphQLInt, defaultValue: 0 },
        limit: { type: GraphQLInt, defaultValue: 10 }
    },
    resolve: async (_, { offset, limit }) => {
        return await db.User.findAll({ offset, limit });
    }
};

const getUserById = {
    type: UserType,
    args: {
        id: { type: GraphQLString }
    },
    resolve: async (_, { id }) => {
        return await db.User.findByPk(id);
    }
};

module.exports = {
    getAllUsers,
    getUserById,
};