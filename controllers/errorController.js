const AppError = require("../utils/AppError");

const handleCastErrorDB = err => {
    const message = `invalid ${err.path}: ${err.value}`;
    return new AppError(message, 400);
};
const handleDuplicateErrorDB = err => {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    const message = `duplicate field value ${value}. please use another value`;
    return new AppError(message, 400);
};

const handleJWTError = () =>
    new AppError("invalid token please login again", 401);

const handleTokenExpiredError = () =>
    new AppError("your token has expired!", 401);

module.exports = ((err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";

    if (process.env.NODE_ENV === "development") {
        if (req.originalUrl.startsWith("/api")) {
            return res.status(err.statusCode).json({
                status: err.status,
                message: err.message,
                error: err,
                stack: err.stack
            });
        }
    }

    if (process.env.NODE_ENV === "production") {
        let error = { ...err };
        error.message = err.message;
        if (error.name === "CastError") error = handleCastErrorDB(error);
        if (error.code === 11000) error = handleDuplicateErrorDB(error);
        if (error.name === "validationError") error = handleValidationErrorDB(error);

        //<-- validation error handling
        if (error.name === "JsonWebTokenError") error = handleJWTError();
        if (error.name === "TokenExpiredError") error = handleTokenExpiredError();
        //operational, trusted error: send message to the client
        if (req.originalUrl.startsWith("/api")) {
            if (err.isOperation) {
                return res.status(err.statusCode).json({
                    status: err.status,
                    message: err.message,
                });
                //programming or unknown error
            }
            console.error("ERROR", err);
            return res.status(500).json({
                status: "error",
                message: "something went very wrong"
            })

        }
    }
});

// module.exports = app;