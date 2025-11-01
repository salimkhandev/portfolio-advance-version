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
// Configure CORS to allow credentials (cookies)
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true // Allow cookies to be sent
}));
app.use(express.json());       // parse JSON request bodies
app.use(cookieParser());      // parse cookies

// --- Routes ---
app.use("/api/users", userRoutes);       // login route
app.use("/api/projects", projectRoutes); // CRUD project routes
app.use("/api/skills", skillRoutes);    // CRUD skill routes

// --- Connect to MongoDB and start server ---
const startServer = async () => {
    try {
        
        await connectDB();
        
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
