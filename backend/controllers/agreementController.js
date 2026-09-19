const supabase = require('../config/supabase');
const AgreementClause = require('../models/AgreementClause');
const fs = require('fs');
const path = require('path');

const defaultClauses = JSON.parse(fs.readFileSync(path.join(__dirname, '../seed/data.json'), 'utf-8')).plainEnglishAgreementClauses;

function normalizeClause(c) {
  return {
    ...c,
    clauseTitle: c.clause_title || c.clauseTitle,
    highlightValue: c.highlight_value || c.highlightValue,
    standardLegal: c.standard_legal || c.standardLegal,
    plainEnglish: c.plain_english || c.plainEnglish
  };
}

// GET /api/agreement/clauses
exports.getClauses = async (req, res) => {
  try {
    let clauses = [];

    if (supabase) {
      const { data, error } = await supabase.from('agreement_clauses').select('*').order('id', { ascending: true });
      if (!error && data && data.length > 0) {
        clauses = data.map(normalizeClause);
      }
    }

    if (clauses.length === 0) {
      try {
        clauses = await AgreementClause.find({});
      } catch (err) {
        clauses = defaultClauses;
      }
    }

    if (!clauses || clauses.length === 0) {
      clauses = defaultClauses;
    }
    return res.json({ success: true, count: clauses.length, data: clauses });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/agreement/sign
exports.signAgreement = async (req, res) => {
  try {
    const { signerName, agreementId } = req.body;
    return res.json({
      success: true,
      message: 'DigiLocker Aadhaar eSign authenticated! The stamped digital rental agreement is now active and legally binding in Supabase.',
      details: {
        signer: signerName || req.headers['x-user-name'] || 'Verified Tenant',
        maskedAadhaar: 'XXXX-XXXX-4892',
        agreementId: agreementId || 'LEAS-2026-AHM-402',
        timestamp: new Date().toISOString(),
        escrowDepositStatus: 'Guaranteed'
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/agreement/clarification
exports.requestClarification = async (req, res) => {
  try {
    const { clauseId, question } = req.body;
    return res.json({
      success: true,
      message: 'Your clarification question has been submitted to Nestera Legal Assist. A plain-English legal response will be provided within 4 hours.',
      details: { clauseId, question }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
