const { GraphQLInputObjectType, GraphQLNonNull, GraphQLString } = require('graphql');

const CommentInputType = new GraphQLInputObjectType({
  name: 'CommentInputType',
  fields: {
    content: { type: new GraphQLNonNull(GraphQLString) },
    promptId: { type: new GraphQLNonNull(GraphQLString) },
    // Input types do not need to contain nested types, since they are for sending data to mutations
    // Only output types return nested objects
    // userId will be taken from context, not input
  },
});

module.exports = CommentInputType; 