class SearchFeatures {
    constructor(query, queryString) {
        this.query = query
        this.queryString = queryString
    }

    search() {
        const keyword = this.queryString.keyword ? {
            name: {
                $regex: this.queryString.keyword,
                $options: "i",
            }
        } : {};

        // console.log(keyword);

        this.query = this.query.find({ ...keyword });
        return this;
    }

    filter() {
        const queryCopy = { ...this.queryString }

        // fields to remove for category
        const removeFields = ["keyword", "page", "limit", "sort"];

        // console.log(queryCopy);
        removeFields.forEach(key => delete queryCopy[key]);
        // console.log(queryCopy);

        // price filter
        let queryString = JSON.stringify(queryCopy);
        queryString = queryString.replace(/\b(gt|gte|lt|lte)\b/g, key => `$${key}`);

        // console.log(JSON.parse(queryString));

        this.query = this.query.find(JSON.parse(queryString));
        return this;
    }

    sort() {
        const sortBy = this.queryString.sort;
        if (sortBy === 'price_low') {
            this.query = this.query.sort({ price: 1 });
        } else if (sortBy === 'price_high') {
            this.query = this.query.sort({ price: -1 });
        } else if (sortBy === 'rating') {
            this.query = this.query.sort({ ratings: -1 });
        } else if (sortBy === 'newest') {
            this.query = this.query.sort({ createdAt: -1 });
        } else {
            // Default: Top Selling & Priority products ALWAYS appear first!
            this.query = this.query.sort({ isTopSelling: -1, priority: -1, createdAt: -1 });
        }
        return this;
    }

    pagination(resultPerPage) {
        const currentPage = Number(this.queryString.page) || 1;

        const skipProducts = resultPerPage * (currentPage - 1);

        this.query = this.query.limit(resultPerPage).skip(skipProducts);
        return this;
    }
};

module.exports = SearchFeatures;