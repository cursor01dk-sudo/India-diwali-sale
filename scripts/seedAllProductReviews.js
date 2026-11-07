const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/config/config.env') });
const Product = require('../backend/models/productModel');

mongoose.set('strictQuery', false);

// 1. Diverse pool of authentic Indian customer names
const indianNames = [
    "Rahul Sharma", "Priya Patel", "Aditya Verma", "Sneha Iyer", "Vikram Rathore",
    "Pooja Nair", "Amit Kulkarni", "Ananya Sengupta", "Suresh Menon", "Deepika Reddy",
    "Manish Tiwari", "Simran Kaur", "Nikhil Pillai", "Tanvi Joshi", "Gaurav Bhattacharya",
    "Swati Mukherjee", "Farhan Akhtar", "Megha Kapoor", "Harshavardhan Rao", "Divya Agarwal",
    "Pranav Deshmukh", "Neha Verma", "Ashish Saxena", "Ritu Chauhan", "Vishal Pandey",
    "Siddharth Das", "Ishita Banerjee", "Arun Varma", "Sunita Biswas", "Kartik Mishra",
    "Anjali Yadav", "Mohit Singhania", "Priyanka Roy", "Varun Chopra", "Shreya Goswami",
    "Rohan Malhotra", "Kavita Mehra", "Deepak Joshi", "Rupali Salunkhe", "Akash Gupta",
    "Bhavna Chawla", "Tarun Nambiar", "Smita Patil", "Kunal Shinde", "Pallavi Hegde",
    "Abhishek Dubey", "Nandini Ghosh", "Sumit Rawat", "Rashmi Tripathy", "Chirag Sethi",
    "Vandana Maurya", "Hemant Solanki", "Alok Sengupta", "Aakanksha Kaul", "Vinay Khatri",
    "Brijesh Yadav", "Shalini Nair", "Kishore Kumar", "Pooja Sundaram", "Ganesh Murthy",
    "Lavanya Krishnan", "Sameer Qureshi", "Geeta Sundar", "Dinesh Prabhu", "Malini Iyer",
    "Ravi Teja", "Bhavik Shah", "Archana Natarajan", "Venkatesh Rao", "Jayanti Bose",
    "Naveen Jindal", "Shikha Srivastava", "Nilesh Kamat", "Rekha Balakrishnan", "Pankaj Jain",
    "Tanya Singhal", "Omkar Bhave", "Vidya Sreenivasan", "Sanjay Choudhary", "Monika Dixit",
    "Pradeep Naidu", "Ritika Sehgal", "Uday Kiran", "Aparna Namboodiri", "Lalit Bohra",
    "Komal Agnihotri", "Bhupendra Bisht", "Chandana Hegde", "Mayank Grover", "Sarita Tomar",
    "Gautam Mathur", "Payal Dhingra", "Tushar Barot", "Leena Vaidya", "Sachin Jadhav",
    "Shweta Rathi", "Aniruddh Sen", "Asha Narayanan", "Rajeshwari Pillai", "Devendra Lodha"
];

// 2. High-energy Flipkart review headlines
const reviewTitles = [
    "Simply awesome", "Worth every penny", "Classy product", "Mind-blowing purchase",
    "Terrific purchase", "Fabulous!", "Great choice", "Super quality",
    "Value-for-money", "Best in the segment", "Highly recommended", "Very good product",
    "Awesome experience", "Good product", "Satisfied with purchase", "Brilliant product",
    "Must buy!", "Does the job well", "Perfect purchase", "Exceptional quality",
    "Exceeded expectations", "Compact and powerful", "Excellent daily driver", "Smooth performance",
    "Delivered on time", "Good deal at this price", "Genuine quality product", "Ekart delivery was super fast",
    "Love this product", "Best purchase of the year", "Impressive build", "Top notch quality",
    "Highly durable", "Very comfortable", "Nice finish and design", "Great Flipkart offer"
];

// 3. Category & context tailored review feedback generators
const feedbackTemplates = {
    audio: [
        "Sound quality is crystal clear with punchy bass. Battery lasts easily for more than 2 days on single charge.",
        "Bluetooth connectivity is instant with zero lag. Watched movies and played games, audio sync is great.",
        "Earbuds fit comfortably in ears and don't fall off during jogging or gym workouts.",
        "Best soundbar/speaker in this price segment. Room filling audio with rich mids and crisp treble.",
        "Build quality is solid and premium. Noise isolation works really well in busy environments.",
        "Fast charging is a big plus, 10 mins charge gives around 2 hours playtime. Value for money!",
        "Delivered safely by Ekart in 2 days. Original Flipkart Assured product with sealed packaging."
    ],
    appliances: [
        "Motor power is awesome. Smoothies and thick chutneys are ready in less than 30 seconds.",
        "The blades are extremely sharp and build quality of jars is very sturdy. Zero leakage from lids.",
        "Compact size fits easily on small kitchen counter. Very easy to wash and assemble back.",
        "Value for money appliance. Low noise compared to other brands in same wattage.",
        "Has been using daily for morning shakes and grinding spices, working like a charm.",
        "Flipkart packaging was pristine with multiple bubble wrap layers. Certified genuine quality.",
        "Sturdy rubber feet prevent vibrations on maximum speed setting. Very satisfied purchase."
    ],
    mobiles: [
        "Display is vibrant and crisp even under direct sunlight. Scrolling and animations are super fluid.",
        "Battery backup easily lasts 1.5 days on normal to heavy usage. 5G speeds are blazing fast.",
        "Camera captures natural skin tones and rich colors in daylight. Night mode photos are also sharp.",
        "Phone feels very slim and lightweight in hands. Premium finish on the back panel.",
        "Fast charger in box charges phone from 10% to 80% in about 35 minutes. Truly impressive.",
        "Received within 24 hours via Flipkart Assured delivery. 100% genuine sealed box."
    ],
    grooming: [
        "Blades are very skin-friendly and sharp. Gives a clean, irritation-free trim every time.",
        "Battery life is stellar. One full charge lasts for weeks of multiple grooming sessions.",
        "Ergonomic grip and waterproof body make it very easy to clean directly under running water.",
        "Different comb attachments make beard styling so convenient at home. Saves salon visits.",
        "Compact travel lock feature is thoughtful. Build quality feels sturdy and premium.",
        "Authentic Flipkart Assured product, verified with serial number on brand warranty website."
    ],
    fashion: [
        "Fabric is 100% pure breathable cotton. Color didn't fade even after multiple machine washes.",
        "Fitting is true to size as shown in Flipkart size guide. Looks stylish and classy.",
        "Stitching is neat and durable with no loose threads. Very soft against the skin.",
        "Comfortable for all-day wear in hot Indian summers. Got multiple compliments from friends.",
        "Received in sealed tamper-proof Flipkart bag. Delivery executive was polite and quick."
    ],
    general: [
        "Item is exactly as shown in Flipkart product photos. High quality material and finish.",
        "Completely satisfied with this purchase. Worth every single rupee spent.",
        "Good packaging and prompt delivery by Ekart. Reliable seller and Flipkart Assured guarantee.",
        "Works smoothly as expected. Exceeded my expectations for this price bracket.",
        "Using it for over a month now, performance is top notch with zero issues."
    ]
};

const datePool = [
    "Yesterday", "2 days ago", "4 days ago", "6 days ago",
    "1 week ago", "2 weeks ago", "3 weeks ago", "4 weeks ago",
    "1 month ago", "2 months ago", "3 months ago", "4 months ago",
    "5 months ago", "6 months ago", "7 months ago", "8 months ago",
    "9 months ago", "10 months ago", "11 months ago", "1 year ago"
];

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomElem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function getCategoryFeedback(cat, prodName) {
    const c = (cat || "").toLowerCase();
    const n = (prodName || "").toLowerCase();

    if (c.includes("audio") || n.includes("sound") || n.includes("speaker") || n.includes("headphone") || n.includes("earbud")) {
        return feedbackTemplates.audio;
    }
    if (c.includes("appliance") || n.includes("blender") || n.includes("grinder") || n.includes("mixer") || n.includes("chopper")) {
        return feedbackTemplates.appliances;
    }
    if (c.includes("mobile") || n.includes("galaxy") || n.includes("phone") || n.includes("5g") || n.includes("samsung")) {
        return feedbackTemplates.mobiles;
    }
    if (c.includes("grooming") || c.includes("beauty") || n.includes("trimmer") || n.includes("shaver") || n.includes("shaving")) {
        return feedbackTemplates.grooming;
    }
    if (c.includes("fashion") || n.includes("shirt") || n.includes("pant") || n.includes("wear") || n.includes("t-shirt")) {
        return feedbackTemplates.fashion;
    }
    return feedbackTemplates.general;
}

function generateReviewsForProduct(product) {
    // Each product gets between 45 and 85 reviews (40+80+ reviews as requested!)
    const targetCount = getRandomInt(45, 85);
    const feedbackList = getCategoryFeedback(product.category, product.name);
    const generatedReviews = [];

    // Shuffle names so no two reviews in same product have same name
    const shuffledNames = [...indianNames].sort(() => 0.5 - Math.random());

    for (let i = 0; i < targetCount; i++) {
        const name = shuffledNames[i % shuffledNames.length];
        
        // Realistic Flipkart distribution: ~65% 5-star, ~28% 4-star, ~7% 3-star
        const rand = Math.random();
        let rating = 5;
        if (rand > 0.93) rating = 3;
        else if (rand > 0.65) rating = 4;
        else rating = 5;

        const title = getRandomElem(reviewTitles);
        const baseComment = getRandomElem(feedbackList);
        
        // Add natural variations to comments so each feels authentic
        const addOns = [
            "",
            " Ekart delivery was fast.",
            " Must buy at this price point.",
            " Highly satisfied with Flipkart Assured.",
            " Value for money purchase.",
            " Packing was very neat and safe.",
            " Happy with the product quality.",
            " Recommended to all my friends.",
            " 10/10 purchase experience."
        ];
        const comment = baseComment + getRandomElem(addOns);
        const dateStr = getRandomElem(datePool);
        const likes = getRandomInt(12, 145);
        const dislikes = getRandomInt(0, 3);

        generatedReviews.push({
            name,
            rating,
            title,
            comment,
            dateStr,
            likes,
            dislikes,
            createdAt: new Date(Date.now() - getRandomInt(1, 360) * 24 * 60 * 60 * 1000)
        });
    }

    return generatedReviews;
}

function getFeatureAspectsForCategory(cat, prodName) {
    const c = (cat || "").toLowerCase();
    const n = (prodName || "").toLowerCase();

    if (c.includes("audio") || n.includes("speaker") || n.includes("sound")) {
        return [
            { name: "Sound Clarity", rating: +(4.2 + Math.random() * 0.6).toFixed(1) },
            { name: "Bass Quality", rating: +(4.3 + Math.random() * 0.5).toFixed(1) },
            { name: "Battery Backup", rating: +(4.1 + Math.random() * 0.7).toFixed(1) },
            { name: "Build & Finish", rating: +(4.4 + Math.random() * 0.5).toFixed(1) },
            { name: "Value for Money", rating: +(4.5 + Math.random() * 0.4).toFixed(1) }
        ];
    }
    if (c.includes("appliance") || n.includes("blender") || n.includes("grinder") || n.includes("chopper")) {
        return [
            { name: "Motor Power", rating: +(4.3 + Math.random() * 0.5).toFixed(1) },
            { name: "Grinding Quality", rating: +(4.4 + Math.random() * 0.5).toFixed(1) },
            { name: "Durability & Build", rating: +(4.2 + Math.random() * 0.6).toFixed(1) },
            { name: "Ease of Cleaning", rating: +(4.5 + Math.random() * 0.4).toFixed(1) },
            { name: "Value for Money", rating: +(4.6 + Math.random() * 0.3).toFixed(1) }
        ];
    }
    if (c.includes("mobile") || n.includes("galaxy") || n.includes("phone")) {
        return [
            { name: "Display Quality", rating: +(4.5 + Math.random() * 0.4).toFixed(1) },
            { name: "Battery Life", rating: +(4.3 + Math.random() * 0.5).toFixed(1) },
            { name: "Camera Clarity", rating: +(4.2 + Math.random() * 0.6).toFixed(1) },
            { name: "Performance & Speed", rating: +(4.5 + Math.random() * 0.4).toFixed(1) },
            { name: "Value for Money", rating: +(4.4 + Math.random() * 0.5).toFixed(1) }
        ];
    }
    if (c.includes("grooming") || n.includes("trimmer") || n.includes("shaver")) {
        return [
            { name: "Blade Sharpness", rating: +(4.5 + Math.random() * 0.4).toFixed(1) },
            { name: "Battery Life", rating: +(4.3 + Math.random() * 0.5).toFixed(1) },
            { name: "Skin Comfort", rating: +(4.4 + Math.random() * 0.5).toFixed(1) },
            { name: "Ergonomic Grip", rating: +(4.3 + Math.random() * 0.5).toFixed(1) },
            { name: "Value for Money", rating: +(4.6 + Math.random() * 0.3).toFixed(1) }
        ];
    }
    return [
        { name: "Quality & Durability", rating: +(4.4 + Math.random() * 0.5).toFixed(1) },
        { name: "Design & Look", rating: +(4.5 + Math.random() * 0.4).toFixed(1) },
        { name: "Comfort / Usability", rating: +(4.3 + Math.random() * 0.5).toFixed(1) },
        { name: "Value for Money", rating: +(4.6 + Math.random() * 0.3).toFixed(1) }
    ];
}

async function runSeeder() {
    try {
        const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/flipkart';
        console.log("Connecting to MongoDB...");
        await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log("Connected to MongoDB successfully.");

        const products = await Product.find();
        console.log(`Found ${products.length} products to enrich with 40+ to 80+ reviews...\n`);

        let updatedCount = 0;

        for (const product of products) {
            const newReviews = generateReviewsForProduct(product);
            const totalRatingSum = newReviews.reduce((sum, r) => sum + r.rating, 0);
            const calculatedRating = +(totalRatingSum / newReviews.length).toFixed(1);
            const featureAspects = getFeatureAspectsForCategory(product.category, product.name);

            product.reviews = newReviews;
            product.numOfReviews = newReviews.length;
            product.ratings = calculatedRating;
            product.featureRatings = featureAspects;

            await product.save({ validateBeforeSave: false });
            updatedCount++;
            console.log(`[${updatedCount}/${products.length}] ${product.name.substring(0, 35)}... -> ${newReviews.length} reviews | ${calculatedRating} ★ ratings`);
        }

        console.log(`\n🎉 SUCCESS! All ${updatedCount} products enriched with 40+ to 80+ diverse reviews and authentic Flipkart ratings.`);
        process.exit(0);
    } catch (err) {
        console.error("Error during reviews seeding:", err);
        process.exit(1);
    }
}

runSeeder();

