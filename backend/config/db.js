const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI;

        if (!uri) {
            throw new Error('MONGODB_URI not set in environment');
        }

        if (mongoose.connection.readyState === 1) {
            return mongoose.connection;
        }

        const conn = await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000,
        });
        return conn;
    } catch (error) {
        // Don't call process.exit() on serverless - let it handle the error
        if (!process.env.VERCEL) {
            process.exit(1);
        }
        throw error; // Re-throw for serverless to handle
    }
};

module.exports = { connectDB, mongoose };
