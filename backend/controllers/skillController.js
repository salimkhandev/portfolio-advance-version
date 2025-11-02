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

const getSkills = async (req, res) => {
    try {
        const skills = await Skill.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: skills.length,
            skills
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching skills"
        });
    }
};

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
        res.status(500).json({
            success: false,
            message: "Error fetching skill"
        });
    }
};

const addSkill = async (req, res) => {
    try {
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

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Skill icon image is required"
            });
        }

        try {
            const fileInput = req.file.buffer || req.file.path;
            const imageResult = await uploadImageToCloudinary(
                fileInput,
                'skill-icons'
            );
            req.body.imageUrl = imageResult.url;
            req.body.cloudinaryImagePublicId = imageResult.public_id;
            } catch (uploadError) {
                return res.status(500).json({
                    success: false,
                    message: "Error uploading image to Cloudinary"
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
            message: "Error adding skill"
        });
    }
};

const updateSkill = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid skill ID format"
            });
        }

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

        if (req.file) {
            if (existingSkill.cloudinaryImagePublicId) {
                await deleteImageFromCloudinary(existingSkill.cloudinaryImagePublicId);
            }

            try {
                const fileInput = req.file.buffer || req.file.path;
                const imageResult = await uploadImageToCloudinary(
                    fileInput,
                    'skill-icons'
                );
                req.body.imageUrl = imageResult.url;
                req.body.cloudinaryImagePublicId = imageResult.public_id;
            } catch (uploadError) {
                return res.status(500).json({
                    success: false,
                    message: "Error uploading image to Cloudinary"
                });
            }
        } else if (req.body.removeImage === 'true' || req.body.imageUrl === '') {
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
            message: "Error updating skill"
        });
    }
};

const deleteSkill = async (req, res) => {
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

        if (skill.cloudinaryImagePublicId) {
            await deleteImageFromCloudinary(skill.cloudinaryImagePublicId);
        }

        await Skill.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: "Skill deleted successfully",
            skill
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error deleting skill"
        });
    }
};

module.exports = { getSkills, getSkill, addSkill, deleteSkill, updateSkill };
