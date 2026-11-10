import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import MetaData from '../Layouts/MetaData';
import ConfirmationNumberOutlinedIcon from '@mui/icons-material/ConfirmationNumberOutlined';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';

const CouponTable = () => {
    const { enqueueSnackbar } = useSnackbar();
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [creating, setCreating] = useState(false);

    const [newCoupon, setNewCoupon] = useState({
        code: '',
        description: '',
        discountType: 'percentage',
        discountValue: 10,
        minOrderValue: 499,
        maxDiscountAmount: 1000,
        validTill: ''
    });

    const fetchCoupons = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get('/api/v1/admin/coupons');
            if (data && data.success) {
                setCoupons(data.coupons || []);
            }
        } catch (err) {
            enqueueSnackbar(err.response?.data?.message || 'Failed to load coupons', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCoupons();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleCreateCoupon = async (e) => {
        e.preventDefault();
        if (!newCoupon.code || !newCoupon.discountValue) {
            enqueueSnackbar('Coupon code and discount value are required', { variant: 'warning' });
            return;
        }

        setCreating(true);
        try {
            const { data } = await axios.post('/api/v1/admin/coupon/new', newCoupon);
            if (data && data.success) {
                enqueueSnackbar('Coupon created and broadcasted live to store checkout!', { variant: 'success' });
                setShowCreateModal(false);
                setNewCoupon({
                    code: '',
                    description: '',
                    discountType: 'percentage',
                    discountValue: 10,
                    minOrderValue: 499,
                    maxDiscountAmount: 1000,
                    validTill: ''
                });
                fetchCoupons();
            }
        } catch (err) {
            enqueueSnackbar(err.response?.data?.message || 'Failed to create coupon', { variant: 'error' });
        } finally {
            setCreating(false);
        }
    };

    const handleDeleteCoupon = async (id) => {
        if (!window.confirm('Are you sure you want to delete this coupon?')) return;
        try {
            const { data } = await axios.delete(`/api/v1/admin/coupon/${id}`);
            if (data && data.success) {
                enqueueSnackbar('Coupon deleted successfully', { variant: 'success' });
                setCoupons(coupons.filter(c => c._id !== id));
            }
        } catch (err) {
            enqueueSnackbar(err.response?.data?.message || 'Failed to delete coupon', { variant: 'error' });
        }
    };

    return (
        <div className="space-y-6">
            <MetaData title="Coupons & Discounts | Nexmart Admin" />

            {/* Header */}
            <div className="bg-[#171825] border border-[#232538] rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
                        <ConfirmationNumberOutlinedIcon sx={{ fontSize: 28, color: '#FBBF24' }} />
                        <span>Coupons & Discount Engine</span>
                    </h1>
                    <p className="text-xs text-[#8E92BC] mt-1">
                        Manage promotional discount codes, percentage and flat offers, minimum order thresholds, and expiry dates.
                    </p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-4 py-2.5 rounded-xl bg-[#5B5CE5] hover:bg-[#4E4FD9] text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-[#5B5CE5]/25 transition-all cursor-pointer"
                >
                    <AddRoundedIcon sx={{ fontSize: 18 }} />
                    <span>Create New Coupon</span>
                </button>
            </div>

            {/* Coupons List Table */}
            <div className="bg-[#171825] border border-[#232538] rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-[#1F2133] text-slate-400 font-semibold uppercase tracking-wider text-[10px] border-b border-[#232538]">
                            <tr>
                                <th className="py-3 px-4">Coupon Code</th>
                                <th className="py-3 px-4">Description</th>
                                <th className="py-3 px-4">Discount</th>
                                <th className="py-3 px-4">Min. Cart Value</th>
                                <th className="py-3 px-4">Max. Discount</th>
                                <th className="py-3 px-4">Status</th>
                                <th className="py-3 px-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#232538] text-slate-300">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="py-8 text-center text-slate-500">Loading coupons...</td>
                                </tr>
                            ) : coupons.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-8 text-center text-slate-500">No active coupons found. Create your first coupon above!</td>
                                </tr>
                            ) : (
                                coupons.map((c) => (
                                    <tr key={c._id} className="hover:bg-[#1E2033]/60 transition-colors">
                                        <td className="py-3.5 px-4 font-mono font-bold text-white text-sm">
                                            <span className="px-2.5 py-1 rounded-lg bg-[#5B5CE5]/15 border border-[#5B5CE5]/30 text-[#818CF8]">
                                                {c.code}
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-4 text-slate-400 max-w-xs truncate">{c.description || 'Promotional Offer'}</td>
                                        <td className="py-3.5 px-4 font-bold text-white">
                                            {c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `₹${c.discountValue} FLAT`}
                                        </td>
                                        <td className="py-3.5 px-4">₹{c.minOrderValue || 0}</td>
                                        <td className="py-3.5 px-4">₹{c.maxDiscountAmount || 'No cap'}</td>
                                        <td className="py-3.5 px-4">
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#10B981]/15 text-[#34D399] border border-[#10B981]/25">
                                                <CheckCircleOutlineRoundedIcon sx={{ fontSize: 12 }} />
                                                <span>Active</span>
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-4 text-right">
                                            <button
                                                onClick={() => handleDeleteCoupon(c._id)}
                                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                                                title="Delete Coupon"
                                            >
                                                <DeleteOutlineRoundedIcon sx={{ fontSize: 18 }} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Coupon Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-[#171825] border border-[#232538] rounded-2xl w-full max-w-lg p-6 shadow-2xl relative space-y-4">
                        <div className="flex items-center justify-between border-b border-[#232538] pb-3">
                            <h3 className="text-base font-bold text-white flex items-center gap-2">
                                <ConfirmationNumberOutlinedIcon sx={{ fontSize: 20, color: '#5B5CE5' }} />
                                <span>Add New Promo Coupon</span>
                            </h3>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="text-slate-400 hover:text-white text-lg font-bold"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleCreateCoupon} className="space-y-4 text-xs">
                            <div>
                                <label className="block text-slate-300 font-semibold mb-1">Coupon Code (Uppercase)</label>
                                <input
                                    type="text"
                                    required
                                    value={newCoupon.code}
                                    onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                                    className="w-full bg-[#0E1017] border border-[#232538] focus:border-[#5B5CE5] rounded-xl px-3.5 py-2.5 text-white uppercase font-mono font-bold outline-none"
                                    placeholder="DIWALI100"
                                />
                            </div>

                            <div>
                                <label className="block text-slate-300 font-semibold mb-1">Offer Description</label>
                                <input
                                    type="text"
                                    value={newCoupon.description}
                                    onChange={(e) => setNewCoupon({ ...newCoupon, description: e.target.value })}
                                    className="w-full bg-[#0E1017] border border-[#232538] focus:border-[#5B5CE5] rounded-xl px-3.5 py-2.5 text-white outline-none"
                                    placeholder="Instant ₹100 Discount on all Electronics"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-slate-300 font-semibold mb-1">Discount Type</label>
                                    <select
                                        value={newCoupon.discountType}
                                        onChange={(e) => setNewCoupon({ ...newCoupon, discountType: e.target.value })}
                                        className="w-full bg-[#0E1017] border border-[#232538] focus:border-[#5B5CE5] rounded-xl px-3.5 py-2.5 text-white outline-none"
                                    >
                                        <option value="percentage">Percentage (%)</option>
                                        <option value="flat">Flat Amount (₹)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-slate-300 font-semibold mb-1">Discount Value</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        value={newCoupon.discountValue}
                                        onChange={(e) => setNewCoupon({ ...newCoupon, discountValue: e.target.value })}
                                        className="w-full bg-[#0E1017] border border-[#232538] focus:border-[#5B5CE5] rounded-xl px-3.5 py-2.5 text-white outline-none font-bold"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-slate-300 font-semibold mb-1">Min. Order Value (₹)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={newCoupon.minOrderValue}
                                        onChange={(e) => setNewCoupon({ ...newCoupon, minOrderValue: e.target.value })}
                                        className="w-full bg-[#0E1017] border border-[#232538] focus:border-[#5B5CE5] rounded-xl px-3.5 py-2.5 text-white outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-300 font-semibold mb-1">Max Cap (₹)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={newCoupon.maxDiscountAmount}
                                        onChange={(e) => setNewCoupon({ ...newCoupon, maxDiscountAmount: e.target.value })}
                                        className="w-full bg-[#0E1017] border border-[#232538] focus:border-[#5B5CE5] rounded-xl px-3.5 py-2.5 text-white outline-none"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-3 border-t border-[#232538]">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-4 py-2 rounded-xl bg-[#202234] hover:bg-[#2B2E44] text-slate-300 font-bold"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={creating}
                                    className="px-5 py-2 rounded-xl bg-[#5B5CE5] hover:bg-[#4E4FD9] text-white font-bold disabled:opacity-50"
                                >
                                    {creating ? 'Saving...' : 'Publish Coupon'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CouponTable;
