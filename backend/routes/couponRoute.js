const express = require('express');
const {
    getAllCoupons,
    createCoupon,
    deleteCoupon,
    validateCoupon,
} = require('../controllers/couponController');
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');

const router = express.Router();

router.route('/coupon/validate').post(validateCoupon);
router.route('/admin/coupons').get(isAuthenticatedUser, authorizeRoles('admin', 'superadmin', 'staff'), getAllCoupons);
router.route('/admin/coupon/new').post(isAuthenticatedUser, authorizeRoles('admin', 'superadmin'), createCoupon);
router.route('/admin/coupon/:id').delete(isAuthenticatedUser, authorizeRoles('admin', 'superadmin'), deleteCoupon);

module.exports = router;

