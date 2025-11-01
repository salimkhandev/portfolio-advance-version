const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Title is required"],
        trim: true,
        maxlength: [200, "Title cannot exceed 200 characters"]
    },
    description: {
        type: String,
        required: [true, "Description is required"],
        trim: true
    },
    features: {
        type: [String],
        default: [],
        validate: {
            validator: function(arr) {
                return arr.length > 0;
            },
            message: "At least one feature is required"
        }
    },
    tools: {
        type: [String],
        default: [],
        validate: {
            validator: function(arr) {
                return arr.length > 0;
            },
            message: "At least one tool is required"
        }
    },
    githubLink: {
        type: String,
        trim: true,
        validate: {
            validator: function(v) {
                return !v || /^https?:\/\/.+/i.test(v);
            },
            message: "GitHub link must be a valid URL"
        }
    },
    deployedUrl: {
        type: String,
        trim: true,
        validate: {
            validator: function(v) {
                return !v || /^https?:\/\/.+/i.test(v);
            },
            message: "Deployed URL must be a valid URL"
        }
    },
    cloudinaryLink: {
        type: String,
        trim: true
    },
    cloudinaryVideoUrl: {
        type: String,
        trim: true
    },
    cloudinaryVideoPublicId: {
        type: String,
        trim: true
    },
    cloudinaryThumbnailUrl: {
        type: String,
        trim: true
    },
    cloudinaryThumbnailPublicId: {
        type: String,
        trim: true
    },
    duration: {
        type: String,
        trim: true
    },
    challenges: {
        type: String,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt field before saving
projectSchema.pre("save", function(next) {
    this.updatedAt = Date.now();
    next();
});

// Update the updatedAt field before updating
projectSchema.pre("findOneAndUpdate", function(next) {
    this.set({ updatedAt: Date.now() });
    next();
});

module.exports = mongoose.model("Project", projectSchema);
