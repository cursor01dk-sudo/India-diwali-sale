const mongoose = require('mongoose');

let connectionPromise;

const connectDatabase = async () => {
    // If running on Vercel or MONGO_URI is omitted, operate in zero-DB standalone mode
    if (process.env.VERCEL || !process.env.MONGO_URI) {
        mongoose.set('bufferCommands', false);
        return null;
    }

    if (mongoose.connection.readyState === 1) {
        return mongoose.connection;
    }

    if (connectionPromise) return connectionPromise;

    try {
        mongoose.set('strictQuery', false);
        mongoose.set('bufferCommands', false);
        connectionPromise = mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 3000,
            maxPoolSize: 5,
        });

        const conn = await connectionPromise;
        console.log('[MongoDB]: Connected successfully');
        return conn;
    } catch (err) {
        connectionPromise = undefined;
        console.warn('[MongoDB]: Database connection unavailable, falling back to standalone JSON store:', err.message);
        return null;
    }
};

module.exports = connectDatabase;

