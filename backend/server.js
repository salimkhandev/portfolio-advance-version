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

const corsOptions = {
    origin: true, // Allow all origins
    credentials: true, // Allow cookies to be sent
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'], // Allow all methods
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'], // Allow necessary headers
    exposedHeaders: ['Content-Type'], // Expose headers to client
    maxAge: 86400 // Cache preflight requests for 24 hours
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));       // parse JSON request bodies with increased limit
app.use(express.urlencoded({ limit: '50mb', extended: true })); // parse URL-encoded bodies with increased limit
app.use(cookieParser());      // parse cookies

let dbConnected = false;

const ensureDBConnection = async (req, res, next) => {
    if (!dbConnected) {
        try {
            await connectDB();
            dbConnected = true;
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Database connection failed'
            });
        }
    }
    next();
};

app.get("/", (req, res) => {
    res.json({ message: "Hello from the backend" });
});

app.get("/api/cloudinary-config", (req, res) => {
    res.json({
        success: true,
        cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
        uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET || ''
    });
});

app.post("/api/cloudinary-signature", express.json(), (req, res) => {
    try {
        const { folder, resource_type = 'auto' } = req.body;
        
        if (!process.env.CLOUDINARY_API_SECRET || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_CLOUD_NAME) {
            return res.status(500).json({
                success: false,
                message: 'Cloudinary credentials not configured on server. Please set CLOUDINARY_API_SECRET, CLOUDINARY_API_KEY, and CLOUDINARY_CLOUD_NAME environment variables.'
            });
        }
        
        const cloudinary = require("./config/cloudinary");
        
        const timestamp = Math.round(new Date().getTime() / 1000);
        const params = {};
        
        if (folder && folder.trim()) {
            params.folder = folder.trim();
        }
        
        params.timestamp = timestamp;
        const signature = cloudinary.utils.api_sign_request(
            params,
            process.env.CLOUDINARY_API_SECRET
        );

        res.json({
            success: true,
            signature,
            timestamp,
            folder: params.folder || '',
            resource_type: resource_type || 'auto',
            api_key: process.env.CLOUDINARY_API_KEY,
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to generate upload signature'
        });
    }
});

app.use('/api', ensureDBConnection);
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/skills", skillRoutes);

module.exports = app;

if (!process.env.VERCEL) {
    const startServer = async () => {
        try {
            await connectDB();
            dbConnected = true;
            app.listen(PORT);
        } catch (error) {
            process.exit(1);
        }
    };
    startServer();
}
