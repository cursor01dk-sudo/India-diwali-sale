const jwt = require('jsonwebtoken');

const sendToken = (user, statusCode, res) => {
    let token;
    if (user.getJWTToken && typeof user.getJWTToken === 'function') {
        token = user.getJWTToken();
    } else {
        token = jwt.sign(
            { id: user._id || user.id, role: user.role || 'user', email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || '7d' }
        );
    }

    const isProduction = process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL);
    const expireDays = Number(process.env.COOKIE_EXPIRE) || 7;
    const isCrossDomain = Boolean(process.env.FRONTEND_URL || process.env.ADMIN_URL);

    const options = {
        expires: new Date(Date.now() + expireDays * 24 * 60 * 60 * 1000),
        httpOnly: true,
        sameSite: isProduction ? (isCrossDomain ? 'none' : 'lax') : 'lax',
        secure: isProduction,
    };

    const safeUser = { ...(user._doc || user) };
    delete safeUser.password;

    res.status(statusCode).cookie('token', token, options).json({
        success: true,
        user: safeUser,
        token,
    });
};

module.exports = sendToken;
