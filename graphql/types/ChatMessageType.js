const {
  GraphQLObjectType,
  GraphQLInt,
  GraphQLString,
} = require('graphql');

const UserType = require('./UserType');

module.exports = new GraphQLObjectType({
  name: 'ChatMessage',
  fields: () => ({
    id: { type: GraphQLInt },
    content: { type: GraphQLString },
    expiresAt: { type: GraphQLString },
    user: {
      type: UserType,
      resolve: (msg, _, { db }) =>
        db.User.findByPk(msg.userId),
    },
  }),
});
