const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const { Schema, model } = mongoose;

const UserSchema = new Schema({
    name: {
        type: String,
        required: [true, "user must have a name!"]
    },
    email: {
        type: String,
        required: [true, "please provide an email address!"],
        unique: true,
        lowerCase: true,
        validate: [validator.isEmail, "please provide a valid email address"]
    },
    password: {
        type: String,
        required: [true, "please provide a password!"],
        minLength: [8, "password must have 8 or more characters"],
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, "please confirm your password!"],
        minLength: [8, "password must have 8 or more characters"],
        validate: {
            validator: function (el) {
                //this works on save()
                return el === this.password;
            },
            message: "passwords does not match!"
        }
    },
    role: {
        type: String,
        enum: {
            values: ["user", "admin"],
            message: "role is either user or admin"
        },
        default: "user"
    },
    passwordChangedAt: Date,
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});

UserSchema.pre("save", async function (next) {
    // only run this function if password is not modified
    if (!this.isModified('password')) return next();
    //hash the password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);
    //delete passwordConfirm field
    this.passwordConfirm = undefined;
    next();
});

UserSchema.pre("save", function (next) {
    if (!this.isModified("password") || this.isNew) return next();

    this.passwordChangedAt = Date.now - 1000; // token may be created before timeStamp so we subtract 1s
    next();
});

UserSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

UserSchema.methods.changePassword = function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changeTS = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        console.log(changeTS, JWTTimestamp)

        return JWTTimestamp < changeTS;
    }
    // false means not changed
    return false;
};


const User = model("User", UserSchema);
module.exports = User;