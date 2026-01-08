const { GraphQLNonNull, GraphQLString } = require('graphql');
const LabelType = require('../types/LabelType');
const { createPendingLabel } = require('../helpers/labelHelpers');

// This mutation only takes a single argument and not a complex object, therefore i chose not to use an input type for label
const createLabelMutation = {
  type: LabelType,
  args: {
    name: { type: new GraphQLNonNull(GraphQLString) },
  },
  resolve: async (_, { name }, context) => {
    return createPendingLabel(name);
  },
};

module.exports = createLabelMutation;