const fs = require('fs');
const path = require('path');
const asyncErrorHandler = require('../middlewares/asyncErrorHandler');
// const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const paytm = require('paytmchecksum');
const https = require('https');
const Payment = require('../models/paymentModel');
const ErrorHandler = require('../utils/errorHandler');
const { v4: uuidv4 } = require('uuid');
const { broadcastSync, EVENTS } = require('../sockets/socketServer');
const { recordActivity } = require('../utils/activityLogger');
const UpiConfig = require('../models/upiConfigModel');
const mongoose = require('mongoose');

const paymentConfigFile = path.join(__dirname, '../data/paymentConfig.json');

let inMemoryPaymentConfig = {
    upiId: process.env.MERCHANT_UPI_ID || 'nexmartpay@icici',
    payeeName: process.env.MERCHANT_PAYEE_NAME || 'Ranga Store',
    isEnabled: true,
    qrNote: 'Order Product',
    instructions: 'Scan this QR code using any UPI app (GPay, PhonePe, Paytm, BHIM) to complete your payment.',
    updatedAt: new Date().toISOString()
};

function getPaymentConfig() {
    try {
        const bundledConfig = require('../data/paymentConfig.json');
        if (bundledConfig && bundledConfig.upiId) {
            inMemoryPaymentConfig = { ...inMemoryPaymentConfig, ...bundledConfig };
        }
    } catch (e) {}
    try {
        if (fs.existsSync(paymentConfigFile)) {
            const data = JSON.parse(fs.readFileSync(paymentConfigFile, 'utf8'));
            if (data && data.upiId) {
                inMemoryPaymentConfig = { ...inMemoryPaymentConfig, ...data };
            }
        }
    } catch (e) {}
    return inMemoryPaymentConfig;
}

// Fetch authoritative UPI configuration from MongoDB Atlas with memory/file fallback
async function fetchAuthoritativeUpiConfig() {
    if (mongoose.connection.readyState === 1) {
        try {
            let doc = await UpiConfig.findOne();
            if (!doc) {
                doc = await UpiConfig.create({
                    upiId: inMemoryPaymentConfig.upiId,
                    payeeName: inMemoryPaymentConfig.payeeName,
                    isEnabled: inMemoryPaymentConfig.isEnabled !== false,
                    qrNote: inMemoryPaymentConfig.qrNote,
                    instructions: inMemoryPaymentConfig.instructions
                });
            }
            if (doc) {
                inMemoryPaymentConfig = {
                    upiId: doc.upiId,
                    payeeName: doc.payeeName,
                    isEnabled: doc.isEnabled !== false,
                    qrNote: doc.qrNote || 'Order Product',
                    instructions: doc.instructions || 'Scan this QR code using any UPI app (GPay, PhonePe, Paytm, BHIM) to complete your payment.',
                    updatedAt: doc.updatedAt ? doc.updatedAt.toISOString() : new Date().toISOString()
                };
                return inMemoryPaymentConfig;
            }
        } catch (err) {
            console.warn('[UpiConfig]: MongoDB fetch warning, using cache/file:', err.message);
        }
    }
    return getPaymentConfig();
}

// Helper to generate a valid NPCI UPI payment intent URI
function buildUpiPaymentUri(upiId, payeeName, amount, orderRef, qrNote) {
    const cleanAmount = Number(amount || 1).toFixed(2);
    const note = `${qrNote || 'Order Product'} ${orderRef ? `FK${orderRef}` : ''}`.trim();
    return `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${cleanAmount}&cu=INR&tn=${encodeURIComponent(note)}`;
}

// exports.processPayment = asyncErrorHandler(async (req, res, next) => {
//     const myPayment = await stripe.paymentIntents.create({
//         amount: req.body.amount,
//         currency: "inr",
//         metadata: {
//             company: "Flipkart",
//         },
//     });

//     res.status(200).json({
//         success: true,
//         client_secret: myPayment.client_secret, 
//     });
// });

// exports.sendStripeApiKey = asyncErrorHandler(async (req, res, next) => {
//     res.status(200).json({ stripeApiKey: process.env.STRIPE_API_KEY });
// });

// Process Payment
exports.processPayment = asyncErrorHandler(async (req, res, next) => {

    const { amount, email, phoneNo } = req.body;

    var params = {};

    /* initialize an array */
    params["MID"] = process.env.PAYTM_MID;
    params["WEBSITE"] = process.env.PAYTM_WEBSITE;
    params["CHANNEL_ID"] = process.env.PAYTM_CHANNEL_ID;
    params["INDUSTRY_TYPE_ID"] = process.env.PAYTM_INDUSTRY_TYPE;
    params["ORDER_ID"] = "oid" + uuidv4();
    params["CUST_ID"] = process.env.PAYTM_CUST_ID;
    params["TXN_AMOUNT"] = JSON.stringify(amount);
    // params["CALLBACK_URL"] = `${req.protocol}://${req.get("host")}/api/v1/callback`;
    params["CALLBACK_URL"] = `https://${req.get("host")}/api/v1/callback`;
    params["EMAIL"] = email;
    params["MOBILE_NO"] = phoneNo;

    let paytmChecksum = paytm.generateSignature(params, process.env.PAYTM_MERCHANT_KEY);
    paytmChecksum.then(function (checksum) {

        let paytmParams = {
            ...params,
            "CHECKSUMHASH": checksum,
        };

        res.status(200).json({
            paytmParams
        });

    }).catch(function (error) {
        console.log(error);
    });
});

// Paytm Callback
exports.paytmResponse = (req, res, next) => {

    // console.log(req.body);

    let paytmChecksum = req.body.CHECKSUMHASH;
    delete req.body.CHECKSUMHASH;

    let isVerifySignature = paytm.verifySignature(req.body, process.env.PAYTM_MERCHANT_KEY, paytmChecksum);
    if (isVerifySignature) {
        // console.log("Checksum Matched");

        var paytmParams = {};

        paytmParams.body = {
            "mid": req.body.MID,
            "orderId": req.body.ORDERID,
        };

        paytm.generateSignature(JSON.stringify(paytmParams.body), process.env.PAYTM_MERCHANT_KEY).then(function (checksum) {

            paytmParams.head = {
                "signature": checksum
            };

            /* prepare JSON string for request */
            var post_data = JSON.stringify(paytmParams);

            var options = {
                /* for Staging */
                hostname: 'securegw-stage.paytm.in',
                /* for Production */
                // hostname: 'securegw.paytm.in',
                port: 443,
                path: '/v3/order/status',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': post_data.length
                }
            };

            // Set up the request
            var response = "";
            var post_req = https.request(options, function (post_res) {
                post_res.on('data', function (chunk) {
                    response += chunk;
                });

                post_res.on('end', function () {
                    let { body } = JSON.parse(response);
                    // let status = body.resultInfo.resultStatus;
                    // res.json(body);
                    addPayment(body);
                    // res.redirect(`${req.protocol}://${req.get("host")}/order/${body.orderId}`)
                    res.redirect(`https://${req.get("host")}/order/${body.orderId}`)
                });
            });

            // post the data
            post_req.write(post_data);
            post_req.end();
        });

    } else {
        console.log("Checksum Mismatched");
    }
}

const addPayment = async (data) => {
    try {
        await Payment.create(data);
    } catch (error) {
        console.log("Payment Failed!");
    }
}

exports.getPaymentStatus = asyncErrorHandler(async (req, res, next) => {

    const payment = await Payment.findOne({ orderId: req.params.id });

    if (!payment) {
        return next(new ErrorHandler("Payment Details Not Found", 404));
    }

    const txn = {
        id: payment.txnId,
        status: payment.resultInfo.resultStatus,
    }

    res.status(200).json({
        success: true,
        txn,
    });
});

// ==========================================
// YOUPI PG V2 INTEGRATION CONTROLLERS
// ==========================================

// Create a YouPI Payment Session
exports.createYoupiSession = asyncErrorHandler(async (req, res, next) => {
    const { amount, orderId, email, phoneNo, customerName } = req.body;

    const host = req.get('host') || 'localhost:3000';
    const protocol = req.headers['x-forwarded-proto'] || req.protocol || (process.env.VERCEL ? 'https' : 'http');
    const origin = req.headers.origin || `${protocol}://${host}`;

    const apiUrl = process.env.YOUPI_API_URL || 'http://localhost:6100';
    const checkoutPortalUrl = process.env.YOUPI_CHECKOUT_URL || 'http://localhost:7000';
    const merchantId = process.env.YOUPI_MERCHANT_ID || '00000000-0000-0000-0000-000000000001';
    const merchantKey = process.env.YOUPI_MERCHANT_KEY || 'mk_live_26f4b793d576a9ebd1837e533ad46599e63ad7be10f20748';
    const returnUrl = process.env.YOUPI_RETURN_URL || `${origin}/orders/success`;

    const paymentConfig = await fetchAuthoritativeUpiConfig();

    // Enforce Global UPI enable/disable check on backend
    if (paymentConfig.isEnabled === false) {
        return res.status(403).json({
            success: false,
            isUpiDisabled: true,
            message: "UPI payments are currently disabled by the store. Please choose an alternative payment method (Cards or Net Banking)."
        });
    }

    const merchantUpiId = paymentConfig.upiId || 'nexmartpay@icici';
    const merchantPayeeName = paymentConfig.payeeName || 'Ranga Store';

    const randomRef = Math.floor(100000 + Math.random() * 900000);
    const cleanOrderId = orderId || `FK_${Date.now()}_${randomRef}`;
    const cleanAmount = Number(amount || 1).toFixed(2);

    // Build authoritative UPI URI using merchant credentials and dynamic amount + order notes
    const transactionNote = `${paymentConfig.qrNote || 'Order Product'} FK${randomRef}`;
    const upiString = buildUpiPaymentUri(merchantUpiId, merchantPayeeName, cleanAmount, randomRef, paymentConfig.qrNote);
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(upiString)}&margin=4`;

    try {
        const response = await fetch(`${apiUrl}/api/v1/payments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Merchant-Id': merchantId,
                'X-Merchant-Key': merchantKey
            },
            body: JSON.stringify({
                orderId: cleanOrderId,
                amount: cleanAmount,
                currency: 'INR',
                method: 'MANUAL_UPI',
                returnUrl: returnUrl,
                customer: {
                    name: customerName || 'Customer',
                    email: email || 'customer@example.com',
                    mobileNumber: phoneNo ? String(phoneNo).replace(/\D/g, '').slice(-10) : '9876543210'
                }
            })
        });

        const data = await response.json();

        if (response.ok && data.paymentId) {
            return res.status(200).json({
                success: true,
                isGatewayLive: true,
                paymentId: data.paymentId,
                orderId: data.orderId,
                amount: data.amount,
                upiString: upiString,
                qrCodeUrl: qrCodeUrl,
                checkoutUrl: data.checkoutUrl || `${checkoutPortalUrl}/checkout/${data.paymentId}`,
                qrSvgUrl: `${checkoutPortalUrl}/checkout/${data.paymentId}/qr.svg`,
                status: data.status,
                payeeVpa: merchantUpiId,
                payeeName: merchantPayeeName
            });
        }

        console.warn("YouPI Gateway returned non-200:", data);
    } catch (err) {
        console.warn("YouPI Gateway offline or unreachable:", err.message);
    }

    // Direct UPI Fallback if gateway is booting or offline
    res.status(200).json({
        success: true,
        isGatewayLive: false,
        paymentId: `fk_${Date.now()}`,
        orderId: cleanOrderId,
        amount: cleanAmount,
        upiString: upiString,
        qrCodeUrl: qrCodeUrl,
        status: 'ACTIVE',
        payeeVpa: merchantUpiId,
        payeeName: merchantPayeeName
    });
});

// Check payment session status
exports.getYoupiPaymentStatus = asyncErrorHandler(async (req, res, next) => {
    const { id } = req.params;
    const apiUrl = process.env.YOUPI_API_URL || 'http://localhost:6100';

    try {
        const response = await fetch(`${apiUrl}/api/v1/payments/${id}`);
        if (response.ok) {
            const data = await response.json();
            return res.status(200).json({
                success: true,
                payment: data
            });
        }
    } catch (err) {
        // Ignored
    }

    res.status(200).json({
        success: true,
        payment: { paymentId: id, status: 'ACTIVE' }
    });
});

// Submit manual UTR / Reference
exports.submitYoupiUtr = asyncErrorHandler(async (req, res, next) => {
    const { id } = req.params;
    const { utr } = req.body;
    const apiUrl = process.env.YOUPI_API_URL || 'http://localhost:6100';

    try {
        const response = await fetch(`${apiUrl}/api/v1/checkout/${id}/manual-utr`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ utr })
        });
        const data = await response.json();
        return res.status(response.status).json(data);
    } catch (err) {
        return res.status(200).json({
            success: true,
            status: 'MANUAL_REVIEW',
            message: 'UTR submitted for merchant review.'
        });
    }
});

// YouPI Webhook Handler
exports.youpiWebhook = asyncErrorHandler(async (req, res, next) => {
    console.log("[YouPI Webhook Notification]:", req.body);
    res.status(200).json({ received: true });
});

// Get Active UPI Settings (Used by Checkout & Admin Panel)
exports.getUpiSettings = asyncErrorHandler(async (req, res, next) => {
    const config = await fetchAuthoritativeUpiConfig();
    res.status(200).json({
        success: true,
        upiId: config.upiId,
        payeeName: config.payeeName,
        isEnabled: config.isEnabled !== false,
        qrNote: config.qrNote || 'Order Product',
        instructions: config.instructions || 'Scan this QR code using any UPI app (GPay, PhonePe, Paytm, BHIM) to complete your payment.',
        updatedAt: config.updatedAt,
        updatedBy: config.updatedBy || 'admin'
    });
});

// Update UPI Settings (Admin Only)
exports.updateUpiSettings = asyncErrorHandler(async (req, res, next) => {
    const { upiId, payeeName, isEnabled, qrNote, instructions } = req.body;

    if (!upiId || typeof upiId !== 'string' || !upiId.includes('@')) {
        return next(new ErrorHandler("Please provide a valid UPI ID (e.g. yourname@upi or mobile@ybl)", 400));
    }

    const cleanUpiId = upiId.trim();
    const cleanPayeeName = (payeeName && payeeName.trim()) ? payeeName.trim() : 'Ranga Store';
    const targetEnabled = (typeof isEnabled === 'boolean') ? isEnabled : (String(isEnabled) !== 'false');
    const cleanQrNote = (qrNote && qrNote.trim()) ? qrNote.trim() : 'Order Product';
    const cleanInstructions = (instructions && instructions.trim()) ? instructions.trim() : 'Scan this QR code using any UPI app (GPay, PhonePe, Paytm, BHIM) to complete your payment.';
    const now = new Date();

    inMemoryPaymentConfig = {
        upiId: cleanUpiId,
        payeeName: cleanPayeeName,
        isEnabled: targetEnabled,
        qrNote: cleanQrNote,
        instructions: cleanInstructions,
        updatedAt: now.toISOString(),
        updatedBy: req.user?.email || 'admin'
    };

    process.env.MERCHANT_UPI_ID = cleanUpiId;
    process.env.MERCHANT_PAYEE_NAME = cleanPayeeName;

    // 1. Persist to MongoDB Atlas
    if (mongoose.connection.readyState === 1) {
        try {
            await UpiConfig.findOneAndUpdate(
                {},
                {
                    upiId: cleanUpiId,
                    payeeName: cleanPayeeName,
                    isEnabled: targetEnabled,
                    qrNote: cleanQrNote,
                    instructions: cleanInstructions,
                    updatedAt: now,
                    updatedBy: req.user?.email || 'admin'
                },
                { upsert: true, new: true, runValidators: true }
            );
        } catch (dbErr) {
            console.warn("[UpiConfig]: MongoDB Atlas update skipped, using disk/cache:", dbErr.message);
        }
    }

    // 2. Persist to backend/data/paymentConfig.json
    try {
        fs.writeFileSync(paymentConfigFile, JSON.stringify(inMemoryPaymentConfig, null, 2), 'utf8');
    } catch (e) {
        console.warn("[PaymentConfig]: Disk write skipped, preserved in memory:", e.message);
    }

    // 3. Update backend/config/config.env if present
    try {
        const envPath = path.join(__dirname, '../config/config.env');
        if (fs.existsSync(envPath)) {
            let envContent = fs.readFileSync(envPath, 'utf8');
            if (/^MERCHANT_UPI_ID=/m.test(envContent)) {
                envContent = envContent.replace(/^MERCHANT_UPI_ID=.*$/m, `MERCHANT_UPI_ID=${cleanUpiId}`);
            } else {
                envContent += `\nMERCHANT_UPI_ID=${cleanUpiId}\n`;
            }
            if (/^MERCHANT_PAYEE_NAME=/m.test(envContent)) {
                envContent = envContent.replace(/^MERCHANT_PAYEE_NAME=.*$/m, `MERCHANT_PAYEE_NAME=${cleanPayeeName}`);
            } else {
                envContent += `\nMERCHANT_PAYEE_NAME=${cleanPayeeName}\n`;
            }
            fs.writeFileSync(envPath, envContent, 'utf8');
        }
    } catch (e) {}

    // 4. Update YouPI SQLite database if present
    try {
        const sqliteDbPath = path.join(__dirname, '../../Payment gateway/YouPI-PG-main/data/youpi_pg.sqlite');
        if (fs.existsSync(sqliteDbPath)) {
            const Database = require('better-sqlite3');
            const db = new Database(sqliteDbPath);
            db.prepare(`UPDATE merchants SET payee_vpa = ?, payee_name = ? WHERE id = '00000000-0000-0000-0000-000000000001'`).run(cleanUpiId, cleanPayeeName);
            db.close();
        }
    } catch (e) {}

    // 5. Broadcast real-time update to all connected customers and admins
    broadcastSync(EVENTS.UPI_SETTINGS_UPDATED, {
        upiId: cleanUpiId,
        payeeName: cleanPayeeName,
        isEnabled: targetEnabled,
        qrNote: cleanQrNote,
        instructions: cleanInstructions,
        updatedAt: inMemoryPaymentConfig.updatedAt
    });

    await recordActivity(req, {
        action: targetEnabled ? 'UPDATE_UPI_GATEWAY' : 'DISABLE_UPI_GATEWAY',
        entityType: 'upi',
        entityId: cleanUpiId,
        details: targetEnabled 
            ? `Updated Store Receiver UPI ID to "${cleanUpiId}" (${cleanPayeeName})`
            : `Disabled UPI payments store-wide (Previously: "${cleanUpiId}")`,
    });

    res.status(200).json({
        success: true,
        message: targetEnabled
            ? `Global UPI configuration updated successfully! All store payments are routed to "${cleanUpiId}".`
            : `UPI payments have been DISABLED across the entire store.`,
        upiId: cleanUpiId,
        payeeName: cleanPayeeName,
        isEnabled: targetEnabled,
        qrNote: cleanQrNote,
        instructions: cleanInstructions,
        updatedAt: inMemoryPaymentConfig.updatedAt
    });
});


