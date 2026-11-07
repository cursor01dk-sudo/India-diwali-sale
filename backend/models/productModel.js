const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter product name"],
        trim: true
    },
    description: {
        type: String,
        required: [true, "Please enter product description"]
    },
    highlights: [
        {
            type: String,
            default: ""
        }
    ],
    specifications: [
        {
            title: {
                type: String,
                default: ""
            },
            description: {
                type: String,
                default: ""
            }
        }
    ],
    price: {
        type: Number,
        required: [true, "Please enter product price"]
    },
    cuttedPrice: {
        type: Number,
        required: [true, "Please enter cutted price"]
    },
    images: [
        {
            public_id: {
                type: String,
                default: "fk_img"
            },
            url: {
                type: String,
                required: true
            }
        }
    ],
    brand: {
        name: {
            type: String,
            default: "Flipkart Assured"
        },
        logo: {
            public_id: {
                type: String,
                default: "brand_logo"
            },
            url: {
                type: String,
                default: "/assets/banners/poster_oppo.jpg"
            }
        }
    },
    category: {
        type: String,
        required: [true, "Please enter product category"],
        default: "Electronics"
    },
    tag: {
        type: String,
        default: "Best deals"
    },
    dealText: {
        type: String,
        default: "WOW! Deal with offers"
    },
    deliveryDate: {
        type: String,
        default: "Delivery in 2-3 Days"
    },
    isAssured: {
        type: Boolean,
        default: true
    },
    isTopSelling: {
        type: Boolean,
        default: false
    },
    inBestGadgets: {
        type: Boolean,
        default: false
    },
    priority: {
        type: Number,
        default: 0
    },
    protectFee: {
        type: Number,
        default: 149
    },
    variants: [
        {
            label: String,
            value: String,
            price: Number,
            cuttedPrice: Number
        }
    ],
    stock: {
        type: Number,
        required: [true, "Please enter product stock"],
        default: 50
    },
    warranty: {
        type: Number,
        default: 1
    },
    ratings: {
        type: Number,
        default: 4.3
    },
    numOfReviews: {
        type: Number,
        default: 61462
    },
    reviewImages: [
        {
            public_id: {
                type: String,
                default: "rev_img"
            },
            url: {
                type: String,
                required: true
            }
        }
    ],
    featureRatings: [
        {
            name: {
                type: String,
                required: true
            },
            rating: {
                type: Number,
                required: true,
                default: 4.0
            }
        }
    ],
    reviews: [
        {
            user: {
                type: mongoose.Schema.ObjectId,
                ref: "User",
                required: false
            },
            name: {
                type: String,
                default: "Verified Customer"
            },
            rating: {
                type: Number,
                default: 5
            },
            title: {
                type: String,
                default: "Must buy!"
            },
            comment: {
                type: String,
                default: "Excellent product!"
            },
            dateStr: {
                type: String,
                default: "1 year ago"
            },
            images: [
                {
                    type: String
                }
            ],
            likes: {
                type: Number,
                default: 24
            },
            dislikes: {
                type: Number,
                default: 3
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }
    ],
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Product', productSchema);
