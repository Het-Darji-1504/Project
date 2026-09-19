const express = require('express');
const router = express.Router();
const neighborhoodController = require('../controllers/neighborhoodController');

router.get('/:propertyId', neighborhoodController.getReviews);
router.post('/', neighborhoodController.addReview);

module.exports = router;
