const { GraphQLSchema, GraphQLObjectType, GraphQLString } = require('graphql');
const loginMutation = require("../mutations/loginMutation");
const createPromptMutation = require("../mutations/createPromptMutation");
const createLabelMutation = require("../mutations/createLabelMutation");
const validateLabelMutation = require("../mutations/validateLabelMutation");
const createCommentMutation = require("../mutations/createCommentMutation");
const createEvaluationMutation = require("../mutations/createEvaluationMutation");
const updateEvaluationHighlightMutation = require("../mutations/updateEvaluationHighlightMutation");

const MutationType = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        login: loginMutation,
        createPrompt: createPromptMutation,
        createLabel: createLabelMutation,
        validateLabel: validateLabelMutation,
        createComment: createCommentMutation,
        createEvaluation: createEvaluationMutation,
        updateEvaluationHighlight: updateEvaluationHighlightMutation,
    },
});

module.exports = MutationType;