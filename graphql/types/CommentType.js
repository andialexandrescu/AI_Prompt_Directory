const { GraphQLObjectType, GraphQLInt, GraphQLString } = require('graphql');
const UserType = require('./UserType');

const CommentType = new GraphQLObjectType({
    name: 'Comment',
    fields: () => {
        const PromptType = require('./PromptType'); // Must be inside because of the circular import between CommentType and PromptType
        return {
            id: { type: GraphQLInt },
            content: { type: GraphQLString },
            user: {
                type: UserType,
                resolve: async (comment) => {
                    const user = await comment.getUser();
                    return user;
                }
            },
            prompt: {
                type: PromptType,
                resolve: async (comment) => {
                    const prompt = await comment.getPrompt();
                    return prompt;
                }
            },
            createdAt: { type: GraphQLString },
            updatedAt: { type: GraphQLString },
        };
    },
});

module.exports = CommentType;
