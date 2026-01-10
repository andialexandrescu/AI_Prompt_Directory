const { GraphQLNonNull, GraphQLString, GraphQLBoolean } = require('graphql');
const EvaluationType = require('../types/EvaluationType');
const { updateEvaluationHighlightStatus } = require('../helpers/evaluationHelpers');

const updateEvaluationHighlightMutation = {
    type: EvaluationType,
    args: {
        id: { type: new GraphQLNonNull(GraphQLString) }, // uuid of evaluation
        highlight: { type: new GraphQLNonNull(GraphQLBoolean) }, // true to highlight, false to unhighlight
    },
    resolve: async (_, { id, highlight }, context) => {
        const targetStatus = highlight ? 'highlighted_by_admin' : 'not_highlighted';
        return await updateEvaluationHighlightStatus(id, context.user, targetStatus);
    },
};

module.exports = updateEvaluationHighlightMutation;
