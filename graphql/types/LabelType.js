const { GraphQLObjectType, GraphQLInt, GraphQLString, GraphQLEnumType, GraphQLList } = require('graphql');
const UserType = require('./UserType');

const LabelStatusEnum = new GraphQLEnumType({
    name: 'LabelStatus',
    values: {
        approved: { value: 'approved' },
        pending: { value: 'pending' },
        rejected: { value: 'rejected' },
    },
});

const LabelType = new GraphQLObjectType({
    name: 'Label',
    fields: () => {
        const PromptType = require('./PromptType');
        return {
            id: { type: GraphQLInt },
            name: { type: GraphQLString },
            status: { type: LabelStatusEnum },
            prompts: {
                type: new GraphQLList(PromptType),
                resolve: async (label) => {
                    if (label.Prompts) { // Eager-loading
                        return label.Prompts;
                    }
                    if (label.getPrompts) {
                        return await label.getPrompts();
                    }
                }
            }
        };
    },
});

module.exports = LabelType;