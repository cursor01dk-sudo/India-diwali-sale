const express = require('express');
const { getWebsiteContent, updateWebsiteContent } = require('../controllers/contentController');
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');

const router = express.Router();

router.route('/content').get(getWebsiteContent);
router.route('/admin/content').put(isAuthenticatedUser, authorizeRoles('admin', 'superadmin'), updateWebsiteContent);

module.exports = router;
