const { GraphQLNonNull } = require('graphql');
const PromptType = require('../types/PromptType');
const PromptInputType = require('../inputTypes/PromptInputType');
const db = require('../../models');
const { createPendingLabel } = require('../helpers/labelHelpers');

const createPromptMutation = {
    type: PromptType,
    args: {
        input: { type: new GraphQLNonNull(PromptInputType) },
    },
    resolve: async (_, { input }, context) => {
        if (!context.user) {
            throw new Error('Unauthorized');
        }

        const { topic, content, notes, existingLabelIds = [], newLabelNames = [] } = input;
        const createdByUserId = context.user.id;

        const t = await db.sequelize.transaction();
        try {
            let promptState = 'posted'; // The state is set after the label logic
            const allLabels = [];

            if (existingLabelIds && existingLabelIds.length) { // Fetch existing approved labels by Id
                const existing = await db.Label.findAll({
                where: {
                    id: existingLabelIds,
                    status: 'approved' // Only allow attaching approved labels
                },
                transaction: t
                });
                allLabels.push(...existing);
            }

            // Create new labels as pending only (approval is handled by validateLabelMutation)
            if (newLabelNames && newLabelNames.length) {
                // Deduplicate
                const names = [...new Set(newLabelNames.map(n => (n || '').trim()).filter(Boolean))];
                if (names.length) {
                    // Use the helper to create or find each label
                    const labelPromises = names.map(name => createPendingLabel(name, { transaction: t }));
                    const createdOrFoundLabels = await Promise.all(labelPromises);
                    allLabels.push(...createdOrFoundLabels);
                }
            }

            // Set state to pending_approval only if any attached label is pending
            if (allLabels.length) {
                const hasPending = allLabels.some(l => l.status === 'pending');
                promptState = hasPending ? 'pending_approval' : 'posted';
            }
            const prompt = await db.Prompt.create({ topic, content, notes, createdByUserId, state: promptState }, { transaction: t });

            if (allLabels.length) {
                await db.PromptLabel.bulkCreate( // Create join rows for all labels
                    allLabels.map(label => ({ promptId: prompt.id, labelId: label.id })),
                    { transaction: t }
                );
            }

            await t.commit();
            return prompt;
        } catch (e) {
            await t.rollback();
            throw e;
        }
  },
};

module.exports = createPromptMutation;
