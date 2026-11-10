const mongoose = require('mongoose');
const ActivityLog = require('../models/activityLogModel');
const asyncErrorHandler = require('../middlewares/asyncErrorHandler');
const { inMemoryLogs } = require('../utils/activityLogger');

// Get Activity Logs --- ADMIN
exports.getActivityLogs = asyncErrorHandler(async (req, res, next) => {
    let logs = [];
    if (mongoose.connection.readyState === 1) {
        try {
            logs = await ActivityLog.find().sort({ createdAt: -1 }).limit(100);
        } catch (e) {
            logs = [];
        }
    }

    if (!logs || logs.length === 0) {
        logs = inMemoryLogs;
    }

    res.status(200).json({
        success: true,
        logs,
    });
});
