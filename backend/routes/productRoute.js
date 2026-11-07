const express = require('express');
const {
    getAllProducts,
    getProductDetails,
    updateProduct,
    deleteProduct,
    getProductReviews,
    deleteReview,
    createProductReview,
    createProduct,
    getAdminProducts,
    getProducts,
    scrapeProductUrl,
    importProduct,
    setFeaturedGadgets,
    getFeaturedGadgets
} = require('../controllers/productController');
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');

const router = express.Router();

router.route('/products').get(getAllProducts);
router.route('/products/all').get(getProducts);
router.route('/featured-gadgets').get(getFeaturedGadgets);

// Auto-Sync / Restore Store Data (Products, Reviews, Banners)
router.route('/sync-store-data').get(async (req, res) => {
    try {
        const autoSyncData = require('../utils/autoSyncData');
        await autoSyncData();
        const Product = require('../models/productModel');
        const Banner = require('../models/bannerModel');
        const productCount = await Product.countDocuments();
        const bannerCount = await Banner.countDocuments();
        res.status(200).json({
            success: true,
            message: `Store data synced successfully! ${productCount} products and ${bannerCount} banners are active.`,
            productsCount: productCount,
            bannersCount: bannerCount
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Flipkart Import Endpoints (Accessible from Admin Panel)
router.route('/admin/product/scrape').post(isAuthenticatedUser, authorizeRoles("admin"), scrapeProductUrl);
router.route('/admin/product/import').post(isAuthenticatedUser, authorizeRoles("admin"), importProduct);
router.route('/admin/products/featured-gadgets').put(isAuthenticatedUser, authorizeRoles("admin"), setFeaturedGadgets);

router.route('/admin/products').get(isAuthenticatedUser, authorizeRoles("admin"), getAdminProducts);
router.route('/admin/product/new').post(isAuthenticatedUser, authorizeRoles("admin"), createProduct);

router.route('/admin/product/:id')
    .put(isAuthenticatedUser, authorizeRoles("admin"), updateProduct)
    .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteProduct);

router.route('/product/:id').get(getProductDetails);

router.route('/review').put(isAuthenticatedUser, createProductReview);

router.route('/admin/reviews')
    .get(isAuthenticatedUser, authorizeRoles("admin"), getProductReviews)
    .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteReview);

module.exports = router;