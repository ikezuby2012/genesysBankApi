const User = require("../models/userModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

exports.getAllUsers = catchAsync(async (req, res, next) => {
    const users = await User.find();

    res.status(200).json({
        status: 'success',
        results: users.length,
        data: {
            users
        }
    });
});

exports.disableAccount = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.params.id, { active: false });


    res.status(204).json({
        status: "success",
        data: null
    });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
    await User.findByIdAndDelete(req.params.id);

    res.status(204).json({
        status: "success",
        data: null
    })
})