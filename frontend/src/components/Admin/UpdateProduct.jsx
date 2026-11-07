import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { useSnackbar } from 'notistack';
import { useParams, Link } from 'react-router-dom';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { getProductDetails, getProducts } from '../../actions/productAction';
import MetaData from '../Layouts/MetaData';

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

const UpdateProduct = () => {
    const dispatch = useDispatch();
    const { enqueueSnackbar } = useSnackbar();
    const params = useParams();

    const productId = params.id;
    const { product } = useSelector((state) => state.productDetails);

    const [saving, setSaving] = useState(false);
    const [savedSuccess, setSavedSuccess] = useState(false);

    // Form fields
    const [title, setTitle] = useState('');
    const [brand, setBrand] = useState('Flipkart Assured');
    const [category, setCategory] = useState('Electronics');
    const [sellingPrice, setSellingPrice] = useState('');
    const [mrp, setMrp] = useState('');
    const [stock, setStock] = useState('50');
    const [description, setDescription] = useState('');
    const [isTopSelling, setIsTopSelling] = useState(false);
    const [inBestGadgets, setInBestGadgets] = useState(false);

    const [images, setImages] = useState([]);
    const [imageUrlInput, setImageUrlInput] = useState('');
    const [uploadingSlot, setUploadingSlot] = useState(false);

    // Highlights
    const [highlightInput, setHighlightInput] = useState('');
    const [highlights, setHighlights] = useState([]);

    // Customer Review Photos & Reviews Management
    const [reviewImages, setReviewImages] = useState([]);
    const [reviewImgInput, setReviewImgInput] = useState('');
    const [uploadingReviewPhoto, setUploadingReviewPhoto] = useState(false);
    const [featureRatings, setFeatureRatings] = useState([]);
    const [newAspect, setNewAspect] = useState({ name: '', rating: '4.0' });
    const [reviews, setReviews] = useState([]);
    const [newReview, setNewReview] = useState({
        name: '',
        rating: 5,
        title: '',
        comment: '',
        dateStr: '1 year ago'
    });

    useEffect(() => {
        if (params.id) {
            dispatch(getProductDetails(params.id));
        }
    }, [dispatch, params.id]);

    useEffect(() => {
        if (product && product._id === params.id) {
            setTitle(product.name || '');
            setSellingPrice(String(product.price ?? ''));
            setMrp(String(product.cuttedPrice ?? ''));
            setStock(String(product.stock ?? '50'));
            setCategory(product.category || 'Electronics');
            setBrand(product.brand?.name || 'Flipkart Assured');
            setIsTopSelling(Boolean(product.isTopSelling));
            setInBestGadgets(Boolean(product.inBestGadgets));
            setDescription(product.description || '');
            setHighlights(product.highlights || [
                '100% Genuine Certified Quality',
                'Flipkart Assured Guarantee',
                '7 Days Easy Replacement'
            ]);

            if (product.images && product.images.length > 0) {
                setImages(product.images.map(img => ({ url: img.url, public_id: img.public_id })));
            }

            if (product.reviewImages && product.reviewImages.length > 0) {
                setReviewImages(product.reviewImages.map(img => ({ url: img.url, public_id: img.public_id })));
            } else {
                setReviewImages([]);
            }

            if (product.featureRatings && product.featureRatings.length > 0) {
                setFeatureRatings(product.featureRatings);
            } else {
                setFeatureRatings([]);
            }

            if (product.reviews && product.reviews.length > 0) {
                setReviews(product.reviews);
            } else {
                setReviews([]);
            }
        }
    }, [product, params.id]);

    // Live calculated discount
    const numPrice = Number(sellingPrice) || 0;
    const numMrp = Number(mrp) || 0;
    const discountPercent = numMrp > numPrice
        ? Math.round(((numMrp - numPrice) / numMrp) * 100)
        : 0;

    // Add Image URL
    const handleAddImageUrl = () => {
        if (!imageUrlInput.trim()) return;
        setImages([...images, { url: imageUrlInput.trim(), public_id: `prod_img_${Date.now()}` }]);
        setImageUrlInput('');
    };

    // Remove Image
    const handleRemoveImage = (index) => {
        setImages(images.filter((_, i) => i !== index));
    };

    // Upload image from computer
    const handleLocalFileUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            enqueueSnackbar("Please select a valid image file", { variant: "warning" });
            return;
        }

        setUploadingSlot(true);
        const reader = new FileReader();
        reader.onload = async () => {
            const base64 = reader.result;
            // Immediate local preview
            setImages(prev => [...prev, { url: base64, public_id: `prod_img_${Date.now()}` }]);

            // Upload to server for persistent storage
            try {
                const formData = new FormData();
                formData.append('image', file);
                const { data } = await axios.post('/api/v1/admin/banner/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                if (data.success && data.url) {
                    setImages(prev => prev.map((img, idx) => idx === prev.length - 1 ? { ...img, url: data.url } : img));
                    enqueueSnackbar(`Image "${file.name}" uploaded and applied!`, { variant: "success" });
                }
            } catch (err) {
                enqueueSnackbar(`Applied "${file.name}" locally`, { variant: "info" });
            } finally {
                setUploadingSlot(false);
            }
        };
        reader.readAsDataURL(file);
    };

    // Highlights
    const handleAddHighlight = () => {
        if (!highlightInput.trim()) return;
        setHighlights([...highlights, highlightInput.trim()]);
        setHighlightInput('');
    };

    const handleRemoveHighlight = (index) => {
        setHighlights(highlights.filter((_, i) => i !== index));
    };

    // Review Images Handlers
    const handleAddReviewImageUrl = () => {
        if (!reviewImgInput.trim()) return;
        setReviewImages([...reviewImages, { url: reviewImgInput.trim(), public_id: `rev_img_${Date.now()}` }]);
        setReviewImgInput('');
    };

    const handleRemoveReviewImage = (index) => {
        setReviewImages(reviewImages.filter((_, i) => i !== index));
    };

    const handleLocalReviewFileUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            enqueueSnackbar("Please select a valid image file", { variant: "warning" });
            return;
        }

        setUploadingReviewPhoto(true);
        const reader = new FileReader();
        reader.onload = async () => {
            const base64 = reader.result;
            setReviewImages(prev => [...prev, { url: base64, public_id: `rev_img_${Date.now()}` }]);

            try {
                const formData = new FormData();
                formData.append('image', file);
                const { data } = await axios.post('/api/v1/admin/banner/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                if (data.success && data.url) {
                    setReviewImages(prev => prev.map((img, idx) => idx === prev.length - 1 ? { ...img, url: data.url } : img));
                    enqueueSnackbar(`Customer photo "${file.name}" uploaded!`, { variant: "success" });
                }
            } catch (err) {
                enqueueSnackbar(`Applied review photo locally`, { variant: "info" });
            } finally {
                setUploadingReviewPhoto(false);
            }
        };
        reader.readAsDataURL(file);
    };

    // Feature Ratings Handlers
    const handleAddFeatureRating = () => {
        if (!newAspect.name.trim()) {
            enqueueSnackbar("Please enter an aspect name (e.g. Grinding Quality)", { variant: "warning" });
            return;
        }
        const r = parseFloat(newAspect.rating) || 4.0;
        setFeatureRatings([...featureRatings, { name: newAspect.name.trim(), rating: r }]);
        setNewAspect({ name: '', rating: '4.0' });
    };

    const handleRemoveFeatureRating = (index) => {
        setFeatureRatings(featureRatings.filter((_, i) => i !== index));
    };

    // Customer Reviews Handlers
    const handleAddReview = () => {
        if (!newReview.name.trim()) {
            enqueueSnackbar("Please enter customer name", { variant: "warning" });
            return;
        }
        if (!newReview.comment.trim()) {
            enqueueSnackbar("Please enter review description / comment", { variant: "warning" });
            return;
        }

        const revObj = {
            name: newReview.name.trim(),
            rating: Number(newReview.rating) || 5,
            title: newReview.title.trim() || 'Verified Purchase',
            comment: newReview.comment.trim(),
            dateStr: newReview.dateStr.trim() || '1 year ago',
            likes: Math.floor(Math.random() * 30) + 10,
            dislikes: 0
        };

        setReviews([revObj, ...reviews]);
        setNewReview({
            name: '',
            rating: 5,
            title: '',
            comment: '',
            dateStr: '1 year ago'
        });
        enqueueSnackbar("Review added successfully!", { variant: "success" });
    };

    const handleRemoveReview = (index) => {
        setReviews(reviews.filter((_, i) => i !== index));
    };

    // Save and real-time sync with store
    const handleSaveChanges = async (e) => {
        if (e) e.preventDefault();

        if (!title.trim()) {
            enqueueSnackbar("Product title is required", { variant: "warning" });
            return;
        }

        if (!sellingPrice || numPrice <= 0) {
            enqueueSnackbar("Please enter a valid selling price", { variant: "warning" });
            return;
        }

        if (images.length === 0) {
            enqueueSnackbar("Please add at least 1 product image", { variant: "warning" });
            return;
        }

        setSaving(true);
        setSavedSuccess(false);

        try {
            const payload = {
                name: title.trim(),
                price: numPrice,
                cuttedPrice: numMrp > numPrice ? numMrp : Math.round(numPrice * 1.5),
                category,
                stock: Number(stock) || 50,
                isTopSelling,
                inBestGadgets,
                priority: isTopSelling ? 100 : 0,
                brand: {
                    name: brand.trim() || 'Flipkart Assured',
                    logo: product?.brand?.logo || {
                        public_id: `brand_${Date.now()}`,
                        url: 'https://rukminim1.flixcart.com/www/100/100/promos/01/07/2019/335606d2-6421-4d37-8339-ff741b65df02.png'
                    }
                },
                images: images.filter(i => i.url && i.url.trim()).map((img, idx) => ({
                    public_id: img.public_id || `prod_img_${Date.now()}_${idx}`,
                    url: img.url
                })),
                reviewImages: reviewImages.filter(i => i.url && i.url.trim()).map((img, idx) => ({
                    public_id: img.public_id || `rev_img_${Date.now()}_${idx}`,
                    url: img.url
                })),
                featureRatings,
                reviews,
                highlights,
                description
            };

            const { data } = await axios.put(`/api/v1/admin/product/${productId}`, payload);
            if (data.success) {
                enqueueSnackbar("Product updated and synced with live store!", { variant: "success" });
                setSavedSuccess(true);

                // Real-time Redux synchronization
                dispatch(getProductDetails(productId));
                dispatch(getProducts());
            }
        } catch (err) {
            enqueueSnackbar(err.response?.data?.message || "Failed to update product", { variant: "error" });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-12">
            <MetaData title="Edit Product | Admin Console" />

            {/* Header Banner */}
            <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 rounded-2xl p-4 sm:p-6 text-white shadow-md">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                        <div className="text-[11px] text-blue-200 font-bold uppercase tracking-wider">
                            Visual Catalog Studio
                        </div>
                        <h2 className="text-lg sm:text-xl font-black tracking-tight text-white">
                            Edit Product & Real-Time Sync
                        </h2>
                        <p className="text-xs text-blue-100 mt-0.5">
                            Update titles, custom selling prices, MRP, and Full HD photos with instant store sync.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <Link
                            to="/admin/products"
                            className="bg-white/15 hover:bg-white/25 text-white text-xs font-semibold px-3 py-1.5 rounded-lg border border-white/20 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                            <ArrowBackIcon sx={{ fontSize: 14 }} />
                            <span>Catalog</span>
                        </Link>
                        {productId && (
                            <Link
                                to={`/product/${productId}`}
                                target="_blank"
                                className="bg-amber-400 hover:bg-amber-500 text-gray-950 text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm transition-colors flex items-center gap-1 cursor-pointer"
                            >
                                <VisibilityOutlinedIcon sx={{ fontSize: 15 }} />
                                <span>View on Store</span>
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Live Success Banner */}
            {savedSuccess && (
                <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fadeIn">
                    <div className="flex items-center gap-2.5">
                        <CheckCircleIcon sx={{ fontSize: 24, color: '#10b981' }} />
                        <div>
                            <h3 className="text-sm font-bold text-emerald-300">
                                Product Saved & Synced Successfully!
                            </h3>
                            <p className="text-xs text-emerald-400/90">
                                Changes are immediately active on your live storefront.
                            </p>
                        </div>
                    </div>

                    <Link
                        to={`/product/${productId}`}
                        target="_blank"
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-md transition-colors"
                    >
                        <VisibilityOutlinedIcon sx={{ fontSize: 16 }} />
                        <span>View Live Product Page</span>
                        <ArrowForwardIcon sx={{ fontSize: 14 }} />
                    </Link>
                </div>
            )}

            <form onSubmit={handleSaveChanges} className="space-y-6">

                {/* 1. Basic Information Card */}
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
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. BOOSTER Powerful Blender 750 W Juicer Mixer Grinder"
                            className="w-full px-3 py-2.5 text-xs sm:text-sm border border-slate-700 bg-[#0f172a] text-slate-100 placeholder-slate-500 rounded-xl focus:border-blue-500 focus:outline-hidden"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-300 mb-1">Brand Name</label>
                            <input
                                type="text"
                                value={brand}
                                onChange={(e) => setBrand(e.target.value)}
                                placeholder="e.g. BOOSTER, Philips, boAt"
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

                {/* 2. Pricing & Live Discount Calculator Card */}
                <div className="bg-[#131c31] rounded-2xl p-5 border border-slate-800 shadow-md space-y-4">
                    <h3 className="text-sm font-extrabold text-white uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        2. Pricing & Discount Controls (Live Store Sync)
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        {/* Selling Price */}
                        <div>
                            <label className="block text-xs font-bold text-slate-300 mb-1">
                                Your Selling Price (₹) <span className="text-red-400">*</span>
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-2 text-xs font-bold text-slate-500">₹</span>
                                <input
                                    type="number"
                                    required
                                    value={sellingPrice}
                                    onChange={(e) => setSellingPrice(e.target.value)}
                                    placeholder="399"
                                    className="w-full pl-7 pr-3 py-2 text-xs sm:text-sm font-bold border border-slate-700 bg-[#0f172a] rounded-xl focus:border-blue-500 focus:outline-hidden text-emerald-400"
                                />
                            </div>
                        </div>

                        {/* MRP / Cutted Price */}
                        <div>
                            <label className="block text-xs font-bold text-slate-300 mb-1">
                                MRP / Cutted Price (₹)
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-2 text-xs font-bold text-slate-500">₹</span>
                                <input
                                    type="number"
                                    value={mrp}
                                    onChange={(e) => setMrp(e.target.value)}
                                    placeholder="2014"
                                    className="w-full pl-7 pr-3 py-2 text-xs sm:text-sm border border-slate-700 bg-[#0f172a] rounded-xl focus:border-blue-500 focus:outline-hidden text-slate-400"
                                />
                            </div>
                        </div>

                        {/* Available Stock */}
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

                        {/* Calculated Live Discount */}
                        <div>
                            <label className="block text-xs font-bold text-slate-300 mb-1">Calculated Discount</label>
                            <div className="px-3 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-black flex items-center gap-1">
                                <span>↓ {discountPercent}% OFF</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Product Images Gallery & Local File Uploader */}
                <div className="bg-[#131c31] rounded-2xl p-5 border border-slate-800 shadow-md space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                            3. Product Images ({images.length})
                        </h3>
                        <span className="text-[11px] text-slate-400">Upload from PC or paste image URLs</span>
                    </div>

                    {/* Local File Upload Dropzone */}
                    <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
                        <label className="flex-1 cursor-pointer flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 text-xs font-bold transition-all text-center">
                            <CloudUploadIcon sx={{ fontSize: 18 }} />
                            <span>{uploadingSlot ? "Uploading Image..." : "Upload Image File from Computer"}</span>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleLocalFileUpload}
                                className="hidden"
                            />
                        </label>

                        {/* URL Input */}
                        <div className="flex-1 flex gap-2">
                            <input
                                type="text"
                                value={imageUrlInput}
                                onChange={(e) => setImageUrlInput(e.target.value)}
                                placeholder="Or paste image URL (https://...)"
                                className="flex-1 px-3 py-2 text-xs border border-slate-700 bg-[#0f172a] text-slate-100 placeholder-slate-500 rounded-xl focus:border-blue-500 focus:outline-hidden font-mono"
                            />
                            <button
                                type="button"
                                onClick={handleAddImageUrl}
                                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-bold rounded-xl transition-colors shrink-0 cursor-pointer"
                            >
                                + Add
                            </button>
                        </div>
                    </div>

                    {/* Image Preview Thumbnails */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 pt-2">
                        {images.map((img, idx) => (
                            <div key={idx} className="relative aspect-square rounded-xl border border-slate-800 bg-[#0f172a] p-1 flex items-center justify-center group overflow-hidden">
                                <img
                                    src={img.url}
                                    alt={`Item ${idx + 1}`}
                                    className="w-full h-full object-contain rounded-lg"
                                    onError={(e) => { e.target.src = '/assets/products/zebronics_speaker.jpg'; }}
                                />
                                <button
                                    type="button"
                                    onClick={() => handleRemoveImage(idx)}
                                    className="absolute top-1 right-1 p-1 bg-red-600 hover:bg-red-700 text-white rounded-md opacity-90 group-hover:opacity-100 transition-opacity cursor-pointer shadow-sm"
                                    title="Remove image"
                                >
                                    <DeleteOutlineIcon sx={{ fontSize: 14 }} />
                                </button>
                                <span className="absolute bottom-1 left-1 bg-slate-900/90 text-white text-[9px] px-1 rounded font-bold">
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
                                placeholder="e.g. 750W Heavy Duty Motor with 100% Copper Winding"
                                className="flex-1 px-3 py-2 text-xs border border-slate-700 bg-[#0f172a] text-slate-100 placeholder-slate-500 rounded-xl focus:border-blue-500 focus:outline-hidden"
                            />
                            <button
                                type="button"
                                onClick={handleAddHighlight}
                                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl border border-slate-700 cursor-pointer"
                            >
                                + Add
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

                    {/* Description */}
                    <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">Full Description</label>
                        <textarea
                            rows={4}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Enter detailed product description..."
                            className="w-full px-3 py-2 text-xs border border-slate-700 bg-[#0f172a] text-slate-100 rounded-xl focus:border-blue-500 focus:outline-hidden"
                        />
                    </div>
                </div>

                {/* 5. Customer Review Photos Mosaic (Verified Buyer Photos) */}
                <div className="bg-[#131c31] rounded-2xl p-5 border border-slate-800 shadow-md space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
                        <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            5. Customer Review Photos ({reviewImages.length})
                        </h3>
                        <span className="text-[11px] text-slate-400">
                            Rendered in the Flipkart customer photos mosaic (+44 view all modal)
                        </span>
                    </div>

                    {/* Add Review Photo inputs */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* URL Input */}
                        <div>
                            <label className="block text-xs font-bold text-slate-300 mb-1">Add Photo by URL</label>
                            <div className="flex gap-2">
                                <input
                                    type="url"
                                    value={reviewImgInput}
                                    onChange={(e) => setReviewImgInput(e.target.value)}
                                    placeholder="https://... or /assets/reviews/..."
                                    className="flex-1 px-3 py-2 text-xs border border-slate-700 bg-[#0f172a] text-slate-100 placeholder-slate-500 rounded-xl focus:border-blue-500 focus:outline-hidden"
                                />
                                <button
                                    type="button"
                                    onClick={handleAddReviewImageUrl}
                                    className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl cursor-pointer"
                                >
                                    + Add URL
                                </button>
                            </div>
                        </div>

                        {/* Upload Local File */}
                        <div>
                            <label className="block text-xs font-bold text-slate-300 mb-1">Or Upload Photo from PC</label>
                            <label className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-dashed border-slate-600 hover:border-emerald-500 bg-[#0f172a] hover:bg-slate-900 text-xs text-slate-300 cursor-pointer transition-colors">
                                <CloudUploadIcon sx={{ fontSize: 16 }} />
                                <span>{uploadingReviewPhoto ? 'Uploading...' : 'Browse Computer Photo...'}</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleLocalReviewFileUpload}
                                    className="hidden"
                                />
                            </label>
                        </div>
                    </div>

                    {/* Gallery Grid */}
                    {reviewImages.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-6 gap-2.5 pt-2">
                            {reviewImages.map((img, idx) => (
                                <div key={idx} className="relative aspect-square rounded-xl border border-slate-800 bg-[#0f172a] p-1 flex items-center justify-center group overflow-hidden">
                                    <img
                                        src={typeof img === 'string' ? img : img.url}
                                        alt={`Customer review ${idx + 1}`}
                                        className="w-full h-full object-cover rounded-lg"
                                        onError={(e) => { e.target.src = '/assets/reviews/mixer_rev_1.jpg'; }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveReviewImage(idx)}
                                        className="absolute top-1 right-1 p-1 bg-red-600 hover:bg-red-700 text-white rounded-md opacity-90 group-hover:opacity-100 transition-opacity cursor-pointer shadow-sm"
                                        title="Remove photo"
                                    >
                                        <DeleteOutlineIcon sx={{ fontSize: 14 }} />
                                    </button>
                                    <span className="absolute bottom-1 left-1 bg-slate-900/90 text-white text-[9px] px-1 rounded font-bold">
                                        #{idx + 1}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-3 bg-[#0f172a] rounded-xl border border-slate-800 text-xs text-slate-400 text-center">
                            No customer review photos added yet. Add photo URLs or upload from PC to display them on the storefront.
                        </div>
                    )}
                </div>

                {/* 6. Feature Aspect Badges */}
                <div className="bg-[#131c31] rounded-2xl p-5 border border-slate-800 shadow-md space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
                        <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                            6. Feature Aspect Ratings ({featureRatings.length})
                        </h3>
                        <span className="text-[11px] text-slate-400">
                            Category badges e.g. Grinding Quality 3.6 ★, Noise Level 3.6 ★
                        </span>
                    </div>

                    {/* Existing Badges List */}
                    <div className="flex flex-wrap gap-2">
                        {featureRatings.map((f, i) => (
                            <div key={i} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0f172a] border border-slate-700 text-xs text-slate-200">
                                <span className="font-semibold">{f.name}</span>
                                <span className="bg-emerald-600 text-white font-bold text-[11px] px-1.5 py-0.5 rounded-sm">
                                    {f.rating} ★
                                </span>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveFeatureRating(i)}
                                    className="text-slate-400 hover:text-red-400 cursor-pointer ml-1 text-xs"
                                    title="Remove aspect"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Add New Aspect */}
                    <div className="pt-2 border-t border-slate-800/80">
                        <label className="block text-xs font-bold text-slate-300 mb-1.5">Add Feature Aspect</label>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <input
                                type="text"
                                value={newAspect.name}
                                onChange={(e) => setNewAspect({ ...newAspect, name: e.target.value })}
                                placeholder="Aspect Name (e.g. Build Quality, Sound Quality, Battery)"
                                className="flex-1 px-3 py-2 text-xs border border-slate-700 bg-[#0f172a] text-slate-100 placeholder-slate-500 rounded-xl focus:border-blue-500 focus:outline-hidden"
                            />
                            <div className="flex items-center gap-2">
                                <div className="relative w-28">
                                    <input
                                        type="number"
                                        step="0.1"
                                        min="1"
                                        max="5"
                                        value={newAspect.rating}
                                        onChange={(e) => setNewAspect({ ...newAspect, rating: e.target.value })}
                                        placeholder="3.8"
                                        className="w-full px-3 py-2 text-xs border border-slate-700 bg-[#0f172a] text-emerald-400 font-bold rounded-xl focus:border-blue-500 focus:outline-hidden"
                                    />
                                    <span className="absolute right-2.5 top-2 text-xs text-slate-500 font-bold">★</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleAddFeatureRating}
                                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl border border-slate-700 cursor-pointer whitespace-nowrap"
                                >
                                    + Add Aspect
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 7. Customer Reviews Manager */}
                <div className="bg-[#131c31] rounded-2xl p-5 border border-slate-800 shadow-md space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
                        <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
                            7. Customer Reviews & Carousel ({reviews.length})
                        </h3>
                        <span className="text-[11px] text-slate-400">
                            Displayed in the horizontal review carousel on the product page
                        </span>
                    </div>

                    {/* Existing Reviews List */}
                    <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                        {reviews.map((rev, i) => (
                            <div key={i} className="p-3 rounded-xl bg-[#0f172a] border border-slate-800 text-xs space-y-1.5 relative group">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className={`flex items-center gap-0.5 text-white text-[11px] font-bold px-1.5 py-0.5 rounded-xs ${
                                            rev.rating >= 4 ? 'bg-emerald-600' : rev.rating >= 3 ? 'bg-amber-600' : 'bg-red-500'
                                        }`}>
                                            <span>{rev.rating}</span>
                                            <span>★</span>
                                        </div>
                                        <span className="font-bold text-white text-xs">{rev.title || 'Review'}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] text-slate-400">{rev.dateStr || '1 year ago'}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveReview(i)}
                                            className="text-red-400 hover:text-red-300 cursor-pointer p-0.5"
                                            title="Remove review"
                                        >
                                            <DeleteOutlineIcon sx={{ fontSize: 15 }} />
                                        </button>
                                    </div>
                                </div>
                                <p className="text-slate-300 text-xs leading-relaxed">
                                    "{rev.comment}"
                                </p>
                                <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800/80">
                                    <span className="font-semibold text-slate-300">{rev.name}</span>
                                    <span className="text-emerald-400 font-bold">✓ Certified Buyer</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Add Review Form */}
                    <div className="pt-3 border-t border-slate-800 space-y-3">
                        <label className="block text-xs font-bold text-white">Add New Customer Review Manually</label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <div>
                                <label className="block text-[11px] text-slate-400 mb-1">Customer / Buyer Name</label>
                                <input
                                    type="text"
                                    value={newReview.name}
                                    onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                                    placeholder="e.g. Rahul Sharma"
                                    className="w-full px-3 py-2 text-xs border border-slate-700 bg-[#0f172a] text-slate-100 placeholder-slate-500 rounded-xl focus:border-blue-500 focus:outline-hidden"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] text-slate-400 mb-1">Review Title</label>
                                <input
                                    type="text"
                                    value={newReview.title}
                                    onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                                    placeholder="e.g. Excellent / Nice product"
                                    className="w-full px-3 py-2 text-xs border border-slate-700 bg-[#0f172a] text-slate-100 placeholder-slate-500 rounded-xl focus:border-blue-500 focus:outline-hidden"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] text-slate-400 mb-1">Star Rating (1-5)</label>
                                <select
                                    value={newReview.rating}
                                    onChange={(e) => setNewReview({ ...newReview, rating: Number(e.target.value) })}
                                    className="w-full px-3 py-2 text-xs border border-slate-700 bg-[#0f172a] text-slate-100 rounded-xl focus:border-blue-500 focus:outline-hidden"
                                >
                                    <option value={5}>5 ★ - Excellent</option>
                                    <option value={4}>4 ★ - Very Good</option>
                                    <option value={3}>3 ★ - Good</option>
                                    <option value={2}>2 ★ - Disliked</option>
                                    <option value={1}>1 ★ - Bad</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-[11px] text-slate-400 mb-1">Review Date</label>
                            <input
                                type="text"
                                value={newReview.dateStr}
                                onChange={(e) => setNewReview({ ...newReview, dateStr: e.target.value })}
                                placeholder="e.g. 1 year ago, 6 months ago, 2 weeks ago"
                                className="w-full px-3 py-2 text-xs border border-slate-700 bg-[#0f172a] text-slate-100 placeholder-slate-500 rounded-xl focus:border-blue-500 focus:outline-hidden"
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] text-slate-400 mb-1">Review Comment / Feedback</label>
                            <textarea
                                rows={2}
                                value={newReview.comment}
                                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                                placeholder="Describe product quality, usage experience, packaging, performance..."
                                className="w-full px-3 py-2 text-xs border border-slate-700 bg-[#0f172a] text-slate-100 placeholder-slate-500 rounded-xl focus:border-blue-500 focus:outline-hidden"
                            />
                        </div>

                        <button
                            type="button"
                            onClick={handleAddReview}
                            className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-colors"
                        >
                            + Add Review to Product
                        </button>
                    </div>
                </div>

                {/* 8. Action Buttons */}
                <div className="flex items-center justify-between gap-3 pt-3">
                    <Link
                        to="/admin/products"
                        className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-xs font-bold hover:bg-slate-800 transition-colors"
                    >
                        ← Cancel & Back
                    </Link>

                    <button
                        type="submit"
                        disabled={saving}
                        className="py-3 px-8 rounded-xl bg-[#ffe11b] hover:bg-amber-400 text-gray-950 font-black text-sm shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                        {saving ? (
                            <>
                                <span className="inline-block w-3.5 h-3.5 border-2 border-gray-900/30 border-t-gray-900 rounded-full animate-spin"></span>
                                <span>Syncing with Live Store...</span>
                            </>
                        ) : (
                            <>
                                <CheckCircleIcon sx={{ fontSize: 18 }} />
                                <span>Save Changes & Sync Store Live</span>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default UpdateProduct;
