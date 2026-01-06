const { GraphQLList, GraphQLString } = require('graphql');
const UserType = require('../types/UserType');
const db = require('../../models');

const getAllUsers = {
    type: new GraphQLList(UserType),
    resolve: async () => {
        return await db.User.findAll();
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