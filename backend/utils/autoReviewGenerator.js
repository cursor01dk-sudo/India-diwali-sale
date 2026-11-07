/**
 * Automatic Review & Rating Generator for New & Imported Products
 * Automatically generates 45 to 85 authentic, high-quality Indian customer reviews,
 * dynamic Flipkart ratings (4.5★ - 4.8★), realistic timestamps, verified purchase badges,
 * and category-specific feature ratings whenever a product is imported or created.
 */

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
    smartwatch: [
        "Display is bright and clearly readable outdoors in harsh sunlight. Touch response is snappy.",
        "Bluetooth calling is clear and mic quality is surprisingly good. Zero disconnection issues.",
        "Battery backup is phenomenal, lasting almost 6-7 days on regular usage.",
        "Heart rate and SpO2 tracking are accurate compared to my medical pulse oximeter.",
        "Strap quality is skin friendly and comfortable for wearing 24x7.",
        "Watch faces in companion app look aesthetic and stylish. Premium metal finish."
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

    if (c.includes("smartwatch") || n.includes("watch") || n.includes("calling pro") || n.includes("hurricane") || n.includes("ninja") || n.includes("talk")) {
        return feedbackTemplates.smartwatch;
    }
    if (c.includes("audio") || n.includes("sound") || n.includes("speaker") || n.includes("headphone") || n.includes("earbud") || n.includes("airdopes") || n.includes("pods") || n.includes("buds")) {
        return feedbackTemplates.audio;
    }
    if (c.includes("appliance") || n.includes("blender") || n.includes("grinder") || n.includes("mixer") || n.includes("chopper") || n.includes("stove")) {
        return feedbackTemplates.appliances;
    }
    if (c.includes("mobile") || n.includes("galaxy") || n.includes("phone") || n.includes("5g") || n.includes("samsung")) {
        return feedbackTemplates.mobiles;
    }
    if (c.includes("grooming") || c.includes("beauty") || n.includes("trimmer") || n.includes("shaver") || n.includes("shaving")) {
        return feedbackTemplates.grooming;
    }
    if (c.includes("fashion") || n.includes("shirt") || n.includes("pant") || n.includes("wear") || n.includes("t-shirt") || n.includes("co-ords")) {
        return feedbackTemplates.fashion;
    }
    return feedbackTemplates.general;
}

function getFeatureAspectsForCategory(cat, prodName) {
    const c = (cat || "").toLowerCase();
    const n = (prodName || "").toLowerCase();

    if (c.includes("smartwatch") || n.includes("watch")) {
        return [
            { name: "Display Clarity", rating: +(4.5 + Math.random() * 0.4).toFixed(1) },
            { name: "Battery Life", rating: +(4.4 + Math.random() * 0.5).toFixed(1) },
            { name: "Calling & Bluetooth", rating: +(4.3 + Math.random() * 0.5).toFixed(1) },
            { name: "Strap & Comfort", rating: +(4.6 + Math.random() * 0.3).toFixed(1) },
            { name: "Design & Look", rating: +(4.7 + Math.random() * 0.3).toFixed(1) }
        ];
    }
    if (c.includes("audio") || n.includes("speaker") || n.includes("sound") || n.includes("earbud") || n.includes("buds") || n.includes("pods")) {
        return [
            { name: "Sound Clarity", rating: +(4.4 + Math.random() * 0.5).toFixed(1) },
            { name: "Bass Quality", rating: +(4.5 + Math.random() * 0.4).toFixed(1) },
            { name: "Battery Backup", rating: +(4.3 + Math.random() * 0.5).toFixed(1) },
            { name: "Build & Finish", rating: +(4.5 + Math.random() * 0.4).toFixed(1) },
            { name: "Value for Money", rating: +(4.6 + Math.random() * 0.3).toFixed(1) }
        ];
    }
    if (c.includes("appliance") || n.includes("blender") || n.includes("grinder") || n.includes("chopper")) {
        return [
            { name: "Motor Power", rating: +(4.5 + Math.random() * 0.4).toFixed(1) },
            { name: "Blade Sharpness", rating: +(4.6 + Math.random() * 0.3).toFixed(1) },
            { name: "Ease of Cleaning", rating: +(4.4 + Math.random() * 0.5).toFixed(1) },
            { name: "Build Quality", rating: +(4.5 + Math.random() * 0.4).toFixed(1) },
            { name: "Value for Money", rating: +(4.6 + Math.random() * 0.3).toFixed(1) }
        ];
    }
    if (c.includes("grooming") || n.includes("trimmer")) {
        return [
            { name: "Blade Quality", rating: +(4.6 + Math.random() * 0.3).toFixed(1) },
            { name: "Battery Backup", rating: +(4.5 + Math.random() * 0.4).toFixed(1) },
            { name: "Skin Comfort", rating: +(4.4 + Math.random() * 0.5).toFixed(1) },
            { name: "Grip & Ergonomics", rating: +(4.5 + Math.random() * 0.4).toFixed(1) },
            { name: "Value for Money", rating: +(4.7 + Math.random() * 0.3).toFixed(1) }
        ];
    }
    return [
        { name: "Product Quality", rating: +(4.5 + Math.random() * 0.4).toFixed(1) },
        { name: "Build & Finish", rating: +(4.4 + Math.random() * 0.5).toFixed(1) },
        { name: "Performance", rating: +(4.5 + Math.random() * 0.4).toFixed(1) },
        { name: "Value for Money", rating: +(4.6 + Math.random() * 0.3).toFixed(1) }
    ];
}

/**
 * Ensures product data contains 45 to 85 realistic reviews & authentic Flipkart ratings.
 * If product already has 40+ reviews, it preserves them.
 * Otherwise, it generates rich reviews, ratings, and feature aspects automatically.
 * @param {Object} productData
 * @returns {Object} enriched productData
 */
function ensureProductReviews(productData) {
    if (!productData) return productData;

    const existingReviews = Array.isArray(productData.reviews) ? productData.reviews : [];

    // If already has 40+ reviews, keep them intact
    if (existingReviews.length >= 40) {
        productData.numOfReviews = existingReviews.length;
        const sum = existingReviews.reduce((acc, r) => acc + (Number(r.rating) || 5), 0);
        productData.ratings = Number((sum / existingReviews.length).toFixed(1));
        return productData;
    }

    // Generate between 45 and 85 diverse reviews (satisfies 40+ to 80+ reviews)
    const targetCount = getRandomInt(45, 85);
    const feedbackList = getCategoryFeedback(productData.category, productData.name);
    const generatedReviews = [];

    // Keep existing genuine reviews at top if any
    existingReviews.forEach(r => {
        generatedReviews.push({
            name: r.name || "Flipkart Customer",
            rating: Math.max(Number(r.rating) || 5, 4),
            title: r.title || "Terrific purchase",
            comment: r.comment || "Great product, works efficiently.",
            dateStr: r.dateStr || "1 month ago",
            likes: Number(r.likes) || getRandomInt(30, 90),
            dislikes: Number(r.dislikes) || 0,
            createdAt: r.createdAt ? new Date(r.createdAt) : new Date(Date.now() - getRandomInt(10, 60) * 86400000)
        });
    });

    const shuffledNames = [...indianNames].sort(() => 0.5 - Math.random());
    const addOns = [
        "",
        " Ekart delivery was super fast.",
        " Must buy at this price point.",
        " Highly satisfied with Flipkart Assured.",
        " Value for money purchase.",
        " Packing was very neat and safe.",
        " Happy with the product quality.",
        " Recommended to all my friends.",
        " 10/10 purchase experience."
    ];

    while (generatedReviews.length < targetCount) {
        const i = generatedReviews.length;
        const name = shuffledNames[i % shuffledNames.length];

        // Natural distribution: 68% 5-star, 26% 4-star, 6% 3-star
        const rand = Math.random();
        let rating = 5;
        if (rand > 0.94) rating = 3;
        else if (rand > 0.68) rating = 4;
        else rating = 5;

        const title = getRandomElem(reviewTitles);
        const baseComment = getRandomElem(feedbackList);
        const comment = baseComment + getRandomElem(addOns);
        const dateStr = getRandomElem(datePool);
        const likes = getRandomInt(15, 155);
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

    productData.reviews = generatedReviews;
    productData.numOfReviews = generatedReviews.length;

    // Calculate dynamic average rating (4.4 - 4.8)
    const sum = generatedReviews.reduce((acc, r) => acc + (Number(r.rating) || 5), 0);
    productData.ratings = Number((sum / generatedReviews.length).toFixed(1));

    // Ensure featureRatings are also present
    if (!productData.featureRatings || productData.featureRatings.length === 0) {
        productData.featureRatings = getFeatureAspectsForCategory(productData.category, productData.name);
    }

    return productData;
}

module.exports = {
    ensureProductReviews,
    indianNames,
    reviewTitles,
    feedbackTemplates,
    getCategoryFeedback,
    getFeatureAspectsForCategory
};

