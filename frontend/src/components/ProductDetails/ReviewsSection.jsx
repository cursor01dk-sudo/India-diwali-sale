import React, { useState, useRef } from 'react';
import StarIcon from '@mui/icons-material/Star';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined';

const ReviewsSection = ({
    product,
    isAuthenticated,
    user,
    onRateClick,
    showReviewForm,
    setShowReviewForm,
    reviewRating,
    setReviewRating,
    reviewComment,
    setReviewComment,
    reviewTitle,
    setReviewTitle,
    handleReviewSubmit,
    submittingReview
}) => {
    const [isSectionOpen, setIsSectionOpen] = useState(true);
    const [lightboxIndex, setLightboxIndex] = useState(null);
    const carouselRef = useRef(null);

    // Customer review photos: only from product (or empty if not added/scraped)
    const customerPhotos = (product.reviewImages && product.reviewImages.length > 0)
        ? product.reviewImages.map(img => (typeof img === 'string' ? img : img.url))
        : [];

    // Feature aspect ratings (matching screenshot)
    const aspectRatings = (product.featureRatings && product.featureRatings.length > 0)
        ? product.featureRatings
        : [
            { name: "Design & Features", rating: 3.8 },
            { name: "Value for Money", rating: 3.7 },
            { name: "Grinding Quality", rating: 3.6 },
            { name: "Noise Level", rating: 3.6 },
            { name: "Build Quality", rating: 3.5 },
            { name: "Power & Performance", rating: 3.6 }
        ];

    // Fallback positive reviews
    const fallbackReviews = [
        {
            name: "Pradeep Joshi",
            rating: 5,
            title: "Excellent",
            comment: "Nice product. Fast delivery and compact design.",
            dateStr: "1 year ago",
            likes: 142,
            dislikes: 2
        },
        {
            name: "Sunita Roy",
            rating: 5,
            title: "Superb Quality",
            comment: "Really impressive build and performance, totally worth every rupee.",
            dateStr: "1 year ago",
            likes: 98,
            dislikes: 1
        },
        {
            name: "Rahul Verma",
            rating: 4,
            title: "Must buy!",
            comment: "Very nice product for day-to-day use, smooth and powerful.",
            dateStr: "1 year ago",
            likes: 89,
            dislikes: 3
        },
        {
            name: "Naveen Kumar",
            rating: 5,
            title: "Highly recommended",
            comment: "Works smoothly and efficiently. Delivered quickly in pristine condition.",
            dateStr: "1 year ago",
            likes: 74,
            dislikes: 1
        },
        {
            name: "Aarti Mehra",
            rating: 5,
            title: "Terrific purchase",
            comment: "Smooth blending performance and very easy to wash.",
            dateStr: "8 months ago",
            likes: 56,
            dislikes: 0
        }
    ];

    const reviewsList = product.reviews && product.reviews.length > 0
        ? product.reviews
        : fallbackReviews;

    // Handle carousel scroll
    const scrollCarousel = (direction) => {
        if (carouselRef.current) {
            const scrollAmount = direction === 'left' ? -320 : 320;
            carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    const overallRating = product.ratings || 3.9;
    const ratingLabel = overallRating >= 4.2 ? "Very Good" : (overallRating >= 3.8 ? "Good" : "Average");
    const ratingsCount = product.numOfReviews || (product.reviews?.length) || 0;

    return (
        <section className="bg-white rounded-xl shadow-2xs border border-gray-200/90 p-4 sm:p-6 space-y-4">

            {/* 1. TOP HEADER (MATCHING SCREENSHOT) */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="space-y-1">
                    <h2 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">
                        Ratings and reviews
                    </h2>
                    <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex items-center gap-1">
                            <span className="text-xs sm:text-sm font-black text-gray-950 flex items-center gap-0.5">
                                <span>{overallRating}</span>
                                <span className="text-[#388e3c]">★</span>
                            </span>
                            <span className="text-xs sm:text-sm font-semibold text-gray-800">
                                {ratingLabel}
                            </span>
                        </div>
                        <span className="text-xs text-gray-400 font-normal">
                            based on {ratingsCount.toLocaleString()} ratings by Verified Buyers
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={onRateClick}
                        className="hidden sm:inline-flex px-3 py-1.5 border border-[#2874f0] text-[#2874f0] hover:bg-blue-50 rounded-md text-xs font-bold transition-colors cursor-pointer"
                    >
                        Rate Product
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsSectionOpen(!isSectionOpen)}
                        className="p-1 rounded-md hover:bg-gray-100 text-gray-500 cursor-pointer transition-colors"
                        aria-label="Toggle section"
                    >
                        {isSectionOpen ? (
                            <KeyboardArrowUpIcon sx={{ fontSize: 22 }} />
                        ) : (
                            <KeyboardArrowDownIcon sx={{ fontSize: 22 }} />
                        )}
                    </button>
                </div>
            </div>

            {isSectionOpen && (
                <div className="space-y-5 animate-fadeIn">

                    {/* 2. CUSTOMER REVIEW PHOTOS GRID (EXACT MOSAIC MATCH TO SCREENSHOT - ZERO CROPPING) */}
                    {customerPhotos.length > 0 && (
                        <div>
                            <div
                                className="w-full rounded-xl overflow-hidden shadow-2xs"
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: '45.5% 1fr 1fr',
                                    gap: '8px',
                                    aspectRatio: '880 / 418',
                                    width: '100%'
                                }}
                            >

                                {/* Photo 1 (Left Large Photo - spans 45.5% width, full height) */}
                                <div
                                    onClick={() => setLightboxIndex(0)}
                                    className="h-full relative overflow-hidden rounded-lg cursor-pointer bg-gray-100 group border border-gray-200"
                                >
                                    <img
                                        src={customerPhotos[0]}
                                        alt="Customer review 1"
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                </div>

                                {/* Photos 2 & 3 (Middle Column - spans 1fr width, 2 rows) */}
                                <div className="grid grid-rows-2 gap-2 h-full">
                                    <div
                                        onClick={() => setLightboxIndex(1)}
                                        className="h-full relative overflow-hidden rounded-lg cursor-pointer bg-gray-100 group border border-gray-200"
                                    >
                                        <img
                                            src={customerPhotos[1] || customerPhotos[0]}
                                            alt="Customer review 2"
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                    </div>
                                    <div
                                        onClick={() => setLightboxIndex(2)}
                                        className="h-full relative overflow-hidden rounded-lg cursor-pointer bg-gray-100 group border border-gray-200"
                                    >
                                        <img
                                            src={customerPhotos[2] || customerPhotos[0]}
                                            alt="Customer review 3"
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                    </div>
                                </div>

                                {/* Photos 4 & 5 (Right Column - spans 1fr width, 2 rows, with +44 overlay) */}
                                <div className="grid grid-rows-2 gap-2 h-full">
                                    <div
                                        onClick={() => setLightboxIndex(3)}
                                        className="h-full relative overflow-hidden rounded-lg cursor-pointer bg-gray-100 group border border-gray-200"
                                    >
                                        <img
                                            src={customerPhotos[3] || customerPhotos[0]}
                                            alt="Customer review 4"
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                    </div>

                                    {/* 5th Photo with +44 Overlay */}
                                    <div
                                        onClick={() => setLightboxIndex(4)}
                                        className="h-full relative overflow-hidden rounded-lg cursor-pointer bg-gray-900 group border border-gray-200"
                                    >
                                        <img
                                            src={customerPhotos[4] || customerPhotos[0]}
                                            alt="Customer review 5"
                                            className="w-full h-full object-cover opacity-75 group-hover:scale-105 transition-transform duration-300"
                                        />
                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-black text-sm sm:text-base tracking-tight">
                                            <span>+{customerPhotos.length > 5 ? (customerPhotos.length - 4) : 44}</span>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    )}

                    {/* 3. FEATURE ASPECT RATINGS ROW (MATCHING SCREENSHOT) */}
                    <div
                        className="overflow-x-auto pb-1 no-scrollbar scrollbar-none"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        <div className="flex items-center gap-2 sm:gap-2.5">
                            {aspectRatings.map((aspect, idx) => (
                                <div
                                    key={idx}
                                    className="px-3 py-1.5 rounded-md border border-gray-200 bg-white shadow-2xs flex items-center gap-1.5 text-xs text-gray-800 whitespace-nowrap shrink-0 hover:border-gray-300 transition-colors"
                                >
                                    <span className="font-medium text-gray-700">{aspect.name}</span>
                                    <span className="font-extrabold text-gray-900 flex items-center gap-0.5">
                                        <span>{aspect.rating}</span>
                                        <span className="text-[#388e3c]">★</span>
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 4. HORIZONTAL REVIEW CARDS CAROUSEL WITH '>' SCROLL ARROW */}
                    <div className="relative group">
                        <div
                            ref={carouselRef}
                            className="flex items-stretch gap-3 overflow-x-auto pb-2 pt-1 scroll-smooth no-scrollbar scrollbar-none"
                            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                        >
                            {reviewsList.map((rev, idx) => {
                                const revKey = rev._id || `carousel-rev-${idx}`;
                                const isPositive = Number(rev.rating) >= 4;
                                const isNeutral = Number(rev.rating) === 3;

                                return (
                                    <div
                                        key={revKey}
                                        className="w-64 sm:w-72 shrink-0 p-3 sm:p-3.5 rounded-lg border border-gray-200 bg-white shadow-2xs flex flex-col justify-between hover:border-gray-300 transition-colors"
                                    >
                                        <div className="space-y-1.5">
                                            {/* Header: Rating + Title ... TimeAgo */}
                                            <div className="flex items-center justify-between text-xs">
                                                <div className="flex items-center gap-1.5 min-w-0">
                                                    <span className="font-extrabold text-gray-900 flex items-center gap-0.5">
                                                        <span>{rev.rating || 5}</span>
                                                        <span className={isPositive ? "text-[#388e3c]" : (isNeutral ? "text-amber-500" : "text-red-500")}>★</span>
                                                    </span>
                                                    <span className="font-bold text-gray-900 truncate">
                                                        {rev.title || (isPositive ? "Must buy!" : "Average")}
                                                    </span>
                                                </div>
                                                <span className="text-[11px] text-gray-400 shrink-0 ml-1">
                                                    {rev.dateStr || "1 year ago"}
                                                </span>
                                            </div>

                                            {/* Comment */}
                                            <p className="text-xs text-gray-700 line-clamp-2 leading-relaxed">
                                                {rev.comment}
                                            </p>
                                        </div>

                                        <div className="pt-2 mt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
                                            <span className="font-semibold text-gray-600 truncate max-w-[120px]">
                                                {rev.name || "Customer"}
                                            </span>
                                            <div className="flex items-center gap-0.5 text-emerald-700 font-medium">
                                                <CheckCircleIcon sx={{ fontSize: 13, color: '#059669' }} />
                                                <span>Verified</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Right Arrow Scroll Button (Exact Match) */}
                        <button
                            type="button"
                            onClick={() => scrollCarousel('right')}
                            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 w-8 h-8 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center text-gray-700 hover:bg-gray-50 active:scale-95 transition-all z-10 cursor-pointer"
                            aria-label="Scroll right"
                        >
                            <ChevronRightIcon sx={{ fontSize: 20 }} />
                        </button>

                        {/* Left Arrow Scroll Button */}
                        <button
                            type="button"
                            onClick={() => scrollCarousel('left')}
                            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 w-8 h-8 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center text-gray-700 hover:bg-gray-50 active:scale-95 transition-all z-10 cursor-pointer"
                            aria-label="Scroll left"
                        >
                            <ChevronLeftIcon sx={{ fontSize: 20 }} />
                        </button>
                    </div>

                    {/* 5. INTERACTIVE REVIEW FORM (MANUAL ADDING FROM PRODUCT DETAILS) */}
                    {showReviewForm && (
                        <form onSubmit={handleReviewSubmit} className="p-4 rounded-xl bg-blue-50/50 border border-blue-200 space-y-3 animate-fadeIn">
                            <div className="flex items-center justify-between border-b border-blue-200/60 pb-2">
                                <div className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                                    <RateReviewOutlinedIcon sx={{ fontSize: 16, color: '#2874f0' }} />
                                    <span>Write a Customer Review</span>
                                </div>
                                <span className="text-[11px] text-gray-500">
                                    Posting as <span className="font-semibold text-gray-700">{user?.name || "Verified Customer"}</span>
                                </span>
                            </div>

                            {/* Rating Stars & Title */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                                        Your Rating:
                                    </label>
                                    <div className="flex items-center gap-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                type="button"
                                                key={star}
                                                onClick={() => setReviewRating(star)}
                                                className="p-1 hover:scale-110 transition-transform cursor-pointer"
                                            >
                                                <StarIcon
                                                    sx={{
                                                        fontSize: 22,
                                                        color: star <= reviewRating ? '#f59e0b' : '#d1d5db'
                                                    }}
                                                />
                                            </button>
                                        ))}
                                        <span className="text-xs font-bold text-amber-600 ml-2">
                                            {reviewRating} ★
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                                        Review Headline / Title:
                                    </label>
                                    <input
                                        type="text"
                                        value={reviewTitle || ''}
                                        onChange={(e) => setReviewTitle && setReviewTitle(e.target.value)}
                                        placeholder="e.g. Excellent, Must buy!, Great value"
                                        className="w-full text-xs p-2 rounded border border-gray-300 bg-white focus:outline-hidden focus:border-[#2874f0]"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                                    Review Details:
                                </label>
                                <textarea
                                    value={reviewComment}
                                    onChange={(e) => setReviewComment(e.target.value)}
                                    rows={3}
                                    placeholder="Describe your experience with this product (performance, quality, packaging)..."
                                    className="w-full text-xs p-2.5 rounded border border-gray-300 bg-white focus:outline-hidden focus:border-[#2874f0]"
                                    required
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-1">
                                <button
                                    type="button"
                                    onClick={() => setShowReviewForm(false)}
                                    className="px-3 py-1.5 rounded border border-gray-300 text-gray-700 text-xs font-bold hover:bg-gray-100 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submittingReview}
                                    className="px-4 py-1.5 rounded bg-[#2874f0] hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                                >
                                    {submittingReview ? "Submitting..." : "Submit Review"}
                                </button>
                            </div>
                        </form>
                    )}

                </div>
            )}

            {/* 6. LIGHTBOX / MODAL PHOTO VIEWER */}
            {lightboxIndex !== null && (
                <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-between p-4 sm:p-6 animate-fadeIn">
                    <div className="w-full max-w-4xl flex items-center justify-between text-white">
                        <div className="text-sm font-bold">
                            Customer Review Photos ({lightboxIndex + 1} of {customerPhotos.length})
                        </div>
                        <button
                            type="button"
                            onClick={() => setLightboxIndex(null)}
                            className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors"
                        >
                            <CloseIcon sx={{ fontSize: 22 }} />
                        </button>
                    </div>

                    <div className="relative flex items-center justify-center max-w-4xl max-h-[70vh] w-full my-auto">
                        <img
                            src={customerPhotos[lightboxIndex]}
                            alt={`Customer review enlarged ${lightboxIndex + 1}`}
                            className="max-h-[65vh] max-w-full object-contain rounded-lg shadow-2xl"
                        />

                        {/* Prev / Next controls */}
                        {customerPhotos.length > 1 && (
                            <>
                                <button
                                    type="button"
                                    onClick={() => setLightboxIndex((lightboxIndex - 1 + customerPhotos.length) % customerPhotos.length)}
                                    className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center cursor-pointer transition-colors"
                                >
                                    <ChevronLeftIcon sx={{ fontSize: 26 }} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setLightboxIndex((lightboxIndex + 1) % customerPhotos.length)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center cursor-pointer transition-colors"
                                >
                                    <ChevronRightIcon sx={{ fontSize: 26 }} />
                                </button>
                            </>
                        )}
                    </div>

                    {/* Thumbnails strip */}
                    <div className="w-full max-w-2xl flex items-center justify-center gap-2 overflow-x-auto py-2">
                        {customerPhotos.map((photo, i) => (
                            <button
                                key={i}
                                type="button"
                                onClick={() => setLightboxIndex(i)}
                                className={`w-12 h-12 rounded overflow-hidden border-2 transition-all cursor-pointer ${
                                    lightboxIndex === i ? 'border-[#2874f0] scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                                }`}
                            >
                                <img src={photo} alt="thumbnail" className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </section>
    );
};

export default ReviewsSection;
