const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const transactionSchema = new Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: [true, 'transaction must belong to a User']
    },
    amount: {
        type: Number,
        min: [1, "amount should not be less than 1"],
        required: [true, "amount not specified!"]
    },
    transaction_type: {
        type: String,
        enum: {
            values: ["deposit", "withdrawal", "transfer"],
            message: "transaction type is either deposit user, withdrawal, or transfer"
        },
        required: [true, "transaction type must be specified!"]
    },
    balance: {
        type: Number,
        default: 0
    }
}, {
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at"
    },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});

transactionSchema.pre(/^find/, function (next) {
    this.populate({
        path: "user",
        select: "name email accountNumber current_balance role"
    })
    next();
});


const Transaction = model("Transaction", transactionSchema);
module.exports = Transaction;