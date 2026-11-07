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

// Export the Express app as the Vercel Serverless Function entrypoint
module.exports = app;

