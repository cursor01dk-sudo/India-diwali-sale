const mongoose = require('mongoose');

const upiConfigSchema = new mongoose.Schema({
    upiId: {
        type: String,
        required: [true, 'Please provide a valid UPI ID / VPA'],
        trim: true,
        default: 'nexmartpay@icici'
    },
    payeeName: {
        type: String,
        required: [true, 'Please provide Merchant / Payee Name'],
        trim: true,
        default: 'Ranga Store'
    },
    isEnabled: {
        type: Boolean,
        default: true
    },
    qrNote: {
        type: String,
        trim: true,
        default: 'Order Product'
    },
    instructions: {
        type: String,
        trim: true,
        default: 'Scan this QR code using any UPI app (GPay, PhonePe, Paytm, BHIM) to complete your payment.'
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    updatedBy: {
        type: String,
        default: 'admin'
    }
});

module.exports = mongoose.model('UpiConfig', upiConfigSchema);
