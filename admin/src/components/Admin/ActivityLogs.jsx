import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MetaData from '../Layouts/MetaData';
import HistoryEduOutlinedIcon from '@mui/icons-material/HistoryEduOutlined';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import { socket } from '../../utils/socket';

const ActivityLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterEntity, setFilterEntity] = useState('all');

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get('/api/v1/admin/activity-logs');
            if (data && data.success) {
                setLogs(data.logs || []);
            }
        } catch (err) {
            console.warn('Could not load activity logs:', err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();

        // Listen for live activity logs emitted over Socket.IO
        const handleNewLog = (data) => {
            if (data && data.data) {
                setLogs((prev) => [data.data, ...prev]);
            }
        };

        socket.on('sync:activity_logged', handleNewLog);

        return () => {
            socket.off('sync:activity_logged', handleNewLog);
        };
    }, []);

    const filteredLogs = filterEntity === 'all'
        ? logs
        : logs.filter(l => l.entityType === filterEntity);

    return (
        <div className="space-y-6">
            <MetaData title="Admin Activity Logs | Nexmart Admin" />

            {/* Header */}
            <div className="bg-[#171825] border border-[#232538] rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
                        <HistoryEduOutlinedIcon sx={{ fontSize: 28, color: '#38BDF8' }} />
                        <span>Administrator Audit Trail & Activity Logs</span>
                    </h1>
                    <p className="text-xs text-[#8E92BC] mt-1">
                        Cryptographically secure, real-time audit trail capturing all price edits, banner updates, order modifications, and CMS updates.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <select
                        value={filterEntity}
                        onChange={(e) => setFilterEntity(e.target.value)}
                        className="bg-[#202234] border border-[#2F3249] rounded-xl px-3 py-2 text-xs text-white outline-none cursor-pointer"
                    >
                        <option value="all">All Domains</option>
                        <option value="product">Products</option>
                        <option value="banner">Banners</option>
                        <option value="order">Orders</option>
                        <option value="content">Website CMS</option>
                        <option value="coupon">Coupons</option>
                        <option value="upi">UPI Gateway</option>
                    </select>

                    <button
                        onClick={fetchLogs}
                        className="p-2 rounded-xl bg-[#202234] hover:bg-[#2B2E44] text-slate-300 border border-[#2F3249] transition-all cursor-pointer"
                        title="Reload Activity Logs"
                    >
                        <RefreshRoundedIcon sx={{ fontSize: 18 }} />
                    </button>
                </div>
            </div>

            {/* Logs Table */}
            <div className="bg-[#171825] border border-[#232538] rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-[#1F2133] text-slate-400 font-semibold uppercase tracking-wider text-[10px] border-b border-[#232538]">
                            <tr>
                                <th className="py-3 px-4">Timestamp</th>
                                <th className="py-3 px-4">Admin Operator</th>
                                <th className="py-3 px-4">Action</th>
                                <th className="py-3 px-4">Entity Type</th>
                                <th className="py-3 px-4">Operation Details</th>
                                <th className="py-3 px-4">Client IP</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#232538] text-slate-300">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="py-8 text-center text-slate-500">Loading audit trail...</td>
                                </tr>
                            ) : filteredLogs.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-8 text-center text-slate-500">No activity logs recorded for this category yet.</td>
                                </tr>
                            ) : (
                                filteredLogs.map((log, i) => (
                                    <tr key={log._id || i} className="hover:bg-[#1E2033]/60 transition-colors">
                                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                                            {log.createdAt ? new Date(log.createdAt).toLocaleString() : 'Just now'}
                                        </td>
                                        <td className="py-3.5 px-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-[#5B5CE5]/20 text-[#818CF8] flex items-center justify-center font-bold text-[10px]">
                                                    <AdminPanelSettingsOutlinedIcon sx={{ fontSize: 14 }} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-white text-[11px]">{log.admin?.name || 'Administrator'}</p>
                                                    <p className="text-[10px] text-[#63688E]">{log.admin?.email || 'admin@flipkart.com'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3.5 px-4 font-mono font-bold text-slate-200">
                                            <span className="px-2 py-0.5 rounded-md bg-[#25283D] border border-[#343753] text-[10px]">
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-4">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                                log.entityType === 'product' ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/25' :
                                                log.entityType === 'banner' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/25' :
                                                log.entityType === 'upi' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25' :
                                                log.entityType === 'order' ? 'bg-sky-500/15 text-sky-400 border border-sky-500/25' :
                                                'bg-slate-500/15 text-slate-300 border border-slate-500/25'
                                            }`}>
                                                {log.entityType}
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-4 font-medium text-slate-200 max-w-sm truncate" title={log.details}>
                                            {log.details}
                                        </td>
                                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                                            {log.ipAddress || '127.0.0.1'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ActivityLogs;
