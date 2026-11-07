const fs = require('fs');
const path = require('path');
const Product = require('../models/productModel');
const Banner = require('../models/bannerModel');
const User = require('../models/userModel');

let isSynced = false;

/**
 * Automatically seeds products, banners, and default users
 * if the database is newly created or empty (e.g. when deploying to Vercel/MongoDB Atlas).
 */
async function autoSyncData() {
    if (isSynced) return;

    try {
        const productCount = await Product.countDocuments();
        const bannerCount = await Banner.countDocuments();
        const userCount = await User.countDocuments();

        const dataDir = path.join(__dirname, '../data');

        // 1. Auto-seed Products if empty
        if (productCount === 0) {
            const productsFile = path.join(dataDir, 'products.json');
            if (fs.existsSync(productsFile)) {
                const productsData = JSON.parse(fs.readFileSync(productsFile, 'utf-8'));
                if (Array.isArray(productsData) && productsData.length > 0) {
                    await Product.insertMany(productsData);
                    console.log(`[AutoSync] Imported ${productsData.length} products with all reviews into MongoDB!`);
                }
            }
        }

        // 2. Auto-seed Banners if empty
        if (bannerCount === 0) {
            const bannersFile = path.join(dataDir, 'banners.json');
            if (fs.existsSync(bannersFile)) {
                const bannersData = JSON.parse(fs.readFileSync(bannersFile, 'utf-8'));
                if (Array.isArray(bannersData) && bannersData.length > 0) {
                    await Banner.insertMany(bannersData);
                    console.log(`[AutoSync] Imported ${bannersData.length} banners into MongoDB!`);
                }
            }
        }

        // 3. Auto-seed Users (Admin + Demo accounts) if empty
        if (userCount === 0) {
            const usersFile = path.join(dataDir, 'users.json');
            if (fs.existsSync(usersFile)) {
                const usersData = JSON.parse(fs.readFileSync(usersFile, 'utf-8'));
                if (Array.isArray(usersData) && usersData.length > 0) {
                    await User.insertMany(usersData);
                    console.log(`[AutoSync] Imported ${usersData.length} users into MongoDB!`);
                }
            }
        }

        isSynced = true;
    } catch (err) {
        console.error('[AutoSync Error]:', err.message);
    }
}

module.exports = autoSyncData;

