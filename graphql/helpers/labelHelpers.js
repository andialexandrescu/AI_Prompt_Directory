const db = require('../../models');

// Creates a label with the given name if it does not exist and always sets the status to pending

async function createPendingLabel(name, options = {}) {
  const labelName = name.trim();
  if (!labelName) {
    throw new Error('Label name required');
  }
  let label = await db.Label.findOne({ where: { name: labelName }, ...options });
  if (label) {
    return label;
  }
  label = await db.Label.create({ name: labelName, status: 'pending' }, options);
  return label;
}

module.exports = { createPendingLabel };