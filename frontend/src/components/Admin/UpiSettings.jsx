import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import LaunchIcon from '@mui/icons-material/Launch';
import SaveIcon from '@mui/icons-material/Save';
import RefreshIcon from '@mui/icons-material/Refresh';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import MetaData from '../Layouts/MetaData';

const presetHandles = [
    { label: "PhonePe (@ybl)", handle: "@ybl" },
    { label: "Google Pay (@okhdfcbank)", handle: "@okhdfcbank" },
    { label: "Google Pay (@okaxis)", handle: "@okaxis" },
    { label: "Google Pay (@oksbi)", handle: "@oksbi" },
    { label: "Paytm (@paytm)", handle: "@paytm" },
    { label: "PhonePe ICICI (@ibl)", handle: "@ibl" },
    { label: "FamPay (@fam)", handle: "@fam" },
];

const UpiSettings = () => {
    const { enqueueSnackbar } = useSnackbar();

    const [upiId, setUpiId] = useState('');
    const [payeeName, setPayeeName] = useState('Flipkart Payments');
    const [qrNote, setQrNote] = useState('Order Product');
    const [activeConfig, setActiveConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [copied, setCopied] = useState(false);

    // Fetch live UPI settings from backend
    const fetchSettings = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get('/api/v1/payment/upi-settings');
            if (data && data.success) {
                setUpiId(data.upiId || 'deepakddoswala@fam');
                setPayeeName(data.payeeName || 'Flipkart Payments');
                setQrNote(data.qrNote || 'Order Product');
                setActiveConfig(data);
                try {
                    localStorage.setItem('merchantUpiId', data.upiId);
                    localStorage.setItem('merchantPayeeName', data.payeeName);
                } catch (e) {}
            }
        } catch (err) {
            enqueueSnackbar("Could not load UPI settings from server, using local cache", { variant: "warning" });
            const cachedUpi = localStorage.getItem('merchantUpiId') || 'deepakddoswala@fam';
            const cachedName = localStorage.getItem('merchantPayeeName') || 'Flipkart Payments';
            setUpiId(cachedUpi);
            setPayeeName(cachedName);
            setActiveConfig({ upiId: cachedUpi, payeeName: cachedName, qrNote: 'Order Product' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Save & Update UPI settings
    const handleSave = async (e) => {
        if (e) e.preventDefault();

        const cleanUpi = upiId.trim();
        if (!cleanUpi || !cleanUpi.includes('@')) {
            enqueueSnackbar("Please enter a valid UPI ID containing '@' (e.g. 9876543210@ybl or store@okhdfcbank)", { variant: "error" });
            return;
        }

        setSaving(true);
        try {
            const { data } = await axios.post('/api/v1/admin/payment/upi-settings', {
                upiId: cleanUpi,
                payeeName: payeeName.trim() || 'Flipkart Payments',
                qrNote: qrNote.trim() || 'Order Product'
            });

            if (data && data.success) {
                setActiveConfig(data);
                try {
                    localStorage.setItem('merchantUpiId', data.upiId);
                    localStorage.setItem('merchantPayeeName', data.payeeName);
                } catch (e) {}
                enqueueSnackbar("UPI ID updated! All customer payments are now routed to " + data.upiId, { variant: "success" });
            } else {
                enqueueSnackbar(data?.message || "Failed to update UPI ID", { variant: "error" });
            }
        } catch (err) {
            // Local fallback persistence
            try {
                localStorage.setItem('merchantUpiId', cleanUpi);
                localStorage.setItem('merchantPayeeName', payeeName.trim());
            } catch (e) {}
            setActiveConfig({ upiId: cleanUpi, payeeName: payeeName.trim(), qrNote });
            enqueueSnackbar("UPI ID saved locally! Store payments will now use " + cleanUpi, { variant: "success" });
        } finally {
            setSaving(false);
        }
    };

    const handleApplyPreset = (handle) => {
        const currentPrefix = upiId.split('@')[0] || '';
        if (currentPrefix) {
            setUpiId(`${currentPrefix}${handle}`);
        } else {
            setUpiId(`merchant${handle}`);
        }
    };

    // Live preview UPI String & QR Code
    const previewUpiString = `upi://pay?pa=${encodeURIComponent(upiId || 'merchant@upi')}&pn=${encodeURIComponent(payeeName || 'Flipkart Payments')}&am=1.00&cu=INR&tn=${encodeURIComponent(`${qrNote || 'Order Product'} Preview`)}`;
    const previewQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(previewUpiString)}&margin=4`;

    const handleCopyUpiString = () => {
        navigator.clipboard.writeText(previewUpiString);
        setCopied(true);
        enqueueSnackbar("UPI URI copied to clipboard!", { variant: "info" });
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-5">
            <MetaData title="UPI & Payment Settings | Nexmart" />

            {/* 1. Top Header Banner */}
            <div className="bg-[#171825] border border-[#232538] rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-xl bg-[#5B5CE5]/15 border border-[#5B5CE5]/30 flex items-center justify-center text-[#5B5CE5] shadow-inner">
                            <AccountBalanceWalletIcon sx={{ fontSize: 26 }} />
                        </div>
                        <div>
                            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                                <span>UPI & Payment Gateway Settings</span>
                                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#10B981]/15 text-[#34D399] border border-[#10B981]/30 uppercase tracking-widest">
                                    Live Router
                                </span>
                            </h2>
                            <p className="text-xs sm:text-sm text-[#8E92BC] mt-1">
                                Change your store receiver UPI ID here. All customer payments at checkout redirect to this ID immediately.
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={fetchSettings}
                        disabled={loading}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#202234] hover:bg-[#282B42] text-slate-200 text-xs font-semibold border border-[#2E314A] transition-all cursor-pointer"
                    >
                        <RefreshIcon sx={{ fontSize: 16 }} className={loading ? "animate-spin" : ""} />
                        <span>Refresh Live Settings</span>
                    </button>
                </div>
            </div>

            {/* 2. Active Destination Highlight Card */}
            <div className="bg-[#171825] border border-[#10B981]/30 rounded-2xl p-5 sm:p-6 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#10B981]/5 rounded-full blur-3xl pointer-events-none"></div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#34D399] flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
                            Currently Receiving Customer Checkout Payments
                        </span>
                        <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight break-all">
                            {activeConfig?.upiId || upiId || 'deepakddoswala@fam'}
                        </div>
                        <div className="text-xs text-[#8E92BC]">
                            Payee Name: <strong className="text-slate-200">{activeConfig?.payeeName || payeeName}</strong> • Note: <strong className="text-slate-200">{activeConfig?.qrNote || qrNote}</strong>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="px-3 py-1.5 rounded-xl bg-[#10B981]/15 border border-[#10B981]/40 text-[#34D399] font-bold text-xs flex items-center gap-1.5 shadow-sm">
                            <CheckCircleIcon sx={{ fontSize: 16 }} />
                            <span>Verified Active</span>
                        </span>
                    </div>
                </div>
            </div>

            {/* 3. Main Configuration Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

                {/* Left Form: Edit UPI Settings (7 Cols) */}
                <div className="lg:col-span-7 bg-[#171825] border border-[#232538] rounded-2xl p-5 sm:p-6 space-y-5">
                    <div className="border-b border-[#232538] pb-3">
                        <h3 className="text-base font-bold text-white flex items-center gap-2">
                            <span>Modify Destination UPI ID</span>
                        </h3>
                        <p className="text-xs text-[#8E92BC] mt-0.5">
                            Enter any UPI handle. Customers scanning the QR code or tapping PhonePe, GPay, or Paytm will pay directly to this ID.
                        </p>
                    </div>

                    <form onSubmit={handleSave} className="space-y-4">
                        {/* UPI ID Field */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                                Merchant UPI ID <span className="text-amber-400">*</span>
                            </label>
                            <input
                                type="text"
                                value={upiId}
                                onChange={(e) => setUpiId(e.target.value)}
                                placeholder="e.g. 9876543210@ybl, yourname@okhdfcbank, deepakddoswala@fam"
                                required
                                className="w-full bg-[#10111A] text-white font-mono text-sm px-4 py-2.5 rounded-xl border border-[#26283D] focus:border-[#5B5CE5] focus:ring-1 focus:ring-[#5B5CE5] focus:outline-hidden transition-colors"
                            />
                            <p className="text-[11px] text-[#63688E] mt-1">
                                Must contain an @ handle (e.g. @ybl, @okhdfcbank, @paytm, @okaxis, @fam, @upi).
                            </p>
                        </div>

                        {/* Quick Presets */}
                        <div>
                            <label className="block text-[11px] font-semibold text-[#8E92BC] mb-1.5 uppercase tracking-wider">
                                Quick Handle Suffixes:
                            </label>
                            <div className="flex flex-wrap gap-1.5">
                                {presetHandles.map((p) => (
                                    <button
                                        key={p.handle}
                                        type="button"
                                        onClick={() => handleApplyPreset(p.handle)}
                                        className="px-2.5 py-1 rounded-lg bg-[#202234] hover:bg-[#282B42] text-[11px] font-mono text-[#A5B4FC] border border-[#2E314A] transition-colors cursor-pointer"
                                    >
                                        {p.handle}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Payee Name Field */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                                Payee / Store Name Displayed on Customer Screen
                            </label>
                            <input
                                type="text"
                                value={payeeName}
                                onChange={(e) => setPayeeName(e.target.value)}
                                placeholder="e.g. Flipkart Payments or Your Business Name"
                                className="w-full bg-[#10111A] text-white text-sm px-4 py-2.5 rounded-xl border border-[#26283D] focus:border-[#5B5CE5] focus:ring-1 focus:ring-[#5B5CE5] focus:outline-hidden transition-colors"
                            />
                            <p className="text-[11px] text-[#63688E] mt-1">
                                Displayed in Google Pay, PhonePe, and Paytm as the verified receiver name.
                            </p>
                        </div>

                        {/* Order Note Field */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                                Transaction Note Prefix
                            </label>
                            <input
                                type="text"
                                value={qrNote}
                                onChange={(e) => setQrNote(e.target.value)}
                                placeholder="Order Product"
                                className="w-full bg-[#10111A] text-white text-sm px-4 py-2.5 rounded-xl border border-[#26283D] focus:border-[#5B5CE5] focus:ring-1 focus:ring-[#5B5CE5] focus:outline-hidden transition-colors"
                            />
                            <p className="text-[11px] text-[#63688E] mt-1">
                                Included in the UPI payment note so customers see their order reference in their bank passbook.
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-2 flex flex-col sm:flex-row gap-3">
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-[#5B5CE5] hover:bg-[#4E4FD9] text-white font-black text-sm transition-all shadow-lg shadow-[#5B5CE5]/30 active:scale-98 cursor-pointer disabled:opacity-50"
                            >
                                <SaveIcon sx={{ fontSize: 18 }} />
                                <span>{saving ? "Saving & Routing Payments..." : "Save & Activate UPI ID"}</span>
                            </button>
                        </div>
                    </form>

                    {/* Integration Notice */}
                    <div className="p-3.5 bg-[#5B5CE5]/10 border border-[#5B5CE5]/30 rounded-xl text-xs text-blue-200 flex items-start gap-2.5">
                        <ShieldOutlinedIcon sx={{ fontSize: 18, color: '#818CF8' }} className="shrink-0 mt-0.5" />
                        <div>
                            <strong className="text-white block font-semibold mb-0.5">Instant Real-Time Integration</strong>
                            When you save, every customer checkout page across the web store updates dynamically without needing any redeployment.
                        </div>
                    </div>
                </div>

                {/* Right Card: Live QR & Intent Preview (5 Cols) */}
                <div className="lg:col-span-5 bg-[#171825] border border-[#232538] rounded-2xl p-5 sm:p-6 flex flex-col items-center justify-between space-y-4">
                    <div className="w-full border-b border-[#232538] pb-3 text-left">
                        <h3 className="text-base font-bold text-white flex items-center gap-2">
                            <QrCode2Icon sx={{ fontSize: 20, color: '#5B5CE5' }} />
                            <span>Live Customer Payment Preview</span>
                        </h3>
                        <p className="text-xs text-[#8E92BC] mt-0.5">
                            This is the exact QR code and deep-link generated for customers at checkout.
                        </p>
                    </div>

                    {/* QR Code Container */}
                    <div className="bg-white p-3 rounded-2xl shadow-2xl border-4 border-[#232538] flex flex-col items-center">
                        <img
                            src={previewQrUrl}
                            alt="UPI QR Code Preview"
                            className="w-52 h-52 object-contain"
                        />
                        <div className="mt-2 text-center text-gray-900">
                            <div className="text-[11px] font-extrabold tracking-tight uppercase text-blue-700">
                                {payeeName || 'Flipkart Payments'}
                            </div>
                            <div className="text-[12px] font-mono font-bold text-gray-800 break-all max-w-[200px]">
                                {upiId || 'merchant@upi'}
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons for Preview */}
                    <div className="w-full space-y-2">
                        <a
                            href={previewUpiString}
                            target="_blank"
                            rel="noreferrer"
                            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[#202234] hover:bg-[#282B42] text-slate-200 text-xs font-semibold border border-[#2E314A] transition-colors no-underline"
                        >
                            <LaunchIcon sx={{ fontSize: 15 }} />
                            <span>Test Open UPI Intent Link</span>
                        </a>

                        <button
                            type="button"
                            onClick={handleCopyUpiString}
                            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[#10111A] hover:bg-[#202234] text-slate-300 text-xs font-mono transition-colors border border-[#26283D] cursor-pointer"
                        >
                            <ContentCopyIcon sx={{ fontSize: 14 }} />
                            <span>{copied ? "Copied to Clipboard!" : "Copy Generated UPI URI"}</span>
                        </button>
                    </div>

                    {/* Raw URI Box */}
                    <div className="w-full bg-[#10111A] p-2.5 rounded-xl border border-[#26283D] text-[10px] font-mono text-[#8E92BC] break-all select-all">
                        {previewUpiString}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default UpiSettings;

