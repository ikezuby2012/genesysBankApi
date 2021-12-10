const Transaction = require("../models/transactionModel");
const User = require("../models/userModel");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const APIFeatures = require("../utils/apiFeatures");
const mongoose = require("mongoose");

exports.getAllTransactions = catchAsync(async (req, res, next) => {
    const features = new APIFeatures(Transaction.find(), req.query).filter().sort().limitFields().paginate();
    const transactions = await features.query;

    res.status(200).json({
        status: 'success',
        results: transactions.length,
        data: transactions
    });

});

exports.getTransaction = catchAsync(async (req, res, next) => {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
        return next(new AppError("no transaction found with that id", 404));
    }


    res.status(200).json({
        status: "success",
        data: transaction
    })
});

exports.getTransactionByUserId = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const data = await Transaction.aggregate([
        {
            $match: {
                "user": mongoose.Types.ObjectId(id)
            }
        },
        {
            $sort: {
                created_at: -1
            }
        }
    ]);

    if (!data) {
        return next(new AppError("could not fetch data!", 401));
    }

    res.status(200).json({
        status: "success",
        data
    })
});

exports.deposit = catchAsync(async (req, res, next) => {
    const { amount, transaction_type, user } = req.body;

    //increment user balance
    if (!transaction_type === "deposit") {
        return next(new AppError("please use the withdrawal route", 500));
    }
    const _user = await User.updateOne({ _id: user }, { $inc: { current_balance: amount } });
    if (!_user) {
        return next(new AppError("deposit failed", 403));
    }
    const checkUser = await User.findOne({ _id: user });
    const balance = checkUser.current_balance;
    // console.log(balance);
    if (!checkUser) {
        return next(new AppError("user does not exist", 401));
    }

    //save transaction
    const transaction = await Transaction.create({
        user,
        amount,
        transaction_type,
        balance
    });

    //done
    res.status(200).json({
        status: "success",
        data: checkUser
    });
});

exports.withdrawal = catchAsync(async (req, res, next) => {
    const { amount, transaction_type, user } = req.body;

    //increment user balance
    if (!transaction_type === "withdrawal") {
        return next(new AppError("please use the deposit route", 500));
    }
    const _user = await User.findOneAndUpdate(
        {
            _id: user,
            current_balance: { $gt: 0 }
        },
        { $inc: { current_balance: -amount } },
        {
            new: true
        });
    if (!_user) {
        return next(new AppError("insufficient fund", 403));
    }
    const checkUser = await User.findOne({ _id: user });
    const balance = checkUser.current_balance;
    if (!checkUser) {
        return next(new AppError("user does not exist", 401));
    }
    //save transaction
    const transaction = await Transaction.create({
        user,
        amount,
        transaction_type,
        balance
    });
    //done
    res.status(200).json({
        status: "success",
        data: checkUser
    });
});

exports.transfer = catchAsync(async (req, res, next) => {
    const { amount, transaction_type, user } = req.body;

    if (!transaction_type === "withdrawal" && !transaction_type === "deposit") {
        return next(new AppError("please use the deposit or withdrawal route", 500));
    }
    //check if receiver exist
    const checkReceiver = await User.findOne({ _id: req.params.id });
    if (!checkReceiver) {
        return next(new AppError("the account you transferring to does not exist", 404))
    }

    //decrement fund from sender current_balance
    const _user = await User.findOneAndUpdate(
        {
            _id: user,
            current_balance: { $gt: 0 }
        },
        { $inc: { current_balance: -amount } },
        {
            new: true
        });
    if (!_user) {
        return next(new AppError("transfer failed, check your current balance", 401));
    }
    //increment receiver current_balance
    const updateReceiver = await User.updateOne({ _id: req.params.id },
        { $inc: { current_balance: amount } });

    if (!updateReceiver) {
        return next(new AppError("transfer  failed", 403));
    }


    const checkUser = await User.findOne({ _id: user });
    const balance = checkUser.current_balance;
    if (!checkUser) {
        return next(new AppError("user does not exist", 401));
    }
    //save transaction
    const transaction = await Transaction.create({
        user,
        amount,
        transaction_type,
        balance
    });

    //done
    res.status(200).json({
        status: "success",
        data: transaction
    });

});

exports.reverseTransfer = catchAsync(async (req, res, next) => {
    const { amount, transaction_type, user } = req.body;

    if (!transaction_type === "withdrawal" && !transaction_type === "deposit") {
        return next(new AppError("please use the deposit or withdrawal route", 500));
    }

    //check if receiver exist
    const checkReceiver = await User.findOne({ _id: req.params.id });
    if (!checkReceiver) {
        return next(new AppError("the account you does not exist", 404))
    }
    //decrement fund from receiver current_balance
    const receiver = await User.findOneAndUpdate(
        {
            _id: req.params.id,
            current_balance: { $gt: 0 }
        },
        { $inc: { current_balance: -amount } },
        {
            new: true
        });
    if (!receiver) {
        return next(new AppError("reverse failed", 401));
    }
    //increment receiver current_balance
    const updateSender = await User.updateOne({ _id: user },
        { $inc: { current_balance: amount } });

    if (!updateSender) {
        return next(new AppError("transfer  failed", 403));
    }

    const checkUser = await User.findOne({ _id: user });
    const balance = checkUser.current_balance;
    if (!checkUser) {
        return next(new AppError("user does not exist", 401));
    }
    //save transaction
    const transaction = await Transaction.create({
        user,
        amount,
        transaction_type,
        balance
    });

    //done
    res.status(200).json({
        status: "success",
        data: transaction
    })
});