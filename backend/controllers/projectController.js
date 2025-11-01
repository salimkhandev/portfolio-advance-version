const Project = require("../models/Project.js");
const mongoose = require("mongoose");
const { 
  uploadVideoToCloudinary, 
  deleteVideoFromCloudinary,
  uploadImageToCloudinary,
  deleteImageFromCloudinary 
} = require("../utils/cloudinaryUpload");

// Helper function to extract validation errors
const extractValidationErrors = (error) => {
    if (error.name === 'ValidationError') {
        const errors = {};
        Object.keys(error.errors).forEach(key => {
            errors[key] = error.errors[key].message;
        });
        return errors;
    }
    return null;
};

// Get all projects (public)
const getProjects = async (req, res) => {
    try {
        const projects = await Project.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: projects.length,
            projects
        });
    } catch (error) {
        console.error("Error fetching projects:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching projects",
            error: error.message
        });
    }
};

// Get single project by ID (public)
const getProject = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid project ID format"
            });
        }

        const project = await Project.findById(id);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found"
            });
        }

        res.status(200).json({
            success: true,
            project
        });
    } catch (error) {
        console.error("Error fetching project:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching project",
            error: error.message
        });
    }
};

// Add project (protected)
const addProject = async (req, res) => {
    try {
        // Parse FormData arrays (features, tools)
        if (req.body.features && typeof req.body.features === 'string') {
            try {
                req.body.features = JSON.parse(req.body.features);
            } catch (e) {
                // If not JSON, treat as single item array
                req.body.features = [req.body.features];
            }
        }
        if (req.body.tools && typeof req.body.tools === 'string') {
            try {
                req.body.tools = JSON.parse(req.body.tools);
            } catch (e) {
                req.body.tools = [req.body.tools];
            }
        }

        // Handle array format from FormData (feature[0], feature[1], etc.)
        const features = [];
        const tools = [];
        Object.keys(req.body).forEach(key => {
            if (key.startsWith('features[')) {
                const index = parseInt(key.match(/\[(\d+)\]/)[1]);
                features[index] = req.body[key];
                delete req.body[key];
            } else if (key.startsWith('tools[')) {
                const index = parseInt(key.match(/\[(\d+)\]/)[1]);
                tools[index] = req.body[key];
                delete req.body[key];
            }
        });
        if (features.length > 0) req.body.features = features.filter(Boolean);
        if (tools.length > 0) req.body.tools = tools.filter(Boolean);

        // Handle video upload
        if (req.files && req.files['video'] && req.files['video'][0]) {
            try {
                const videoFile = req.files['video'][0];
                // Use buffer (memory storage) or path (disk storage)
                const videoInput = videoFile.buffer || videoFile.path;
                const videoResult = await uploadVideoToCloudinary(videoInput);
                req.body.cloudinaryVideoUrl = videoResult.url;
                req.body.cloudinaryVideoPublicId = videoResult.public_id;
            } catch (uploadError) {
                console.error("Error uploading video to Cloudinary:", uploadError);
                return res.status(500).json({
                    success: false,
                    message: "Error uploading video to Cloudinary",
                    error: uploadError.message
                });
            }
        }

        // Handle thumbnail upload
        if (req.files && req.files['thumbnail'] && req.files['thumbnail'][0]) {
            try {
                const thumbnailFile = req.files['thumbnail'][0];
                // Use buffer (memory storage) or path (disk storage)
                const thumbnailInput = thumbnailFile.buffer || thumbnailFile.path;
                const thumbnailResult = await uploadImageToCloudinary(thumbnailInput);
                req.body.cloudinaryThumbnailUrl = thumbnailResult.url;
                req.body.cloudinaryThumbnailPublicId = thumbnailResult.public_id;
            } catch (uploadError) {
                console.error("Error uploading thumbnail to Cloudinary:", uploadError);
                return res.status(500).json({
                    success: false,
                    message: "Error uploading thumbnail to Cloudinary",
                    error: uploadError.message
                });
            }
        }

        const project = new Project(req.body);
        await project.save();

        res.status(201).json({
            success: true,
            message: "Project added successfully",
            project
        });
    } catch (error) {
        console.error("Error adding project:", error);

        // Handle validation errors
        const validationErrors = extractValidationErrors(error);
        if (validationErrors) {
            return res.status(400).json({
                success: false,
                message: "Validation error",
                errors: validationErrors
            });
        }

        // Handle other errors
        res.status(500).json({
            success: false,
            message: "Error adding project",
            error: error.message
        });
    }
};

// Update project (protected)
const updateProject = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid project ID format"
            });
        }

        // Get existing project to check for old video
        const existingProject = await Project.findById(id);
        if (!existingProject) {
            return res.status(404).json({
                success: false,
                message: "Project not found"
            });
        }

        // Parse FormData arrays (features, tools)
        if (req.body.features && typeof req.body.features === 'string') {
            try {
                req.body.features = JSON.parse(req.body.features);
            } catch (e) {
                req.body.features = [req.body.features];
            }
        }
        if (req.body.tools && typeof req.body.tools === 'string') {
            try {
                req.body.tools = JSON.parse(req.body.tools);
            } catch (e) {
                req.body.tools = [req.body.tools];
            }
        }

        // Handle array format from FormData
        const features = [];
        const tools = [];
        Object.keys(req.body).forEach(key => {
            if (key.startsWith('features[')) {
                const match = key.match(/\[(\d+)\]/);
                if (match) {
                    const index = parseInt(match[1]);
                    features[index] = req.body[key];
                    delete req.body[key];
                }
            } else if (key.startsWith('tools[')) {
                const match = key.match(/\[(\d+)\]/);
                if (match) {
                    const index = parseInt(match[1]);
                    tools[index] = req.body[key];
                    delete req.body[key];
                }
            }
        });
        if (features.length > 0) req.body.features = features.filter(Boolean);
        if (tools.length > 0) req.body.tools = tools.filter(Boolean);

        // Handle video upload/delete
        if (req.files && req.files['video'] && req.files['video'][0]) {
            // Delete old video from Cloudinary if it exists
            if (existingProject.cloudinaryVideoPublicId) {
                await deleteVideoFromCloudinary(existingProject.cloudinaryVideoPublicId);
            }

            // Upload new video to Cloudinary
            try {
                const videoFile = req.files['video'][0];
                // Use buffer (memory storage) or path (disk storage)
                const videoInput = videoFile.buffer || videoFile.path;
                const videoResult = await uploadVideoToCloudinary(videoInput);
                req.body.cloudinaryVideoUrl = videoResult.url;
                req.body.cloudinaryVideoPublicId = videoResult.public_id;
            } catch (uploadError) {
                console.error("Error uploading video to Cloudinary:", uploadError);
                return res.status(500).json({
                    success: false,
                    message: "Error uploading video to Cloudinary",
                    error: uploadError.message
                });
            }
        } else if (req.body.removeVideo === 'true' || req.body.cloudinaryVideoUrl === '') {
            // If explicitly removing video or setting to empty
            if (existingProject.cloudinaryVideoPublicId) {
                await deleteVideoFromCloudinary(existingProject.cloudinaryVideoPublicId);
                req.body.cloudinaryVideoUrl = '';
                req.body.cloudinaryVideoPublicId = '';
            }
        }

        // Handle thumbnail upload/delete
        if (req.files && req.files['thumbnail'] && req.files['thumbnail'][0]) {
            // Delete old thumbnail from Cloudinary if it exists
            if (existingProject.cloudinaryThumbnailPublicId) {
                await deleteImageFromCloudinary(existingProject.cloudinaryThumbnailPublicId);
            }

            // Upload new thumbnail to Cloudinary
            try {
                const thumbnailFile = req.files['thumbnail'][0];
                // Use buffer (memory storage) or path (disk storage)
                const thumbnailInput = thumbnailFile.buffer || thumbnailFile.path;
                const thumbnailResult = await uploadImageToCloudinary(thumbnailInput);
                req.body.cloudinaryThumbnailUrl = thumbnailResult.url;
                req.body.cloudinaryThumbnailPublicId = thumbnailResult.public_id;
            } catch (uploadError) {
                console.error("Error uploading thumbnail to Cloudinary:", uploadError);
                return res.status(500).json({
                    success: false,
                    message: "Error uploading thumbnail to Cloudinary",
                    error: uploadError.message
                });
            }
        } else if (req.body.removeThumbnail === 'true' || req.body.cloudinaryThumbnailUrl === '') {
            // If explicitly removing thumbnail or setting to empty
            if (existingProject.cloudinaryThumbnailPublicId) {
                await deleteImageFromCloudinary(existingProject.cloudinaryThumbnailPublicId);
                req.body.cloudinaryThumbnailUrl = '';
                req.body.cloudinaryThumbnailPublicId = '';
            }
        }

        const updatedProject = await Project.findByIdAndUpdate(
            id,
            req.body,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: "Project updated successfully",
            project: updatedProject
        });
    } catch (error) {
        console.error("Error updating project:", error);

        // Handle validation errors
        const validationErrors = extractValidationErrors(error);
        if (validationErrors) {
            return res.status(400).json({
                success: false,
                message: "Validation error",
                errors: validationErrors
            });
        }

        // Handle other errors
        res.status(500).json({
            success: false,
            message: "Error updating project",
            error: error.message
        });
    }
};

// Delete project (protected)
const deleteProject = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid project ID format"
            });
        }

        // Get project first to access Cloudinary public_id
        const project = await Project.findById(id);
        
        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found"
            });
        }

        // Delete video from Cloudinary if it exists
        if (project.cloudinaryVideoPublicId) {
            await deleteVideoFromCloudinary(project.cloudinaryVideoPublicId);
        }

        // Delete thumbnail from Cloudinary if it exists
        if (project.cloudinaryThumbnailPublicId) {
            await deleteImageFromCloudinary(project.cloudinaryThumbnailPublicId);
        }

        // Delete project from database
        await Project.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: "Project deleted successfully",
            project
        });
    } catch (error) {
        console.error("Error deleting project:", error);
        res.status(500).json({
            success: false,
            message: "Error deleting project",
            error: error.message
        });
    }
};

module.exports = { getProjects, getProject, addProject, deleteProject, updateProject };