const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Please enter banner title"],
        trim: true
    },
    subtitle: {
        type: String,
        default: ""
    },
    discountText: {
        type: String,
        default: ""
    },
    image: {
        type: String,
        required: [true, "Please provide banner image URL"]
    },
    type: {
        type: String,
        enum: ["hero_banner", "carousel_card", "wide_banner", "featured_brand", "brand_deal"],
        default: "carousel_card"
    },
    link: {
        type: String,
        default: "/products"
    },
    order: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Banner', bannerSchema);
