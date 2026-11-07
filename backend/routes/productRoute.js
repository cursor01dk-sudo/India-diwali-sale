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