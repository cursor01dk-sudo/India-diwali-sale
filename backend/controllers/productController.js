const fs = require('fs');
const path = require('path');
const Product = require('../models/productModel');
const asyncErrorHandler = require('../middlewares/asyncErrorHandler');
const SearchFeatures = require('../utils/searchFeatures');
const ErrorHandler = require('../utils/errorHandler');
const cloudinary = require('cloudinary');
const { ensureProductReviews } = require('../utils/autoReviewGenerator');

// Get All Products
exports.getAllProducts = asyncErrorHandler(async (req, res, next) => {

    const resultPerPage = 24;
    const productsCount = await Product.countDocuments();

    const searchFeature = new SearchFeatures(Product.find(), req.query)
        .search()
        .filter()
        .sort();

    let products = await searchFeature.query;
    let filteredProductsCount = products.length;
    let isFallback = false;

    // Graceful fallback: If a category or filter returns 0 products, 
    // fall back to showing all products from the store library so visitors never see a dead "No results found" screen
    if (products.length === 0 && !req.query.keyword) {
        const currentPage = Number(req.query.page) || 1;
        const skipProducts = resultPerPage * (currentPage - 1);
        products = await Product.find().sort({ isTopSelling: -1, priority: -1, createdAt: -1 }).skip(skipProducts).limit(resultPerPage);
        filteredProductsCount = productsCount;
        isFallback = true;
    } else {
        searchFeature.pagination(resultPerPage);
        products = await searchFeature.query.clone();
    }

    res.status(200).json({
        success: true,
        products,
        productsCount,
        resultPerPage,
        filteredProductsCount,
        isFallback,
    });
});

// Get All Products ---Product Sliders
exports.getProducts = asyncErrorHandler(async (req, res, next) => {
    const products = await Product.find().sort({ isTopSelling: -1, priority: -1, createdAt: -1 });

    res.status(200).json({
        success: true,
        products,
    });
});

// Get Product Details
exports.getProductDetails = asyncErrorHandler(async (req, res, next) => {

    const product = await Product.findById(req.params.id);

    if (!product) {
        return next(new ErrorHandler("Product Not Found", 404));
    }

    res.status(200).json({
        success: true,
        product,
    });
});

// Get All Products ---ADMIN
exports.getAdminProducts = asyncErrorHandler(async (req, res, next) => {
    const products = await Product.find().sort({ isTopSelling: -1, priority: -1, createdAt: -1 });

    res.status(200).json({
        success: true,
        products,
    });
});

// Create Product ---ADMIN
exports.createProduct = asyncErrorHandler(async (req, res, next) => {
    let images = [];
    if (typeof req.body.images === "string") {
        images.push(req.body.images);
    } else if (Array.isArray(req.body.images)) {
        images = req.body.images;
    }

    const imagesLink = [];

    for (let i = 0; i < images.length; i++) {
        const item = images[i];
        if (!item) continue;

        // If it's already an object with url
        if (typeof item === 'object' && item.url) {
            imagesLink.push({
                public_id: item.public_id || `prod_img_${Date.now()}_${i}`,
                url: item.url
            });
            continue;
        }

        const imgStr = typeof item === 'string' ? item : '';
        if (imgStr.startsWith('http://') || imgStr.startsWith('https://') || imgStr.startsWith('/assets/')) {
            imagesLink.push({
                public_id: `prod_img_${Date.now()}_${i}`,
                url: imgStr
            });
        } else if (imgStr.startsWith('data:image')) {
            try {
                const result = await cloudinary.v2.uploader.upload(imgStr, { folder: "products" });
                imagesLink.push({
                    public_id: result.public_id,
                    url: result.secure_url
                });
            } catch (err) {
                imagesLink.push({
                    public_id: `prod_img_${Date.now()}_${i}`,
                    url: imgStr
                });
            }
        }
    }

    if (imagesLink.length === 0) {
        imagesLink.push({
            public_id: `prod_img_${Date.now()}`,
            url: '/assets/products/zebronics_speaker.jpg'
        });
    }

    let brandLogo = {
        public_id: `brand_logo_${Date.now()}`,
        url: 'https://rukminim1.flixcart.com/www/100/100/promos/01/07/2019/335606d2-6421-4d37-8339-ff741b65df02.png'
    };

    if (req.body.logo && typeof req.body.logo === 'string') {
        if (req.body.logo.startsWith('http://') || req.body.logo.startsWith('https://')) {
            brandLogo.url = req.body.logo;
        } else if (req.body.logo.startsWith('data:image')) {
            try {
                const result = await cloudinary.v2.uploader.upload(req.body.logo, { folder: "brands" });
                brandLogo.public_id = result.public_id;
                brandLogo.url = result.secure_url;
            } catch (err) {
                brandLogo.url = req.body.logo;
            }
        }
    }

    let brandName = "Flipkart Assured";
    if (typeof req.body.brandname === 'string' && req.body.brandname.trim()) {
        brandName = req.body.brandname.trim();
    } else if (typeof req.body.brand === 'string' && req.body.brand.trim()) {
        brandName = req.body.brand.trim();
    } else if (req.body.brand && typeof req.body.brand.name === 'string' && req.body.brand.name.trim()) {
        brandName = req.body.brand.name.trim();
    }

    req.body.brand = {
        name: brandName,
        logo: brandLogo
    };

    if (!req.body.description || !req.body.description.trim()) {
        req.body.description = req.body.name || "Premium certified product on Flipkart.";
    }

    req.body.images = imagesLink;
    if (req.user) req.body.user = req.user.id;

    // Handle specifications safely
    let specs = [];
    if (Array.isArray(req.body.specifications)) {
        req.body.specifications.forEach((s) => {
            if (typeof s === 'string') {
                try { specs.push(JSON.parse(s)); } catch (e) { specs.push({ title: 'Feature', description: s }); }
            } else if (typeof s === 'object') {
                specs.push(s);
            }
        });
    }
    req.body.specifications = specs;

    // Default cuttedPrice if not provided
    if (!req.body.cuttedPrice || Number(req.body.cuttedPrice) <= Number(req.body.price)) {
        req.body.cuttedPrice = Math.round(Number(req.body.price || 999) * 1.5);
    }

    // Default highlights
    if (!req.body.highlights || !Array.isArray(req.body.highlights) || req.body.highlights.length === 0) {
        req.body.highlights = ["100% Genuine Certified Product", "Flipkart Assured Quality", "7 Days Replacement Guarantee"];
    }

    // Automatically generate 40+ to 80+ realistic customer reviews & ratings
    ensureProductReviews(req.body);

    const product = await Product.create(req.body);

    res.status(201).json({
        success: true,
        product
    });
});

// Update Product ---ADMIN
exports.updateProduct = asyncErrorHandler(async (req, res, next) => {

    let product = await Product.findById(req.params.id);

    if (!product) {
        return next(new ErrorHandler("Product Not Found", 404));
    }

    if (req.body.images !== undefined) {
        let images = [];
        if (typeof req.body.images === "string") {
            images.push(req.body.images);
        } else if (Array.isArray(req.body.images)) {
            images = req.body.images;
        }

        const imagesLink = [];

        for (let i = 0; i < images.length; i++) {
            const item = images[i];
            if (!item) continue;

            // 1. If it's already an object with url
            if (typeof item === 'object' && item.url) {
                imagesLink.push({
                    public_id: item.public_id || `prod_img_${Date.now()}_${i}`,
                    url: item.url
                });
                continue;
            }

            // 2. If it's a string URL or path
            const imgStr = typeof item === 'string' ? item.trim() : '';
            if (imgStr.startsWith('http://') || imgStr.startsWith('https://') || imgStr.startsWith('/assets/') || imgStr.startsWith('/uploads/')) {
                imagesLink.push({
                    public_id: `prod_img_${Date.now()}_${i}`,
                    url: imgStr
                });
            } else if (imgStr.startsWith('data:image')) {
                // Save locally to frontend/public/uploads if base64
                let savedLocally = false;
                try {
                    const uploadDir = path.join(__dirname, '../../frontend/public/uploads');
                    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
                    const matches = imgStr.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
                    if (matches) {
                        const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
                        const filename = `prod_${Date.now()}_${i}.${ext}`;
                        fs.writeFileSync(path.join(uploadDir, filename), matches[2], 'base64');
                        imagesLink.push({
                            public_id: `prod_img_${Date.now()}_${i}`,
                            url: `/uploads/${filename}`
                        });
                        savedLocally = true;
                    }
                } catch (e) {
                    // ignore
                }

                if (!savedLocally) {
                    try {
                        const result = await cloudinary.v2.uploader.upload(imgStr, { folder: "products" });
                        imagesLink.push({
                            public_id: result.public_id,
                            url: result.secure_url
                        });
                    } catch (err) {
                        imagesLink.push({
                            public_id: `prod_img_${Date.now()}_${i}`,
                            url: imgStr
                        });
                    }
                }
            }
        }

        if (imagesLink.length > 0) {
            req.body.images = imagesLink;
        }
    }

    // Brand / Logo handling safely
    if (req.body.logo && typeof req.body.logo === 'string' && req.body.logo.trim().length > 0) {
        req.body.brand = {
            name: req.body.brandname || (product.brand && product.brand.name) || "Flipkart Assured",
            logo: {
                public_id: `brand_logo_${Date.now()}`,
                url: req.body.logo
            }
        };
    } else if (req.body.brandname) {
        req.body.brand = {
            ...(product.brand || {}),
            name: req.body.brandname
        };
    }

    // Specifications safe parsing
    if (req.body.specifications && Array.isArray(req.body.specifications)) {
        let specs = [];
        req.body.specifications.forEach((s) => {
            if (typeof s === 'string') {
                try {
                    specs.push(JSON.parse(s));
                } catch (e) {
                    specs.push({ title: "Feature", description: s });
                }
            } else if (typeof s === 'object') {
                specs.push(s);
            }
        });
        req.body.specifications = specs;
    }

    // Review Images handling safely
    if (req.body.reviewImages !== undefined && Array.isArray(req.body.reviewImages)) {
        req.body.reviewImages = req.body.reviewImages.map((img, i) => {
            if (typeof img === 'string') {
                return { public_id: `rev_img_${Date.now()}_${i}`, url: img.trim() };
            }
            if (img && typeof img === 'object' && img.url) {
                return { public_id: img.public_id || `rev_img_${Date.now()}_${i}`, url: img.url.trim() };
            }
            return null;
        }).filter(Boolean);
    }

    // Customer Reviews & Ratings sync
    if (req.body.reviews !== undefined && Array.isArray(req.body.reviews)) {
        req.body.numOfReviews = req.body.reviews.length;
        if (req.body.reviews.length > 0) {
            const sum = req.body.reviews.reduce((acc, r) => acc + (Number(r.rating) || 5), 0);
            req.body.ratings = Number((sum / req.body.reviews.length).toFixed(1));
        }
    }

    if (req.user && req.user.id) {
        req.body.user = req.user.id;
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });

    res.status(200).json({
        success: true,
        product
    });
});

// Delete Product ---ADMIN
exports.deleteProduct = asyncErrorHandler(async (req, res, next) => {

    const product = await Product.findById(req.params.id);

    if (!product) {
        return next(new ErrorHandler("Product Not Found", 404));
    }

    try {
        if (product.images && product.images.length > 0) {
            for (let i = 0; i < product.images.length; i++) {
                if (product.images[i].public_id && !product.images[i].public_id.startsWith('prod_img_')) {
                    await cloudinary.v2.uploader.destroy(product.images[i].public_id);
                }
            }
        }
    } catch (err) {
        // Safe fallback - don't crash deletion
    }

    await product.remove();

    res.status(200).json({
        success: true,
        message: "Product deleted successfully"
    });
});

// Create OR Update Reviews
exports.createProductReview = asyncErrorHandler(async (req, res, next) => {

    const { rating, comment, productId, name } = req.body;

    const isUserAdmin = req.user.role === 'admin' || (req.user.name && req.user.name.toLowerCase().includes('admin'));
    const reviewerName = name && !name.toLowerCase().includes('admin') 
        ? name 
        : (isUserAdmin ? "Verified Customer" : req.user.name);

    const review = {
        user: req.user._id,
        name: reviewerName,
        rating: Number(rating),
        comment,
    }

    const product = await Product.findById(productId);

    if (!product) {
        return next(new ErrorHandler("Product Not Found", 404));
    }

    const isReviewed = product.reviews.find(review => review.user.toString() === req.user._id.toString());

    if (isReviewed) {

        product.reviews.forEach((rev) => { 
            if (rev.user.toString() === req.user._id.toString())
                (rev.rating = rating, rev.comment = comment);
        });
    } else {
        product.reviews.push(review);
        product.numOfReviews = product.reviews.length;
    }

    let avg = 0;

    product.reviews.forEach((rev) => {
        avg += rev.rating;
    });

    product.ratings = avg / product.reviews.length;

    await product.save({ validateBeforeSave: false });

    res.status(200).json({
        success: true
    });
});

// Get All Reviews of Product
exports.getProductReviews = asyncErrorHandler(async (req, res, next) => {

    const product = await Product.findById(req.query.id);

    if (!product) {
        return next(new ErrorHandler("Product Not Found", 404));
    }

    res.status(200).json({
        success: true,
        reviews: product.reviews
    });
});

// Delete Reveiws
exports.deleteReview = asyncErrorHandler(async (req, res, next) => {

    const product = await Product.findById(req.query.productId);

    if (!product) {
        return next(new ErrorHandler("Product Not Found", 404));
    }

    const reviews = product.reviews.filter((rev) => rev._id.toString() !== req.query.id.toString());

    let avg = 0;

    reviews.forEach((rev) => {
        avg += rev.rating;
    });

    let ratings = 0;

    if (reviews.length === 0) {
        ratings = 0;
    } else {
        ratings = avg / reviews.length;
    }

    const numOfReviews = reviews.length;

    await Product.findByIdAndUpdate(req.query.productId, {
        reviews,
        ratings: Number(ratings),
        numOfReviews,
    }, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });

    res.status(200).json({
        success: true,
    });
});

const { scrapeFlipkartProduct } = require('../utils/flipkartScraper');

// Scrape product from any Flipkart URL --- ADMIN
exports.scrapeProductUrl = asyncErrorHandler(async (req, res, next) => {
    const { url } = req.body;
    if (!url) {
        return next(new ErrorHandler("Please provide a Flipkart product URL", 400));
    }

    try {
        const productData = await scrapeFlipkartProduct(url);
        res.status(200).json({
            success: true,
            productData
        });
    } catch (error) {
        return next(new ErrorHandler(error.message || "Failed to fetch Flipkart product details", 500));
    }
});

// Import and save scraped product with custom adjusted prices --- ADMIN
exports.importProduct = asyncErrorHandler(async (req, res, next) => {
    const productData = req.body;
    if (!productData || !productData.name || !productData.price) {
        return next(new ErrorHandler("Product name and price are required", 400));
    }

    if (!productData.cuttedPrice || Number(productData.cuttedPrice) <= Number(productData.price)) {
        productData.cuttedPrice = Math.round(Number(productData.price) * 1.5);
    }

    // Default image if missing
    if (!productData.images || productData.images.length === 0) {
        productData.images = [{ public_id: `fk_img_${Date.now()}`, url: '/assets/products/zebronics_speaker.jpg' }];
    }

    // Format reviewImages
    if (productData.reviewImages !== undefined && Array.isArray(productData.reviewImages)) {
        productData.reviewImages = productData.reviewImages.map((img, i) => {
            if (typeof img === 'string') {
                return { public_id: `rev_img_${Date.now()}_${i}`, url: img.trim() };
            }
            if (img && typeof img === 'object' && img.url) {
                return { public_id: img.public_id || `rev_img_${Date.now()}_${i}`, url: img.url.trim() };
            }
            return null;
        }).filter(Boolean);
    }

    // Automatically enrich with 40+ to 80+ realistic customer reviews & ratings
    ensureProductReviews(productData);

    const product = await Product.create(productData);

    res.status(201).json({
        success: true,
        message: "Product imported successfully into store!",
        product
    });
});

// Bulk Update Featured Products for "Best Gadgets & Appliances" --- ADMIN
exports.setFeaturedGadgets = asyncErrorHandler(async (req, res, next) => {
    const { productIds } = req.body;
    if (!Array.isArray(productIds)) {
        return next(new ErrorHandler("productIds array is required", 400));
    }

    // Set inBestGadgets: false for all products not in productIds
    await Product.updateMany({ _id: { $nin: productIds } }, { inBestGadgets: false });

    // Set inBestGadgets: true for all products in productIds
    await Product.updateMany({ _id: { $in: productIds } }, { inBestGadgets: true });

    const featuredProducts = await Product.find({ inBestGadgets: true });

    res.status(200).json({
        success: true,
        message: "Best Gadgets products updated successfully!",
        featuredProducts
    });
});

// Get Featured Products for "Best Gadgets & Appliances"
exports.getFeaturedGadgets = asyncErrorHandler(async (req, res, next) => {
    const products = await Product.find({ inBestGadgets: true });

    res.status(200).json({
        success: true,
        products
    });
});
