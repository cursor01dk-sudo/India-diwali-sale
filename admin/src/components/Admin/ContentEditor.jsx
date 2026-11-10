import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import MetaData from '../Layouts/MetaData';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import ContactSupportOutlinedIcon from '@mui/icons-material/ContactSupportOutlined';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';

const ContentEditor = () => {
    const { enqueueSnackbar } = useSnackbar();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    const [content, setContent] = useState({
        announcement: {
            enabled: true,
            text: 'Festive Mega Diwali Sale is LIVE! Extra 10% Instant Discount on All UPI & Cards',
            link: '/products',
            bgColor: '#2874f0',
            textColor: '#ffffff'
        },
        promotionalNotice: {
            enabled: true,
            title: 'Lowest Price Guarantee',
            subtitle: 'Assured 100% Genuine Certified Products with 7 Days Easy Return'
        },
        contactInfo: {
            email: 'support@flipkart.com',
            phone: '1800 202 9898',
            address: 'Flipkart Internet Private Limited, Buildings Alyssa, Begonia & Clove Embassy Tech Village, Outer Ring Road, Bengaluru, 560103, Karnataka, India',
            workingHours: '24x7 Customer Care'
        },
        socialLinks: {
            facebook: 'https://facebook.com/flipkart',
            twitter: 'https://twitter.com/flipkart',
            youtube: 'https://youtube.com/flipkart',
            instagram: 'https://instagram.com/flipkart',
            telegram: 'https://t.me/flipkartdeals'
        },
        footer: {
            aboutText: 'Flipkart is your one-stop shopping destination for the best deals, electronics, fashion, and home appliances.',
            copyrightText: '© 2012-2026 Flipkart.com. All rights reserved.'
        }
    });

    const fetchContent = async () => {
        setFetching(true);
        try {
            const { data } = await axios.get('/api/v1/content');
            if (data && data.success && data.content) {
                setContent(data.content);
            }
        } catch (err) {
            console.warn('Could not fetch remote content, using current settings');
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => {
        fetchContent();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await axios.put('/api/v1/admin/content', content);
            if (data && data.success) {
                enqueueSnackbar('Website content updated and synchronized live across all customer screens!', { variant: 'success' });
            }
        } catch (err) {
            enqueueSnackbar(err.response?.data?.message || 'Failed to update website content', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="flex items-center justify-center p-12 text-slate-400">
                <span>Loading Website Content Configuration...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <MetaData title="Website Content CMS | Nexmart Admin" />

            {/* Header Banner */}
            <div className="bg-[#171825] border border-[#232538] rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
                        <CampaignOutlinedIcon sx={{ fontSize: 28, color: '#5B5CE5' }} />
                        <span>Dynamic Website Content & CMS Control</span>
                    </h1>
                    <p className="text-xs text-[#8E92BC] mt-1">
                        Control announcement banners, promotional text, social links, contact information, and footer details live in MongoDB.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={fetchContent}
                    className="px-4 py-2 rounded-xl bg-[#202234] hover:bg-[#2B2E44] text-slate-300 text-xs font-bold flex items-center gap-2 border border-[#2F3249] transition-all cursor-pointer"
                >
                    <RefreshRoundedIcon sx={{ fontSize: 16 }} />
                    <span>Reload Current Content</span>
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* 1. ANNOUNCEMENT BAR */}
                <div className="bg-[#171825] border border-[#232538] rounded-2xl p-6 shadow-lg space-y-4">
                    <div className="flex items-center justify-between border-b border-[#232538] pb-4">
                        <div className="flex items-center gap-2 text-white font-bold text-sm">
                            <CampaignOutlinedIcon sx={{ fontSize: 20, color: '#38BDF8' }} />
                            <span>Top Announcement Bar</span>
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <span className="text-xs text-slate-400 font-medium">Show Bar:</span>
                            <input
                                type="checkbox"
                                checked={content.announcement?.enabled || false}
                                onChange={(e) => setContent({
                                    ...content,
                                    announcement: { ...content.announcement, enabled: e.target.checked }
                                })}
                                className="w-4 h-4 accent-[#5B5CE5] cursor-pointer"
                            />
                        </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Announcement Text</label>
                            <input
                                type="text"
                                value={content.announcement?.text || ''}
                                onChange={(e) => setContent({
                                    ...content,
                                    announcement: { ...content.announcement, text: e.target.value }
                                })}
                                className="w-full bg-[#0E1017] border border-[#232538] focus:border-[#5B5CE5] rounded-xl px-4 py-2.5 text-xs text-white outline-none"
                                placeholder="Festive Diwali Sale Announcement"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Target Destination Link</label>
                            <input
                                type="text"
                                value={content.announcement?.link || ''}
                                onChange={(e) => setContent({
                                    ...content,
                                    announcement: { ...content.announcement, link: e.target.value }
                                })}
                                className="w-full bg-[#0E1017] border border-[#232538] focus:border-[#5B5CE5] rounded-xl px-4 py-2.5 text-xs text-white outline-none"
                                placeholder="/products"
                            />
                        </div>
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Bar Background Color</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={content.announcement?.bgColor || '#2874f0'}
                                        onChange={(e) => setContent({
                                            ...content,
                                            announcement: { ...content.announcement, bgColor: e.target.value }
                                        })}
                                        className="w-10 h-9 bg-transparent border-0 rounded cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        value={content.announcement?.bgColor || '#2874f0'}
                                        onChange={(e) => setContent({
                                            ...content,
                                            announcement: { ...content.announcement, bgColor: e.target.value }
                                        })}
                                        className="w-full bg-[#0E1017] border border-[#232538] rounded-xl px-3 py-2 text-xs text-white outline-none font-mono"
                                    />
                                </div>
                            </div>
                            <div className="flex-1">
                                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Text Color</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={content.announcement?.textColor || '#ffffff'}
                                        onChange={(e) => setContent({
                                            ...content,
                                            announcement: { ...content.announcement, textColor: e.target.value }
                                        })}
                                        className="w-10 h-9 bg-transparent border-0 rounded cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        value={content.announcement?.textColor || '#ffffff'}
                                        onChange={(e) => setContent({
                                            ...content,
                                            announcement: { ...content.announcement, textColor: e.target.value }
                                        })}
                                        className="w-full bg-[#0E1017] border border-[#232538] rounded-xl px-3 py-2 text-xs text-white outline-none font-mono"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. PROMOTIONAL NOTICE */}
                <div className="bg-[#171825] border border-[#232538] rounded-2xl p-6 shadow-lg space-y-4">
                    <div className="flex items-center justify-between border-b border-[#232538] pb-4">
                        <div className="flex items-center gap-2 text-white font-bold text-sm">
                            <InfoOutlinedIcon sx={{ fontSize: 20, color: '#FBBF24' }} />
                            <span>Trust & Promotional Guarantee Box</span>
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <span className="text-xs text-slate-400 font-medium">Show Box:</span>
                            <input
                                type="checkbox"
                                checked={content.promotionalNotice?.enabled || false}
                                onChange={(e) => setContent({
                                    ...content,
                                    promotionalNotice: { ...content.promotionalNotice, enabled: e.target.checked }
                                })}
                                className="w-4 h-4 accent-[#5B5CE5] cursor-pointer"
                            />
                        </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Notice Title</label>
                            <input
                                type="text"
                                value={content.promotionalNotice?.title || ''}
                                onChange={(e) => setContent({
                                    ...content,
                                    promotionalNotice: { ...content.promotionalNotice, title: e.target.value }
                                })}
                                className="w-full bg-[#0E1017] border border-[#232538] focus:border-[#5B5CE5] rounded-xl px-4 py-2.5 text-xs text-white outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Notice Subtitle / Description</label>
                            <input
                                type="text"
                                value={content.promotionalNotice?.subtitle || ''}
                                onChange={(e) => setContent({
                                    ...content,
                                    promotionalNotice: { ...content.promotionalNotice, subtitle: e.target.value }
                                })}
                                className="w-full bg-[#0E1017] border border-[#232538] focus:border-[#5B5CE5] rounded-xl px-4 py-2.5 text-xs text-white outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* 3. CONTACT & STORE INFORMATION */}
                <div className="bg-[#171825] border border-[#232538] rounded-2xl p-6 shadow-lg space-y-4">
                    <div className="flex items-center gap-2 text-white font-bold text-sm border-b border-[#232538] pb-4">
                        <ContactSupportOutlinedIcon sx={{ fontSize: 20, color: '#34D399' }} />
                        <span>Store Contact & Support Information</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Support Email</label>
                            <input
                                type="email"
                                value={content.contactInfo?.email || ''}
                                onChange={(e) => setContent({
                                    ...content,
                                    contactInfo: { ...content.contactInfo, email: e.target.value }
                                })}
                                className="w-full bg-[#0E1017] border border-[#232538] focus:border-[#5B5CE5] rounded-xl px-4 py-2.5 text-xs text-white outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Support Phone / Toll Free</label>
                            <input
                                type="text"
                                value={content.contactInfo?.phone || ''}
                                onChange={(e) => setContent({
                                    ...content,
                                    contactInfo: { ...content.contactInfo, phone: e.target.value }
                                })}
                                className="w-full bg-[#0E1017] border border-[#232538] focus:border-[#5B5CE5] rounded-xl px-4 py-2.5 text-xs text-white outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Working Hours</label>
                            <input
                                type="text"
                                value={content.contactInfo?.workingHours || ''}
                                onChange={(e) => setContent({
                                    ...content,
                                    contactInfo: { ...content.contactInfo, workingHours: e.target.value }
                                })}
                                className="w-full bg-[#0E1017] border border-[#232538] focus:border-[#5B5CE5] rounded-xl px-4 py-2.5 text-xs text-white outline-none"
                            />
                        </div>
                        <div className="md:col-span-3">
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Corporate & Mail Office Address</label>
                            <textarea
                                rows={2}
                                value={content.contactInfo?.address || ''}
                                onChange={(e) => setContent({
                                    ...content,
                                    contactInfo: { ...content.contactInfo, address: e.target.value }
                                })}
                                className="w-full bg-[#0E1017] border border-[#232538] focus:border-[#5B5CE5] rounded-xl px-4 py-2.5 text-xs text-white outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* 4. SOCIAL MEDIA LINKS */}
                <div className="bg-[#171825] border border-[#232538] rounded-2xl p-6 shadow-lg space-y-4">
                    <div className="flex items-center gap-2 text-white font-bold text-sm border-b border-[#232538] pb-4">
                        <ShareOutlinedIcon sx={{ fontSize: 20, color: '#A855F7' }} />
                        <span>Social Media Accounts</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Instagram URL</label>
                            <input
                                type="text"
                                value={content.socialLinks?.instagram || ''}
                                onChange={(e) => setContent({
                                    ...content,
                                    socialLinks: { ...content.socialLinks, instagram: e.target.value }
                                })}
                                className="w-full bg-[#0E1017] border border-[#232538] focus:border-[#5B5CE5] rounded-xl px-4 py-2.5 text-xs text-white outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Facebook URL</label>
                            <input
                                type="text"
                                value={content.socialLinks?.facebook || ''}
                                onChange={(e) => setContent({
                                    ...content,
                                    socialLinks: { ...content.socialLinks, facebook: e.target.value }
                                })}
                                className="w-full bg-[#0E1017] border border-[#232538] focus:border-[#5B5CE5] rounded-xl px-4 py-2.5 text-xs text-white outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Twitter / X URL</label>
                            <input
                                type="text"
                                value={content.socialLinks?.twitter || ''}
                                onChange={(e) => setContent({
                                    ...content,
                                    socialLinks: { ...content.socialLinks, twitter: e.target.value }
                                })}
                                className="w-full bg-[#0E1017] border border-[#232538] focus:border-[#5B5CE5] rounded-xl px-4 py-2.5 text-xs text-white outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">YouTube URL</label>
                            <input
                                type="text"
                                value={content.socialLinks?.youtube || ''}
                                onChange={(e) => setContent({
                                    ...content,
                                    socialLinks: { ...content.socialLinks, youtube: e.target.value }
                                })}
                                className="w-full bg-[#0E1017] border border-[#232538] focus:border-[#5B5CE5] rounded-xl px-4 py-2.5 text-xs text-white outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Telegram Channel URL</label>
                            <input
                                type="text"
                                value={content.socialLinks?.telegram || ''}
                                onChange={(e) => setContent({
                                    ...content,
                                    socialLinks: { ...content.socialLinks, telegram: e.target.value }
                                })}
                                className="w-full bg-[#0E1017] border border-[#232538] focus:border-[#5B5CE5] rounded-xl px-4 py-2.5 text-xs text-white outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* 5. FOOTER & COPYRIGHT */}
                <div className="bg-[#171825] border border-[#232538] rounded-2xl p-6 shadow-lg space-y-4">
                    <div className="flex items-center gap-2 text-white font-bold text-sm border-b border-[#232538] pb-4">
                        <InfoOutlinedIcon sx={{ fontSize: 20, color: '#38BDF8' }} />
                        <span>Footer & Legal Copyright</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Footer About Text</label>
                            <textarea
                                rows={2}
                                value={content.footer?.aboutText || ''}
                                onChange={(e) => setContent({
                                    ...content,
                                    footer: { ...content.footer, aboutText: e.target.value }
                                })}
                                className="w-full bg-[#0E1017] border border-[#232538] focus:border-[#5B5CE5] rounded-xl px-4 py-2.5 text-xs text-white outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Copyright Statement</label>
                            <textarea
                                rows={2}
                                value={content.footer?.copyrightText || ''}
                                onChange={(e) => setContent({
                                    ...content,
                                    footer: { ...content.footer, copyrightText: e.target.value }
                                })}
                                className="w-full bg-[#0E1017] border border-[#232538] focus:border-[#5B5CE5] rounded-xl px-4 py-2.5 text-xs text-white outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-2">
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-3 rounded-xl bg-[#5B5CE5] hover:bg-[#4E4FD9] text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-[#5B5CE5]/30 transition-all cursor-pointer disabled:opacity-50"
                    >
                        <SaveRoundedIcon sx={{ fontSize: 18 }} />
                        <span>{loading ? 'Saving & Broadcasting...' : 'Save & Publish Live Changes'}</span>
                    </button>
                </div>

            </form>
        </div>
    );
};

export default ContentEditor;
