const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ["private", "public"],
        default: "public",
        required: true
    },
    password: {
        type: String,
        required: false
    },
    createdAt: {
        type: Date,
        immutable: true,
        default: () => Date.now(),
        required: true,
    },
    updatedAt: {
        type: Date,
        default: () => Date.now(),
        required: true,
    },
    messages: [{
        content: {
            type: String,
            required: true,
        },
        userId: {
            type: mongoose.SchemaTypes.ObjectId,
            immutable: true,
            required: true
        },
        postedAt: {
            type: Date,
            immutable: true,
            default: () => Date.now(),
            required: true,
        },
        updatedAt: {
            type: Date,
            default: () => Date.now(),
            required: true,
        },
    }]
});

const Room = mongoose.model('room', schema);
module.exports = Room;