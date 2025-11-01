const express = require("express");
const { getSkills, getSkill, addSkill, deleteSkill, updateSkill } = require("../controllers/skillController.js");
const { protect } = require("../middleware/authMiddleware.js");
const { uploadImage } = require("../utils/upload.js");

const router = express.Router();

// Multer error handling middleware
const handleMulterError = (err, req, res, next) => {
  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message || 'File upload error',
      error: err.toString()
    });
  }
  next();
};

router.get("/", getSkills);
router.get("/:id", getSkill);
router.post("/", protect, uploadImage, handleMulterError, addSkill);
router.put("/:id", protect, uploadImage, handleMulterError, updateSkill);
router.delete("/:id", protect, deleteSkill);

module.exports = router;
