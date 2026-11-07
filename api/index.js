const cloudinary = require('cloudinary');
const connectDatabase = require('../backend/config/database');
const app = require('../backend/app');

// Ensure database connection (handles serverless connection caching)
connectDatabase();

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

