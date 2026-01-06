const { GraphQLObjectType, GraphQLInt, GraphQLString } = require('graphql');

const LoggedInUserType = new GraphQLObjectType({
    name: "LoggedInUser",
    fields: {
        id: {
            type: GraphQLString,
        },
        token: {
            type: GraphQLString,
        }
    }
});

module.exports = LoggedInUserType;