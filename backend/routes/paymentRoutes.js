const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

router.get('/', paymentController.getPayments);
router.post('/create-checkout-session', paymentController.createCheckoutSession);
router.post('/pay', paymentController.executePayment);
router.post('/accommodation-checkout', paymentController.accommodationCheckout);

module.exports = router;
