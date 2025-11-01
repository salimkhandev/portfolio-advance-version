const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
    // Get token from cookies instead of headers
    const token = req.cookies?.token;

    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }

    try {
        // Verify the JWT using your secret key
        const decoded = jwt.verify(token, process.env.SECRET_KEY);

        // Attach decoded user data to request
        req.user = decoded;

        // Continue to next middleware or route
        next();
    } catch (error) {
        return res.status(403).json({ message: "Invalid or expired token" });
    }
};

module.exports = { protect };
