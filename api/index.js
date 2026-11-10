const cloudinary = require('cloudinary');
const connectDatabase = require('../backend/config/database');
const app = require('../backend/app');

// Serverless database connection middleware (ensures DB is resolved per request)
app.use(async (req, res, next) => {
    try {
        await connectDatabase();
    } catch (e) {
        // Routes with static fallbacks can still serve during a database outage.
        console.error(`[Database unavailable] ${e.message}`);
    }
    next();
});

// Configure Cloudinary if credentials are provided in Vercel env
if (process.env.CLOUDINARY_NAME) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });
}

// Export resilient handler that normalizes Vercel rewritten paths
module.exports = (req, res) => {
    // If Vercel rewrote the path to /api or /, recover original requested path
    const original = req.headers['x-matched-path'] || req.headers['x-now-route-matches'] || req.headers['x-forwarded-uri'];
    if (original && (req.url === '/api' || req.url === '/' || req.url === '/api/')) {
        req.url = original;
    }

    if (typeof req.body === 'string' && req.body.trim().startsWith('{')) {
        try {
            req.body = JSON.parse(req.body);
        } catch (e) {}
    }

    return app(req, res);
};

