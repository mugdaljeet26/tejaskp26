require('dns').setServers(['8.8.8.8', '1.1.1.1']);
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 10000,
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline);
    } catch (error) {
        console.error(`MongoDB Error: ${error.message}`.red.bold);
        console.log('⚠️  Running without MongoDB — data will not be saved.'.yellow);
        // Do NOT exit — let server run so HTML pages still load
    }
};

module.exports = connectDB;
