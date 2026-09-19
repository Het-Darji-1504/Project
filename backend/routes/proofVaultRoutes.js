const express = require('express');
const router = express.Router();
const proofVaultController = require('../controllers/proofVaultController');

router.get('/', proofVaultController.getProofItems);
router.post('/items', proofVaultController.addProofItem);
router.patch('/:id/acknowledge', proofVaultController.acknowledgeItem);
router.post('/:id/dispute', proofVaultController.disputeItem);

module.exports = router;
