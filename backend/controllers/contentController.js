const mongoose = require('mongoose');
const WebsiteContent = require('../models/contentModel');
const asyncErrorHandler = require('../middlewares/asyncErrorHandler');
const ErrorHandler = require('../utils/errorHandler');
const { broadcastSync, EVENTS } = require('../sockets/socketServer');
const { recordActivity } = require('../utils/activityLogger');

const defaultContent = {
    identifier: 'main_website_content',
    announcement: {
        enabled: true,
        text: 'Festive Mega Diwali Sale is LIVE! Extra 10% Instant Discount on All UPI & Cards',
        link: '/products',
        bgColor: '#2874f0',
        textColor: '#ffffff',
    },
    promotionalNotice: {
        enabled: true,
        title: 'Lowest Price Guarantee',
        subtitle: 'Assured 100% Genuine Certified Products with 7 Days Easy Return',
    },
    contactInfo: {
        email: 'support@flipkart.com',
        phone: '1800 202 9898',
        address: 'Flipkart Internet Private Limited, Buildings Alyssa, Begonia & Clove Embassy Tech Village, Outer Ring Road, Bengaluru, 560103, Karnataka, India',
        workingHours: '24x7 Customer Care',
    },
    socialLinks: {
        facebook: 'https://facebook.com/flipkart',
        twitter: 'https://twitter.com/flipkart',
        youtube: 'https://youtube.com/flipkart',
        instagram: 'https://instagram.com/flipkart',
        telegram: 'https://t.me/flipkartdeals',
    },
    footer: {
        aboutText: 'Flipkart is your one-stop shopping destination for the best deals, electronics, fashion, and home appliances.',
        copyrightText: '© 2012-2026 Flipkart.com. All rights reserved.',
    },
};

// Memory fallback store for zero-DB standalone environments
let localContentCache = { ...defaultContent };

// Get Website Content --- PUBLIC
exports.getWebsiteContent = asyncErrorHandler(async (req, res, next) => {
    let content = null;
    if (mongoose.connection.readyState === 1) {
        try {
            content = await WebsiteContent.findOne({ identifier: 'main_website_content' });
        } catch (e) {
            content = null;
        }
    }

    if (!content) {
        content = localContentCache;
    }

    res.status(200).json({
        success: true,
        content,
    });
});

// Update Website Content --- ADMIN
exports.updateWebsiteContent = asyncErrorHandler(async (req, res, next) => {
    let content = null;

    if (mongoose.connection.readyState === 1) {
        try {
            content = await WebsiteContent.findOneAndUpdate(
                { identifier: 'main_website_content' },
                {
                    ...req.body,
                    updatedBy: req.user?.name || 'Administrator',
                    updatedAt: new Date(),
                },
                { new: true, upsert: true, runValidators: true }
            );
        } catch (e) {
            content = null;
        }
    }

    if (!content) {
        // Fallback to local memory cache
        localContentCache = {
            ...localContentCache,
            ...req.body,
            updatedBy: req.user?.name || 'Administrator',
            updatedAt: new Date(),
        };
        content = localContentCache;
    }

    // 1. Broadcast real-time event to all connected customer browsers!
    broadcastSync(EVENTS.CONTENT_UPDATED, content);

    // 2. Record administrative audit log
    await recordActivity(req, {
        action: 'UPDATE_WEBSITE_CONTENT',
        entityType: 'content',
        entityId: 'main_website_content',
        details: `Updated website content (announcement: "${content.announcement?.text?.slice(0, 40)}...")`,
    });

    res.status(200).json({
        success: true,
        message: 'Website content updated and synchronized live across all clients',
        content,
    });
});
