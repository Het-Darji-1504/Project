const mongoose = require('mongoose');

const agreementClauseSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  clauseTitle: { type: String, required: true },
  highlightValue: { type: String, required: true },
  standardLegal: { type: String, required: true },
  plainEnglish: { type: String, required: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('AgreementClause', agreementClauseSchema);
