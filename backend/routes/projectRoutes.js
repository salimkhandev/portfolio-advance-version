const express = require("express");
const { getProjects, getProject, addProject, deleteProject, updateProject } = require("../controllers/projectController.js");
const { protect } = require("../middleware/authMiddleware.js");
const { uploadMultiple } = require("../utils/upload.js");

const router = express.Router();

const optionalUpload = (req, res, next) => {
    if (req.is('application/json')) {
        return next();
    }
    return uploadMultiple(req, res, next);
};

router.get("/", getProjects);
router.get("/:id", getProject);
router.post("/", protect, optionalUpload, addProject);
router.put("/:id", protect, optionalUpload, updateProject);
router.delete("/:id", protect, deleteProject);

module.exports = router;
