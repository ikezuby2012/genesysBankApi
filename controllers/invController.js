const Inventory = require(`./../models/inventoryModel`);
const APIFeatures = require("../utils/apiFeatures");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

exports.getAllInventories = catchAsync(async (req, res, next) => {
    const features = new APIFeatures(Inventory.find(), req.query).filter().sort().limitFields().paginate();
    const inventories = await features.query;

    res.status(200).json({
        status: 'success',
        results: inventories.length,
        data: inventories
    });
});

exports.createInventory = catchAsync(async (req, res, next) => {
    const newInventory = await Inventory.create(req.body);

    console.log("working");

    res.status(201).json({
        status: "success",
        data: newInventory

    });

});

exports.getInventory = catchAsync(async (req, res, next) => {
    const inventory = await Inventory.findById(req.params.id);

    if (!inventory) {
        return next(new AppError('no inventory found with that ID', 404));
    }
    res.status(200).json({
        status: "success",
        data: inventory
    });
})

exports.updateInventory = catchAsync(async (req, res, next) => {
    const inventory = await Inventory.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if (!inventory) {
        return next(new AppError('unable to update inventory', 404));
    }

    res.status(201).json({
        status: "successful",
        data: inventory
    });
})

exports.deleteInventory = catchAsync(async (req, res, next) => {
    const inv = await Inventory.findByIdAndDelete(req.params.id);

    if (!inv) {
        return next(new AppError("No inventory found with that Id", 404));
    }
    res.status(204).json({
        status: "successful",
        data: null
    })
});