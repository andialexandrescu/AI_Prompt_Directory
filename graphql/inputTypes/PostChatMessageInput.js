const { GraphQLInputObjectType, GraphQLInt, GraphQLString } = require('graphql');

module.exports = new GraphQLInputObjectType({
  name: 'PostChatMessageInput',
  fields: {
    chatRoomId: { type: GraphQLInt },
    content: { type: GraphQLString },
  },
});
