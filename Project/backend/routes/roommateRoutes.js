const express = require('express');
const router = express.Router();
const roommateController = require('../controllers/roommateController');

router.get('/', roommateController.getRoommates);
router.get('/:id', roommateController.getRoommateById);
router.post('/swipe', roommateController.swipeAction);

module.exports = router;
