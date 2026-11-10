const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
    admin: {
        id: { type: String, default: 'admin' },
        name: { type: String, default: 'Administrator' },
        email: { type: String, default: 'admin@flipkart.com' },
        role: { type: String, default: 'admin' }
    },
    action: {
        type: String,
        required: true
    },
    entityType: {
        type: String,
        enum: ['product', 'banner', 'order', 'content', 'coupon', 'upi', 'user', 'system'],
        required: true
    },
    entityId: {
        type: String,
        default: ''
    },
    details: {
        type: String,
        required: true
    },
    ipAddress: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('ActivityLog', activityLogSchema);

