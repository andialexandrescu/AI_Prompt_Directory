const { GraphQLNonNull, GraphQLInt, GraphQLString } = require('graphql');
const LabelType = require('../types/LabelType');
const db = require('../../models');

const validateLabelMutation = {
  type: LabelType,
  args: {
    id: { type: new GraphQLNonNull(GraphQLInt) },
    status: { type: new GraphQLNonNull(GraphQLString) }, // 'approved' or 'rejected'
  },
  resolve: async (_, { id, status }, context) => {
    if (!context.user || context.user.role !== 'admin') {
      throw new Error('Unauthorized: Only admins can approve/reject labels');
    }
    if (!['approved', 'rejected'].includes(status)) {
      throw new Error('Status must be approved or rejected');
    }

    const label = await db.Label.findByPk(id);
    if (!label) {
      throw new Error('Label not found');
    }
    
    label.status = status;
    await label.save();

    // Find the promptLabel association for this label
    const promptLabel = await db.PromptLabel.findOne({ where: { labelId: label.id } });
    if (status === 'approved') {
      if (promptLabel) {
        const prompt = await db.Prompt.findByPk(promptLabel.promptId);
        if (prompt) {
          const labels = await db.Label.findAll({
            include: [{
              model: db.Prompt,
              where: { id: prompt.id },
              through: { attributes: [] }
            }]
          });
          if (labels.every(l => l.status === 'approved')) {
            prompt.state = 'posted';
            await prompt.save();
          }
        }
      }
    } else if (status === 'rejected') {  // Delete the associated prompt and its label association
      if (promptLabel) {
        await db.PromptLabel.destroy({ where: { id: promptLabel.id } });
        await db.Prompt.destroy({ where: { id: promptLabel.promptId } });
      }
    }
    return label;
  },
};

module.exports = validateLabelMutation;