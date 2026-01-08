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
    args: {
        offset: { type: GraphQLInt, defaultValue: 0 },
        limit: { type: GraphQLInt, defaultValue: 10 }
    },
    resolve: async (_, { offset, limit }) => {
        return db.Comment.findAll({ 
            offset,
            limit,
            include: [db.User, db.Prompt] 
        });
    }
};

module.exports = {
  getCommentById,
  getAllComments
};
