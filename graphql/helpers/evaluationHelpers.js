const db = require('../../models');

async function updateEvaluationHighlightStatus(evaluationId, user, targetStatus) {
    if (!user || user.role !== 'admin') {
        throw new Error('Unauthorized: Only admins can update evaluation highlight status');
    }

    const validStatuses = ['highlighted_by_admin', 'not_highlighted'];
    if (!validStatuses.includes(targetStatus)) {
        throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    const evaluation = await db.Evaluation.findByPk(evaluationId);
    if (!evaluation) {
        throw new Error('Evaluation not found');
    }

    if (evaluation.status === targetStatus) {
        const action = targetStatus === 'highlighted_by_admin' ? 'highlighted' : 'not highlighted';
        throw new Error(`Evaluation is already ${action}`);
    }

    evaluation.status = targetStatus;
    await evaluation.save();

    return evaluation;
}

module.exports = { 
    updateEvaluationHighlightStatus
};
