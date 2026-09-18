const express = require('express');
const router = express.Router();
const ownerController = require('../controllers/ownerController');

router.get('/dashboard', ownerController.getOwnerDashboard);
router.post('/properties', ownerController.addOwnerProperty);

module.exports = router;
