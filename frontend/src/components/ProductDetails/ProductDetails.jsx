import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { clearErrors, getProductDetails, getProducts } from '../../actions/productAction';
import { addItemsToCart } from '../../actions/cartAction';
import { addToWishlist, removeFromWishlist } from '../../actions/wishlistAction';
import Loader from '../Layouts/Loader';
import MetaData from '../Layouts/MetaData';
import FAssuredBadge from '../Layouts/FAssuredBadge';
import ReviewsSection from './ReviewsSection';

// Icons
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import AutorenewOutlinedIcon from '@mui/icons-material/AutorenewOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { fallbackProducts } from '../../data/storeFallbackData';

const ProductDetails = () => {
    const dispatch = useDispatch();
    const { enqueueSnackbar } = useSnackbar();
    const params = useParams();
    const navigate = useNavigate();

    const productId = params.id;
    const { product: rawProduct, loading, error } = useSelector((state) => state.productDetails);
    const { products: allProductsRaw } = useSelector((state) => state.products);
    const product = useMemo(() => {
        return (rawProduct && rawProduct.name) ? rawProduct : (fallbackProducts.find(p => String(p._id) === String(productId)) || rawProduct || {});
    }, [rawProduct, productId]);

    const allProducts = useMemo(() => {
        return (allProductsRaw && allProductsRaw.length > 0) ? allProductsRaw : fallbackProducts;
    }, [allProductsRaw]);
    const { isAuthenticated, user } = useSelector((state) => state.user);
    const { cartItems } = useSelector((state) => state.cart);
    const { wishlistItems } = useSelector((state) => state.wishlist);

    // Selected image index & variant
    const [selectedImgIndex, setSelectedImgIndex] = useState(0);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [appliedOffer, setAppliedOffer] = useState(null);

    // Accordions state (matching reference image)
    const [isPeaceOfMindOpen, setIsPeaceOfMindOpen] = useState(true);
    const [isAllDetailsOpen, setIsAllDetailsOpen] = useState(false);

    // Review form state
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewTitle, setReviewTitle] = useState('Must buy!');
    const [reviewComment, setReviewComment] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);

    const itemInWishlist = wishlistItems.some((i) => i.product === productId);
    const itemInCart = cartItems.some((i) => i.product === productId);

    useEffect(() => {
        if (error) {
            enqueueSnackbar(error, { variant: "error" });
            dispatch(clearErrors());
        }
        dispatch(getProductDetails(productId));
    }, [dispatch, productId, error, enqueueSnackbar]);

    useEffect(() => {
        if (!allProducts || allProducts.length === 0) {
            dispatch(getProducts());
        }
    }, [dispatch, allProducts]);

    useEffect(() => {
        if (product && product.variants && product.variants.length > 0) {
            setSelectedVariant(product.variants[product.variants.length - 1]);
        }
    }, [product]);

    // Reset applied offer when productId or variant changes
    useEffect(() => {
        setAppliedOffer(null);
        setSelectedImgIndex(0);
    }, [productId]);

    const addToWishlistHandler = () => {
        if (itemInWishlist) {
            dispatch(removeFromWishlist(productId));
            enqueueSnackbar("Removed From Wishlist", { variant: "info" });
        } else {
            dispatch(addToWishlist(productId));
            enqueueSnackbar("Added To Wishlist", { variant: "success" });
        }
    };

    const addToCartHandler = async () => {
        if (itemInCart) {
            navigate('/cart');
            return;
        }
        await dispatch(addItemsToCart(productId, 1, product));
        enqueueSnackbar("Product Added To Cart", { variant: "success" });
    };

    const buyNowHandler = async () => {
        if (!itemInCart) {
            await dispatch(addItemsToCart(productId, 1, product));
        }
        navigate('/order/confirm');
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: product?.name || 'Flipkart Product',
                url: window.location.href,
            }).catch(() => {});
        } else {
            navigator.clipboard.writeText(window.location.href);
            enqueueSnackbar("Product link copied to clipboard!", { variant: "success" });
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!isAuthenticated) {
            enqueueSnackbar("Please login to submit a review", { variant: "warning" });
            navigate('/login');
            return;
        }
        if (!reviewComment.trim()) {
            enqueueSnackbar("Please write a short review comment", { variant: "warning" });
            return;
        }

        setSubmittingReview(true);
        try {
            const config = { headers: { "Content-Type": "application/json" } };
            const reviewerName = user?.role === 'admin' || user?.name?.toLowerCase().includes('admin')
                ? 'Verified Customer'
                : user?.name;

            const { data } = await axios.put('/api/v1/review', {
                rating: reviewRating,
                title: reviewTitle || (reviewRating >= 4 ? "Must buy!" : (reviewRating === 3 ? "Average quality" : "Bad quality")),
                comment: reviewComment,
                productId,
                name: reviewerName
            }, config);

            if (data.success) {
                enqueueSnackbar("Thank you! Review submitted successfully.", { variant: "success" });
                setReviewComment('');
                setShowReviewForm(false);
                dispatch(getProductDetails(productId));
            }
        } catch (err) {
            enqueueSnackbar(err.response?.data?.message || "Failed to submit review", { variant: "error" });
        } finally {
            setSubmittingReview(false);
        }
    };

    if (loading || !product || !product.name) {
        return <Loader />;
    }

    // Dynamic price based on variant or product
    const currentPrice = selectedVariant?.price || product.price || 0;
    const currentCuttedPrice = selectedVariant?.cuttedPrice || product.cuttedPrice || Math.round(currentPrice * 1.5);

    // Dynamic bank discounts matching reference image (₹50 off for budget items, scaling with price)
    const discountFkAxis = currentPrice < 500 ? 25 : (currentPrice < 2000 ? 50 : Math.min(1200, Math.round(currentPrice * 0.10)));
    const discountFkSbi = currentPrice < 500 ? 25 : (currentPrice < 2000 ? 50 : Math.min(1250, Math.round(currentPrice * 0.10)));

    // Effective price when an offer is applied
    const activeDiscount = appliedOffer ? Math.min(appliedOffer.discount, currentPrice - 1) : 0;
    const effectivePrice = Math.max(1, currentPrice - activeDiscount);

    const discountPercent = currentCuttedPrice > effectivePrice
        ? Math.round(((currentCuttedPrice - effectivePrice) / currentCuttedPrice) * 100)
        : 75;

    const images = product.images && product.images.length > 0 
        ? product.images 
        : [{ url: '/assets/boat/boat_soundbar_1.jpg' }];

    const activeImage = images[selectedImgIndex]?.url || images[0]?.url;

    const handleApplyOffer = (offer) => {
        if (appliedOffer?.id === offer.id) {
            setAppliedOffer(null);
            enqueueSnackbar("Offer removed. Regular price restored.", { variant: "info" });
        } else {
            setAppliedOffer(offer);
            enqueueSnackbar(`Offer applied! Saved ${offer.title}`, { variant: "success" });
        }
    };

    // Filter out current product for Similar Products
    const similarProducts = (allProducts || []).filter((p) => p._id !== productId);

    return (
        <div className="min-h-screen bg-[#f1f2f4] pb-24 text-[#212121]">
            <MetaData title={`${product.name} - Flipkart`} />

            {/* BREADCRUMB NAVIGATION & QUICK BACK LINK */}
            <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 text-xs text-gray-500 flex items-center justify-between">
                <div className="flex items-center gap-2 truncate">
                    <button 
                        onClick={() => navigate(-1)} 
                        className="flex items-center gap-1 text-gray-700 hover:text-[#2874f0] font-bold pr-2.5 border-r border-gray-300"
                        title="Go back"
                    >
                        <ArrowBackIcon sx={{ fontSize: 16 }} />
                        <span className="text-xs">Back</span>
                    </button>

                    <Link to="/" className="hover:text-[#2874f0] font-semibold flex items-center gap-1 shrink-0">
                        <span className="bg-[#ffe11b] text-gray-900 px-1.5 py-0.2 rounded font-black text-[10px]">Flipkart</span>
                        <span>Home</span>
                    </Link>
                    <span>/</span>
                    <Link to={`/products?category=${encodeURIComponent(product.category || 'All')}`} className="hover:text-[#2874f0] truncate shrink-0">
                        {product.category || 'Products'}
                    </Link>
                    {product.brand?.name && (
                        <>
                            <span>/</span>
                            <Link to={`/products?keyword=${encodeURIComponent(product.brand.name)}`} className="hover:text-[#2874f0] truncate shrink-0">
                                {product.brand.name}
                            </Link>
                        </>
                    )}
                    <span>/</span>
                    <span className="text-gray-900 font-medium truncate">{product.name}</span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <button 
                        onClick={handleShare}
                        className="flex items-center gap-1 text-xs text-gray-600 hover:text-[#2874f0] px-2 py-1 rounded-md hover:bg-white"
                        title="Share product"
                    >
                        <ShareOutlinedIcon sx={{ fontSize: 16 }} />
                        <span className="hidden sm:inline">Share</span>
                    </button>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-2 sm:px-6 space-y-4">
                {/* 1. MAIN PRODUCT DETAILS CARD (2 COLUMNS) */}
                <div className="bg-white rounded-2xl shadow-xs border border-gray-200 p-3 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* LEFT COLUMN: PRODUCT IMAGE GALLERY */}
                    <div className="lg:col-span-6 space-y-3">
                        
                        {/* Main Active Image Display */}
                        <div className="relative aspect-square max-h-[460px] w-full bg-white rounded-2xl border border-gray-100 flex items-center justify-center overflow-hidden group">
                            <img
                                src={activeImage}
                                alt={product.name}
                                className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                                onError={(e) => { e.target.src = '/assets/boat/boat_soundbar_1.jpg'; }}
                            />

                            {/* Floating Rating Pill over bottom left of image */}
                            <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-full shadow-md border border-gray-200/80 flex items-center gap-1 text-[11px] font-bold text-gray-800">
                                <span>{product.ratings || 4.2}</span>
                                <span className="text-[#388e3c]">★</span>
                                <span className="text-gray-400 font-normal">| {(product.numOfReviews || (product.reviews?.length) || 0).toLocaleString()}</span>
                            </div>

                            {/* Floating Heart & Share on top right */}
                            <div className="absolute top-3 right-3 flex flex-col gap-2">
                                <button
                                    onClick={addToWishlistHandler}
                                    className="w-9 h-9 rounded-full bg-white/95 hover:bg-white shadow-md flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
                                    title={itemInWishlist ? "In wishlist" : "Add to wishlist"}
                                >
                                    {itemInWishlist ? (
                                        <FavoriteIcon sx={{ fontSize: 20, color: '#ef4444' }} />
                                    ) : (
                                        <FavoriteBorderIcon sx={{ fontSize: 20 }} />
                                    )}
                                </button>
                                <button
                                    onClick={handleShare}
                                    className="w-9 h-9 rounded-full bg-white/95 hover:bg-white shadow-md flex items-center justify-center text-gray-600 hover:text-blue-600 transition-colors"
                                    title="Share product"
                                >
                                    <ShareOutlinedIcon sx={{ fontSize: 18 }} />
                                </button>
                            </div>
                        </div>

                        {/* Carousel Dots Indicator for Mobile */}
                        {images.length > 1 && (
                            <div className="flex items-center justify-center gap-1.5 py-0.5 sm:hidden">
                                {images.map((_, dotIdx) => (
                                    <button
                                        key={dotIdx}
                                        onClick={() => setSelectedImgIndex(dotIdx)}
                                        className={`rounded-full transition-all ${
                                            selectedImgIndex === dotIdx
                                                ? 'w-5 h-1.5 bg-[#2874f0]'
                                                : 'w-1.5 h-1.5 bg-gray-300'
                                        }`}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Thumbnails Strip */}
                        <div className="grid grid-cols-4 sm:grid-cols-4 gap-2.5">
                            {images.map((img, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => setSelectedImgIndex(idx)}
                                    className={`aspect-square rounded-xl bg-white border-2 overflow-hidden cursor-pointer p-1 transition-all flex items-center justify-center ${
                                        selectedImgIndex === idx
                                            ? 'border-[#2874f0] shadow-sm'
                                            : 'border-gray-200 hover:border-gray-400'
                                    }`}
                                >
                                    <img
                                        src={img.url}
                                        alt={`Thumb ${idx}`}
                                        className="w-full h-full object-contain"
                                        onError={(e) => { e.target.src = '/assets/boat/boat_soundbar_1.jpg'; }}
                                    />
                                </div>
                            ))}
                        </div>

                    </div>

                    {/* RIGHT COLUMN: EXACT NATURAL UI MATCHING REFERENCE IMAGE */}
                    <div className="lg:col-span-6 space-y-4">

                        {/* Title & Brand */}
                        <div className="space-y-1">
                            <div className="text-xs font-bold text-[#2874f0]">
                                <Link to={`/products?keyword=${encodeURIComponent(product.brand?.name || 'Flipkart')}`} className="hover:underline">
                                    {product.brand?.name || 'BOOSTER'} | Visit store
                                </Link>
                            </div>

                            <h1 className="text-sm sm:text-base font-normal text-gray-900 leading-snug">
                                {product.name}
                            </h1>

                            {/* Rating pill */}
                            <div className="flex items-center gap-2 pt-0.5">
                                <div className="flex items-center gap-0.5 bg-[#388e3c] text-white text-xs font-bold px-1.5 py-0.5 rounded-sm">
                                    <span>{product.ratings || 4.2}</span>
                                    <span className="text-[10px]">★</span>
                                </div>
                                <span className="text-xs text-gray-500 font-medium">
                                    {(product.numOfReviews || (product.reviews?.length) || 0).toLocaleString()} ratings
                                </span>
                                <FAssuredBadge />
                            </div>
                        </div>

                        {/* PRICING SECTION */}
                        <div className="pt-1 pb-2 border-b border-gray-100">
                            <div className="flex items-baseline gap-2">
                                <span className="text-[#388e3c] font-black text-base flex items-center">
                                    <span>↓</span>{discountPercent}%
                                </span>
                                {currentCuttedPrice > effectivePrice && (
                                    <span className="text-gray-400 line-through text-xs font-medium">
                                        ₹{currentCuttedPrice.toLocaleString()}
                                    </span>
                                )}
                                <span className="text-gray-950 font-black text-2xl sm:text-3xl">
                                    ₹{effectivePrice.toLocaleString()}
                                </span>
                                {appliedOffer && (
                                    <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-md">
                                        Offer Applied (-₹{appliedOffer.discount})
                                    </span>
                                )}
                            </div>

                            <div className="text-[11px] text-gray-500 mt-1 cursor-pointer hover:underline flex items-center gap-1">
                                <span>+ ₹{product.protectFee || 19} Protect Promise Fee</span>
                                <span className="font-bold">&gt;</span>
                            </div>
                        </div>

                        {/* 1. BANK OFFERS (EXACT BLUE-BORDERED BOX AS IN REFERENCE IMAGE) */}
                        <div className="rounded-2xl border-2 border-[#53a0fd] p-3.5 bg-white space-y-2">
                            <div className="text-xs font-bold text-gray-900">
                                Bank offers
                            </div>

                            <div>
                                <span className="inline-block bg-[#fbf4d7] text-[#876a00] text-[10px] font-bold px-2 py-0.5 rounded-sm">
                                    Best value for you
                                </span>
                            </div>

                            {/* 2 Side-by-Side Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-0.5">
                                
                                {/* Card 1: Flipkart Axis */}
                                <div className={`rounded-xl border transition-all overflow-hidden bg-white ${
                                    appliedOffer?.id === 'fk-axis' ? 'border-emerald-500 ring-1 ring-emerald-500' : 'border-gray-200'
                                }`}>
                                    <div className="p-2.5 flex items-start justify-between">
                                        <div className="flex items-start gap-2">
                                            <span className="w-5 h-3.5 bg-gradient-to-r from-[#97144d] to-[#ed1164] rounded-xs text-[6px] text-white font-black flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                                                AXIS
                                            </span>
                                            <div>
                                                <div className="text-xs font-bold text-gray-900 leading-tight">
                                                    ₹{discountFkAxis.toLocaleString()} off
                                                </div>
                                                <div className="text-[11px] text-gray-600">
                                                    Flipkart Axis
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleApplyOffer({ id: 'fk-axis', title: `₹${discountFkAxis} off`, discount: discountFkAxis })}
                                            className="text-xs font-bold text-[#2874f0] hover:underline"
                                        >
                                            {appliedOffer?.id === 'fk-axis' ? 'Already applied' : 'Apply'}
                                        </button>
                                    </div>

                                    <div className="bg-[#f8f9fa] border-t border-gray-100 px-2.5 py-1 flex items-center justify-between text-[10px] text-gray-600 font-medium">
                                        <span>Credit Card • Cashback</span>
                                        <span className="text-gray-400 font-bold">&gt;</span>
                                    </div>
                                </div>

                                {/* Card 2: Flipkart SBI */}
                                <div className={`rounded-xl border transition-all overflow-hidden bg-white ${
                                    appliedOffer?.id === 'fk-sbi' ? 'border-emerald-500 ring-1 ring-emerald-500' : 'border-gray-200'
                                }`}>
                                    <div className="p-2.5 flex items-start justify-between">
                                        <div className="flex items-start gap-2">
                                            <span className="w-5 h-3.5 bg-gradient-to-r from-[#0088cc] to-[#005599] rounded-xs text-[6px] text-white font-black flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                                                SBI
                                            </span>
                                            <div>
                                                <div className="text-xs font-bold text-gray-900 leading-tight">
                                                    ₹{discountFkSbi.toLocaleString()} off
                                                </div>
                                                <div className="text-[11px] text-gray-600">
                                                    Flipkart SBI
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleApplyOffer({ id: 'fk-sbi', title: `₹${discountFkSbi} off`, discount: discountFkSbi })}
                                            className="text-xs font-bold text-[#2874f0] hover:underline"
                                        >
                                            {appliedOffer?.id === 'fk-sbi' ? 'Already applied' : 'Apply'}
                                        </button>
                                    </div>

                                    <div className="bg-[#f8f9fa] border-t border-gray-100 px-2.5 py-1 flex items-center justify-between text-[10px] text-gray-600 font-medium">
                                        <span>Credit Card • Cashback</span>
                                        <span className="text-gray-400 font-bold">&gt;</span>
                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* 2. DELIVERY DETAILS (EXACT PILL BOXES AS IN REFERENCE IMAGE) */}
                        <div className="space-y-2 pt-1">
                            <h3 className="text-sm font-bold text-gray-900">Delivery details</h3>
                            
                            <div className="space-y-2">
                                {/* Location pill */}
                                <div className="bg-[#f0f6ff] text-gray-900 rounded-xl px-3.5 py-2.5 flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-1.5 font-semibold text-gray-900">
                                        <LocationOnOutlinedIcon sx={{ fontSize: 16, color: '#374151' }} />
                                        <span>Location not set</span>
                                    </div>
                                    <span className="text-[#2874f0] font-bold cursor-pointer hover:underline">
                                        Select delivery location &gt;
                                    </span>
                                </div>

                                {/* Delivery date pill */}
                                <div className="bg-[#f5f6f8] text-gray-800 rounded-xl px-3.5 py-2.5 flex items-center gap-2 text-xs font-medium">
                                    <LocalShippingOutlinedIcon sx={{ fontSize: 18, color: '#374151' }} />
                                    <span>Delivery by <strong className="text-gray-900 font-bold">{product.deliveryDate || 'Friday, 13 Nov'}</strong></span>
                                </div>

                                {/* Seller pill */}
                                <div className="bg-[#f5f6f8] text-gray-800 rounded-xl px-3.5 py-2.5 flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-2 min-w-0 pr-2">
                                        <StorefrontOutlinedIcon sx={{ fontSize: 18, color: '#374151', shrink: 0 }} />
                                        <div className="truncate">
                                            <span className="text-gray-900 font-bold">
                                                Seller: {product.brand?.name ? `${product.brand.name.toUpperCase()}INDUSTRYINDIA` : 'BOOSTERINDUSTRYINDIA'}
                                            </span>
                                            <div className="text-[11px] text-gray-500 font-normal">
                                                3.8★ • 1 year with Flipkart
                                            </div>
                                        </div>
                                    </div>

                                    <span className="text-[#2874f0] font-bold cursor-pointer hover:underline text-xs shrink-0">
                                        See other sellers
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* 3. SHOP WITH PEACE OF MIND (EXACT AS IN REFERENCE IMAGE) */}
                        <div className="space-y-3 pt-2">
                            <div 
                                onClick={() => setIsPeaceOfMindOpen(!isPeaceOfMindOpen)}
                                className="flex items-center justify-between cursor-pointer"
                            >
                                <h3 className="text-sm font-bold text-gray-900">Shop with peace of mind</h3>
                                <button className="text-gray-600 p-0.5">
                                    {isPeaceOfMindOpen ? <KeyboardArrowUpIcon sx={{ fontSize: 20 }} /> : <KeyboardArrowDownIcon sx={{ fontSize: 20 }} />}
                                </button>
                            </div>

                            {isPeaceOfMindOpen && (
                                <div className="space-y-3 animate-fadeIn">
                                    {/* Warranty box */}
                                    <div className="bg-[#f5f6f8] rounded-xl p-3 flex items-start gap-3 text-xs text-gray-800 leading-snug">
                                        <div className="w-8 h-8 rounded-lg bg-blue-100/70 text-[#2874f0] flex items-center justify-center shrink-0 mt-0.5">
                                            <AssignmentTurnedInOutlinedIcon sx={{ fontSize: 18 }} />
                                        </div>
                                        <div className="text-gray-700 text-xs">
                                            {product.warranty 
                                                ? `${product.warranty * 12}-Month Motor Warranty From The Date Of Purchase. To Extend The Warranty By An Addition...`
                                                : "12-Month Motor Warranty From The Date Of Purchase. To Extend The Warranty By An Addition..."}
                                        </div>
                                    </div>

                                    {/* 3 Trust Badges */}
                                    <div className="grid grid-cols-3 gap-2 text-center py-1">
                                        <div className="flex flex-col items-center gap-1.5">
                                            <div className="w-9 h-9 rounded-full bg-[#f0f6ff] text-[#2874f0] flex items-center justify-center">
                                                <AccessTimeOutlinedIcon sx={{ fontSize: 18 }} />
                                            </div>
                                            <span className="text-[11px] text-gray-700 font-medium leading-tight">
                                                Cancellation upto 24hrs
                                            </span>
                                        </div>

                                        <div className="flex flex-col items-center gap-1.5">
                                            <div className="w-9 h-9 rounded-full bg-[#f0f6ff] text-[#2874f0] flex items-center justify-center">
                                                <AutorenewOutlinedIcon sx={{ fontSize: 18 }} />
                                            </div>
                                            <span className="text-[11px] text-gray-700 font-medium leading-tight">
                                                7 Days Replacement
                                            </span>
                                        </div>

                                        <div className="flex flex-col items-center gap-1.5">
                                            <div className="w-9 h-9 rounded-full bg-[#f0f6ff] text-[#2874f0] flex items-center justify-center">
                                                <PaymentsOutlinedIcon sx={{ fontSize: 18 }} />
                                            </div>
                                            <span className="text-[11px] text-gray-700 font-medium leading-tight">
                                                Cash on Delivery
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <hr className="border-gray-200 mt-2" />
                        </div>

                        {/* 4. ALL DETAILS ACCORDION (EXACT AS IN REFERENCE IMAGE) */}
                        <div className="space-y-2 pt-1">
                            <div 
                                onClick={() => setIsAllDetailsOpen(!isAllDetailsOpen)}
                                className="flex items-center justify-between cursor-pointer py-1"
                            >
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900">All details</h3>
                                    <p className="text-xs text-gray-500">Features, description and more</p>
                                </div>
                                <button className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600">
                                    {isAllDetailsOpen ? <KeyboardArrowUpIcon sx={{ fontSize: 18 }} /> : <KeyboardArrowDownIcon sx={{ fontSize: 18 }} />}
                                </button>
                            </div>

                            {isAllDetailsOpen && (
                                <div className="space-y-3 pt-2 text-xs text-gray-700 animate-fadeIn">
                                    {/* Highlights */}
                                    {product.highlights && product.highlights.length > 0 && (
                                        <div className="space-y-1.5">
                                            <div className="font-bold text-gray-900 text-xs">Highlights</div>
                                            <ul className="list-disc pl-4 space-y-1 text-gray-700">
                                                {product.highlights.map((h, i) => (
                                                    <li key={i}>{h}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Description */}
                                    {product.description && (
                                        <div className="space-y-1 pt-1">
                                            <div className="font-bold text-gray-900 text-xs">Description</div>
                                            <p className="text-gray-600 leading-relaxed">{product.description}</p>
                                        </div>
                                    )}

                                    {/* Specifications */}
                                    {product.specifications && product.specifications.length > 0 && (
                                        <div className="space-y-1.5 pt-1">
                                            <div className="font-bold text-gray-900 text-xs">Specifications</div>
                                            <div className="border border-gray-200 rounded-xl overflow-hidden">
                                                {product.specifications.map((s, i) => (
                                                    <div key={i} className={`flex text-xs p-2.5 ${i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                                                        <span className="w-1/3 text-gray-500 font-medium">{s.title}</span>
                                                        <span className="w-2/3 text-gray-800 font-medium">{s.description}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* 5. INLINE ACTION BUTTONS (MATCHING EXACT BOTTOM OF REFERENCE IMAGE) */}
                        <div className="pt-3 flex items-center gap-3">
                            <button
                                onClick={addToCartHandler}
                                className="flex-1 py-3 px-4 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-900 font-bold text-sm text-center shadow-xs transition-colors"
                            >
                                {itemInCart ? "Go to cart" : "Add to cart"}
                            </button>

                            <button
                                onClick={buyNowHandler}
                                className="flex-1 py-2 px-4 rounded-xl bg-[#ffd200] hover:bg-[#ffcc00] text-gray-950 font-bold text-center leading-tight shadow-xs transition-colors flex flex-col items-center justify-center"
                            >
                                <span className="text-xs sm:text-sm">Buy now</span>
                                <span className="text-xs font-black">at ₹{effectivePrice.toLocaleString()}</span>
                            </button>
                        </div>

                    </div>

                </div>

                {/* 2. RATINGS & CUSTOMER REVIEWS (MATCHING FLIPKART SCREENSHOT EXACTLY) */}
                <ReviewsSection
                    product={product}
                    isAuthenticated={isAuthenticated}
                    user={user}
                    onRateClick={() => {
                        if (!isAuthenticated) {
                            enqueueSnackbar("Please login to write a review", { variant: "warning" });
                            navigate('/login');
                        } else {
                            setShowReviewForm(!showReviewForm);
                        }
                    }}
                    showReviewForm={showReviewForm}
                    setShowReviewForm={setShowReviewForm}
                    reviewRating={reviewRating}
                    setReviewRating={setReviewRating}
                    reviewComment={reviewComment}
                    setReviewComment={setReviewComment}
                    reviewTitle={reviewTitle}
                    setReviewTitle={setReviewTitle}
                    handleReviewSubmit={handleReviewSubmit}
                    submittingReview={submittingReview}
                />

                {/* 3. SIMILAR PRODUCTS & RECOMMENDED PRODUCTS (AUTOMATICALLY POPULATED) */}
                {similarProducts.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-xs border border-gray-200 p-3.5 sm:p-6 space-y-3 sm:space-y-4">
                        <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0 flex-1">
                                <h2 className="text-sm sm:text-lg font-bold text-gray-900 truncate sm:whitespace-normal">
                                    Similar Products
                                </h2>
                                <p className="text-[11px] sm:text-xs text-gray-500 truncate sm:whitespace-normal">
                                    Customers who viewed this item also explored
                                </p>
                            </div>
                            <Link
                                to="/products"
                                className="shrink-0 whitespace-nowrap text-xs font-bold text-[#2874f0] hover:underline flex items-center gap-1 py-1"
                            >
                                <span>View all</span>
                                <ArrowForwardIosIcon sx={{ fontSize: 10 }} />
                            </Link>
                        </div>

                        {/* Horizontal Scrollable Rail of Other Products */}
                        <div className="flex items-stretch gap-3 overflow-x-auto no-scrollbar py-2 px-1">
                            {similarProducts.map((item) => {
                                const itemDiscount = item.cuttedPrice > item.price
                                    ? Math.round(((item.cuttedPrice - item.price) / item.cuttedPrice) * 100)
                                    : 75;
                                const itemImg = item.images && item.images[0]?.url 
                                    ? item.images[0].url 
                                    : '/assets/boat/boat_soundbar_1.jpg';

                                return (
                                    <div
                                        key={item._id}
                                        onClick={() => {
                                            navigate(`/product/${item._id}`);
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }}
                                        className="w-[190px] sm:w-[220px] shrink-0 rounded-2xl border border-gray-200/80 bg-white hover:border-[#2874f0] hover:shadow-md transition-all p-3 cursor-pointer flex flex-col justify-between group"
                                    >
                                        <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center p-2">
                                            <img
                                                src={itemImg}
                                                alt={item.name}
                                                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                                                onError={(e) => { e.target.src = '/assets/boat/boat_soundbar_1.jpg'; }}
                                            />
                                            <span className="absolute top-2 left-2 bg-[#8b23a9] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-xs">
                                                Special Price
                                            </span>
                                        </div>

                                        <div className="pt-2.5 space-y-1.5">
                                            <h3 className="text-xs font-medium text-gray-900 line-clamp-2 leading-snug group-hover:text-[#2874f0] min-h-[32px]">
                                                {item.name}
                                            </h3>

                                            <div className="flex items-center gap-1.5 pt-0.5">
                                                <div className="flex items-center gap-0.5 bg-[#388e3c] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-xs">
                                                    <span>{item.ratings || 4.3}</span>
                                                    <span>★</span>
                                                </div>
                                                <span className="text-[10px] text-gray-400">
                                                    ({(item.numOfReviews || (item.reviews?.length) || 0).toLocaleString()})
                                                </span>
                                            </div>

                                            <div className="flex items-baseline gap-1.5 pt-1">
                                                <span className="text-sm font-black text-gray-950">
                                                    ₹{item.price?.toLocaleString()}
                                                </span>
                                                {item.cuttedPrice > item.price && (
                                                    <span className="text-[10px] text-gray-400 line-through">
                                                        ₹{item.cuttedPrice?.toLocaleString()}
                                                    </span>
                                                )}
                                                <span className="text-[10px] font-bold text-[#388e3c]">
                                                    ↓{itemDiscount}%
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </main>

            {/* FIXED BOTTOM BUY BAR (ALWAYS VISIBLE ON ALL MOBILE PRODUCTS) */}
            <div className="fixed bottom-0 left-0 right-0 z-[100] bg-white border-t border-gray-200 shadow-2xl p-2.5 md:hidden safe-area-pb">
                <div className="flex items-center gap-2.5">
                    <button
                        type="button"
                        onClick={addToCartHandler}
                        className="flex-1 py-3 px-4 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-900 font-bold text-xs text-center shadow-2xs transition-all cursor-pointer"
                    >
                        {itemInCart ? "Go to cart" : "Add to cart"}
                    </button>

                    <button
                        type="button"
                        onClick={buyNowHandler}
                        className="flex-1 py-2 px-4 rounded-xl bg-[#ffd200] hover:bg-[#ffcc00] active:bg-[#e6be00] text-gray-950 font-bold text-center leading-tight shadow-md flex flex-col items-center justify-center transition-all cursor-pointer"
                    >
                        <span className="text-xs">Buy now</span>
                        <span className="text-xs font-black">at ₹{effectivePrice.toLocaleString()}</span>
                    </button>
                </div>
            </div>

        </div>
    );
};

export default ProductDetails;
