const { GraphQLSchema, GraphQLObjectType, GraphQLString } = require('graphql');
const loginMutation = require("../mutations/loginMutation");
const createPromptMutation = require("../mutations/createPromptMutation");
const createLabelMutation = require("../mutations/createLabelMutation");
const validateLabelMutation = require("../mutations/validateLabelMutation");

const MutationType = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        login: loginMutation,
        createPrompt: createPromptMutation,
        createLabel: createLabelMutation,
        validateLabel: validateLabelMutation,
    },
});

module.exports = MutationType;