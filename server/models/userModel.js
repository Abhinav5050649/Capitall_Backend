const mongoose = require("mongoose")
const Schema = mongoose.Schema

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    itemsPosted: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'item',
    }],
    itemsPurchased: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'item'
    }]
});

const User = mongoose.model('user', userSchema);
module.exports = User;