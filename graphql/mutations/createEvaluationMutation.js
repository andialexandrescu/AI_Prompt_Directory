const { GraphQLNonNull } = require('graphql');
const EvaluationType = require('../types/EvaluationType');
const EvaluationInputType = require('../inputTypes/EvaluationInputType');
const db = require('../../models');

const createEvaluationMutation = {
    type: EvaluationType,
    args: {
        input: { type: new GraphQLNonNull(EvaluationInputType) },
    },
    resolve: async (_, { input }, context) => {
        if (!context.user) {
            throw new Error('Unauthorized');
        }

        const { promptId, llmModelId, rating, content } = input;
        const userId = context.user.id;

        const prompt = await db.Prompt.findByPk(promptId);
        
        if (!prompt) {
            throw new Error('Prompt not found');
        }

        const llmModel = await db.LLMModel.findByPk(llmModelId);
        
        if (!llmModel) {
            throw new Error('LLM Model not found');
        }

        if (prompt.state !== 'posted') { // validate that the prompt exists and is in posted state
            throw new Error('Cannot evaluate a prompt that is not posted');
        }

        // the afterCreate hook will automatically update averageRating for model and provider
        const evaluation = await db.Evaluation.create({
            promptId,
            userId,
            llmModelId,
            rating,
            content,
            // status: 'not_highlighted' is set by default in model
        });

        return evaluation;
    },
};

module.exports = createEvaluationMutation;
