const express = require('express');
const {
    processPayment,
    paytmResponse,
    getPaymentStatus,
    createYoupiSession,
    getYoupiPaymentStatus,
    submitYoupiUtr,
    youpiWebhook,
    getUpiSettings,
    updateUpiSettings
} = require('../controllers/paymentController');
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');

const router = express.Router();

router.route('/payment/process').post(processPayment);
// router.route('/stripeapikey').get(isAuthenticatedUser, sendStripeApiKey);

router.route('/callback').post(paytmResponse);

router.route('/payment/status/:id').get(isAuthenticatedUser, getPaymentStatus);

// Dynamic UPI Payment Settings
router.route('/payment/upi-settings')
    .get(getUpiSettings)
    .post(isAuthenticatedUser, authorizeRoles("admin", "superadmin"), updateUpiSettings)
    .put(isAuthenticatedUser, authorizeRoles("admin", "superadmin"), updateUpiSettings);

router.route('/admin/payment/upi-settings')
    .get(getUpiSettings)
    .post(isAuthenticatedUser, authorizeRoles("admin", "superadmin"), updateUpiSettings)
    .put(isAuthenticatedUser, authorizeRoles("admin", "superadmin"), updateUpiSettings);

// YouPI PG Routes
router.route('/payment/youpi/create').post(createYoupiSession);
router.route('/payment/youpi/status/:id').get(getYoupiPaymentStatus);
router.route('/payment/youpi/utr/:id').post(submitYoupiUtr);
router.route('/payment/youpi/webhook').post(youpiWebhook);

module.exports = router;
