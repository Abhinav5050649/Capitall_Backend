const mongoose = require("mongoose")
const Schema = mongoose.Schema

const itemSchema = new Schema({
    itemName: {
        type: String,
        required: true,
    },
    itemDescription: {
        type: String,
        required: true
    },
    itemImageURL: [{
        type: String,
    }],
    itemPrice: {
        type: Number,
        required: true,
        default: 0
    },
    itemSeller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    itemSold: {
        type: Boolean,
        default: false,
        required: true,
    },
    itemBuyer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    }
});

const Item = mongoose.model('item', itemSchema);
module.exports = Item;