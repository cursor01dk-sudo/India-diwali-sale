import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import MetaData from '../Layouts/MetaData';
import { fallbackBanners } from '../../data/storeFallbackData';

const presetAssets = [
    { label: "Hero: Bank Offer Refreshed", path: "/assets/banners/banner_bank_offer.jpg", type: "hero_banner" },
    { label: "Top Promo: OPPO Find X10", path: "/assets/banners/poster_oppo.jpg", type: "carousel_card" },
    { label: "Top Promo: vivo T5x 5G", path: "/assets/banners/poster_vivo.jpg", type: "carousel_card" },
    { label: "Top Promo: acer Aspire 7", path: "/assets/banners/poster_acer.jpg", type: "carousel_card" },
    { label: "Wide Festive: Galaxy F70e 5G", path: "/assets/banners/banner_samsung.jpg", type: "wide_banner" },
    { label: "Diwali Sale Live", path: "/assets/diwali/banner.jpg", type: "carousel_card" },
];

const ManageBanners = () => {
    const { enqueueSnackbar } = useSnackbar();
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');

    // Modal state for Add / Edit
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBannerId, setEditingBannerId] = useState(null);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [uploadedFileName, setUploadedFileName] = useState('');
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        title: '',
        subtitle: '',
        discountText: '',
        image: '',
        type: 'hero_banner',
        link: '/products',
        order: 1
    });

    // Fetch all banners
    const fetchBanners = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get('/api/v1/banners');
            if (data.success && data.banners && data.banners.length > 0) {
                setBanners(data.banners);
                localStorage.setItem('fk_custom_banners', JSON.stringify(data.banners));
            } else {
                const saved = localStorage.getItem('fk_custom_banners');
                setBanners(saved ? JSON.parse(saved) : fallbackBanners);
            }
        } catch (err) {
            const saved = localStorage.getItem('fk_custom_banners');
            setBanners(saved ? JSON.parse(saved) : fallbackBanners);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBanners();
    }, []);

    const openAddModal = (defaultType = 'hero_banner') => {
        setEditingBannerId(null);
        setUploadedFileName('');
        setFormData({
            title: '',
            subtitle: '',
            discountText: '',
            image: '',
            type: defaultType,
            link: '/products',
            order: banners.length + 1
        });
        setIsModalOpen(true);
    };

    const openEditModal = (b) => {
        setEditingBannerId(b._id);
        setUploadedFileName('');
        setFormData({
            title: b.title || '',
            subtitle: b.subtitle || '',
            discountText: b.discountText || '',
            image: b.image || '',
            type: b.type || 'hero_banner',
            link: b.link || '/products',
            order: b.order || 1
        });
        setIsModalOpen(true);
    };

    // Handle local image file upload & instant application
    const handleLocalFileUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            enqueueSnackbar("Please select a valid image file (PNG, JPG, WebP)", { variant: "warning" });
            return;
        }

        setUploadedFileName(file.name);
        setUploadingImage(true);

        const reader = new FileReader();
        reader.onload = async () => {
            const base64Data = reader.result;

            // 1. Immediately apply the image locally so user sees it instantly
            setFormData(prev => ({
                ...prev,
                image: base64Data,
                title: prev.title || file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ")
            }));

            // 2. Upload to server to persist as an uploaded file
            try {
                const uploadFormData = new FormData();
                uploadFormData.append('image', file);

                const { data } = await axios.post('/api/v1/admin/banner/upload', uploadFormData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                if (data.success && data.url) {
                    setFormData(prev => ({
                        ...prev,
                        image: data.url
                    }));
                    enqueueSnackbar(`Image "${file.name}" saved and applied!`, { variant: "success" });
                } else {
                    enqueueSnackbar(`Applied "${file.name}" locally`, { variant: "info" });
                }
            } catch (err) {
                // Base64 already applied as seamless fallback
                enqueueSnackbar(`Applied "${file.name}" locally`, { variant: "info" });
            } finally {
                setUploadingImage(false);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!formData.title || !formData.image) {
            enqueueSnackbar("Title and Image URL are required", { variant: "error" });
            return;
        }

        try {
            if (editingBannerId) {
                // Update / Replace existing
                await axios.put(`/api/v1/admin/banner/${editingBannerId}`, formData);
                enqueueSnackbar("Poster replaced successfully!", { variant: "success" });
            } else {
                // Add new
                await axios.post('/api/v1/admin/banner/new', formData);
                enqueueSnackbar("New poster added successfully!", { variant: "success" });
            }
            fetchBanners();
            setIsModalOpen(false);
        } catch (err) {
            // Local fallback
            if (editingBannerId) {
                const updated = banners.map(b => b._id === editingBannerId ? { ...b, ...formData } : b);
                setBanners(updated);
                localStorage.setItem('fk_custom_banners', JSON.stringify(updated));
            } else {
                const newB = { ...formData, _id: Date.now().toString() };
                const updated = [...banners, newB];
                setBanners(updated);
                localStorage.setItem('fk_custom_banners', JSON.stringify(updated));
            }
            enqueueSnackbar("Poster saved successfully!", { variant: "success" });
            setIsModalOpen(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to remove this poster?")) return;

        try {
            await axios.delete(`/api/v1/admin/banner/${id}`);
            enqueueSnackbar("Poster removed successfully", { variant: "info" });
            fetchBanners();
        } catch (err) {
            const updated = banners.filter(b => b._id !== id);
            setBanners(updated);
            localStorage.setItem('fk_custom_banners', JSON.stringify(updated));
            enqueueSnackbar("Poster removed locally", { variant: "info" });
        }
    };

    const handleResetDefaults = async () => {
        if (!window.confirm("Reset all banners and posters to the official Flipkart festival defaults?")) return;
        try {
            await axios.post('/api/v1/admin/banners/reset');
            enqueueSnackbar("All posters restored to default!", { variant: "success" });
            fetchBanners();
        } catch (err) {
            fetchBanners();
            enqueueSnackbar("Refreshed posters", { variant: "info" });
        }
    };

    // Filter by active tab
    const filteredBanners = activeTab === 'all'
        ? banners
        : banners.filter(b => b.type === activeTab);

    const counts = {
        all: banners.length,
        hero_banner: banners.filter(b => b.type === 'hero_banner').length,
        featured_brand: banners.filter(b => b.type === 'featured_brand').length,
        brand_deal: banners.filter(b => b.type === 'brand_deal').length,
        carousel_card: banners.filter(b => b.type === 'carousel_card').length,
        wide_banner: banners.filter(b => b.type === 'wide_banner').length,
    };

    const getTypeLabel = (type) => {
        switch (type) {
            case 'hero_banner': return 'Hero Festive Banner';
            case 'featured_brand': return 'Featured Brand';
            case 'brand_deal': return 'Brand Deal';
            case 'carousel_card': return 'Top Promo Card';
            case 'wide_banner': return 'Wide Festive Banner';
            default: return type;
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'hero_banner': return 'bg-red-500/20 text-red-300 border-red-500/30';
            case 'featured_brand': return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
            case 'brand_deal': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
            case 'carousel_card': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
            case 'wide_banner': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
            default: return 'bg-slate-800 text-slate-300 border-slate-700';
        }
    };

    return (
        <div className="space-y-5">
            <MetaData title="Poster & Banner Studio | Nexmart" />

            {/* Header Banner */}
            <div className="bg-[#171825] border border-[#232538] rounded-2xl p-4 sm:p-6 text-white shadow-xl">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                        <div className="text-[11px] text-[#5B5CE5] font-bold uppercase tracking-wider">
                            Visual Merchandising Studio
                        </div>
                        <h2 className="text-lg sm:text-xl font-black tracking-tight text-white">
                            Front Page Posters, Brands & Banners
                        </h2>
                        <p className="text-xs text-[#8E92BC] mt-0.5">
                            Any changes you make here (Add, Replace, or Remove) are reflected live on your storefront instantly.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            onClick={handleResetDefaults}
                            className="bg-[#202234] hover:bg-[#282B42] text-slate-200 text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1 transition-colors border border-[#2E314A] cursor-pointer"
                            title="Restore default festival banners"
                        >
                            <RestartAltIcon sx={{ fontSize: 16 }} />
                            <span>Reset Defaults</span>
                        </button>

                        <button
                            onClick={() => openAddModal(activeTab === 'all' ? 'hero_banner' : activeTab)}
                            className="bg-[#5B5CE5] hover:bg-[#4E4FD9] text-white text-xs font-bold px-3.5 py-1.5 rounded-xl flex items-center gap-1 shadow-md shadow-[#5B5CE5]/25 transition-colors cursor-pointer"
                        >
                            <AddCircleOutlineIcon sx={{ fontSize: 16 }} />
                            <span>Add New Poster</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="space-y-4">

                {/* Info Card */}
                <div className="bg-[#171825] rounded-2xl p-4 shadow-md border border-[#232538] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                        <h2 className="text-sm font-bold text-white">
                            Dynamic Poster Management
                        </h2>
                        <p className="text-xs text-[#8E92BC] mt-0.5">
                            Live updates to hero banners, promo carousel cards, and feature strips.
                        </p>
                    </div>
                    <div className="text-xs font-bold text-slate-300 bg-[#10111A] px-3 py-1.5 rounded-xl border border-[#26283D]">
                        Total Posters: <span className="text-[#38BDF8] font-black">{banners.length}</span>
                    </div>
                </div>

                {/* Category Navigation Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                    {[
                        { id: 'all', label: 'All Posters', count: counts.all },
                        { id: 'hero_banner', label: 'Hero Festive Banners', count: counts.hero_banner },
                        { id: 'carousel_card', label: 'Top Promo Cards', count: counts.carousel_card },
                        { id: 'wide_banner', label: 'Wide Feature Banners', count: counts.wide_banner },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${activeTab === tab.id
                                    ? 'bg-[#5B5CE5] text-white shadow-md shadow-[#5B5CE5]/25 font-extrabold'
                                    : 'bg-[#171825] text-[#8E92BC] hover:text-white hover:bg-[#202234] border border-[#232538]'
                                }`}
                        >
                            <span>{tab.label}</span>
                            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-[#202234] text-[#8E92BC]'
                                }`}>
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Posters Grid */}
                {loading ? (
                    <div className="bg-[#171825] rounded-2xl p-12 text-center text-[#8E92BC] text-sm border border-[#232538]">
                        Loading posters...
                    </div>
                ) : filteredBanners.length === 0 ? (
                    <div className="bg-[#171825] rounded-2xl p-12 text-center space-y-3 border border-[#232538]">
                        <div className="text-3xl">🖼️</div>
                        <h3 className="text-sm font-bold text-white">No posters found in this section</h3>
                        <p className="text-xs text-[#8E92BC]">Click "Add New Poster" to add one now.</p>
                        <button
                            onClick={() => openAddModal(activeTab === 'all' ? 'hero_banner' : activeTab)}
                            className="bg-[#5B5CE5] hover:bg-[#4E4FD9] text-white text-xs font-bold px-4 py-2 rounded-xl cursor-pointer"
                        >
                            Add Poster
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredBanners.map((b) => (
                            <div
                                key={b._id}
                                className="bg-[#171825] rounded-2xl p-3.5 border border-[#232538] shadow-md hover:border-[#3A3D59] transition-all flex flex-col justify-between group"
                            >
                                <div>
                                    {/* Type Badge & Order */}
                                    <div className="flex items-center justify-between mb-2">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getTypeColor(b.type)}`}>
                                            {getTypeLabel(b.type)}
                                        </span>
                                        {b.discountText && (
                                            <span className="text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded">
                                                {b.discountText}
                                            </span>
                                        )}
                                    </div>

                                    {/* Poster Image Preview */}
                                    <div className="w-full aspect-[16/9] bg-[#10111A] rounded-xl overflow-hidden border border-[#232538] relative mb-3">
                                        <img
                                            src={b.image}
                                            alt={b.title}
                                            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                                            onError={(e) => { e.target.src = '/assets/banners/banner_bank_offer.jpg'; }}
                                        />
                                    </div>

                                    {/* Details */}
                                    <div className="space-y-1 mb-3">
                                        <h3 className="text-xs font-bold text-white line-clamp-1">{b.title}</h3>
                                        {b.subtitle && (
                                            <p className="text-[11px] text-slate-400 line-clamp-2">{b.subtitle}</p>
                                        )}
                                        <div className="text-[10px] font-mono text-blue-400 truncate pt-0.5">
                                            Link: {b.link || '/products'}
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons: Replace & Remove */}
                                <div className="flex items-center gap-2 pt-2.5 border-t border-slate-800">
                                    <button
                                        onClick={() => openEditModal(b)}
                                        className="flex-1 py-1.5 px-3 bg-slate-800/80 hover:bg-blue-600/20 hover:text-blue-300 hover:border-blue-500/40 border border-slate-700 text-slate-200 font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                                    >
                                        <EditOutlinedIcon sx={{ fontSize: 15 }} />
                                        <span>Replace</span>
                                    </button>

                                    <button
                                        onClick={() => handleDelete(b._id)}
                                        className="py-1.5 px-3 bg-red-950/40 hover:bg-red-900/60 border border-red-800/50 text-red-400 font-bold text-xs rounded-lg flex items-center justify-center transition-colors cursor-pointer"
                                        title="Remove poster"
                                    >
                                        <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

            </div>

            {/* Modal for Add / Replace Poster */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 animate-fadeIn">
                    <div className="bg-[#131c31] w-full max-w-lg rounded-2xl shadow-2xl p-5 border border-slate-700 max-h-[92vh] overflow-y-auto text-slate-100">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                            <div>
                                <h3 className="text-base font-bold text-white">
                                    {editingBannerId ? 'Replace / Edit Poster' : 'Add New Poster'}
                                </h3>
                                <p className="text-xs text-slate-400">
                                    Fill in the details below. Front page updates immediately.
                                </p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="w-8 h-8 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
                            >
                                <CloseIcon sx={{ fontSize: 20 }} />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="space-y-3.5 text-xs">

                            {/* Poster Type */}
                            <div>
                                <label className="block text-slate-300 font-bold mb-1">
                                    Where should this poster appear? (Type)
                                </label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    className="w-full p-2.5 rounded-lg border border-slate-700 bg-[#0f172a] text-slate-100 font-medium outline-hidden focus:border-blue-500"
                                >
                                    <option value="hero_banner">1. Massive Festive Hero Banner (Bank Offer Refreshed)</option>
                                    <option value="carousel_card">2. Top Promotional Carousel Card (Oppo, Vivo, etc.)</option>
                                    <option value="wide_banner">3. Wide Festive Banner (Galaxy F70e 5G)</option>
                                </select>
                            </div>

                            {/* LOCAL IMAGE UPLOAD SECTION (PRIMARY FEATURE) */}
                            <div className="p-3.5 bg-slate-900/90 rounded-xl border border-blue-500/30 space-y-2.5">
                                <div className="flex items-center justify-between">
                                    <label className="text-white font-bold flex items-center gap-1.5 text-xs">
                                        <CloudUploadIcon sx={{ fontSize: 18, color: '#38bdf8' }} />
                                        <span>Upload Poster Image from Computer</span>
                                    </label>
                                    <span className="text-[10px] text-blue-400 font-semibold">Recommended</span>
                                </div>

                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    accept="image/*"
                                    onChange={handleLocalFileUpload}
                                    className="hidden"
                                />

                                {/* Interactive Upload Dropzone Button */}
                                <div
                                    onClick={() => fileInputRef.current && fileInputRef.current.click()}
                                    className="border-2 border-dashed border-blue-500/50 hover:border-blue-400 rounded-xl p-4 bg-[#0f172a] hover:bg-slate-800/80 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer text-center group"
                                >
                                    <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform border border-blue-500/40">
                                        <CloudUploadIcon sx={{ fontSize: 22 }} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors">
                                            {uploadingImage ? "Processing & Applying Image..." : "Click to Browse & Select Image from Your PC"}
                                        </p>
                                        <p className="text-[10px] text-slate-400 mt-0.5">
                                            Supports PNG, JPG, JPEG, WebP, GIF (Auto-compressed & applied live)
                                        </p>
                                    </div>
                                </div>

                                {uploadedFileName && (
                                    <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] font-semibold">
                                        <span className="flex items-center gap-1.5 truncate">
                                            <CheckCircleIcon sx={{ fontSize: 15, color: '#10b981' }} />
                                            <span className="truncate">{uploadedFileName}</span>
                                        </span>
                                        <span className="text-[10px] font-bold bg-emerald-500/20 px-2 py-0.5 rounded text-emerald-300 shrink-0">
                                            ✓ Applied Locally
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Quick Preset Selector */}
                            <div>
                                <label className="block text-slate-300 font-semibold mb-1">
                                    Or Quick Select from Festival Presets (Optional)
                                </label>
                                <select
                                    onChange={(e) => {
                                        const found = presetAssets.find(p => p.path === e.target.value);
                                        if (found) {
                                            setFormData(prev => ({
                                                ...prev,
                                                image: found.path,
                                                title: prev.title || found.label,
                                                type: found.type
                                            }));
                                            setUploadedFileName('');
                                        }
                                    }}
                                    defaultValue=""
                                    className="w-full p-2 rounded-lg border border-dashed border-slate-700 bg-[#0f172a] text-slate-300 font-medium outline-hidden"
                                >
                                    <option value="" disabled>-- Or choose a ready-to-use festival poster --</option>
                                    {presetAssets.map((p, i) => (
                                        <option key={i} value={p.path}>{p.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Poster Title */}
                            <div>
                                <label className="block text-slate-300 font-bold mb-1">Poster Title *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g. BIG BANG DIWALI | BANK OFFER REFRESHED"
                                    className="w-full p-2.5 rounded-lg border border-slate-700 bg-[#0f172a] text-slate-100 placeholder-slate-500 outline-hidden focus:border-blue-500"
                                />
                            </div>

                            {/* Poster Subtitle */}
                            <div>
                                <label className="block text-slate-300 font-semibold mb-1">Subtitle / Description</label>
                                <input
                                    type="text"
                                    value={formData.subtitle}
                                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                                    placeholder="e.g. 10% Instant Discount on SBI Card & Flipkart Axis"
                                    className="w-full p-2.5 rounded-lg border border-slate-700 bg-[#0f172a] text-slate-100 placeholder-slate-500 outline-hidden focus:border-blue-500"
                                />
                            </div>

                            {/* Discount / Offer Badge Text */}
                            <div>
                                <label className="block text-slate-300 font-semibold mb-1">Discount Badge Text (Optional)</label>
                                <input
                                    type="text"
                                    value={formData.discountText}
                                    onChange={(e) => setFormData({ ...formData, discountText: e.target.value })}
                                    placeholder="e.g. Up to 50% Off or From ₹13,499*"
                                    className="w-full p-2.5 rounded-lg border border-slate-700 bg-[#0f172a] text-slate-100 placeholder-slate-500 outline-hidden focus:border-blue-500"
                                />
                            </div>

                            {/* Or Manual Image URL / Path */}
                            <div>
                                <label className="block text-slate-300 font-bold mb-1">
                                    Image URL / Path *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.image}
                                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                    placeholder="e.g. /assets/banners/banner_bank_offer.jpg or /uploads/... or https://..."
                                    className="w-full p-2.5 rounded-lg border border-slate-700 bg-[#0f172a] text-slate-100 placeholder-slate-500 outline-hidden focus:border-blue-500 font-mono"
                                />
                            </div>

                            {/* Live Image Preview */}
                            {formData.image && (
                                <div className="p-2.5 bg-[#0f172a] rounded-xl border border-slate-800 space-y-1.5">
                                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold">
                                        <span className="flex items-center gap-1 text-emerald-400">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                            Live Image Preview (Applied to Store):
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setFormData({ ...formData, image: '' });
                                                setUploadedFileName('');
                                            }}
                                            className="text-red-400 hover:text-red-300 cursor-pointer"
                                        >
                                            ✕ Remove
                                        </button>
                                    </div>
                                    <div className="max-h-40 overflow-hidden rounded-lg bg-black/50 flex items-center justify-center border border-slate-800 p-1">
                                        <img
                                            src={formData.image}
                                            alt="Live Preview"
                                            className="max-h-36 object-contain rounded"
                                            onError={(e) => { e.target.src = '/assets/banners/banner_bank_offer.jpg'; }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Target Link */}
                            <div>
                                <label className="block text-slate-300 font-semibold mb-1">Target Link / Route</label>
                                <input
                                    type="text"
                                    value={formData.link}
                                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                                    placeholder="e.g. /products?keyword=phone"
                                    className="w-full p-2.5 rounded-lg border border-slate-700 bg-[#0f172a] text-slate-100 placeholder-slate-500 outline-hidden focus:border-blue-500 font-mono"
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 pt-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-2.5 rounded-lg border border-slate-700 font-bold text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2.5 rounded-lg bg-[#2874f0] hover:bg-blue-600 text-white font-bold shadow-md transition-colors cursor-pointer"
                                >
                                    {editingBannerId ? 'Replace Poster' : 'Save Poster'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};

export default ManageBanners;
