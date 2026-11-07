const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Banner = require('../models/bannerModel');
const asyncErrorHandler = require('../middlewares/asyncErrorHandler');
const ErrorHandler = require('../utils/errorHandler');

// Default initial banners matching both uploaded screenshots
const defaultBanners = [
    // 1. Massive Festive Hero Banner
    {
        title: "BIG BANG DIWALI | BANK OFFER REFRESHED",
        subtitle: "Sale is live • 10% Instant Discount on SBI Card & Flipkart Axis",
        discountText: "SALE IS LIVE",
        image: "/assets/banners/banner_bank_offer.jpg",
        type: "hero_banner",
        link: "/products",
        order: 1
    },

    // 2. Top Promotional Carousel Card Posters
    {
        title: "OPPO Find X10 | Sale is live",
        subtitle: "Dual 200 MP camera system • From ₹5,833/M*",
        discountText: "Sale is live",
        image: "/assets/banners/poster_oppo.jpg",
        type: "carousel_card",
        link: "/products?keyword=oppo",
        order: 1
    },
    {
        title: "vivo T5x 5G | 7200 mAh",
        subtitle: "Segment's biggest battery* • 120Hz",
        discountText: "120Hz Display",
        image: "/assets/banners/poster_vivo.jpg",
        type: "carousel_card",
        link: "/products?keyword=vivo",
        order: 2
    },
    {
        title: "acer Aspire 7 Gaming Laptop",
        subtitle: "From ₹92,990* • Upto Intel Core 7 | RTX 4050",
        discountText: "From ₹92,990*",
        image: "/assets/banners/poster_acer.jpg",
        type: "carousel_card",
        link: "/products?keyword=laptop",
        order: 3
    },
    {
        title: "BIG BANG DIWALI SALE IS LIVE",
        subtitle: "Lowest Prices Guaranteed",
        discountText: "Lowest Prices",
        image: "/assets/diwali/banner.jpg",
        type: "carousel_card",
        link: "/products?keyword=diya",
        order: 4
    },

    // 3. Wide Feature Festival Banner
    {
        title: "Galaxy F70e 5G | From ₹16,999*",
        subtitle: "50MP Main Camera • Samsung Special Festive Offer",
        discountText: "From ₹16,999*",
        image: "/assets/banners/banner_samsung.jpg",
        type: "wide_banner",
        link: "/product/6aed7ddd4d7517e07d9ac6a0",
        order: 1
    }
];

// Get All Banners (Auto-seeds defaults if empty or missing types)
exports.getAllBanners = asyncErrorHandler(async (req, res, next) => {
    let banners = [];
    if (mongoose.connection.readyState === 1) {
        try {
            banners = await Banner.find().sort({ order: 1 });
            if (!banners || banners.length === 0) {
                banners = await Banner.insertMany(defaultBanners);
            }
        } catch (e) { }
    }

    if (!banners || banners.length === 0) {
        const dataPath = path.join(__dirname, '../data/banners.json');
        if (fs.existsSync(dataPath)) {
            try { banners = JSON.parse(fs.readFileSync(dataPath, 'utf-8')); } catch (e) { }
        }
        if (!banners || banners.length === 0) banners = defaultBanners;
    }

    res.status(200).json({
        success: true,
        banners
    });
});

// Create New Banner (Admin)
exports.createBanner = asyncErrorHandler(async (req, res, next) => {
    const { title, subtitle, discountText, image, type, link, order } = req.body;

    if (!title || !image) {
        return next(new ErrorHandler("Please enter banner title and image URL", 400));
    }

    let banner = {
        _id: "banner_" + Date.now(),
        title,
        subtitle: subtitle || "",
        discountText: discountText || "",
        image,
        type: type || "carousel_card",
        link: link || "/products",
        order: Number(order) || 0
    };

    if (mongoose.connection.readyState === 1) {
        try {
            banner = await Banner.create(banner);
        } catch (e) { }
    }

    try {
        const dataPath = path.join(__dirname, '../data/banners.json');
        if (fs.existsSync(dataPath)) {
            let list = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
            list.push(banner);
            fs.writeFileSync(dataPath, JSON.stringify(list, null, 2));
        }
    } catch (e) { }

    res.status(201).json({
        success: true,
        banner
    });
});

// Update / Replace Banner (Admin)
exports.updateBanner = asyncErrorHandler(async (req, res, next) => {
    let banner = null;
    if (mongoose.connection.readyState === 1) {
        try {
            banner = await Banner.findByIdAndUpdate(req.params.id, req.body, {
                new: true,
                runValidators: true,
                useFindAndModify: false
            });
        } catch (e) { }
    }

    if (!banner) {
        try {
            const dataPath = path.join(__dirname, '../data/banners.json');
            if (fs.existsSync(dataPath)) {
                let list = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
                const idx = list.findIndex(b => String(b._id) === String(req.params.id) || String(b.id) === String(req.params.id));
                if (idx !== -1) {
                    list[idx] = { ...list[idx], ...req.body };
                    banner = list[idx];
                    fs.writeFileSync(dataPath, JSON.stringify(list, null, 2));
                }
            }
        } catch (e) { }
    }

    if (!banner) {
        banner = { _id: req.params.id, ...req.body };
    }

    res.status(200).json({
        success: true,
        banner
    });
});

// Delete Banner (Admin)
exports.deleteBanner = asyncErrorHandler(async (req, res, next) => {
    if (mongoose.connection.readyState === 1) {
        try {
            const banner = await Banner.findById(req.params.id);
            if (banner) await banner.remove();
        } catch (e) { }
    }

    try {
        const dataPath = path.join(__dirname, '../data/banners.json');
        if (fs.existsSync(dataPath)) {
            let list = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
            list = list.filter(b => String(b._id) !== String(req.params.id) && String(b.id) !== String(req.params.id));
            fs.writeFileSync(dataPath, JSON.stringify(list, null, 2));
        }
    } catch (e) { }

    res.status(200).json({
        success: true,
        message: "Banner Deleted Successfully"
    });
});

// Reset / Restore Default Banners
exports.resetBanners = asyncErrorHandler(async (req, res, next) => {
    let banners = defaultBanners;
    if (mongoose.connection.readyState === 1) {
        try {
            await Banner.deleteMany({});
            banners = await Banner.insertMany(defaultBanners);
        } catch (e) { }
    }

    try {
        const dataPath = path.join(__dirname, '../data/banners.json');
        fs.writeFileSync(dataPath, JSON.stringify(defaultBanners, null, 2));
    } catch (e) { }

    res.status(200).json({
        success: true,
        message: "All banners restored to default",
        banners
    });
});

// Upload local image and return persistent URL (Admin)
exports.uploadImage = asyncErrorHandler(async (req, res, next) => {
    const uploadDir = path.join(__dirname, '../../frontend/public/uploads');
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    // 1. File uploaded via multipart/form-data
    if (req.files && req.files.image) {
        const file = req.files.image;
        const ext = path.extname(file.name) || '.jpg';
        const cleanExt = ext.toLowerCase().match(/\.(jpg|jpeg|png|webp|gif|svg)$/) ? ext : '.jpg';
        const filename = `banner_${Date.now()}_${Math.round(Math.random() * 1E6)}${cleanExt}`;
        const targetPath = path.join(uploadDir, filename);

        await file.mv(targetPath);
        return res.status(200).json({
            success: true,
            url: `/uploads/${filename}`
        });
    }

    // 2. Base64 encoded image string in req.body.image
    if (req.body && req.body.image && typeof req.body.image === 'string' && req.body.image.startsWith('data:image')) {
        const matches = req.body.image.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
        if (matches) {
            const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
            const base64Data = matches[2];
            const filename = `banner_${Date.now()}_${Math.round(Math.random() * 1E6)}.${ext}`;
            const targetPath = path.join(uploadDir, filename);

            fs.writeFileSync(targetPath, base64Data, 'base64');
            return res.status(200).json({
                success: true,
                url: `/uploads/${filename}`
            });
        }
    }

    return next(new ErrorHandler("No valid image file or data provided", 400));
});
