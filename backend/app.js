const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');
const errorMiddleware = require('./middlewares/error');

const app = express();

// config: load environment file if present and guarantee critical defaults for production / Vercel
try {
    require('dotenv').config({ path: path.join(__dirname, 'config/config.env') });
} catch (e) {}

process.env.JWT_SECRET = process.env.JWT_SECRET || 'WFFWf15115U842UGUBWF81EE858UYBY51BGBJ5E51Q';
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

// Dynamic CORS & Custom Domain compatibility (Vercel & Custom Domains)
app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    }
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
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

// error middleware
app.use(errorMiddleware);

module.exports = app;
