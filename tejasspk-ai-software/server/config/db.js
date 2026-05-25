require('dns').setServers(['8.8.8.8', '1.1.1.1']);
const mongoose = require('mongoose');

// Cache connection across serverless function invocations (Vercel requirement)
let cachedConn = null;

const connectDB = async () => {
    if (cachedConn && mongoose.connection.readyState === 1) {
        return cachedConn;
    }

    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 10000
            // NOTE: bufferCommands defaults to true — allows Mongoose to queue
            // queries until connection is ready (required for serverless)
        });
        cachedConn = conn;
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        console.error(`MongoDB Error: ${error.message}`);
        return null;
    }
};

module.exports = connectDB;
