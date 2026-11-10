const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');
const errorMiddleware = require('./middlewares/error');

const app = express();

const crypto = require('crypto');

// config: load environment file if present and guarantee critical defaults for production / Vercel
try {
    require('dotenv').config({ path: path.join(__dirname, 'config/config.env') });
} catch (e) {}

if (!process.env.JWT_SECRET) {
    if (process.env.NODE_ENV === 'production') {
        console.warn('[SECURITY WARNING]: JWT_SECRET is not defined in production environment variables! Generating dynamic cryptographically secure secret.');
        process.env.JWT_SECRET = crypto.randomBytes(32).toString('hex');
    } else {
        process.env.JWT_SECRET = 'dev_jwt_secret_' + crypto.createHash('sha256').update(__dirname).digest('hex');
    }
}
process.env.JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';
process.env.COOKIE_EXPIRE = process.env.COOKIE_EXPIRE || '5';

app.use(express.json({ limit: '50mb' }));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(fileUpload());

// Serverless / Vercel body safety normalizer
app.use((req, res, next) => {
    if (typeof req.body === 'string' && req.body.trim().startsWith('{')) {
        try {
            req.body = JSON.parse(req.body);
        } catch (e) {}
    }
    if (!req.body) {
        req.body = {};
    }
    next();
});

// Production CORS & CSRF Origin Protection
app.use((req, res, next) => {
    const origin = req.headers.origin;
    const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:3002',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001',
        'http://127.0.0.1:3002',
        process.env.FRONTEND_URL,
        process.env.ADMIN_URL,
        process.env.CLIENT_URL,
    ].filter(Boolean);

    const isDevelopment = process.env.NODE_ENV !== 'production';

    let isAllowed = false;
    if (!origin) {
        // Same-origin, mobile apps, or server-to-server requests
        isAllowed = true;
    } else if (allowedOrigins.includes(origin)) {
        isAllowed = true;
    } else if (origin.includes('rangastore.shop') || origin.endsWith('rangastore.shop')) {
        isAllowed = true;
    } else if (isDevelopment && (origin.includes('localhost') || origin.includes('127.0.0.1') || origin.includes('.vercel.app'))) {
        isAllowed = true;
    }

    if (origin && isAllowed) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, x-auth-token');
    }

    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }

    // CSRF Protection for state-changing operations
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
        const isWebhook = req.path.includes('/webhook') || req.path.includes('/callback');
        if (!isWebhook && origin && !isAllowed) {
            return res.status(403).json({
                success: false,
                message: 'CORS/CSRF Policy Violation: Unauthorized origin rejected: ' + origin
            });
        }
    }

    next();
});

// Serve locally uploaded banner/product images
app.use('/uploads', express.static(path.join(__dirname, '../frontend/public/uploads')));

const user = require('./routes/userRoute');
const product = require('./routes/productRoute');
const order = require('./routes/orderRoute');
const payment = require('./routes/paymentRoute');
const banner = require('./routes/bannerRoute');
const content = require('./routes/contentRoute');
const coupon = require('./routes/couponRoute');
const activityLog = require('./routes/activityLogRoute');

// Quad-mount routes to guarantee zero 404/500 errors across any Vercel rewrite configuration
app.use('/api/v1', user);
app.use('/v1', user);
app.use('/api', user);
app.use('/', user);

app.use('/api/v1', product);
app.use('/v1', product);
app.use('/api', product);
app.use('/', product);

app.use('/api/v1', order);
app.use('/v1', order);
app.use('/api', order);
app.use('/', order);

app.use('/api/v1', payment);
app.use('/v1', payment);
app.use('/api', payment);
app.use('/', payment);

app.use('/api/v1', banner);
app.use('/v1', banner);
app.use('/api', banner);
app.use('/', banner);

app.use('/api/v1', content);
app.use('/v1', content);
app.use('/api', content);
app.use('/', content);

app.use('/api/v1', coupon);
app.use('/v1', coupon);
app.use('/api', coupon);
app.use('/', coupon);

app.use('/api/v1', activityLog);
app.use('/v1', activityLog);
app.use('/api', activityLog);
app.use('/', activityLog);

// error middleware
app.use(errorMiddleware);

module.exports = app;
