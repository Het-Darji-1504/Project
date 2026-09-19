const express = require('express');
const router = express.Router();
const valuationController = require('../controllers/valuationController');

router.post('/calculate', valuationController.calculateValuation);

module.exports = router;
