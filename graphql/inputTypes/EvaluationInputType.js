const { GraphQLInputObjectType, GraphQLString, GraphQLInt, GraphQLNonNull } = require('graphql');

const EvaluationInputType = new GraphQLInputObjectType({
    name: 'EvaluationInputType',
    fields: {
    promptId: {
        type: new GraphQLNonNull(GraphQLString),
    },
    llmModelId: {
        type: new GraphQLNonNull(GraphQLInt),
    },
    rating: {
        type: new GraphQLNonNull(GraphQLInt),
    },
    content: {
        type: GraphQLString,
    }
    // status is intentionally left out so users can't set their own evaluations as highlighted
    // only admins can highlight evaluations through a separate mutation
    // there will not be input types for llm model and llm provider since we have preseeded data
    },
});

module.exports = EvaluationInputType;
