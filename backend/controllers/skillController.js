const Skill = require("../models/Skill.js");
const mongoose = require("mongoose");
const { uploadImageToCloudinary, deleteImageFromCloudinary } = require("../utils/cloudinaryUpload.js");

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

// Get all skills (public)
const getSkills = async (req, res) => {
    try {
        const skills = await Skill.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: skills.length,
            skills
        });
    } catch (error) {
        console.error("Error fetching skills:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching skills",
            error: error.message
        });
    }
};

// Get single skill by ID (public)
const getSkill = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid skill ID format"
            });
        }

        const skill = await Skill.findById(id);
        if (!skill) {
            return res.status(404).json({
                success: false,
                message: "Skill not found"
            });
        }

        res.status(200).json({
            success: true,
            skill
        });
    } catch (error) {
        console.error("Error fetching skill:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching skill",
            error: error.message
        });
    }
};

// Add skill (protected)
const addSkill = async (req, res) => {
    try {
        console.log('=== Add Skill Request ===');
        console.log('req.body:', req.body);
        console.log('req.file:', req.file);
        console.log('req.files:', req.files);
        console.log('req.body keys:', Object.keys(req.body));

        // Parse FormData arrays (topics)
        if (req.body.topics && typeof req.body.topics === 'string') {
            try {
                req.body.topics = JSON.parse(req.body.topics);
            } catch (e) {
                req.body.topics = [req.body.topics];
            }
        }

        // Handle array format from FormData (topics[0], topics[1], etc.)
        const topics = [];
        Object.keys(req.body).forEach(key => {
            if (key.startsWith('topics[')) {
                const match = key.match(/\[(\d+)\]/);
                if (match) {
                    const index = parseInt(match[1]);
                    topics[index] = req.body[key];
                    delete req.body[key];
                }
            }
        });
        if (topics.length > 0) req.body.topics = topics.filter(Boolean);

        console.log('After parsing - req.body.topics:', req.body.topics);
        console.log('req.body.name:', req.body.name);

        // Validate required fields
        if (!req.body.name || req.body.name.trim() === '') {
            return res.status(400).json({
                success: false,
                message: "Skill name is required"
            });
        }

        if (!req.body.topics || req.body.topics.length === 0) {
            return res.status(400).json({
                success: false,
                message: "At least one topic is required"
            });
        }

        // Handle image upload - uploadImage.single('image') puts file in req.file
        if (!req.file) {
            console.log('ERROR: No file uploaded');
            return res.status(400).json({
                success: false,
                message: "Skill icon image is required"
            });
        }
        
        console.log('File uploaded successfully:', req.file.filename);

        try {
            const imageResult = await uploadImageToCloudinary(
                req.file.path,
                'skill-icons'
            );
            req.body.imageUrl = imageResult.url;
            req.body.cloudinaryImagePublicId = imageResult.public_id;
        } catch (uploadError) {
            console.error("Error uploading image to Cloudinary:", uploadError);
            return res.status(500).json({
                success: false,
                message: "Error uploading image to Cloudinary",
                error: uploadError.message
            });
        }

        const skill = new Skill(req.body);
        await skill.save();

        res.status(201).json({
            success: true,
            message: "Skill added successfully",
            skill
        });
    } catch (error) {
        console.error("Error adding skill:", error);

        // Handle validation errors
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
            message: "Error adding skill",
            error: error.message
        });
    }
};

// Update skill (protected)
const updateSkill = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid skill ID format"
            });
        }

        // Get existing skill to check for old image
        const existingSkill = await Skill.findById(id);
        if (!existingSkill) {
            return res.status(404).json({
                success: false,
                message: "Skill not found"
            });
        }

        // Parse FormData arrays (topics)
        if (req.body.topics && typeof req.body.topics === 'string') {
            try {
                req.body.topics = JSON.parse(req.body.topics);
            } catch (e) {
                req.body.topics = [req.body.topics];
            }
        }

        // Handle array format from FormData
        const topics = [];
        Object.keys(req.body).forEach(key => {
            if (key.startsWith('topics[')) {
                const match = key.match(/\[(\d+)\]/);
                if (match) {
                    const index = parseInt(match[1]);
                    topics[index] = req.body[key];
                    delete req.body[key];
                }
            }
        });
        if (topics.length > 0) req.body.topics = topics.filter(Boolean);

        // Handle image upload/delete - uploadImage.single('image') puts file in req.file
        if (req.file) {
            // Delete old image from Cloudinary if it exists
            if (existingSkill.cloudinaryImagePublicId) {
                await deleteImageFromCloudinary(existingSkill.cloudinaryImagePublicId);
            }

            // Upload new image to Cloudinary
            try {
                const imageResult = await uploadImageToCloudinary(
                    req.file.path,
                    'skill-icons'
                );
                req.body.imageUrl = imageResult.url;
                req.body.cloudinaryImagePublicId = imageResult.public_id;
            } catch (uploadError) {
                console.error("Error uploading image to Cloudinary:", uploadError);
                return res.status(500).json({
                    success: false,
                    message: "Error uploading image to Cloudinary",
                    error: uploadError.message
                });
            }
        } else if (req.body.removeImage === 'true' || req.body.imageUrl === '') {
            // If explicitly removing image or setting to empty
            if (existingSkill.cloudinaryImagePublicId) {
                await deleteImageFromCloudinary(existingSkill.cloudinaryImagePublicId);
                req.body.imageUrl = '';
                req.body.cloudinaryImagePublicId = '';
            }
        }

        const updatedSkill = await Skill.findByIdAndUpdate(
            id,
            req.body,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: "Skill updated successfully",
            skill: updatedSkill
        });
    } catch (error) {
        console.error("Error updating skill:", error);

        // Handle validation errors
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
            message: "Error updating skill",
            error: error.message
        });
    }
};

// Delete skill (protected)
const deleteSkill = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid skill ID format"
            });
        }

        // Get skill first to access Cloudinary public_id
        const skill = await Skill.findById(id);
        
        if (!skill) {
            return res.status(404).json({
                success: false,
                message: "Skill not found"
            });
        }

        // Delete image from Cloudinary if it exists
        if (skill.cloudinaryImagePublicId) {
            await deleteImageFromCloudinary(skill.cloudinaryImagePublicId);
        }

        // Delete skill from database
        await Skill.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: "Skill deleted successfully",
            skill
        });
    } catch (error) {
        console.error("Error deleting skill:", error);
        res.status(500).json({
            success: false,
            message: "Error deleting skill",
            error: error.message
        });
    }
};

module.exports = { getSkills, getSkill, addSkill, deleteSkill, updateSkill };
