const express = require('express');
const router = express.Router();
const ownerController = require('../controllers/ownerController');

router.get('/dashboard', ownerController.getOwnerDashboard);
router.post('/properties', ownerController.addOwnerProperty);
router.put('/properties/:id', ownerController.updateOwnerProperty);
router.patch('/properties/:id/status', ownerController.toggleListingStatus);

// Applications
router.get('/applications', ownerController.getOwnerApplications);
router.post('/applications/:id/action', ownerController.updateApplicationStatus);

// Maintenance
router.patch('/maintenance/:id/status', ownerController.updateMaintenanceStatus);

module.exports = router;
