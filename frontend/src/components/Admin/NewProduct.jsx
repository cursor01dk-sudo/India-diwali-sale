import React, { useState } from 'react';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import { useNavigate, Link } from 'react-router-dom';
import MetaData from '../Layouts/MetaData';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import LinkIcon from '@mui/icons-material/Link';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const categoriesList = [
    'Beauty',
    'Electronics',
    'Mobiles',
    'Home',
    'Appliances',
    'Fashion',
    'Furniture',
    'Audio',
    'Toys',
    'Food',
    'Sports',
    'Books'
];

const badgePresets = [
    'Big Billion Days Price',
    'Super deals',
    'Best deals',
    'Trending',
    'Hot Deal',
    'Only 10 left',
    'Special Price'
];

const NewProduct = () => {
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);

    // Form fields
    const [name, setName] = useState('');
    const [brand, setBrand] = useState('Flipkart Assured');
    const [category, setCategory] = useState('Beauty');
    const [badge, setBadge] = useState('Big Billion Days Price');
    const [price, setPrice] = useState('156');
    const [cuttedPrice, setCuttedPrice] = useState('899');
    const [stock, setStock] = useState('50');
    const [deliveryDate, setDeliveryDate] = useState('Delivery in 2-3 Days');
    const [isTopSelling, setIsTopSelling] = useState(false);
    const [inBestGadgets, setInBestGadgets] = useState(false);

    // Images (supports URLs or base64 file uploads)
    const [imageUrlInput, setImageUrlInput] = useState('');
    const [images, setImages] = useState([
        'https://rukminim2.flixcart.com/image/832/832/xif0q/face-wash/t/e/v/-original-imagpjh87z4gwhzh.jpeg?q=70'
    ]);

    // Highlights
    const [highlightInput, setHighlightInput] = useState('');
    const [highlights, setHighlights] = useState([
        '100% Genuine Certified Quality',
        'Suitable for all skin types / daily use',
        '7 Days Easy Replacement Guarantee'
    ]);

    const [description, setDescription] = useState(
        'Premium quality product tested for maximum performance and durability. Backed by Flipkart Assured guarantee with fast delivery.'
    );

    // Calculate discount
    const numPrice = Number(price) || 0;
    const numCuttedPrice = Number(cuttedPrice) || 0;
    const discountPercent = numCuttedPrice > numPrice
        ? Math.round(((numCuttedPrice - numPrice) / numCuttedPrice) * 100)
        : 0;

    // Add Image URL
    const handleAddImageUrl = () => {
        if (!imageUrlInput.trim()) return;
        setImages([...images, imageUrlInput.trim()]);
        setImageUrlInput('');
    };

    // Remove Image
    const handleRemoveImage = (index) => {
        setImages(images.filter((_, i) => i !== index));
    };

    // File Upload Handler (Base64)
    const handleFileUpload = (e) => {
        const files = Array.from(e.target.files);
        files.forEach((file) => {
            const reader = new FileReader();
            reader.onload = () => {
                if (reader.readyState === 2) {
                    setImages((prev) => [...prev, reader.result]);
                }
            };
            reader.readAsDataURL(file);
        });
    };

    // Add Highlight
    const handleAddHighlight = () => {
        if (!highlightInput.trim()) return;
        setHighlights([...highlights, highlightInput.trim()]);
        setHighlightInput('');
    };

    const handleRemoveHighlight = (index) => {
        setHighlights(highlights.filter((_, i) => i !== index));
    };

    // Submit handler
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!name.trim()) {
            enqueueSnackbar("Please enter a product title", { variant: "warning" });
            return;
        }

        if (!price || numPrice <= 0) {
            enqueueSnackbar("Please enter a valid selling price", { variant: "warning" });
            return;
        }

        if (images.length === 0) {
            enqueueSnackbar("Please add at least 1 product image", { variant: "warning" });
            return;
        }

        setLoading(true);

        const payload = {
            name: name.trim(),
            description: description.trim(),
            price: numPrice,
            cuttedPrice: numCuttedPrice > numPrice ? numCuttedPrice : Math.round(numPrice * 1.5),
            category,
            stock: Number(stock) || 50,
            tag: badge,
            dealText: `WOW! ₹${numPrice} with offer`,
            deliveryDate: deliveryDate || 'Delivery in 2-3 Days',
            isTopSelling,
            inBestGadgets,
            priority: isTopSelling ? 100 : 0,
            protectFee: 19,
            brand: {
                name: brand.trim() || 'Flipkart Assured',
                logo: {
                    public_id: `brand_${Date.now()}`,
                    url: 'https://rukminim1.flixcart.com/www/100/100/promos/01/07/2019/335606d2-6421-4d37-8339-ff741b65df02.png'
                }
            },
            images: images.map((img, i) => ({
                public_id: `prod_img_${Date.now()}_${i}`,
                url: img
            })),
            highlights,
            specifications: [
                { title: 'Brand', description: brand },
                { title: 'Category', description: category },
                { title: 'Deal Tag', description: badge },
                { title: 'Delivery', description: deliveryDate }
            ]
        };

        try {
            const { data } = await axios.post('/api/v1/admin/product/new', payload);
            if (data.success) {
                enqueueSnackbar("Product published to live store successfully!", { variant: "success" });
                navigate(`/product/${data.product._id}`);
            }
        } catch (err) {
            enqueueSnackbar(err.response?.data?.message || "Failed to add product", { variant: "error" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-5">
            <MetaData title="Add New Product | Nexmart" />

            {/* Header Banner */}
            <div className="bg-[#171825] border border-[#232538] rounded-2xl p-4 sm:p-6 text-white shadow-xl">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                        <div className="text-[11px] text-[#5B5CE5] font-bold uppercase tracking-wider">
                            Catalog Management Studio
                        </div>
                        <h2 className="text-lg sm:text-xl font-black tracking-tight text-white">
                            Add New Product Manually
                        </h2>
                        <p className="text-xs text-[#8E92BC] mt-0.5">
                            Create custom products with your own selling prices, MRP, HD images, and festival badges.
                        </p>
                    </div>

                    <Link
                        to="/admin/products"
                        className="bg-[#202234] hover:bg-[#282B42] text-slate-200 text-xs font-semibold px-3.5 py-2 rounded-xl border border-[#2E314A] transition-colors shrink-0 no-underline"
                    >
                        View Product Catalog ➔
                    </Link>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
                {/* 1. Basic Information */}
                <div className="bg-[#131c31] rounded-2xl p-5 border border-slate-800 shadow-md space-y-4">
                    <h3 className="text-sm font-extrabold text-white uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        1. Product Information
                    </h3>

                    <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">
                            Product Title / Name <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Cetaphil Oily Skin Cleanser, Daily Face Wash (236ml)"
                            className="w-full px-3 py-2.5 text-xs sm:text-sm border border-slate-700 bg-[#0f172a] text-slate-100 placeholder-slate-500 rounded-xl focus:border-blue-500 focus:outline-hidden"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-300 mb-1">Brand Name</label>
                            <input
                                type="text"
                                value={brand}
                                onChange={(e) => setBrand(e.target.value)}
                                placeholder="e.g. Cetaphil, Philips, boAt"
                                className="w-full px-3 py-2 text-xs border border-slate-700 bg-[#0f172a] text-slate-100 placeholder-slate-500 rounded-xl focus:border-blue-500 focus:outline-hidden"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-300 mb-1">Category</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full px-3 py-2 text-xs border border-slate-700 bg-[#0f172a] text-slate-100 rounded-xl focus:border-blue-500 focus:outline-hidden"
                            >
                                {categoriesList.map((c) => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-300 mb-1">Deal Tag / Badge</label>
                            <select
                                value={badge}
                                onChange={(e) => setBadge(e.target.value)}
                                className="w-full px-3 py-2 text-xs border border-slate-700 bg-[#0f172a] text-slate-100 rounded-xl focus:border-blue-500 focus:outline-hidden"
                            >
                                {badgePresets.map((b) => (
                                    <option key={b} value={b}>{b}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Top Selling Priority Placement Setting */}
                    <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0f172a] p-3 rounded-xl border border-slate-700/60">
                        <div className="flex items-center gap-2.5">
                            <span className="text-xl">⭐</span>
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
                                checked={isTopSelling}
                                onChange={(e) => setIsTopSelling(e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                            <span className="ml-2.5 text-xs font-extrabold text-amber-400">
                                {isTopSelling ? '★ Pinned 1st' : '☆ Off'}
                            </span>
                        </label>
                    </div>

                    {/* Best Gadgets & Appliances Homepage Featured Setting */}
                    <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0f172a] p-3 rounded-xl border border-slate-700/60">
                        <div className="flex items-center gap-2.5">
                            <span className="text-xl">✨</span>
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
                                checked={inBestGadgets}
                                onChange={(e) => setInBestGadgets(e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                            <span className="ml-2.5 text-xs font-extrabold text-indigo-400">
                                {inBestGadgets ? '✨ Featured' : '☆ Off'}
                            </span>
                        </label>
                    </div>
                </div>

                {/* 2. Pricing & Stock */}
                <div className="bg-[#131c31] rounded-2xl p-5 border border-slate-800 shadow-md space-y-4">
                    <h3 className="text-sm font-extrabold text-white uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        2. Pricing, Discount & Inventory
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-300 mb-1">
                                Selling Price (₹) <span className="text-red-400">*</span>
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-2 text-xs font-bold text-slate-500">₹</span>
                                <input
                                    type="number"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    placeholder="156"
                                    className="w-full pl-7 pr-3 py-2 text-xs sm:text-sm font-bold border border-slate-700 bg-[#0f172a] rounded-xl focus:border-blue-500 focus:outline-hidden text-emerald-400"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-300 mb-1">
                                MRP / Cutted Price (₹)
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-2 text-xs font-bold text-slate-500">₹</span>
                                <input
                                    type="number"
                                    value={cuttedPrice}
                                    onChange={(e) => setCuttedPrice(e.target.value)}
                                    placeholder="899"
                                    className="w-full pl-7 pr-3 py-2 text-xs sm:text-sm border border-slate-700 bg-[#0f172a] rounded-xl focus:border-blue-500 focus:outline-hidden text-slate-400"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-300 mb-1">Available Stock</label>
                            <input
                                type="number"
                                value={stock}
                                onChange={(e) => setStock(e.target.value)}
                                placeholder="50"
                                className="w-full px-3 py-2 text-xs border border-slate-700 bg-[#0f172a] text-slate-100 rounded-xl focus:border-blue-500 focus:outline-hidden"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-300 mb-1">Delivery Estimate</label>
                            <input
                                type="text"
                                value={deliveryDate}
                                onChange={(e) => setDeliveryDate(e.target.value)}
                                placeholder="e.g. Delivery in 2-3 Days"
                                className="w-full px-3 py-2 text-xs border border-slate-700 bg-[#0f172a] text-slate-100 rounded-xl focus:border-blue-500 focus:outline-hidden"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-300 mb-1">Calculated Discount</label>
                            <div className="px-3 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-black flex items-center gap-1">
                                <span>↓ {discountPercent}% OFF</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Product Images */}
                <div className="bg-[#131c31] rounded-2xl p-5 border border-slate-800 shadow-md space-y-4">
                    <h3 className="text-sm font-extrabold text-white uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                        3. Product Images (URL or Upload)
                    </h3>

                    {/* Image URL Input */}
                    <div className="flex gap-2">
                        <div className="flex-1 relative">
                            <span className="absolute left-3 top-2.5 text-slate-500">
                                <LinkIcon sx={{ fontSize: 18 }} />
                            </span>
                            <input
                                type="text"
                                value={imageUrlInput}
                                onChange={(e) => setImageUrlInput(e.target.value)}
                                placeholder="Paste image web URL (Flipkart, CDN, Shopify, etc.)"
                                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-700 bg-[#0f172a] text-slate-100 placeholder-slate-500 rounded-xl focus:border-blue-500 focus:outline-hidden font-mono"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={handleAddImageUrl}
                            className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs transition-colors shrink-0 cursor-pointer"
                        >
                            + Add Image URL
                        </button>
                    </div>

                    {/* File Upload Option */}
                    <div className="flex items-center gap-2">
                        <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors">
                            <CloudUploadIcon sx={{ fontSize: 16 }} />
                            <span>Or Upload Image File</span>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleFileUpload}
                                className="hidden"
                            />
                        </label>
                        <span className="text-[11px] text-slate-400">
                            {images.length} image(s) loaded
                        </span>
                    </div>

                    {/* Thumbnail previews */}
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 pt-2">
                        {images.map((img, idx) => (
                            <div key={idx} className="relative aspect-square rounded-xl border border-slate-800 bg-[#0f172a] p-1 flex items-center justify-center group overflow-hidden">
                                <img
                                    src={img}
                                    alt={`Preview ${idx + 1}`}
                                    className="w-full h-full object-contain rounded-lg"
                                />
                                <button
                                    type="button"
                                    onClick={() => handleRemoveImage(idx)}
                                    className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-md opacity-90 hover:opacity-100 transition-opacity cursor-pointer shadow-sm"
                                    title="Remove image"
                                >
                                    <DeleteOutlineIcon sx={{ fontSize: 14 }} />
                                </button>
                                <span className="absolute bottom-1 left-1 bg-slate-900/90 text-white text-[9px] px-1 rounded">
                                    #{idx + 1}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 4. Highlights & Description */}
                <div className="bg-[#131c31] rounded-2xl p-5 border border-slate-800 shadow-md space-y-4">
                    <h3 className="text-sm font-extrabold text-white uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                        4. Highlights & Description
                    </h3>

                    {/* Highlights */}
                    <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">Key Highlights</label>
                        <div className="flex gap-2 mb-2">
                            <input
                                type="text"
                                value={highlightInput}
                                onChange={(e) => setHighlightInput(e.target.value)}
                                placeholder="e.g. Daily Gentle Foaming Cleanser"
                                className="flex-1 px-3 py-2 text-xs border border-slate-700 bg-[#0f172a] text-slate-100 placeholder-slate-500 rounded-xl focus:border-blue-500 focus:outline-hidden"
                            />
                            <button
                                type="button"
                                onClick={handleAddHighlight}
                                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl border border-slate-700 cursor-pointer"
                            >
                                + Add Highlight
                            </button>
                        </div>

                        <div className="space-y-1.5">
                            {highlights.map((h, i) => (
                                <div key={i} className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-[#0f172a] text-xs text-slate-200 border border-slate-800">
                                    <span className="flex items-center gap-1.5">
                                        <CheckCircleIcon sx={{ fontSize: 14, color: '#10b981' }} />
                                        <span>{h}</span>
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveHighlight(i)}
                                        className="text-red-400 hover:text-red-300 cursor-pointer"
                                    >
                                        <DeleteOutlineIcon sx={{ fontSize: 14 }} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Full Description */}
                    <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">Product Description</label>
                        <textarea
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-3 py-2 text-xs border border-slate-700 bg-[#0f172a] text-slate-100 rounded-xl focus:border-blue-500 focus:outline-hidden"
                        />
                    </div>
                </div>

                {/* Publish Button */}
                <div className="flex items-center justify-between gap-3 pt-2">
                    <Link
                        to="/admin/products"
                        className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-xs font-bold hover:bg-slate-800 transition-colors"
                    >
                        Cancel
                    </Link>

                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 max-w-sm py-3 px-6 rounded-xl bg-[#ffe11b] hover:bg-amber-400 text-gray-950 font-black text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                        <AddCircleOutlineIcon sx={{ fontSize: 18 }} />
                        <span>{loading ? "Publishing Product..." : "Publish Product to Live Store"}</span>
                    </button>
                </div>
            </form>
        </div>
    );
};

export default NewProduct;
