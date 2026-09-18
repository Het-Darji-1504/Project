const express = require('express');
const router = express.Router();
const agreementController = require('../controllers/agreementController');

router.get('/clauses', agreementController.getClauses);
router.post('/sign', agreementController.signAgreement);
router.post('/clarification', agreementController.requestClarification);

module.exports = router;
