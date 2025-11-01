const express = require("express");
const { loginUser, logoutUser, verifyUser } = require("../controllers/userController.js");
const { protect } = require("../middleware/authMiddleware.js");

const router = express.Router();

router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/verify", protect, verifyUser);

module.exports = router;
