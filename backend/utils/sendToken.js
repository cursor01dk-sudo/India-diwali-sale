const sendToken = (user, statusCode, res) => {
    const token = user.getJWTToken();

    const isProduction = process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL);
    const expireDays = Number(process.env.COOKIE_EXPIRE) || 7;

    const options = {
        expires: new Date(Date.now() + expireDays * 24 * 60 * 60 * 1000),
        httpOnly: true,
        sameSite: 'lax',
        secure: isProduction,
    };

    res.status(statusCode).cookie('token', token, options).json({
        success: true,
        user,
        token,
    });
};

module.exports = sendToken;