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
            serverSelectionTimeoutMS: 10000,
            bufferCommands: false,
        });
        cachedConn = conn;
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        console.error(`MongoDB Error: ${error.message}`);
        console.log('⚠️  Running without MongoDB — data will not be saved.');
        return null;
    }
};

module.exports = connectDB;
