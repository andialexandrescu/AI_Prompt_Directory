const { GraphQLNonNull } = require('graphql');
const CommentType = require('../types/CommentType');
const CommentInputType = require('../inputTypes/CommentInputType');
const db = require('../../models');

const createCommentMutation = {
    type: CommentType,
    args: {
        input: { type: new GraphQLNonNull(CommentInputType) },
    },
    resolve: async (_, { input }, context) => {
        if (!context.user) {
            throw new Error('Unauthorized');
        }
        const { content, promptId } = input;
        const userId = context.user.id;
        const comment = await db.Comment.create({
            content,
            promptId,
            userId,
        });
        return comment;
    },
};

module.exports = createCommentMutation;
