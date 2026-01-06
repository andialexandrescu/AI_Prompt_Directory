const { GraphQLSchema, GraphQLObjectType, GraphQLString } = require('graphql');
const loginMutation = require("../mutations/loginMutation"); // din moment ce am ca si field login, el provine din module.exports din loginMutation.js

const MutationType = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        login: loginMutation,
    },
});

module.exports = MutationType;