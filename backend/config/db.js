const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI;

        if (!uri) {
            console.error('❌ MONGODB_URI not set in environment');
            process.exit(1);
        }

        const conn = await mongoose.connect(uri);
        console.log(`✅ MongoDB connected successfully: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        console.error(`❌ MongoDB connection failed: ${error.message}`);
        process.exit(1);
    }
};

module.exports = { connectDB, mongoose };
