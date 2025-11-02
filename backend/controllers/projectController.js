const Project = require("../models/Project.js");
const mongoose = require("mongoose");
const { 
  uploadVideoToCloudinary, 
  deleteVideoFromCloudinary,
  uploadImageToCloudinary,
  deleteImageFromCloudinary 
} = require("../utils/cloudinaryUpload");

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

const getProjects = async (req, res) => {
    try {
        const projects = await Project.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: projects.length,
            projects
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching projects"
        });
    }
};

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
        res.status(500).json({
            success: false,
            message: "Error fetching project"
        });
    }
};

const addProject = async (req, res) => {
    try {
        const contentType = req.headers["content-type"] || "";
        
        if (contentType.includes("application/json")) {
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

            // Handle array format (features[0], tools[0], etc.)
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

            // Frontend already uploaded to Cloudinary, just save the URLs
            // No file processing needed - this bypasses Vercel's 4.5MB limit
            // Expecting: cloudinaryVideoUrl, cloudinaryVideoPublicId, cloudinaryThumbnailUrl, cloudinaryThumbnailPublicId
            
            const project = new Project(req.body);
            await project.save();

            return res.status(201).json({
                success: true,
                message: "Project added successfully",
                project
            });
        }

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

        if (req.files && req.files['video'] && req.files['video'][0]) {
            try {
                const videoFile = req.files['video'][0];
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

        if (req.files && req.files['thumbnail'] && req.files['thumbnail'][0]) {
            try {
                const thumbnailFile = req.files['thumbnail'][0];
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

        return res.status(201).json({
            success: true,
            message: "Project added successfully",
            project
        });
    } catch (error) {
        const validationErrors = extractValidationErrors(error);
        if (validationErrors) {
            return res.status(400).json({
                success: false,
                message: "Validation error",
                errors: validationErrors
            });
        }

        res.status(500).json({
            success: false,
            message: "Error adding project"
        });
    }
};

const updateProject = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid project ID format"
            });
        }

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

        if (req.body.cloudinaryVideoUrl && req.body.cloudinaryVideoPublicId) {
            if (existingProject.cloudinaryVideoPublicId && 
                existingProject.cloudinaryVideoPublicId !== req.body.cloudinaryVideoPublicId) {
                try {
                    await deleteVideoFromCloudinary(existingProject.cloudinaryVideoPublicId);
                } catch (deleteError) {
                    // Continue - don't fail the update if deletion fails
                }
            }
        } else if (req.body.removeVideo === 'true' || req.body.cloudinaryVideoUrl === '') {
            if (existingProject.cloudinaryVideoPublicId) {
                try {
                    await deleteVideoFromCloudinary(existingProject.cloudinaryVideoPublicId);
                } catch (deleteError) {
                    // Silent fail
                }
                req.body.cloudinaryVideoUrl = '';
                req.body.cloudinaryVideoPublicId = '';
            }
        } else if (req.files && req.files['video'] && req.files['video'][0]) {
            if (existingProject.cloudinaryVideoPublicId) {
                try {
                    await deleteVideoFromCloudinary(existingProject.cloudinaryVideoPublicId);
                } catch (deleteError) {
                    // Silent fail
                }
            }
            try {
                const videoFile = req.files['video'][0];
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

        if (req.body.cloudinaryThumbnailUrl && req.body.cloudinaryThumbnailPublicId) {
            if (existingProject.cloudinaryThumbnailPublicId && 
                existingProject.cloudinaryThumbnailPublicId !== req.body.cloudinaryThumbnailPublicId) {
                try {
                    await deleteImageFromCloudinary(existingProject.cloudinaryThumbnailPublicId);
                } catch (deleteError) {
                    // Continue - don't fail the update if deletion fails
                }
            }
        } else if (req.body.removeThumbnail === 'true' || req.body.cloudinaryThumbnailUrl === '') {
            if (existingProject.cloudinaryThumbnailPublicId) {
                try {
                    await deleteImageFromCloudinary(existingProject.cloudinaryThumbnailPublicId);
                } catch (deleteError) {
                    // Silent fail
                }
                req.body.cloudinaryThumbnailUrl = '';
                req.body.cloudinaryThumbnailPublicId = '';
            }
        } else if (req.files && req.files['thumbnail'] && req.files['thumbnail'][0]) {
            if (existingProject.cloudinaryThumbnailPublicId) {
                try {
                    await deleteImageFromCloudinary(existingProject.cloudinaryThumbnailPublicId);
                } catch (deleteError) {
                    // Silent fail
                }
            }
            try {
                const thumbnailFile = req.files['thumbnail'][0];
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
        const validationErrors = extractValidationErrors(error);
        if (validationErrors) {
            return res.status(400).json({
                success: false,
                message: "Validation error",
                errors: validationErrors
            });
        }

        res.status(500).json({
            success: false,
            message: "Error updating project"
        });
    }
};

const deleteProject = async (req, res) => {
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

        if (project.cloudinaryVideoPublicId) {
            await deleteVideoFromCloudinary(project.cloudinaryVideoPublicId);
        }

        if (project.cloudinaryThumbnailPublicId) {
            await deleteImageFromCloudinary(project.cloudinaryThumbnailPublicId);
        }

        await Project.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: "Project deleted successfully",
            project
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error deleting project"
        });
    }
};

module.exports = { getProjects, getProject, addProject, deleteProject, updateProject };