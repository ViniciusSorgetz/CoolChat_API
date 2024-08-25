const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    nick: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});

const User = mongoose.model('user', schema);
module.exports = User;