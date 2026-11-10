const mongoose = require('mongoose');
const ActivityLog = require('../models/activityLogModel');
const { notifyAdmin, EVENTS } = require('../sockets/socketServer');

const inMemoryLogs = [
    {
        _id: 'log_init_1',
        admin: {
            id: 'admin_id',
            name: 'Store Administrator',
            email: 'admin@flipkart.com',
            role: 'superadmin',
        },
        action: 'SYSTEM_STARTUP',
        entityType: 'system',
        entityId: 'sys',
        details: 'Admin Suite & Real-Time Sync Engine activated',
        ipAddress: '127.0.0.1',
        createdAt: new Date(),
    },
];

/**
 * Record an administrative action into MongoDB and notify admin sockets in real-time
 */
async function recordActivity(req, { action, entityType, entityId, details }) {
    try {
        const adminData = {
            id: req.user?._id || req.user?.id || 'admin_id',
            name: req.user?.name || 'Administrator',
            email: req.user?.email || 'admin@flipkart.com',
            role: req.user?.role || 'admin',
        };

        const ipAddress = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '';

        const logEntry = {
            admin: adminData,
            action,
            entityType,
            entityId: String(entityId || ''),
            details: String(details || ''),
            ipAddress,
            createdAt: new Date(),
        };

        let saved = null;
        if (mongoose.connection.readyState === 1) {
            try {
                saved = await ActivityLog.create(logEntry);
            } catch (dbErr) {
                saved = null;
            }
        }
        if (!saved) {
            saved = { ...logEntry, _id: `log_${Date.now()}` };
            inMemoryLogs.unshift(saved);
        }

        // Notify connected admin dashboards
        notifyAdmin(EVENTS.ACTIVITY_LOGGED, saved);
        return saved;
    } catch (err) {
        console.warn('[ActivityLogger]: Error logging activity:', err.message);
        return null;
    }
}

module.exports = {
    recordActivity,
    inMemoryLogs,
};
