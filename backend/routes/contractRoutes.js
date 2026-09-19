const express = require('express');
const router = express.Router();
const contractController = require('../controllers/contractController');

router.get('/', contractController.getContracts);
router.post('/generate', contractController.generateContract);
router.post('/:id/sign', contractController.signContract);

module.exports = router;
