const mongoose = require('mongoose');
const asyncErrorHandler = require('../middlewares/asyncErrorHandler');
const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const ErrorHandler = require('../utils/errorHandler');
const sendEmail = require('../utils/sendEmail');
const { broadcastSync, notifyAdmin, EVENTS } = require('../sockets/socketServer');
const { recordActivity } = require('../utils/activityLogger');

// Create New Order
exports.newOrder = asyncErrorHandler(async (req, res, next) => {

    const {
        shippingInfo,
        orderItems,
        paymentInfo,
        totalPrice,
    } = req.body;

    let order = {
        _id: "order_" + Date.now(),
        shippingInfo,
        orderItems,
        paymentInfo,
        totalPrice,
        paidAt: Date.now(),
        user: req.user ? req.user._id : null,
        orderStatus: "Processing",
        createdAt: new Date().toISOString()
    };

    if (mongoose.connection.readyState === 1) {
        try {
            const orderExist = await Order.findOne({ paymentInfo });
            if (orderExist) {
                return next(new ErrorHandler("Order Already Placed", 400));
            }
            order = await Order.create(order);
        } catch (e) { }
    }

    if (req.user && req.user.email) {
        try {
            await sendEmail({
                email: req.user.email,
                templateId: process.env.SENDGRID_ORDER_TEMPLATEID,
                data: {
                    name: req.user.name,
                    shippingInfo,
                    orderItems,
                    totalPrice,
                    oid: order._id,
                }
            });
        } catch (err) {
            // Email sending failure shouldn't fail order
        }
    }

    // Real-time notification to admin dashboard
    notifyAdmin(EVENTS.ORDER_CREATED, order);

    res.status(201).json({
        success: true,
        order,
    });
});

// Get Single Order Details
exports.getSingleOrderDetails = asyncErrorHandler(async (req, res, next) => {
    let order = null;
    if (mongoose.connection.readyState === 1) {
        try {
            order = await Order.findById(req.params.id).populate("user", "name email");
        } catch (e) { }
    }

    if (!order) {
        order = {
            _id: req.params.id,
            orderStatus: "Processing",
            totalPrice: 0,
            orderItems: [],
            shippingInfo: { address: "Customer Shipping Address", city: "New Delhi", state: "Delhi", pincode: 110001 }
        };
    }

    res.status(200).json({
        success: true,
        order,
    });
});

// Get Logged In User Orders
exports.myOrders = asyncErrorHandler(async (req, res, next) => {
    let orders = [];
    if (mongoose.connection.readyState === 1) {
        try {
            orders = await Order.find({ user: req.user._id });
        } catch (e) { }
    }

    res.status(200).json({
        success: true,
        orders: orders || [],
    });
});


// Get All Orders ---ADMIN
exports.getAllOrders = asyncErrorHandler(async (req, res, next) => {
    let orders = [];
    if (mongoose.connection.readyState === 1) {
        try {
            orders = await Order.find();
        } catch (e) { }
    }

    let totalAmount = 0;
    (orders || []).forEach((order) => {
        totalAmount += (order.totalPrice || 0);
    });

    res.status(200).json({
        success: true,
        orders: orders || [],
        totalAmount,
    });
});

// Update Order Status ---ADMIN
exports.updateOrder = asyncErrorHandler(async (req, res, next) => {

    const order = await Order.findById(req.params.id);

    if (!order) {
        return next(new ErrorHandler("Order Not Found", 404));
    }

    if (order.orderStatus === "Delivered") {
        return next(new ErrorHandler("Already Delivered", 400));
    }

    if (req.body.status === "Shipped") {
        order.shippedAt = Date.now();
        order.orderItems.forEach(async (i) => {
            await updateStock(i.product, i.quantity)
        });
    }

    order.orderStatus = req.body.status;
    if (req.body.status === "Delivered") {
        order.deliveredAt = Date.now();
    }

    await order.save({ validateBeforeSave: false });

    // Real-time synchronization event & audit log
    broadcastSync(EVENTS.ORDER_STATUS_UPDATED, { id: order._id, status: order.orderStatus });
    await recordActivity(req, {
        action: 'UPDATE_ORDER_STATUS',
        entityType: 'order',
        entityId: order._id,
        details: `Updated order status for ${order._id} to "${order.orderStatus}"`,
    });

    res.status(200).json({
        success: true
    });
});

async function updateStock(id, quantity) {
    if (!id) return;
    try {
        const product = await Product.findById(id);
        if (!product) return;
        product.stock -= quantity;
        await product.save({ validateBeforeSave: false });
    } catch (e) {
        // Safe fallback if product is custom or mock
    }
}

// Delete Order ---ADMIN
exports.deleteOrder = asyncErrorHandler(async (req, res, next) => {

    const order = await Order.findById(req.params.id);

    if (!order) {
        return next(new ErrorHandler("Order Not Found", 404));
    }

    await order.remove();

    res.status(200).json({
        success: true,
    });
});