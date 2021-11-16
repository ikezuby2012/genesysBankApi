const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const InventorySchema = new Schema({
    name: {
        type: String,
        required: [true, "inventory must have a name!"]
    },
    price: {
        type: Number,
        required: [true, "inventory must have a price!"],
        min: [1, "price must not be less than 1"],
    },
    quantity: {
        type: Number,
        required: [true, "inventory must have a quantity!"],
        min: [1, "quantity must not be less than 1"]
    }
});

const Inventory = model("Inventory", InventorySchema);
module.exports = Inventory;