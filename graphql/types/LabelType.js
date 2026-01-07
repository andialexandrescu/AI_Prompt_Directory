const { GraphQLObjectType, GraphQLInt, GraphQLString, GraphQLEnumType } = require('graphql');

const LabelStatusEnum = new GraphQLEnumType({
  name: 'LabelStatus',
  values: {
    approved: { value: 'approved' },
    pending: { value: 'pending' },
    rejected: { value: 'rejected' },
  },
});

const LabelType = new GraphQLObjectType({
  name: 'Label',
  fields: {
    id: { type: GraphQLInt },
    name: { type: GraphQLString },
    status: { type: LabelStatusEnum },
  },
});

module.exports = LabelType;