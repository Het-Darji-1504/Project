const express = require('express');
const router = express.Router();
const roommateController = require('../controllers/roommateController');

router.get('/preferences', roommateController.getPreferences);
router.post('/preferences', roommateController.savePreferences);
router.get('/', roommateController.getRoommates);
router.get('/:id', roommateController.getRoommateById);
router.post('/swipe', roommateController.swipeAction);

module.exports = router;

