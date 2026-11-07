const express = require('express');
const {
    processPayment,
    paytmResponse,
    getPaymentStatus,
    createYoupiSession,
    getYoupiPaymentStatus,
    submitYoupiUtr,
    youpiWebhook
} = require('../controllers/paymentController');
const { isAuthenticatedUser } = require('../middlewares/auth');

const router = express.Router();

router.route('/payment/process').post(processPayment);
// router.route('/stripeapikey').get(isAuthenticatedUser, sendStripeApiKey);

router.route('/callback').post(paytmResponse);

router.route('/payment/status/:id').get(isAuthenticatedUser, getPaymentStatus);

// YouPI PG Routes
router.route('/payment/youpi/create').post(createYoupiSession);
router.route('/payment/youpi/status/:id').get(getYoupiPaymentStatus);
router.route('/payment/youpi/utr/:id').post(submitYoupiUtr);
router.route('/payment/youpi/webhook').post(youpiWebhook);

module.exports = router;
