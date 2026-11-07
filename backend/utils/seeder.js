const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('../models/productModel');
const User = require('../models/userModel');
const bcrypt = require('bcryptjs');

dotenv.config({ path: 'backend/config/config.env' });

const diwaliProducts = [
    {
        name: "boAt Aavante Prime X, Detachable Satellites, Truly Wireless, Atmos, Free Installation 700 W Bluetooth Soundbar (Premium Black, 7.1.4 Channel)",
        description: "boAt Aavante Prime X 700W Soundbar with Truly Wireless Detachable Satellites, Dolby Atmos 7.1.4 cinematic surround sound, and free professional installation.",
        highlights: [
            "🔊 Power Output(RMS): 700 W",
            "📡 Truly Wireless Experience with Detachable Satellites",
            "🎬 Dolby Atmos 7.1.4 Channel Cinematic Surround Sound",
            "📶 Wireless Music Streaming via Bluetooth v5.3",
            "📲 Scan QR Code for Free Brand Installation Support"
        ],
        specifications: [
            { title: "Power Output", description: "700 W" },
            { title: "Speaker Configuration", description: "7.1.4 Channel with Wireless Subwoofer & Satellites" },
            { title: "Sound Technology", description: "Dolby Atmos, Dolby Digital" },
            { title: "Connectivity", description: "Bluetooth, HDMI eARC, Optical, AUX, USB" },
            { title: "Warranty", description: "1 Year Domestic Manufacturer Warranty" }
        ],
        price: 23999,
        cuttedPrice: 99990,
        protectFee: 149,
        variants: [
            { label: "160 W", value: "160 W", price: 9999, cuttedPrice: 29990 },
            { label: "700 W", value: "700 W", price: 23999, cuttedPrice: 99990 }
        ],
        images: [
            { public_id: "boat_1", url: "/assets/boat/boat_soundbar_1.jpg" },
            { public_id: "boat_2", url: "/assets/boat/boat_soundbar_2.jpg" },
            { public_id: "boat_3", url: "/assets/boat/boat_soundbar_3.jpg" },
            { public_id: "boat_4", url: "/assets/boat/boat_soundbar_4.jpg" }
        ],
        brand: {
            name: "boAt",
            logo: { public_id: "boat_logo", url: "/assets/boat/boat_soundbar_1.jpg" }
        },
        category: "Audio & Video",
        stock: 25,
        warranty: 1,
        ratings: 4.3,
        numOfReviews: 61462,
        tag: "Bestseller",
        dealText: "WOW! ₹23,999 with offer",
        deliveryDate: "Delivery by 31st Oct",
        isAssured: true,
        reviews: [
            {
                name: "Rahul Sharma",
                rating: 5,
                comment: "Mindblowing sound! The 700W bass literally shakes the living room. Truly wireless satellites make setup effortless."
            },
            {
                name: "Priya Nair",
                rating: 5,
                comment: "Superb Dolby Atmos experience. Watching movies feels like cinema. Worth every rupee."
            },
            {
                name: "Amit Patel",
                rating: 4,
                comment: "Crisp highs and deep punchy bass. Detachable satellites are a game changer."
            }
        ]
    },
    {
        name: "Mivi One 5G (Pink, 128 GB) (8 GB RAM)",
        description: "Mivi One 5G in stunning Pastel Pink with 8 GB RAM, 128 GB ROM, Snapdragon 4 Gen 2 Octa-Core Processor, 50MP AI Dual Camera, 6.75 inch 90Hz Display, and 6000 mAh battery with fast charging.",
        highlights: [
            "📱 8 GB RAM | 128 GB ROM | Expandable Upto 1 TB",
            "⚡ Snapdragon 4 Gen 2 Octa Core 5G Processor | 2.2 GHz",
            "📸 50MP AI Dual Rear Camera | 8MP Front Camera",
            "🔋 6000 mAh Massive Battery with Fast Charge Support",
            "✨ 17.15 cm (6.75 inch) HD+ 90Hz Smooth Display"
        ],
        specifications: [
            { title: "In The Box", description: "Handset, 33W Fast Charger, USB Type-C Cable, SIM Ejector Tool, Protective Case, Quick Guide" },
            { title: "Model Number", description: "Mivi One 5G (Pink)" },
            { title: "Color", description: "Pastel Pink" },
            { title: "Browse Type", description: "Smartphones" },
            { title: "SIM Type", description: "Dual Sim (Nano + Nano)" },
            { title: "Display Size", description: "17.15 cm (6.75 inch)" },
            { title: "Resolution", description: "1600 x 720 Pixels" },
            { title: "Operating System", description: "Android 14" },
            { title: "Processor Core", description: "Octa Core Snapdragon 4 Gen 2" },
            { title: "Primary Camera", description: "50MP AI Camera" },
            { title: "Secondary Camera", description: "8MP Front Camera" },
            { title: "Battery Capacity", description: "6000 mAh" },
            { title: "Warranty", description: "1 Year Manufacturer Warranty for Phone and 6 Months for In-box Accessories" }
        ],
        price: 9999,
        cuttedPrice: 25999,
        protectFee: 149,
        variants: [
            { label: "128 GB", value: "128 GB", price: 9999, cuttedPrice: 25999 },
            { label: "256 GB", value: "256 GB", price: 11999, cuttedPrice: 29999 }
        ],
        images: [
            { public_id: "mivi_pink_1", url: "/assets/products/mivi/mivi_1.jpg" },
            { public_id: "mivi_pink_2", url: "/assets/products/mivi/mivi_2.jpg" },
            { public_id: "mivi_pink_3", url: "/assets/products/mivi/mivi_3.jpg" },
            { public_id: "mivi_pink_4", url: "/assets/products/mivi/mivi_4.jpg" },
            { public_id: "mivi_pink_5", url: "/assets/products/mivi/mivi_5.jpg" }
        ],
        brand: {
            name: "Mivi",
            logo: { public_id: "mivi_logo", url: "/assets/products/mivi/mivi_1.jpg" }
        },
        category: "Mobiles",
        stock: 40,
        warranty: 1,
        ratings: 4.4,
        numOfReviews: 12480,
        tag: "Diwali Special",
        dealText: "WOW! ₹9,999 with bank offer",
        deliveryDate: "Delivery by Tomorrow",
        isAssured: true,
        reviews: [
            {
                name: "Kavita Rathi",
                rating: 5,
                comment: "Stunning pastel pink color! The phone looks like an iPhone from the back. The 50MP camera clicks amazing portraits and 6000mAh battery lasts 2 full days."
            },
            {
                name: "Deepak Choudhary",
                rating: 5,
                comment: "Unbelievable value for 5G smartphone! Snapdragon processor is super snappy, no lag in daily tasks or BGMI gaming. Display is bright and smooth."
            },
            {
                name: "Pooja Sharma",
                rating: 4,
                comment: "Bought this for my sister on Diwali, she fell in love with the pink aesthetic. Premium packaging and fast Flipkart delivery."
            },
            {
                name: "Manish Gupta",
                rating: 5,
                comment: "Best 5G phone under ₹10k! Clean UI, excellent speaker sound, and solid build. Flipkart Assured delivery was on time."
            }
        ]
    },
    {
        name: "Samsung Galaxy F70e 5G (Spotlight Blue, 128 GB) (4 GB RAM)",
        description: "Samsung Galaxy F70e 5G in vibrant Spotlight Blue with 50MP AI Camera, 6.74-inch 90Hz Display, MediaTek Dimensity 6300 Octa-Core Processor, Knox Security, and a massive 6000 mAh battery.",
        highlights: [
            "✨ AI Features | Knox Security Protection",
            "⚡ MediaTek Dimensity 6300 Octa Core 5G Processor | 2.4 GHz",
            "📱 4 GB RAM | 128 GB ROM | Expandable Upto 1 TB",
            "📸 50MP + 2MP Rear Camera | 8MP Front Camera with Face Correction",
            "🔋 6000 mAh Massive Long-Lasting Battery",
            "🎬 17.12 cm (6.74 inch) Smooth 90Hz PLS LCD Display"
        ],
        specifications: [
            { title: "In The Box", description: "Handset, Data Cable (Type C-to-C), Ejection Pin, Quick Start Guide" },
            { title: "Model Number", description: "SM-E706B/DS" },
            { title: "Color", description: "Spotlight Blue" },
            { title: "Browse Type", description: "Smartphones" },
            { title: "SIM Type", description: "Dual Sim (Nano + Nano)" },
            { title: "Display Size", description: "17.12 cm (6.74 inch)" },
            { title: "Resolution", description: "1600 x 720 Pixels" },
            { title: "Operating System", description: "Android 14 (One UI 6.0)" },
            { title: "Processor Core", description: "Octa Core Dimensity 6300" },
            { title: "Primary Camera", description: "50MP Main + 2MP Depth Camera" },
            { title: "Secondary Camera", description: "8MP Front Camera" },
            { title: "Battery Capacity", description: "6000 mAh" },
            { title: "Warranty", description: "1 Year Manufacturer Warranty for Device and 6 Months for In-Box Accessories" }
        ],
        price: 16999,
        cuttedPrice: 22999,
        protectFee: 149,
        variants: [
            { label: "128 GB", value: "128 GB", price: 16999, cuttedPrice: 22999 },
            { label: "256 GB", value: "256 GB", price: 18999, cuttedPrice: 25999 }
        ],
        images: [
            { public_id: "samsung_f70e_1", url: "/assets/products/samsung_f70e/f70e_1.jpg" },
            { public_id: "samsung_f70e_2", url: "/assets/products/samsung_f70e/f70e_2.jpg" },
            { public_id: "samsung_f70e_3", url: "/assets/products/samsung_f70e/f70e_3.jpg" },
            { public_id: "samsung_f70e_4", url: "/assets/products/samsung_f70e/f70e_4.jpg" },
            { public_id: "samsung_f70e_5", url: "/assets/products/samsung_f70e/f70e_5.jpg" }
        ],
        brand: {
            name: "Samsung",
            logo: { public_id: "samsung_logo", url: "/assets/products/samsung_f70e/f70e_1.jpg" }
        },
        category: "Mobiles",
        stock: 50,
        warranty: 1,
        ratings: 4.4,
        numOfReviews: 18450,
        tag: "Special Offer",
        dealText: "WOW! ₹16,999 with bank offer",
        deliveryDate: "Delivery by Tomorrow",
        isAssured: true,
        reviews: [
            {
                name: "Rohan Verma",
                rating: 5,
                comment: "Exceptional battery life! 6000mAh easily lasts 1.5 to 2 days with 5G on. The Spotlight Blue finish looks very stylish and premium."
            },
            {
                name: "Sneha Kulkarni",
                rating: 5,
                comment: "Samsung Knox security and clean One UI without annoying ads. Display is huge and bright, and 50MP camera takes crisp photos in daylight."
            },
            {
                name: "Abhishek Rao",
                rating: 4,
                comment: "Dimensity 6300 is very energy efficient. Great phone for everyday multitasking and media streaming. Very pleased with Flipkart delivery."
            },
            {
                name: "Neha Singhal",
                rating: 5,
                comment: "Got it for ₹16,999 during Big Bang Diwali sale. Best branded 5G phone in this price segment with Samsung reliability!"
            }
        ]
    },
    {
        name: "ZEBRONICS GINOX Plus Party Trolley DJ Speaker,160W,Upto 10H Battery,Karaoke,BT V5.0 | TWS | USB | Msd | 2X Mic & Guitar Input | Aux in/Out,RGB LED,12Full Range Driver,with 2X UHF Wireless Mic,Black",
        description: "ZEBRONICS GINOX Plus 160W Party Trolley DJ Speaker with 12 inch full range driver, 2 wireless UHF mics, multi-connectivity, RGB party lights, and up to 10 hours playtime.",
        highlights: [
            "🔊 160W Powerful Audio Output",
            "🎵 30.48 cm (12 inch) Full-Range Driver",
            "🔋 Up to 10 Hours Rechargeable Playtime",
            "🎤 2X UHF Wireless Microphones Included",
            "🌈 Dynamic RGB Multi-Mode DJ Lights"
        ],
        specifications: [
            { title: "Power Output", description: "160W RMS" },
            { title: "Driver Size", description: "30.48 cm (12 inch)" },
            { title: "Wireless Range", description: "10 m" },
            { title: "Battery Life", description: "Up to 10 Hours" }
        ],
        price: 299,
        cuttedPrice: 19999,
        images: [
            { public_id: "zebronics_speaker", url: "/assets/products/zebronics_speaker.jpg" }
        ],
        brand: {
            name: "Zebronics",
            logo: { public_id: "brand_logo", url: "/assets/products/zebronics_speaker.jpg" }
        },
        category: "Electronics",
        stock: 35,
        warranty: 1,
        ratings: 4.5,
        numOfReviews: 3850,
        tag: "Trending",
        dealText: "WOW! ₹299 with offer",
        deliveryDate: "Delivery in 3 Days",
        isAssured: true
    },
    {
        name: "vivo V50 5G (128 GB Storage, 8 GB RAM, Sunset Red)",
        description: "vivo V50 5G with 50MP Sony Sensor Studio Camera, Ultra-slim Aesthetic Curved Display, Snapdragon 5G chipset, and 80W FlashCharge.",
        highlights: [
            "8 GB RAM | 128 GB ROM",
            "17.22 cm (6.78 inch) Full HD+ AMOLED Display",
            "50MP + 50MP Dual Rear Camera | 50MP Front Camera",
            "5000 mAh Battery with 80W FlashCharge"
        ],
        specifications: [
            { title: "Display", description: "6.78 inch FHD+ AMOLED" },
            { title: "Processor", description: "Snapdragon 5G" },
            { title: "RAM / ROM", description: "8GB / 128GB" }
        ],
        price: 499,
        cuttedPrice: 39999,
        images: [
            { public_id: "vivo_v50", url: "/assets/products/vivo_v50.jpg" }
        ],
        brand: {
            name: "vivo",
            logo: { public_id: "brand_logo", url: "/assets/products/vivo_v50.jpg" }
        },
        category: "Mobiles",
        stock: 20,
        warranty: 1,
        ratings: 4.7,
        numOfReviews: 5410,
        tag: "Only 5 left",
        dealText: "WOW! ₹499 with offer",
        deliveryDate: "Delivery by Tomorrow",
        isAssured: true
    },
    {
        name: "CW Dreamica Pack Of 6 Fancy LED Water Sensor Diya Candle",
        description: "Pack Of 6 Fancy LED Water Sensor Diya Candle. Flameless and smokeless Diwali decorative lights. Automatically turns on when placed in water and turns off when removed. Long battery life and reusable.",
        highlights: [
            "Water Activated LED Sensor",
            "Pack of 6 Multi-colour Diyas",
            "Smokeless, Flameless & Safe",
            "Ideal for Home, Temple & Diwali Decor",
            "Replaceable Button Batteries Included"
        ],
        specifications: [
            { title: "Type", description: "Water Sensor LED Diya" },
            { title: "Pack of", description: "6" },
            { title: "Material", description: "High Grade Plastic" },
            { title: "Occasion", description: "Diwali, Puja, Festive Decor" }
        ],
        price: 99,
        cuttedPrice: 207,
        images: [
            { public_id: "diwali_hero", url: "/assets/diwali/p_hero.jpg" },
            { public_id: "diwali_dreamica", url: "/assets/diwali/dreamica.jpg" }
        ],
        brand: {
            name: "CW Dreamica",
            logo: { public_id: "brand_logo", url: "/assets/diwali/dreamica.jpg" }
        },
        category: "Home",
        stock: 50,
        warranty: 1,
        ratings: 4.0,
        numOfReviews: 661,
        tag: "Best deals",
        dealText: "WOW! ₹99 with offer",
        deliveryDate: "Delivery by 1st Nov",
        isAssured: true
    },
    {
        name: "DevBati Instant Ghee Diya for Puja Aluminium (Pack of 15)...",
        description: "DevBati Pure Cow Ghee Diya wicks for daily puja and Diwali festival. Ready to burn, mess-free burning for 30+ minutes each with soothing aroma.",
        highlights: [
            "Made with Pure Cow Ghee & Camphor",
            "Ready to light wicks in aluminium holders",
            "Burning time: Approx 30-35 mins",
            "Wax free, natural and chemical free"
        ],
        specifications: [
            { title: "Type", description: "Pure Ghee Diya" },
            { title: "Pack of", description: "15" },
            { title: "Burn Time", description: "30+ mins" }
        ],
        price: 99,
        cuttedPrice: 183,
        images: [
            { public_id: "diwali_devbati", url: "/assets/diwali/devbati.jpg" }
        ],
        brand: {
            name: "DevBati",
            logo: { public_id: "brand_logo", url: "/assets/diwali/devbati.jpg" }
        },
        category: "Home",
        stock: 25,
        warranty: 1,
        ratings: 4.3,
        numOfReviews: 120,
        tag: "Trending",
        dealText: "WOW! ₹99 with offer",
        deliveryDate: "Delivery by 2nd Nov",
        isAssured: true
    },
    {
        name: "AquaSense Water Sensor LED Diya | Decorative Diya for Diwali",
        description: "Premium optical sensor LED diyas that glow vibrant yellow flame upon touching water. Perfect for floating bowls and festival centerpieces.",
        highlights: [
            "Sensory Water Activation",
            "Warm Golden Flame Glow",
            "Waterproof Bottom Seal",
            "Pack of 12 Diyas"
        ],
        specifications: [
            { title: "Type", description: "Electronic Floating Diya" },
            { title: "Pack of", description: "12" }
        ],
        price: 99,
        cuttedPrice: 198,
        images: [
            { public_id: "diwali_aquasense", url: "/assets/diwali/dreamica.jpg" }
        ],
        brand: {
            name: "AquaSense",
            logo: { public_id: "brand_logo", url: "/assets/diwali/dreamica.jpg" }
        },
        category: "Home",
        stock: 11,
        warranty: 1,
        ratings: 3.8,
        numOfReviews: 28,
        tag: "Only 11 left",
        dealText: "WOW! ₹99 with offer",
        deliveryDate: "Delivery by 31st Oct",
        isAssured: true
    },
    {
        name: "Viskri UNBREAKABLE Crystal Look Decorative Diya for Diwali",
        description: "Exquisite crystal-finish decorative diya with intricate traditional cuts for luminous light refractions.",
        highlights: [
            "Unbreakable Polycarbonate Crystal",
            "Reflective Prismatic Base",
            "Reusable and Easy to Wash"
        ],
        specifications: [
            { title: "Type", description: "Crystal Diya" },
            { title: "Pack of", description: "6" }
        ],
        price: 99,
        cuttedPrice: 240,
        images: [
            { public_id: "diwali_viskri", url: "/assets/diwali/matki.jpg" }
        ],
        brand: {
            name: "Viskri",
            logo: { public_id: "brand_logo", url: "/assets/diwali/matki.jpg" }
        },
        category: "Home",
        stock: 30,
        warranty: 1,
        ratings: 4.1,
        numOfReviews: 42,
        tag: "Trending",
        dealText: "WOW! ₹99 with offer",
        deliveryDate: "Delivery by 31st Oct",
        isAssured: true
    },
    {
        name: "ARTYORA ARTYORA Clay 12 Diya Set for Diwali Festival...",
        description: "Handcrafted terracotta clay diyas with artistic hand-painted motifs and natural organic colors.",
        highlights: [
            "100% Eco-friendly Organic Clay",
            "Handmade by Traditional Artisans",
            "Pack of 12 Colourful Diya set"
        ],
        specifications: [
            { title: "Type", description: "Terracotta Mitti Diya" },
            { title: "Pack of", description: "12" }
        ],
        price: 99,
        cuttedPrice: 209,
        images: [
            { public_id: "diwali_artyora", url: "/assets/diwali/artyora.jpg" }
        ],
        brand: {
            name: "ARTYORA",
            logo: { public_id: "brand_logo", url: "/assets/diwali/artyora.jpg" }
        },
        category: "Home",
        stock: 40,
        warranty: 1,
        ratings: 4.5,
        numOfReviews: 89,
        tag: "Super deals",
        dealText: "WOW! ₹99 with offer",
        deliveryDate: "Delivery by 31st Oct",
        isAssured: true
    },
    {
        name: "sangeeta Decorative Style for Diwali Candle...",
        description: "Intricately designed floral pattern rangoli diyas with embedded wax tealights.",
        highlights: [
            "Floral Rangoli Pattern",
            "Vivid Festive Color Combinations",
            "Ready to use with tealights"
        ],
        specifications: [
            { title: "Type", description: "Rangoli Tealight Diya" },
            { title: "Pack of", description: "8" }
        ],
        price: 99,
        cuttedPrice: 273,
        images: [
            { public_id: "diwali_sangeeta", url: "/assets/diwali/sangeeta.jpg" }
        ],
        brand: {
            name: "sangeeta",
            logo: { public_id: "brand_logo", url: "/assets/diwali/sangeeta.jpg" }
        },
        category: "Home",
        stock: 3,
        warranty: 1,
        ratings: 4.2,
        numOfReviews: 54,
        tag: "Only 3 left",
        dealText: "WOW! ₹99 with offer",
        deliveryDate: "Delivery by 31st Oct",
        isAssured: true
    },
    {
        name: "BUC Designer Mitti Matki Diya With Wax Tealight Candle...",
        description: "Traditional earthen pot (matki) shaped designer mitti diyas filled with wax and aromatic oils.",
        highlights: [
            "Matki Shape Mitti Diya",
            "Wax Filled with Cotton Wick",
            "Pack of 8 Colorful Pots"
        ],
        specifications: [
            { title: "Type", description: "Matki Diya" },
            { title: "Pack of", description: "8" }
        ],
        price: 99,
        cuttedPrice: 370,
        images: [
            { public_id: "diwali_matki", url: "/assets/diwali/matki.jpg" }
        ],
        brand: {
            name: "BUC",
            logo: { public_id: "brand_logo", url: "/assets/diwali/matki.jpg" }
        },
        category: "Home",
        stock: 15,
        warranty: 1,
        ratings: 4.4,
        numOfReviews: 135,
        tag: "Only 15 left",
        dealText: "WOW! ₹99 with offer",
        deliveryDate: "Delivery by 31st Oct",
        isAssured: true
    },
    {
        name: "PGD Decorative Golden Diya Set for Pooja & Diwali |...",
        description: "Royal golden brass-finish metal diyas for auspicious occasions, Lakshmi Puja, and festival decoration.",
        highlights: [
            "Solid Metal with Golden Polish",
            "Detailed Filigree Border",
            "Washable and Durable"
        ],
        specifications: [
            { title: "Type", description: "Golden Brass Diya" },
            { title: "Pack of", description: "2" }
        ],
        price: 99,
        cuttedPrice: 218,
        images: [
            { public_id: "diwali_golden", url: "/assets/diwali/golden.jpg" }
        ],
        brand: {
            name: "PGD",
            logo: { public_id: "brand_logo", url: "/assets/diwali/golden.jpg" }
        },
        category: "Home",
        stock: 50,
        warranty: 1,
        ratings: 4.0,
        numOfReviews: 67,
        tag: "Best deals",
        dealText: "WOW! ₹99 with offer",
        deliveryDate: "Delivery by 31st Oct",
        isAssured: true
    }
];

const seedProducts = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/flipkart', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log("Connected to MongoDB for seeding...");

        let user = await User.findOne({ email: "admin@flipkart.com" });
        if (!user) {
            user = await User.create({
                name: "Flipkart Admin",
                email: "admin@flipkart.com",
                gender: "male",
                password: "adminPassword123",
                avatar: {
                    public_id: "admin_avatar",
                    url: "https://rukminim1.flixcart.com/www/100/100/promos/01/07/2019/335606d2-6421-4d37-8339-ff741b65df02.png"
                },
                role: "admin"
            });
            console.log("Admin user created.");
        }

        await Product.deleteMany();
        console.log("Existing products cleaned.");

        const productsWithUser = diwaliProducts.map(p => ({
            ...p,
            user: user._id
        }));

        await Product.insertMany(productsWithUser);
        console.log(`Successfully seeded ${productsWithUser.length} Diwali products!`);
        process.exit(0);
    } catch (error) {
        console.error("Seeding error:", error);
        process.exit(1);
    }
};

seedProducts();
