const mongoose = require('mongoose');

let isConnected = false;

const connectDatabase = async () => {
    if (isConnected && mongoose.connection.readyState === 1) {
        return mongoose.connection;
    }

    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/flipkart';

    try {
        mongoose.set('strictQuery', false);
        const conn = await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: process.env.VERCEL ? 3000 : 8000,
        });
        isConnected = true;
        console.log("Mongoose Connected to database");

        // Automatically import all 31 products, reviews, banners, and admin if database is empty
        try {
            const autoSyncData = require('../utils/autoSyncData');
            await autoSyncData();
        } catch (syncErr) {
            console.warn("[AutoSync Warning]:", syncErr.message);
        }

        return conn;
    } catch (err) {
        console.log(`Mongoose Connection Warning: ${err.message}`);
        console.log("Tip: For local development, ensure MongoDB is running. For Vercel, set MONGO_URI (e.g. MongoDB Atlas) in your Vercel Project Settings > Environment Variables.");
    }
};

module.exports = connectDatabase;
