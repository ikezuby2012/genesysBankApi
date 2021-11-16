const mongoose = require("mongoose");

const { Schema, model } = mongoose;

const cartSchema = new Schema({
    inventory: {
        type: mongoose.Schema.ObjectId,
        ref: "Inventory",
        required: [true, "cart must have an inventory"]
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: [true, 'inventory must belong to a User']
    },
    quantity: {
        type: Number,
        min: [1, "quantity must not be less than 0"]
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    paid: {
        type: Boolean,
        default: false
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});

cartSchema.pre(/^find/, function (next) {
    this.populate("user").populate({
        path: "inventory",
        select: "name price"
    })
    next();
});

const Cart = model("Cart", cartSchema);
module.exports = Cart;