const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/propertyController');

router.get('/', propertyController.getProperties);
router.get('/:id', propertyController.getPropertyById);
router.post('/schedule-visit', propertyController.scheduleVisit);
router.post('/apply', propertyController.applyNow);
router.post('/contact-owner', propertyController.contactOwner);
router.patch('/:id/status', propertyController.updatePropertyStatus);
router.post('/verify-utility-ocr', propertyController.verifyUtilityOcr);

module.exports = router;

