const express = require('express');
const router = express.Router();
const verificationController = require('../controllers/verificationController');

router.get('/:propertyId', verificationController.getVerificationStatus);
router.post('/upload-ocr', verificationController.uploadAndVerify);

module.exports = router;
