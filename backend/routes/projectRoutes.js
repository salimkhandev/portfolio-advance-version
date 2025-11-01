const express = require("express");
const { getProjects, getProject, addProject, deleteProject, updateProject } = require("../controllers/projectController.js");
const { protect } = require("../middleware/authMiddleware.js");
const { uploadMultiple } = require("../utils/upload.js");

const router = express.Router();

router.get("/", getProjects);
router.get("/:id", getProject);
router.post("/", protect, uploadMultiple, addProject);
router.put("/:id", protect, uploadMultiple, updateProject);
router.delete("/:id", protect, deleteProject);

module.exports = router;
