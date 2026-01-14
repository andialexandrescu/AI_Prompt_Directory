const { GraphQLInputObjectType, GraphQLInt } = require('graphql');

module.exports = new GraphQLInputObjectType({
  name: 'DeleteChatMessageInput',
  fields: {
    messageId: { type: GraphQLInt },
  },
});
