import React, { useState } from 'react';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import { Link } from 'react-router-dom';
import DownloadIcon from '@mui/icons-material/Download';
import LinkIcon from '@mui/icons-material/Link';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StarIcon from '@mui/icons-material/Star';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import MetaData from '../Layouts/MetaData';

const sampleUrls = [
    {
        label: "User's Flipkart Link (LG 4K Monitor)",
        url: "https://www.flipkart.com/product/p/item?pid=MONHQMZMHVGUQPMH&param=3627&BU=CoreElectronics&pageUID=1793947551728"
    },
    {
        label: "boAt Soundbar Prime X 700W",
        url: "https://www.flipkart.com/boat-aavante-prime-x-700-w-bluetooth-soundbar/p/itm123456789"
    }
];

const ImportFlipkart = () => {
    const { enqueueSnackbar } = useSnackbar();

    const [url, setUrl] = useState('');
    const [fetching, setFetching] = useState(false);
    const [saving, setSaving] = useState(false);
    const [productData, setProductData] = useState(null);
    const [createdProduct, setCreatedProduct] = useState(null);

    // Fetch product details from Flipkart URL
    const handleFetch = async (e) => {
        if (e) e.preventDefault();
        if (!url || !url.includes('flipkart.com')) {
            enqueueSnackbar("Please enter a valid Flipkart product URL", { variant: "warning" });
            return;
        }

        setFetching(true);
        setCreatedProduct(null);

        try {
            const { data } = await axios.post('/api/v1/admin/product/scrape', { url });
            if (data.success && data.productData) {
                setProductData(data.productData);
                enqueueSnackbar("Product details fetched from Flipkart successfully!", { variant: "success" });
            } else {
                enqueueSnackbar("Could not fetch product details", { variant: "error" });
            }
        } catch (err) {
            enqueueSnackbar(err.response?.data?.message || "Failed to fetch from Flipkart", { variant: "error" });
        } finally {
            setFetching(false);
        }
    };

    // Calculate live discount %
    const discount = productData && productData.cuttedPrice > productData.price
        ? Math.round(((productData.cuttedPrice - productData.price) / productData.cuttedPrice) * 100)
        : 0;

    // Handle price adjustment
    const handlePriceChange = (newPrice) => {
        const p = Number(newPrice) || 0;
        setProductData(prev => ({
            ...prev,
            price: p
        }));
    };

    const handleCuttedPriceChange = (newCuttedPrice) => {
        const cp = Number(newCuttedPrice) || 0;
        setProductData(prev => ({
            ...prev,
            cuttedPrice: cp
        }));
    };

    // Remove image
    const handleRemoveImage = (index) => {
        const updated = productData.images.filter((_, i) => i !== index);
        setProductData({ ...productData, images: updated });
    };

    // Save and Publish to Store
    const handleImportSave = async () => {
        if (!productData.name || !productData.price) {
            enqueueSnackbar("Product title and price are required", { variant: "error" });
            return;
        }

        setSaving(true);
        try {
            const { data } = await axios.post('/api/v1/admin/product/import', productData);
            if (data.success && data.product) {
                setCreatedProduct(data.product);
                enqueueSnackbar("Product imported and published to store successfully!", { variant: "success" });
            }
        } catch (err) {
            enqueueSnackbar(err.response?.data?.message || "Failed to save imported product", { variant: "error" });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-5">
            <MetaData title="Flipkart URL 1-Click Importer | Nexmart" />

            {/* Header Banner */}
            <div className="bg-[#171825] border border-[#232538] rounded-2xl p-4 sm:p-6 text-white shadow-xl">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                        <div className="text-[11px] text-[#5B5CE5] font-bold uppercase tracking-wider">
                            Direct 1-Click Importer
                        </div>
                        <h2 className="text-lg sm:text-xl font-black tracking-tight text-white">
                            Import Product from any Flipkart URL
                        </h2>
                        <p className="text-xs text-[#8E92BC] mt-0.5">
                            Extracts 1500x1500px HD images, specifications, features, and certified user reviews automatically.
                        </p>
                    </div>

                    <Link
                        to="/admin/products"
                        className="bg-[#202234] hover:bg-[#282B42] text-slate-200 text-xs font-semibold px-3.5 py-2 rounded-xl border border-[#2E314A] transition-colors shrink-0 no-underline"
                    >
                        View Catalog ➔
                    </Link>
                </div>
            </div>

            <div className="max-w-4xl mx-auto space-y-5">

                {/* 1. URL Input Card */}
                <div className="bg-[#171825] rounded-2xl p-5 shadow-lg border border-[#232538]">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
                            <LinkIcon sx={{ fontSize: 18 }} />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-white">
                                Paste Any Flipkart Product Page URL
                            </h2>
                            <p className="text-xs text-slate-400">
                                Scrapes title, Full HD high-res images, descriptions, specifications, and customer feedbacks.
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleFetch} className="mt-4 flex flex-col sm:flex-row items-stretch gap-2">
                        <div className="relative flex-1">
                            <input
                                type="url"
                                required
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="https://www.flipkart.com/product/p/item?pid=..."
                                className="w-full p-3 rounded-xl border border-slate-700 bg-[#0f172a] text-slate-100 placeholder-slate-500 outline-hidden focus:border-blue-500 text-xs font-mono pr-8"
                            />
                            {url && (
                                <button
                                    type="button"
                                    onClick={() => setUrl('')}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs font-bold"
                                >
                                    ✕
                                </button>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={fetching}
                            className="bg-[#2874f0] hover:bg-blue-600 disabled:bg-blue-900/50 text-white font-bold text-xs px-5 py-3 rounded-xl shadow-md flex items-center justify-center gap-2 transition-colors whitespace-nowrap cursor-pointer"
                        >
                            {fetching ? (
                                <>
                                    <span className="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                    <span>Fetching Flipkart Data...</span>
                                </>
                            ) : (
                                <>
                                    <DownloadIcon sx={{ fontSize: 18 }} />
                                    <span>Fetch Product Details</span>
                                </>
                            )}
                        </button>
                    </form>

                    {/* Quick Sample Links */}
                    <div className="mt-3 pt-3 border-t border-slate-800 flex flex-wrap items-center gap-2 text-xs">
                        <span className="text-slate-400 font-medium">Quick Test:</span>
                        {sampleUrls.map((s, i) => (
                            <button
                                key={i}
                                type="button"
                                onClick={() => setUrl(s.url)}
                                className="bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-[11px] px-2.5 py-1 rounded-md transition-colors border border-slate-700"
                            >
                                {s.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Success Banner if Product Created */}
                {createdProduct && (
                    <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fadeIn">
                        <div className="flex items-center gap-2.5">
                            <CheckCircleIcon sx={{ fontSize: 24, color: '#10b981' }} />
                            <div>
                                <h3 className="text-sm font-bold text-emerald-300">
                                    Product Successfully Imported & Published!
                                </h3>
                                <p className="text-xs text-emerald-400/90">
                                    "{createdProduct.name.slice(0, 60)}..." is now live in your store.
                                </p>
                            </div>
                        </div>

                        <Link
                            to={`/product/${createdProduct._id}`}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-md transition-colors"
                        >
                            <VisibilityOutlinedIcon sx={{ fontSize: 16 }} />
                            <span>View Product Page</span>
                            <ArrowForwardIcon sx={{ fontSize: 14 }} />
                        </Link>
                    </div>
                )}

                {/* 2. Scraped Product Preview & Price Adjustment Form */}
                {productData && (
                    <div className="bg-[#131c31] rounded-2xl p-5 shadow-lg border border-slate-800 space-y-5 animate-fadeIn">

                        {/* Title and Badge */}
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                            <div className="flex items-center gap-2">
                                <span className="bg-[#2874f0] text-white text-[10px] font-black px-2 py-0.5 rounded-sm">
                                    FLIPKART IMPORTED
                                </span>
                                <span className="text-xs font-semibold text-slate-400">
                                    Brand: <strong className="text-white">{productData.brand?.name || 'Flipkart'}</strong>
                                </span>
                            </div>

                            <div className="flex items-center gap-1 bg-emerald-500/20 text-emerald-300 text-xs font-bold px-2 py-0.5 rounded-sm border border-emerald-500/30">
                                <span>{productData.ratings || 4.3}</span>
                                <StarIcon sx={{ fontSize: 12, color: '#34d399' }} />
                                <span className="text-[10px] font-normal text-emerald-400">
                                    ({(productData.numOfReviews || (productData.reviews?.length) || 0).toLocaleString()} reviews)
                                </span>
                            </div>
                        </div>

                        {/* PRICE ADJUSTMENT SECTION (USER'S KEY REQUEST) */}
                        <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-800/40">
                            <h3 className="text-xs font-black uppercase text-amber-300 tracking-wider mb-2 flex items-center gap-1.5">
                                <span>Adjust Product Prices</span>
                                <span className="text-[10px] font-normal text-amber-400/80">(Set your own custom selling price & MRP)</span>
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {/* Selling Price */}
                                <div>
                                    <label className="block text-slate-300 font-bold text-xs mb-1">
                                        Your Selling Price (₹) *
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        value={productData.price}
                                        onChange={(e) => handlePriceChange(e.target.value)}
                                        className="w-full p-2.5 rounded-lg border border-amber-700/60 bg-[#0f172a] font-bold text-base text-amber-300 outline-hidden focus:border-amber-400"
                                    />
                                </div>

                                {/* MRP / Cutted Price */}
                                <div>
                                    <label className="block text-slate-300 font-bold text-xs mb-1">
                                        MRP / Cutted Price (₹) *
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        value={productData.cuttedPrice}
                                        onChange={(e) => handleCuttedPriceChange(e.target.value)}
                                        className="w-full p-2.5 rounded-lg border border-amber-700/60 bg-[#0f172a] font-bold text-base text-amber-300 outline-hidden focus:border-amber-400"
                                    />
                                </div>

                                {/* Calculated Discount Badge */}
                                <div className="flex flex-col justify-end">
                                    <div className="p-2.5 rounded-lg bg-[#0f172a] border border-amber-700/60 flex items-center justify-between">
                                        <span className="text-xs font-medium text-slate-300">Calculated Discount:</span>
                                        <span className="text-sm font-black text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30">
                                            ↓{discount}% OFF
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Top Selling Priority Placement Setting */}
                            <div className="mt-3 pt-3 border-t border-amber-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">⭐</span>
                                    <div>
                                        <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                                            <span>Top Selling / Priority Placement</span>
                                            <span className="text-[10px] bg-amber-400/20 text-amber-300 font-bold px-1.5 py-0.5 rounded-sm">Always 1st on List</span>
                                        </h4>
                                        <p className="text-[11px] text-slate-400">Pin this product to appear at the very top of the store catalog and home rails.</p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={Boolean(productData.isTopSelling)}
                                        onChange={(e) => setProductData({
                                            ...productData,
                                            isTopSelling: e.target.checked,
                                            priority: e.target.checked ? 100 : 0
                                        })}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                                    <span className="ml-2.5 text-xs font-extrabold text-amber-400">
                                        {productData.isTopSelling ? '★ Pinned 1st' : '☆ Off'}
                                    </span>
                                </label>
                            </div>

                            {/* Best Gadgets & Appliances Homepage Featured Setting */}
                            <div className="mt-3 pt-3 border-t border-amber-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">✨</span>
                                    <div>
                                        <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                                            <span>"Best Gadgets & Appliances" (Homepage Grid)</span>
                                            <span className="text-[10px] bg-indigo-400/20 text-indigo-300 font-bold px-1.5 py-0.5 rounded-sm">Featured 4-Grid</span>
                                        </h4>
                                        <p className="text-[11px] text-slate-400">Show this product in the top featured 4-card grid on the storefront homepage.</p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={Boolean(productData.inBestGadgets)}
                                        onChange={(e) => setProductData({
                                            ...productData,
                                            inBestGadgets: e.target.checked
                                        })}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                    <span className="ml-2.5 text-xs font-extrabold text-indigo-400">
                                        {productData.inBestGadgets ? '✨ Featured' : '☆ Off'}
                                    </span>
                                </label>
                            </div>
                        </div>

                        {/* Title and Description */}
                        <div className="space-y-3">
                            <div>
                                <label className="block text-slate-300 font-bold text-xs mb-1">
                                    Product Title
                                </label>
                                <input
                                    type="text"
                                    value={productData.name}
                                    onChange={(e) => setProductData({ ...productData, name: e.target.value })}
                                    className="w-full p-2.5 rounded-lg border border-slate-700 bg-[#0f172a] text-slate-100 text-xs font-medium outline-hidden focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-slate-300 font-bold text-xs mb-1">
                                    Product Description
                                </label>
                                <textarea
                                    rows="3"
                                    value={productData.description}
                                    onChange={(e) => setProductData({ ...productData, description: e.target.value })}
                                    className="w-full p-2.5 rounded-lg border border-slate-700 bg-[#0f172a] text-slate-100 text-xs outline-hidden focus:border-blue-500"
                                />
                            </div>
                        </div>

                        {/* Full HD Images Gallery */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-slate-300 font-bold text-xs">
                                    Full HD Product Images ({productData.images?.length || 0})
                                </label>
                                <span className="text-[11px] text-slate-400">High-Resolution (1500x1500px)</span>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
                                {productData.images && productData.images.map((img, idx) => (
                                    <div key={idx} className="relative aspect-square rounded-xl bg-slate-900 border border-slate-800 overflow-hidden group">
                                        <img
                                            src={img.url}
                                            alt={`HD ${idx}`}
                                            className="w-full h-full object-contain p-1"
                                            onError={(e) => { e.target.src = '/assets/products/zebronics_speaker.jpg'; }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveImage(idx)}
                                            className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                            title="Remove image"
                                        >
                                            <DeleteOutlineIcon sx={{ fontSize: 14 }} />
                                        </button>
                                        <div className="absolute bottom-1 left-1 bg-black/80 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                                            #{idx + 1} HD
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Customer Review Photos Scraped */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-slate-300 font-bold text-xs">
                                    Customer Review Photos ({productData.reviewImages?.length || 0})
                                </label>
                                <span className="text-[11px] text-emerald-400 font-semibold">
                                    Verified Buyer Gallery
                                </span>
                            </div>
                            {productData.reviewImages && productData.reviewImages.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                                    {productData.reviewImages.map((img, idx) => (
                                        <div key={idx} className="relative aspect-square rounded-xl border border-slate-700 bg-slate-900 overflow-hidden group">
                                            <img
                                                src={typeof img === 'string' ? img : img.url}
                                                alt={`Review img ${idx + 1}`}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                                onError={(e) => { e.target.src = '/assets/reviews/mixer_rev_1.jpg'; }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const updated = productData.reviewImages.filter((_, i) => i !== idx);
                                                    setProductData({ ...productData, reviewImages: updated });
                                                }}
                                                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-600/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm cursor-pointer"
                                                title="Remove customer photo"
                                            >
                                                <DeleteOutlineIcon sx={{ fontSize: 13 }} />
                                            </button>
                                            <div className="absolute bottom-1 left-1 bg-black/80 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                                                Review #{idx + 1}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-xs text-slate-400 text-center">
                                    No customer review photos scraped for this link.
                                </div>
                            )}
                        </div>

                        {/* Feature Aspect Ratings */}
                        <div>
                            <label className="block text-slate-300 font-bold text-xs mb-2">
                                Feature Aspect Ratings ({productData.featureRatings?.length || 0})
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {productData.featureRatings && productData.featureRatings.map((f, i) => (
                                    <div key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-700 text-xs text-slate-200">
                                        <span className="font-semibold">{f.name}</span>
                                        <span className="bg-emerald-600/80 text-white font-bold text-[11px] px-1.5 py-0.5 rounded-sm">
                                            {f.rating} ★
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Feature Highlights */}
                        <div>
                            <label className="block text-slate-300 font-bold text-xs mb-2">
                                Feature Highlights ({productData.highlights?.length || 0})
                            </label>
                            <div className="space-y-1.5">
                                {productData.highlights && productData.highlights.map((h, i) => (
                                    <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-200">
                                        <span className="text-blue-400 font-black">•</span>
                                        <span className="flex-1">{h}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Customer Feedbacks & Reviews */}
                        <div>
                            <label className="block text-slate-300 font-bold text-xs mb-2">
                                Customer Feedbacks & Verified Reviews ({productData.reviews?.length || 0})
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                {productData.reviews && productData.reviews.map((rev, i) => (
                                    <div key={i} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1.5">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className={`flex items-center gap-0.5 text-white text-[11px] font-bold px-1.5 py-0.5 rounded-xs ${
                                                    rev.rating >= 4 ? 'bg-emerald-600' : rev.rating >= 3 ? 'bg-amber-600' : 'bg-red-500'
                                                }`}>
                                                    <span>{rev.rating}</span>
                                                    <span>★</span>
                                                </div>
                                                <span className="font-bold text-white text-xs">{rev.title || 'Verified Review'}</span>
                                            </div>
                                            <span className="text-[10px] text-slate-400">{rev.dateStr || '1 year ago'}</span>
                                        </div>
                                        <p className="text-slate-300 text-[11px] leading-relaxed">
                                            "{rev.comment}"
                                        </p>
                                        <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800/80">
                                            <span className="font-semibold text-slate-300">{rev.name}</span>
                                            <span className="text-emerald-400 font-bold">✓ Certified Buyer</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Save / Import Button */}
                        <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setProductData(null)}
                                className="px-4 py-2.5 rounded-xl border border-slate-700 font-bold text-slate-300 text-xs hover:bg-slate-800 cursor-pointer"
                            >
                                Discard
                            </button>

                            <button
                                type="button"
                                disabled={saving}
                                onClick={handleImportSave}
                                className="bg-[#ffe11b] hover:bg-amber-400 text-slate-950 font-black text-xs px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 transition-all cursor-pointer"
                            >
                                {saving ? (
                                    <>
                                        <span className="inline-block w-3.5 h-3.5 border-2 border-gray-900/30 border-t-gray-900 rounded-full animate-spin"></span>
                                        <span>Saving to Store...</span>
                                    </>
                                ) : (
                                    <>
                                        <CheckCircleIcon sx={{ fontSize: 18 }} />
                                        <span>Save & Publish Product to Store</span>
                                    </>
                                )}
                            </button>
                        </div>

                    </div>
                )}

            </div>
        </div>
    );
};

export default ImportFlipkart;
