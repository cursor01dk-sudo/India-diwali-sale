const mongoose = require('mongoose');
const Coupon = require('../models/couponModel');
const asyncErrorHandler = require('../middlewares/asyncErrorHandler');
const ErrorHandler = require('../utils/errorHandler');
const { broadcastSync, EVENTS } = require('../sockets/socketServer');
const { recordActivity } = require('../utils/activityLogger');

let localCoupons = [
    {
        _id: 'c_diwali50',
        code: 'DIWALI50',
        description: 'Flat 50% discount on festive products',
        discountType: 'percentage',
        discountValue: 50,
        minOrderValue: 499,
        maxDiscountAmount: 2000,
        isActive: true,
        validTill: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
    {
        _id: 'c_flat200',
        code: 'FLAT200',
        description: 'Flat ₹200 off on orders above ₹999',
        discountType: 'flat',
        discountValue: 200,
        minOrderValue: 999,
        maxDiscountAmount: 200,
        isActive: true,
        validTill: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
];

// Get All Coupons --- ADMIN
exports.getAllCoupons = asyncErrorHandler(async (req, res, next) => {
    let coupons = [];
    if (mongoose.connection.readyState === 1) {
        try {
            coupons = await Coupon.find().sort({ createdAt: -1 });
        } catch (e) {
            coupons = [];
        }
    }

    if (!coupons || coupons.length === 0) {
        coupons = localCoupons;
    }

    res.status(200).json({
        success: true,
        coupons,
    });
});

// Create Coupon --- ADMIN
exports.createCoupon = asyncErrorHandler(async (req, res, next) => {
    let coupon = null;
    const { code, description, discountType, discountValue, minOrderValue, maxDiscountAmount, validTill } = req.body;

    if (!code || !discountValue) {
        return next(new ErrorHandler('Coupon code and discount value are required', 400));
    }

    const upperCode = code.trim().toUpperCase();

    if (mongoose.connection.readyState === 1) {
        try {
            coupon = await Coupon.create({
                code: upperCode,
                description,
                discountType: discountType || 'percentage',
                discountValue: Number(discountValue),
                minOrderValue: Number(minOrderValue) || 0,
                maxDiscountAmount: Number(maxDiscountAmount) || 1000,
                validTill: validTill ? new Date(validTill) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                isActive: true,
            });
        } catch (e) {
            coupon = null;
        }
    }

    if (!coupon) {
        coupon = {
            _id: `c_${Date.now()}`,
            code: upperCode,
            description,
            discountType: discountType || 'percentage',
            discountValue: Number(discountValue),
            minOrderValue: Number(minOrderValue) || 0,
            maxDiscountAmount: Number(maxDiscountAmount) || 1000,
            validTill: validTill ? new Date(validTill) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            isActive: true,
        };
        localCoupons.unshift(coupon);
    }

    broadcastSync(EVENTS.COUPON_UPDATED, { action: 'created', coupon });

    await recordActivity(req, {
        action: 'CREATE_COUPON',
        entityType: 'coupon',
        entityId: coupon._id,
        details: `Created new coupon code: ${coupon.code} (${coupon.discountValue}${coupon.discountType === 'percentage' ? '%' : '₹'} off)`,
    });

    res.status(201).json({
        success: true,
        message: 'Coupon created successfully',
        coupon,
    });
});

// Delete Coupon --- ADMIN
exports.deleteCoupon = asyncErrorHandler(async (req, res, next) => {
    try {
        const coupon = await Coupon.findById(req.params.id);
        if (coupon) {
            await coupon.remove();
        }
    } catch (e) {}

    localCoupons = localCoupons.filter((c) => String(c._id) !== String(req.params.id));

    broadcastSync(EVENTS.COUPON_UPDATED, { action: 'deleted', id: req.params.id });

    await recordActivity(req, {
        action: 'DELETE_COUPON',
        entityType: 'coupon',
        entityId: req.params.id,
        details: `Deleted coupon ID: ${req.params.id}`,
    });

    res.status(200).json({
        success: true,
        message: 'Coupon deleted successfully',
    });
});

// Validate Coupon --- PUBLIC / CHECKOUT
exports.validateCoupon = asyncErrorHandler(async (req, res, next) => {
    const { code, cartTotal } = req.body;
    if (!code) {
        return next(new ErrorHandler('Please enter coupon code', 400));
    }

    const upperCode = code.trim().toUpperCase();
    let coupon = null;

    try {
        coupon = await Coupon.findOne({ code: upperCode, isActive: true });
    } catch (e) {}

    if (!coupon) {
        coupon = localCoupons.find((c) => c.code === upperCode && c.isActive);
    }

    if (!coupon) {
        return next(new ErrorHandler('Invalid or expired coupon code', 400));
    }

    const orderAmount = Number(cartTotal) || 0;
    if (coupon.minOrderValue && orderAmount < coupon.minOrderValue) {
        return next(new ErrorHandler(`Minimum order value of ₹${coupon.minOrderValue} required for this coupon`, 400));
    }

    let discount = 0;
    if (coupon.discountType === 'percentage') {
        discount = Math.round((orderAmount * coupon.discountValue) / 100);
        if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
            discount = coupon.maxDiscountAmount;
        }
    } else {
        discount = Math.min(coupon.discountValue, orderAmount);
    }

    res.status(200).json({
        success: true,
        discount,
        coupon: {
            code: coupon.code,
            description: coupon.description,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
        },
    });
});
