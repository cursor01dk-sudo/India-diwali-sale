import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { getProducts } from '../../actions/productAction';
import MetaData from '../Layouts/MetaData';
import ProductCard from '../Products/ProductCard';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import AutorenewOutlinedIcon from '@mui/icons-material/AutorenewOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';

const quickActions = [
    { name: "Credit Card", short: "Credit C...", icon: "/assets/banners/action_credit_card.png", link: "/products" },
    { name: "Flipkart UPI", short: "Flipkart ...", icon: "/assets/banners/action_flipkart_axis.png", link: "/products" },
    { name: "Pay Later", short: "Pay Later", icon: "/assets/banners/action_pay_later.png", link: "/products" },
    { name: "Loans", short: "Loans", icon: "/assets/banners/action_loans.png", link: "/products" },
    { name: "Gift Cards", short: "Gift Cards", icon: "/assets/banners/action_gift_cards.png", link: "/products" },
    { name: "Sell Phone", short: "Sell Pho...", icon: "/assets/banners/action_sell_phone.png", link: "/products" },
    { name: "SuperCoins", short: "SuperC...", icon: "/assets/banners/action_supercoins.png", link: "/products" },
    { name: "BLACK", short: "BLACK", icon: "/assets/banners/action_black.png", link: "/products" },
    { name: "Pay", short: "Pay", icon: "/assets/banners/action_pay.png", link: "/products" },
    { name: "For GenZ", short: "For GenZ", icon: "/assets/banners/action_genz.png", link: "/products" },
    { name: "Originals", short: "Originals", icon: "/assets/banners/action_originals.png", link: "/products" },
    { name: "Vouchers", short: "Vouchers", icon: "/assets/banners/action_vouchers.png", link: "/products" },
    { name: "Next Gen", short: "Next Gen", icon: "/assets/banners/action_next_gen.png", link: "/products" },
];

const Home = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { products, loading } = useSelector((state) => state.products);

    // Dynamic banners state (fetched from backend API)
    const [banners, setBanners] = useState([]);

    // Quick actions row scroll handlers
    const actionsScrollRef = useRef(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const checkActionsScroll = () => {
        if (actionsScrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = actionsScrollRef.current;
            setCanScrollLeft(scrollLeft > 8);
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 8);
        }
    };

    const handleScrollActions = (direction) => {
        if (actionsScrollRef.current) {
            const scrollAmount = direction === 'left' ? -260 : 260;
            actionsScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    useEffect(() => {
        checkActionsScroll();
        const el = actionsScrollRef.current;
        if (el) {
            el.addEventListener('scroll', checkActionsScroll);
            window.addEventListener('resize', checkActionsScroll);
            return () => {
                el.removeEventListener('scroll', checkActionsScroll);
                window.removeEventListener('resize', checkActionsScroll);
            };
        }
    }, []);

    useEffect(() => {
        dispatch(getProducts());

        // Fetch dynamic banners from backend
        const fetchBanners = async () => {
            try {
                const { data } = await axios.get('/api/v1/banners');
                if (data.success && data.banners) {
                    setBanners(data.banners);
                    localStorage.setItem('fk_custom_banners', JSON.stringify(data.banners));
                }
            } catch (err) {
                const saved = localStorage.getItem('fk_custom_banners');
                if (saved) setBanners(JSON.parse(saved));
            }
        };
        fetchBanners();
    }, [dispatch]);

    // Filter banners by type
    const heroBanners = banners.filter(b => b.type === 'hero_banner' && b.isActive !== false);
    const carouselCards = banners.filter(b => b.type === 'carousel_card' && b.isActive !== false);
    const wideBanners = banners.filter(b => b.type === 'wide_banner' && b.isActive !== false);

    // Interactive Infinite Looping Banner Track with Swipe / Touch Drag & Momentum
    const bannerTrackRef = useRef(null);
    const bannerOffsetRef = useRef(0);
    const bannerUnitWidthRef = useRef(0);
    const isBannerDraggingRef = useRef(false);
    const bannerStartXRef = useRef(0);
    const bannerStartOffsetRef = useRef(0);
    const bannerLastXRef = useRef(0);
    const bannerLastTimeRef = useRef(0);
    const bannerVelocityRef = useRef(0);
    const bannerHasMovedRef = useRef(false);
    const [isBannerGrabbing, setIsBannerGrabbing] = useState(false);

    // Safe fallbacks matching latest screenshot
    const activeHeroBanner = heroBanners.length > 0 ? heroBanners[0] : {
        _id: 'default-hero',
        title: "BIG BANG DIWALI | BANK OFFER REFRESHED",
        image: "/assets/banners/banner_bank_offer.jpg",
        link: "/products"
    };

    const activeCarouselCards = carouselCards.length > 0 ? carouselCards : [
        { _id: 'cc-1', title: "OPPO Find X10", image: "/assets/banners/poster_oppo.jpg", link: "/products" },
        { _id: 'cc-2', title: "vivo T5x 5G", image: "/assets/banners/poster_vivo.jpg", link: "/products" },
        { _id: 'cc-3', title: "acer Aspire 7", image: "/assets/banners/poster_acer.jpg", link: "/products" }
    ];

    const activeWideBanner = wideBanners.length > 0 ? wideBanners[0] : {
        _id: 'wb-1',
        title: "Galaxy F70e 5G",
        image: "/assets/banners/banner_samsung.jpg",
        link: "/product/6aed7ddd4d7517e07d9ac6a0"
    };

    // Quadruple cards array for infinite seamless loop
    const loopCarouselCards = activeCarouselCards.length > 0
        ? [...activeCarouselCards, ...activeCarouselCards, ...activeCarouselCards, ...activeCarouselCards]
        : [];

    // Interactive Carousel Animation Loop & Momentum Engine
    useEffect(() => {
        const track = bannerTrackRef.current;
        if (!track || loopCarouselCards.length === 0) return;

        let animId;
        const defaultSpeed = 0.65; // Ambient slow movement to the right

        const updateUnitWidth = () => {
            if (track && track.scrollWidth > 0) {
                const uWidth = track.scrollWidth / 4;
                if (uWidth > 0) {
                    bannerUnitWidthRef.current = uWidth;
                    if (bannerOffsetRef.current === 0) {
                        bannerOffsetRef.current = -uWidth;
                    }
                }
            }
        };

        const timer = setTimeout(updateUnitWidth, 120);
        window.addEventListener('resize', updateUnitWidth);

        const step = () => {
            const uWidth = bannerUnitWidthRef.current;
            if (uWidth > 0) {
                if (!isBannerDraggingRef.current) {
                    // Decelerate swipe momentum smoothly back to ambient drift
                    if (Math.abs(bannerVelocityRef.current) > 0.05) {
                        bannerOffsetRef.current += bannerVelocityRef.current;
                        bannerVelocityRef.current *= 0.94;
                    } else {
                        bannerVelocityRef.current = 0;
                        bannerOffsetRef.current += defaultSpeed;
                    }

                    // Seamless infinite loop wrap-around without jumping
                    while (bannerOffsetRef.current >= 0) {
                        bannerOffsetRef.current -= uWidth;
                    }
                    while (bannerOffsetRef.current <= -uWidth * 2) {
                        bannerOffsetRef.current += uWidth;
                    }

                    track.style.transform = `translate3d(${bannerOffsetRef.current}px, 0, 0)`;
                }
            }
            animId = requestAnimationFrame(step);
        };

        animId = requestAnimationFrame(step);

        return () => {
            clearTimeout(timer);
            cancelAnimationFrame(animId);
            window.removeEventListener('resize', updateUnitWidth);
        };
    }, [loopCarouselCards.length]);

    // Banner Drag & Touch Handlers
    const handleBannerDragStart = (clientX) => {
        isBannerDraggingRef.current = true;
        setIsBannerGrabbing(true);
        bannerStartXRef.current = clientX;
        bannerStartOffsetRef.current = bannerOffsetRef.current;
        bannerLastXRef.current = clientX;
        bannerLastTimeRef.current = performance.now();
        bannerVelocityRef.current = 0;
        bannerHasMovedRef.current = false;
    };

    const handleBannerDragMove = (clientX) => {
        if (!isBannerDraggingRef.current) return;
        const diffX = clientX - bannerStartXRef.current;
        if (Math.abs(diffX) > 6) {
            bannerHasMovedRef.current = true;
        }

        bannerOffsetRef.current = bannerStartOffsetRef.current + diffX;

        const uWidth = bannerUnitWidthRef.current;
        if (uWidth > 0) {
            while (bannerOffsetRef.current >= 0) {
                bannerOffsetRef.current -= uWidth;
                bannerStartOffsetRef.current -= uWidth;
            }
            while (bannerOffsetRef.current <= -uWidth * 2) {
                bannerOffsetRef.current += uWidth;
                bannerStartOffsetRef.current += uWidth;
            }
        }

        if (bannerTrackRef.current) {
            bannerTrackRef.current.style.transform = `translate3d(${bannerOffsetRef.current}px, 0, 0)`;
        }

        const now = performance.now();
        const dt = now - bannerLastTimeRef.current;
        if (dt > 10) {
            bannerVelocityRef.current = ((clientX - bannerLastXRef.current) / dt) * 16;
            bannerLastXRef.current = clientX;
            bannerLastTimeRef.current = now;
        }
    };

    const handleBannerDragEnd = () => {
        if (!isBannerDraggingRef.current) return;
        isBannerDraggingRef.current = false;
        setIsBannerGrabbing(false);
    };

    const handleBannerCardClick = (link) => {
        if (!bannerHasMovedRef.current) {
            navigate(link || '/products');
        }
    };


    return (
        <div className="min-h-screen bg-[#f1f2f4] pb-24 text-gray-800">
            <MetaData title="Flipkart | Online Shopping Site for Mobiles, Electronics, Furniture, Grocery" />

            <main className="max-w-7xl mx-auto px-2 sm:px-6 py-3 space-y-4">

                {/* 1. HERO FESTIVE BANNER (BIG BANG DIWALI | BANK OFFER REFRESHED) - EDGE-TO-EDGE FIT */}
                {activeHeroBanner && (
                    <div
                        onClick={() => navigate(activeHeroBanner.link || '/products')}
                        className="relative w-full rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer group"
                    >
                        <img
                            src={activeHeroBanner.image}
                            alt={activeHeroBanner.title}
                            className="w-full h-auto object-cover block rounded-2xl group-hover:scale-[1.005] transition-transform duration-300"
                            onError={(e) => { e.target.src = '/assets/banners/banner_bank_offer.jpg'; }}
                        />
                    </div>
                )}

                {/* 2. QUICK ACTION ICONS ROW (13 ROUND BUTTONS WITH LABELS MATCHING USER SCREENSHOT) */}
                <div className="bg-white rounded-2xl shadow-xs border border-gray-100 relative group/strip overflow-hidden">
                    <div className="relative">
                        {/* Left scroll button with soft fade mask */}
                        {canScrollLeft && (
                            <div className="absolute left-0 top-0 bottom-0 z-20 flex items-center pl-1.5 pr-8 bg-gradient-to-r from-white via-white/90 to-transparent pointer-events-none">
                                <button
                                    onClick={() => handleScrollActions('left')}
                                    className="pointer-events-auto w-7 h-7 sm:w-8 sm:h-8 bg-white hover:bg-gray-50 text-gray-800 rounded-full shadow-md hover:shadow-lg flex items-center justify-center border border-gray-200 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                                    aria-label="Scroll left"
                                >
                                    <ArrowBackIosNewIcon sx={{ fontSize: 12, color: '#111' }} />
                                </button>
                            </div>
                        )}

                        <div
                            ref={actionsScrollRef}
                            onScroll={checkActionsScroll}
                            className="flex items-start gap-2.5 sm:gap-4 overflow-x-auto no-scrollbar py-2 px-3 sm:px-4 scroll-smooth"
                        >
                            {quickActions.map((action, i) => (
                                <div
                                    key={i}
                                    onClick={() => navigate(action.link)}
                                    className="flex flex-col items-center shrink-0 w-[58px] sm:w-[68px] cursor-pointer group"
                                >
                                    <div className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center p-0.5 group-hover:scale-105 transition-transform">
                                        <img
                                            src={action.icon}
                                            alt={action.name}
                                            className="w-full h-full object-contain filter drop-shadow-xs"
                                            onError={(e) => { e.target.src = '/assets/banners/action_credit_card.png'; }}
                                        />
                                    </div>
                                    <span className="text-[10px] sm:text-[11px] font-medium text-gray-700 mt-1 text-center leading-tight whitespace-nowrap overflow-hidden text-ellipsis w-full group-hover:text-[#2874f0]">
                                        {action.short}
                                    </span>
                                </div>
                            ))}

                            {/* End Spacer so the last icon is never crowded by the right edge or button */}
                            <div className="shrink-0 w-8 sm:w-10" aria-hidden="true" />
                        </div>

                        {/* Right scroll button with soft fade mask */}
                        {canScrollRight && (
                            <div className="absolute right-0 top-0 bottom-0 z-20 flex items-center pr-1.5 pl-8 bg-gradient-to-l from-white via-white/90 to-transparent pointer-events-none">
                                <button
                                    onClick={() => handleScrollActions('right')}
                                    className="pointer-events-auto w-7 h-7 sm:w-8 sm:h-8 bg-white hover:bg-gray-50 text-gray-800 rounded-full shadow-md hover:shadow-lg flex items-center justify-center border border-gray-200 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                                    aria-label="Scroll right"
                                >
                                    <ArrowForwardIosIcon sx={{ fontSize: 12, color: '#111' }} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* 5. TOP PROMOTIONAL CARD POSTERS ROW - INTERACTIVE SWIPEABLE INFINITE LOOP */}
                <div
                    className="w-full relative overflow-hidden py-1 select-none"
                    onTouchStart={(e) => handleBannerDragStart(e.touches[0].clientX)}
                    onTouchMove={(e) => handleBannerDragMove(e.touches[0].clientX)}
                    onTouchEnd={handleBannerDragEnd}
                    onTouchCancel={handleBannerDragEnd}
                    onMouseDown={(e) => {
                        e.preventDefault();
                        handleBannerDragStart(e.clientX);
                    }}
                    onMouseMove={(e) => handleBannerDragMove(e.clientX)}
                    onMouseUp={handleBannerDragEnd}
                    onMouseLeave={handleBannerDragEnd}
                    style={{ cursor: isBannerGrabbing ? 'grabbing' : 'grab' }}
                >
                    {/* Continuous Auto-drifting and Gesture-responsive Track */}
                    <div className="overflow-hidden no-scrollbar w-full">
                        <div
                            ref={bannerTrackRef}
                            className="interactive-banner-track flex items-center gap-3 py-1"
                        >
                            {loopCarouselCards.map((banner, index) => (
                                <div
                                    key={`${banner._id || 'card'}-${index}`}
                                    onClick={() => handleBannerCardClick(banner.link || '/products')}
                                    title={banner.title}
                                    className="h-[140px] sm:h-[165px] md:h-[185px] shrink-0 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-shadow duration-300 border border-gray-200/80 bg-white flex items-center justify-center select-none"
                                >
                                    <img
                                        src={banner.image}
                                        alt={banner.title}
                                        draggable="false"
                                        onLoad={() => {
                                            if (bannerTrackRef.current && bannerTrackRef.current.scrollWidth > 0) {
                                                bannerUnitWidthRef.current = bannerTrackRef.current.scrollWidth / 4;
                                            }
                                        }}
                                        className="h-full w-auto max-w-none object-contain rounded-2xl block select-none pointer-events-none"
                                        onError={(e) => { e.target.src = '/assets/banners/poster_oppo.jpg'; }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 6. WIDE FEATURE BANNER (SAMSUNG GALAXY F70e 5G) - EDGE-TO-EDGE FIT */}
                {activeWideBanner && (
                    <div
                        onClick={() => navigate(activeWideBanner.link || '/products')}
                        className="relative w-full rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer group"
                    >
                        <img
                            src={activeWideBanner.image}
                            alt={activeWideBanner.title}
                            className="w-full h-auto object-cover block rounded-2xl group-hover:scale-[1.005] transition-transform duration-300"
                            onError={(e) => { e.target.src = '/assets/banners/banner_samsung.jpg'; }}
                        />
                    </div>
                )}

                {/* 7. BEST GADGETS & APPLIANCES SECTION */}
                {(() => {
                    const featuredGadgets = products ? products.filter(p => p.inBestGadgets) : [];
                    const displayGadgets = featuredGadgets.length > 0 ? featuredGadgets : (products ? products.slice(0, 4) : []);
                    const displayedGadgetIds = new Set(displayGadgets.map(p => String(p._id)));
                    const trendingProducts = products ? products.filter(p => !displayedGadgetIds.has(String(p._id))) : [];

                    return (
                        <>
                            <div className="bg-white rounded-2xl p-3 sm:p-4 shadow-xs border border-gray-100">
                                {/* Header Strip */}
                                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                                    <div className="flex items-center gap-2">
                                        <span className="text-amber-500 font-black text-sm">✨</span>
                                        <h2 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">
                                            Best Gadgets & Appliances
                                        </h2>
                                    </div>

                                    <Link
                                        to="/products"
                                        className="w-7 h-7 rounded-full bg-[#2874f0] text-white flex items-center justify-center hover:bg-blue-700 transition-colors shadow-xs"
                                    >
                                        <ArrowForwardIosIcon sx={{ fontSize: 13 }} />
                                    </Link>
                                </div>

                                {/* Gadgets grid */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
                                    {displayGadgets.map((product) => (
                                        <ProductCard key={product._id} product={product} />
                                    ))}
                                </div>
                            </div>

                            {/* 8. FESTIVE DEALS 2-COLUMN GRID (WATER SENSOR DIYAS, GHEE DIYAS, ETC.) */}
                            <div className="bg-white rounded-2xl p-3 sm:p-4 shadow-xs border border-gray-100">
                                <div className="flex items-center justify-between pb-3 mb-2 border-b border-gray-100">
                                    <div>
                                        <h2 className="text-base font-bold text-gray-900 tracking-tight flex items-center gap-1.5">
                                            <span>Trending Deals & Festive Offers</span>
                                            <span className="text-[10px] bg-red-100 text-red-700 font-extrabold px-1.5 py-0.5 rounded-sm">
                                                99% OFF
                                            </span>
                                        </h2>
                                        <p className="text-xs text-gray-500">Party speakers, 5G smartphones, and festive collections</p>
                                    </div>

                                    <Link to="/products" className="text-xs font-bold text-[#2874f0] hover:underline">
                                        View All
                                    </Link>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                                    {trendingProducts && trendingProducts.length > 0 ? (
                                        trendingProducts.map((product) => (
                                            <ProductCard key={product._id} product={product} />
                                        ))
                                    ) : (
                                        loading && (
                                            <div className="col-span-2 text-center py-8 text-gray-400 text-xs">
                                                Loading products...
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>
                        </>
                    );
                })()}

                {/* 9. FLIPKART TRUST & ASSURANCE HUB (100% NATURAL, COMFORTABLE & TRUSTWORTHY) */}
                <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-xs border border-gray-100 my-2">
                    
                    {/* A. Flipkart Trust Pillars */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-5 border-b border-gray-100">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2874f0] flex items-center justify-center shrink-0">
                                <AssignmentTurnedInOutlinedIcon sx={{ fontSize: 22 }} />
                            </div>
                            <div>
                                <h4 className="text-xs sm:text-sm font-bold text-gray-900 leading-tight">100% Genuine</h4>
                                <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">Direct from verified brands with Flipkart Assured</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#388e3c] flex items-center justify-center shrink-0">
                                <AutorenewOutlinedIcon sx={{ fontSize: 22 }} />
                            </div>
                            <div>
                                <h4 className="text-xs sm:text-sm font-bold text-gray-900 leading-tight">7 Days Return</h4>
                                <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">Doorstep pickup & instant replacement policy</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                                <LocalShippingOutlinedIcon sx={{ fontSize: 22 }} />
                            </div>
                            <div>
                                <h4 className="text-xs sm:text-sm font-bold text-gray-900 leading-tight">Ekart Delivery</h4>
                                <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">Reliable delivery across 19,000+ pin codes in India</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                                <PaymentsOutlinedIcon sx={{ fontSize: 22 }} />
                            </div>
                            <div>
                                <h4 className="text-xs sm:text-sm font-bold text-gray-900 leading-tight">Safe Payments</h4>
                                <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">PCI-DSS 256-bit encryption for UPI & Cards</p>
                            </div>
                        </div>
                    </div>

                    {/* B. Official Flipkart Store Catalog Banner Strip */}
                    <div className="mt-5 p-4 sm:p-5 rounded-xl bg-gradient-to-r from-blue-50/70 via-slate-50 to-blue-50/70 border border-blue-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#ffe11b] flex items-center justify-center shrink-0 shadow-xs">
                                <img
                                    src="/assets/banners/fk_speed_logo.png"
                                    alt="Flipkart"
                                    className="w-5 h-5 object-contain"
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                />
                            </div>
                            <div>
                                <h3 className="text-sm sm:text-base font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
                                    <span>Explore Complete Store Catalog</span>
                                    <span className="text-[10px] bg-[#ffe11b] text-gray-950 font-black px-1.5 py-0.5 rounded-sm">
                                        FLIPKART ASSURED
                                    </span>
                                </h3>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Browse all handpicked products across Mobiles, Electronics, Fashion, Appliances & Home.
                                </p>
                            </div>
                        </div>

                        <Link
                            to="/products"
                            className="w-full sm:w-auto px-6 py-2.5 bg-[#2874f0] hover:bg-[#1258c7] text-white font-extrabold text-xs sm:text-sm rounded-sm shadow-xs hover:shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer no-underline shrink-0"
                            style={{ textDecoration: 'none' }}
                        >
                            <span>View All Products</span>
                            <ArrowForwardIosIcon sx={{ fontSize: 11 }} />
                        </Link>
                    </div>

                    {/* C. Natural Popular Category Tags */}
                    <div className="mt-4 pt-3 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                        <span className="font-bold text-gray-700 text-[11px] uppercase tracking-wider mr-1">Popular Categories:</span>
                        {[
                            "Mobiles & 5G",
                            "Smartwatches",
                            "Wireless Audio",
                            "Kitchen Appliances",
                            "Men's Fashion",
                            "Beauty & Personal Care",
                            "Best Deals"
                        ].map((tag, idx) => (
                            <Link
                                key={idx}
                                to={`/products?keyword=${encodeURIComponent(tag)}`}
                                className="px-2.5 py-1 rounded-full bg-gray-100 hover:bg-blue-50 hover:text-[#2874f0] hover:border-blue-200 border border-gray-200 text-gray-600 text-[11px] font-medium transition-colors cursor-pointer no-underline"
                            >
                                {tag}
                            </Link>
                        ))}
                    </div>

                </div>

            </main>
        </div>
    );
};

export default Home;
