const express = require('express');
const router = express.Router();
const botController = require('../controllers/maintenanceBotController');

router.post('/chat', botController.sendMessage);
router.post('/relay-bot', botController.sendMessage);
router.get('/history', botController.getChatHistory);
router.post('/escalate', botController.escalateTicket);

module.exports = router;

