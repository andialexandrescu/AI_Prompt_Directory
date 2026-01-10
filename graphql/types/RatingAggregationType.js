const { GraphQLObjectType, GraphQLInt, GraphQLFloat, GraphQLList } = require('graphql');

// there's no need to add these entities in models folder since they only represent some statistics
// just like emag, a llm model/ llm provider (emag distributor) has a distribution of ratings
const RatingDistributionType = new GraphQLObjectType({
    name: 'RatingDistribution',
    fields: () => ({
        rating: { type: GraphQLInt },
        count: { type: GraphQLInt },
    }),
});

const RatingAggregationType = new GraphQLObjectType({
    name: 'RatingAggregation',
    fields: () => ({
        totalEvaluations: { type: GraphQLInt },
        averageRating: { type: GraphQLFloat },
        minRating: { type: GraphQLInt }, // worst rating
        maxRating: { type: GraphQLInt }, // best rating
        distribution: { type: new GraphQLList(RatingDistributionType) }, // list of tuple of evaluator's rating and the number of evaluators giving the current rating
    }),
});

module.exports = RatingAggregationType;
