const express = require('express');
const {
    getAllBanners,
    createBanner,
    updateBanner,
    deleteBanner,
    resetBanners,
    uploadImage
} = require('../controllers/bannerController');
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');

const router = express.Router();

router.route('/banners').get(getAllBanners);

router.route('/admin/banners/reset').post(isAuthenticatedUser, authorizeRoles("admin"), resetBanners);
router.route('/admin/banner/upload').post(isAuthenticatedUser, authorizeRoles("admin"), uploadImage);
router.route('/admin/banner/new').post(isAuthenticatedUser, authorizeRoles("admin"), createBanner);
router.route('/admin/banner/:id')
    .put(isAuthenticatedUser, authorizeRoles("admin"), updateBanner)
    .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteBanner);

module.exports = router;
