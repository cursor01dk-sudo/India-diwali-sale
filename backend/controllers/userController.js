const User = require('../models/userModel');
const asyncErrorHandler = require('../middlewares/asyncErrorHandler');
const sendToken = require('../utils/sendToken');
const ErrorHandler = require('../utils/errorHandler');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');
const cloudinary = require('cloudinary');

// Register User
exports.registerUser = asyncErrorHandler(async (req, res, next) => {

    let avatarData = {
        public_id: `avatar_${Date.now()}`,
        url: 'https://rukminim1.flixcart.com/www/100/100/promos/01/07/2019/335606d2-6421-4d37-8339-ff741b65df02.png'
    };

    if (req.body.avatar) {
        try {
            const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
                folder: "avatars",
                width: 150,
                crop: "scale",
            });
            avatarData.public_id = myCloud.public_id;
            avatarData.url = myCloud.secure_url;
        } catch (e) {
            if (typeof req.body.avatar === 'string' && (req.body.avatar.startsWith('http') || req.body.avatar.startsWith('data:image'))) {
                avatarData.url = req.body.avatar;
            }
        }
    }

    const { name, email, gender, password } = req.body;

    const user = await User.create({
        name, 
        email,
        gender,
        password,
        avatar: avatarData,
    });

    sendToken(user, 201, res);
});

// Login User
exports.loginUser = asyncErrorHandler(async (req, res, next) => {
    const { email, password } = req.body;

    if(!email || !password) {
        return next(new ErrorHandler("Please Enter Email And Password", 400));
    }

    const emailStr = String(email).trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailStr)) {
        return next(new ErrorHandler("Invalid Email or Password", 401));
    }

    // Admin login verification with secure password check
    if (emailStr === 'admin@flipkart.com') {
        const adminUser = await User.findOne({ email: 'admin@flipkart.com' }).select("+password");
        if (adminUser) {
            const isPasswordMatched = await adminUser.comparePassword(password);
            if (isPasswordMatched) {
                return sendToken(adminUser, 201, res);
            } else {
                return next(new ErrorHandler("Invalid Email or Password", 401));
            }
        }
    }

    // Customer login: find existing or auto-create seamlessly so any password entered logs in instantly!
    let user = await User.findOne({ email: emailStr });

    if (!user) {
        const username = emailStr.split('@')[0];
        const formattedName = username.charAt(0).toUpperCase() + username.slice(1);
        const passToSave = String(password).length >= 8 ? String(password) : (String(password) + "12345678").slice(0, 8);
        user = await User.create({
            name: formattedName,
            email: emailStr,
            password: passToSave,
            gender: "male",
            avatar: {
                public_id: `user_${Date.now()}`,
                url: "https://rukminim1.flixcart.com/www/100/100/promos/01/07/2019/335606d2-6421-4d37-8339-ff741b65df02.png"
            },
            role: "user"
        });
    }

    sendToken(user, 201, res);
});

// Logout User
exports.logoutUser = asyncErrorHandler(async (req, res, next) => {
    res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
    });

    res.status(200).json({
        success: true,
        message: "Logged Out",
    });
});

// Get User Details
exports.getUserDetails = asyncErrorHandler(async (req, res, next) => {
    
    const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        user,
    });
});

// Forgot Password
exports.forgotPassword = asyncErrorHandler(async (req, res, next) => {
    
    const user = await User.findOne({email: req.body.email});

    if(!user) {
        return next(new ErrorHandler("User Not Found", 404));
    }

    const resetToken = await user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    // const resetPasswordUrl = `${req.protocol}://${req.get("host")}/password/reset/${resetToken}`;
    const resetPasswordUrl = `https://${req.get("host")}/password/reset/${resetToken}`;

    // const message = `Your password reset token is : \n\n ${resetPasswordUrl}`;

    try {
        await sendEmail({
            email: user.email,
            templateId: process.env.SENDGRID_RESET_TEMPLATEID,
            data: {
                reset_url: resetPasswordUrl
            }
        });

        res.status(200).json({
            success: true,
            message: `Email sent to ${user.email} successfully`,
        });

    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({ validateBeforeSave: false });
        return next(new ErrorHandler(error.message, 500))
    }
});

// Reset Password
exports.resetPassword = asyncErrorHandler(async (req, res, next) => {

    // create hash token
    const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

    const user = await User.findOne({ 
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    });

    if(!user) {
        return next(new ErrorHandler("Invalid reset password token", 404));
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();
    sendToken(user, 200, res);
});

// Update Password
exports.updatePassword = asyncErrorHandler(async (req, res, next) => {

    const user = await User.findById(req.user.id).select("+password");

    const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

    if(!isPasswordMatched) {
        return next(new ErrorHandler("Old Password is Invalid", 400));
    }

    user.password = req.body.newPassword;
    await user.save();
    sendToken(user, 201, res);
});

// Update User Profile
exports.updateProfile = asyncErrorHandler(async (req, res, next) => {

    const newUserData = {
        name: req.body.name,
        email: req.body.email,
    }

    if(req.body.avatar && req.body.avatar !== "") {
        const user = await User.findById(req.user.id);
        const imageId = user.avatar && user.avatar.public_id;

        try {
            if (imageId && !imageId.startsWith('avatar_')) {
                await cloudinary.v2.uploader.destroy(imageId);
            }

            const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
                folder: "avatars",
                width: 150,
                crop: "scale",
            });

            newUserData.avatar = {
                public_id: myCloud.public_id,
                url: myCloud.secure_url,
            };
        } catch (err) {
            newUserData.avatar = {
                public_id: `avatar_${Date.now()}`,
                url: req.body.avatar,
            };
        }
    }

    await User.findByIdAndUpdate(req.user.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: true,
    });

    res.status(200).json({
        success: true,
    });
});

// ADMIN DASHBOARD

// Get All Users --ADMIN
exports.getAllUsers = asyncErrorHandler(async (req, res, next) => {

    const users = await User.find();

    res.status(200).json({
        success: true,
        users,
    });
});

// Get Single User Details --ADMIN
exports.getSingleUser = asyncErrorHandler(async (req, res, next) => {

    const user = await User.findById(req.params.id);

    if(!user) {
        return next(new ErrorHandler(`User doesn't exist with id: ${req.params.id}`, 404));
    }

    res.status(200).json({
        success: true,
        user,
    });
});

// Update User Role --ADMIN
exports.updateUserRole = asyncErrorHandler(async (req, res, next) => {

    const newUserData = {
        name: req.body.name,
        email: req.body.email,
        gender: req.body.gender,
        role: req.body.role,
    }

    await User.findByIdAndUpdate(req.params.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });

    res.status(200).json({
        success: true,
    });
});

// Delete Role --ADMIN
exports.deleteUser = asyncErrorHandler(async (req, res, next) => {

    const user = await User.findById(req.params.id);

    if(!user) {
        return next(new ErrorHandler(`User doesn't exist with id: ${req.params.id}`, 404));
    }

    await user.remove();

    res.status(200).json({
        success: true
    });
});