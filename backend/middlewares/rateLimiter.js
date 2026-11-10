// In-memory sliding window rate limiter for login protection
const loginAttempts = new Map();

const CLEANUP_INTERVAL = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 10;
const BLOCK_DURATION = 15 * 60 * 1000; // 15 minutes

// Periodic cleanup
setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of loginAttempts.entries()) {
        if (now - record.lastAttempt > BLOCK_DURATION) {
            loginAttempts.delete(ip);
        }
    }
}, CLEANUP_INTERVAL);

exports.loginRateLimiter = (req, res, next) => {
    const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
    const now = Date.now();

    const record = loginAttempts.get(ip) || { count: 0, firstAttempt: now, lastAttempt: now };

    // Reset count if window expired
    if (now - record.firstAttempt > BLOCK_DURATION) {
        record.count = 0;
        record.firstAttempt = now;
    }

    record.lastAttempt = now;
    record.count += 1;
    loginAttempts.set(ip, record);

    if (record.count > MAX_ATTEMPTS) {
        const remainingMinutes = Math.ceil((BLOCK_DURATION - (now - record.firstAttempt)) / 60000);
        return res.status(429).json({
            success: false,
            message: `Too many login attempts. For security, access is temporarily locked. Please try again in ${remainingMinutes} minutes.`
        });
    }

    // Attach success reset callback
    res.on('finish', () => {
        if (res.statusCode === 200 || res.statusCode === 201) {
            loginAttempts.delete(ip);
        }
    });

    next();
};
