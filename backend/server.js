require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const userRoutes = require("./routes/userRoutes.js");
const projectRoutes = require("./routes/projectRoutes.js");
const skillRoutes = require("./routes/skillRoutes.js");
const { connectDB } = require("./config/db.js");
const cloudinary = require("./config/cloudinary");

const app = express();
const PORT = process.env.PORT || 3000;

// --- Middleware ---
// Configure CORS to allow all origins
const corsOptions = {
    origin: true, // Allow all origins
    credentials: true, // Allow cookies to be sent
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'], // Allow all methods
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'], // Allow necessary headers
    exposedHeaders: ['Content-Type'], // Expose headers to client
    maxAge: 86400 // Cache preflight requests for 24 hours
};

app.use(cors(corsOptions));
app.use(express.json());       // parse JSON request bodies
app.use(cookieParser());      // parse cookies

// --- Database Connection Middleware ---
// For serverless: check if connected, connect if not (reuses connection)
// For local: connect on startup
let dbConnected = false;

const ensureDBConnection = async (req, res, next) => {
    if (!dbConnected) {
        try {
            await connectDB();
            dbConnected = true;
        } catch (error) {
            console.error('Database connection error:', error);
            return res.status(500).json({
                success: false,
                message: 'Database connection failed',
                error: error.message
            });
        }
    }
    next();
};

// Apply database connection middleware to all API routes
app.use('/api', ensureDBConnection);

// --- Default Route ---
app.get("/", (req, res) => {
    res.json({ message: "Hello from the backend" });
});

// --- Routes ---
app.use("/api/users", userRoutes);       // login route
app.use("/api/projects", projectRoutes); // CRUD project routes
app.use("/api/skills", skillRoutes);    // CRUD skill routes

// --- Connect to MongoDB for Local Development ---
if (!process.env.VERCEL) {
    const startServer = async () => {
        try {
            await connectDB();
            dbConnected = true;
            app.listen(PORT, () => {
                console.log(`Server running on http://localhost:${PORT}`);
            });
        } catch (error) {
            console.error('Failed to start server:', error);
            process.exit(1);
        }
    };
    startServer();
} else {
    // Export app for Vercel serverless
    module.exports = app;
}
