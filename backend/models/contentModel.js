const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
    identifier: {
        type: String,
        default: 'main_website_content',
        unique: true
    },
    announcement: {
        enabled: { type: Boolean, default: true },
        text: { type: String, default: 'Festive Mega Diwali Sale is LIVE! Extra 10% Instant Discount on All UPI & Cards' },
        link: { type: String, default: '/products' },
        bgColor: { type: String, default: '#2874f0' },
        textColor: { type: String, default: '#ffffff' }
    },
    promotionalNotice: {
        enabled: { type: Boolean, default: true },
        title: { type: String, default: 'Lowest Price Guarantee' },
        subtitle: { type: String, default: 'Assured 100% Genuine Certified Products with 7 Days Easy Return' }
    },
    contactInfo: {
        email: { type: String, default: 'support@flipkart.com' },
        phone: { type: String, default: '1800 202 9898' },
        address: { type: String, default: 'Flipkart Internet Private Limited, Buildings Alyssa, Begonia & Clove Embassy Tech Village, Outer Ring Road, Devarabeesanahalli Village, Bengaluru, 560103, Karnataka, India' },
        workingHours: { type: String, default: '24x7 Customer Care' }
    },
    socialLinks: {
        facebook: { type: String, default: 'https://facebook.com/flipkart' },
        twitter: { type: String, default: 'https://twitter.com/flipkart' },
        youtube: { type: String, default: 'https://youtube.com/flipkart' },
        instagram: { type: String, default: 'https://instagram.com/flipkart' },
        telegram: { type: String, default: 'https://t.me/flipkartdeals' }
    },
    footer: {
        aboutText: { type: String, default: 'Flipkart is your one-stop shopping destination for the best deals, electronics, fashion, and home appliances.' },
        copyrightText: { type: String, default: '© 2012-2026 Flipkart.com. All rights reserved.' }
    },
    updatedBy: {
        type: String,
        default: 'Admin'
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('WebsiteContent', contentSchema);

