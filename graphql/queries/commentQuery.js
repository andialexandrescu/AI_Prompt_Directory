const { GraphQLList, GraphQLInt } = require('graphql');
const CommentType = require('../types/CommentType');
const db = require('../../models');

const getCommentById = {
    type: CommentType,
    args: {
        id: { type: GraphQLInt }
    },
    resolve: async (_, { id }) => {
        return db.Comment.findByPk(id, { include: [db.User, db.Prompt] });
    }
};

const getAllComments = {
    type: new GraphQLList(CommentType),
    resolve: async () => {
        return db.Comment.findAll({ include: [db.User, db.Prompt] });
    }
};

module.exports = {
  getCommentById,
  getAllComments
};
