const Cart = require("../models/cartModel");
const Inventory = require(`../models/inventoryModel`);
const APIFeatures = require("../utils/apiFeatures");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

exports.addToCart = catchAsync(async (req, res, next) => {
    const { inventory, user } = req.body;
    let inv;
    const newCart = await Cart.create(req.body);

    //check if inventory exist
    const checkInv = await Inventory.findOne({ inventory });
    // if inventory exist, add to cart and reduce quantity
    if (checkInv) {
        inv = await Inventory.updateOne({ _id: inventory, quantity: { $gt: 0 } }, { $inc: { quantity: -1 } });
    }
    if (!inv) {
        return next(new AppError("update failed", 403));
    }

    res.status(201).json({
        status: "success",
        cart: newCart
    })
});

exports.getCart = catchAsync(async (req, res, next) => {
    const cart = await Cart.findById(req.params.id);
    // .populate("inventory").populate("user");

    if (!cart) {
        return next(new AppError("no cart found with that id", 404));
    }


    res.status(200).json({
        status: "success",
        data: cart
    })
});

exports.getAllCart = catchAsync(async (req, res, next) => {
    const features = new APIFeatures(Cart.find(), req.query).filter().sort().limitFields().paginate();
    const carts = await features.query;

    res.status(200).json({
        status: 'success',
        results: carts.length,
        data: carts
    });
})