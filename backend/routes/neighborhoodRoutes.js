const express = require('express');
const router = express.Router();
const neighborhoodController = require('../controllers/neighborhoodController');

router.get('/:locality', neighborhoodController.getNeighborhoodMetrics);

module.exports = router;
