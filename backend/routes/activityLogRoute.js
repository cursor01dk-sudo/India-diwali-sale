const express = require('express');
const { getActivityLogs } = require('../controllers/activityLogController');
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');

const router = express.Router();

router.route('/admin/activity-logs').get(isAuthenticatedUser, authorizeRoles('admin', 'superadmin', 'staff'), getActivityLogs);

module.exports = router;
