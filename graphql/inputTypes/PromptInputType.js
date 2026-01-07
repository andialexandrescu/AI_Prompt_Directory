const { GraphQLInputObjectType, GraphQLString, GraphQLList, GraphQLInt } = require('graphql');

const PromptInputType = new GraphQLInputObjectType({
  name: 'PromptInputType',
  fields: {
    topic: {
        type: GraphQLString
    },
    content: {
        type: GraphQLString
    },
    notes: {
        type: GraphQLString
    },
    // Discarded initial approach: taking label names and finding/ creating them, but it doesn't distinguish between existing approved label Ids and proposing new label names
    existingLabelIds: {
        type: new GraphQLList(GraphQLInt)
    }, // Ids of approved labels to attach to this prompt
    newLabelNames: {
        type: new GraphQLList(GraphQLString)
    }, // New label names that will be created as 'pending' and require admin approval
    
    // State is intentionally left out of PromptInput so clients can’t force a status
    // Additionally the authenticated user is injected in the mutation for creating a prompt
},
});

module.exports = PromptInputType;