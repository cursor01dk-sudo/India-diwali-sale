const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const ErrorHandler = require('../utils/errorHandler');
const asyncErrorHandler = require('./asyncErrorHandler');

exports.isAuthenticatedUser = asyncErrorHandler(async (req, res, next) => {
    let token = req.cookies?.token;

    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token && req.headers['x-auth-token']) {
        token = req.headers['x-auth-token'];
    }

    if (!token) {
        return next(new ErrorHandler("Please Login to Access", 401));
    }

    try {
        const decodedData = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decodedData.id);
        if (!req.user) {
            return next(new ErrorHandler("User session not found", 401));
        }
        next();
    } catch (err) {
        return next(new ErrorHandler("Invalid or expired session. Please login again.", 401));
    }
});

exports.optionalAuth = asyncErrorHandler(async (req, res, next) => {
    let token = req.cookies?.token;

    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token && req.headers['x-auth-token']) {
        token = req.headers['x-auth-token'];
    }

    if (token) {
        try {
            const decodedData = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decodedData.id);
        } catch (err) {
            // Guest checkout - proceed without user
        }
    }
    next();
});

exports.authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return next(new ErrorHandler(`Access Denied: Role (${req.user?.role || 'Guest'}) is not authorized to access this resource`, 403));
        }
        next();
    };
};
