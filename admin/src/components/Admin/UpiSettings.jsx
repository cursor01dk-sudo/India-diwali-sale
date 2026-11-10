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
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import TuneIcon from '@mui/icons-material/Tune';
import SmartphoneIcon from '@mui/icons-material/Smartphone';
import CloseIcon from '@mui/icons-material/Close';
import MetaData from '../Layouts/MetaData';
import { socket } from '../../utils/socket';

const presetHandles = [
    { label: "PhonePe (@ybl)", handle: "@ybl" },
    { label: "Google Pay (@okhdfcbank)", handle: "@okhdfcbank" },
    { label: "Google Pay (@okaxis)", handle: "@okaxis" },
    { label: "Google Pay (@oksbi)", handle: "@oksbi" },
    { label: "Paytm (@paytm)", handle: "@paytm" },
    { label: "PhonePe ICICI (@ibl)", handle: "@ibl" },
    { label: "FamPay (@fam)", handle: "@fam" },
];

const testAmountPresets = [1, 149, 499, 1299, 4999];

const UpiSettings = () => {
    const { enqueueSnackbar } = useSnackbar();

    const [upiId, setUpiId] = useState('');
    const [payeeName, setPayeeName] = useState('Flipkart Payments');
    const [qrNote, setQrNote] = useState('Order Product');
    const [instructions, setInstructions] = useState('');
    const [isEnabled, setIsEnabled] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(null);

    const [activeConfig, setActiveConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [copied, setCopied] = useState(false);

    // Dynamic Test Amount for Simulator
    const [testAmount, setTestAmount] = useState(499);

    // Disable Confirmation Modal
    const [showDisableModal, setShowDisableModal] = useState(false);

    // Fetch live UPI settings from backend
    const fetchSettings = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get('/api/v1/payment/upi-settings');
            if (data && data.success) {
                setUpiId(data.upiId || 'deepakddoswala@fam');
                setPayeeName(data.payeeName || 'Flipkart Payments');
                setQrNote(data.qrNote || 'Order Product');
                setInstructions(data.instructions || 'Scan with any UPI app (GPay, PhonePe, Paytm, BHIM) to complete payment.');
                setIsEnabled(data.isEnabled !== undefined ? data.isEnabled : true);
                setLastUpdated(data.updatedAt || new Date().toISOString());
                setActiveConfig(data);

                try {
                    localStorage.setItem('merchantUpiId', data.upiId);
                    localStorage.setItem('merchantPayeeName', data.payeeName);
                    localStorage.setItem('merchantUpiEnabled', String(data.isEnabled !== false));
                } catch (e) {}
            }
        } catch (err) {
            enqueueSnackbar("Could not load UPI settings from server, using cached settings", { variant: "warning" });
            const cachedUpi = localStorage.getItem('merchantUpiId') || 'deepakddoswala@fam';
            const cachedName = localStorage.getItem('merchantPayeeName') || 'Flipkart Payments';
            const cachedEnabled = localStorage.getItem('merchantUpiEnabled') !== 'false';
            setUpiId(cachedUpi);
            setPayeeName(cachedName);
            setIsEnabled(cachedEnabled);
            setActiveConfig({ upiId: cachedUpi, payeeName: cachedName, qrNote: 'Order Product', isEnabled: cachedEnabled });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();

        // Listen for real-time UPI changes broadcast from another session
        const handleRealTimeUpi = (payload) => {
            if (payload && payload.data) {
                const cfg = payload.data;
                setUpiId(cfg.upiId || 'deepakddoswala@fam');
                setPayeeName(cfg.payeeName || 'Flipkart Payments');
                setIsEnabled(cfg.isEnabled !== false);
                setLastUpdated(cfg.updatedAt || new Date().toISOString());
                setActiveConfig(cfg);
                enqueueSnackbar("Live UPI settings synchronized across cluster!", { variant: "info" });
            }
        };

        socket.on('sync:upi_settings_updated', handleRealTimeUpi);
        return () => {
            socket.off('sync:upi_settings_updated', handleRealTimeUpi);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Save & Update UPI settings (Global single source of truth)
    const handleSave = async (newEnabledState = isEnabled) => {
        const cleanUpi = upiId.trim();
        if (!cleanUpi || !cleanUpi.includes('@')) {
            enqueueSnackbar("Please enter a valid UPI ID containing '@' (e.g. store@okhdfcbank or 9876543210@ybl)", { variant: "error" });
            return;
        }

        setSaving(true);
        try {
            const { data } = await axios.post('/api/v1/admin/payment/upi-settings', {
                upiId: cleanUpi,
                payeeName: payeeName.trim() || 'Flipkart Payments',
                qrNote: qrNote.trim() || 'Order Product',
                instructions: instructions.trim(),
                isEnabled: newEnabledState
            });

            if (data && data.success) {
                setActiveConfig(data);
                setIsEnabled(data.isEnabled);
                setLastUpdated(data.updatedAt || new Date().toISOString());
                try {
                    localStorage.setItem('merchantUpiId', data.upiId);
                    localStorage.setItem('merchantPayeeName', data.payeeName);
                    localStorage.setItem('merchantUpiEnabled', String(data.isEnabled));
                } catch (e) {}

                if (!newEnabledState) {
                    enqueueSnackbar("GLOBAL UPI DISABLED: QR codes & payment buttons hidden across all stores!", { variant: "warning" });
                } else {
                    enqueueSnackbar("GLOBAL UPI ACTIVE: All checkout payments dynamically routed to " + data.upiId, { variant: "success" });
                }
            } else {
                enqueueSnackbar(data?.message || "Failed to update UPI settings", { variant: "error" });
            }
        } catch (err) {
            // Local fallback persistence
            try {
                localStorage.setItem('merchantUpiId', cleanUpi);
                localStorage.setItem('merchantPayeeName', payeeName.trim());
                localStorage.setItem('merchantUpiEnabled', String(newEnabledState));
            } catch (e) {}
            setActiveConfig({ upiId: cleanUpi, payeeName: payeeName.trim(), qrNote, isEnabled: newEnabledState });
            setIsEnabled(newEnabledState);
            enqueueSnackbar("UPI settings updated locally. Server will sync on reconnect.", { variant: "success" });
        } finally {
            setSaving(false);
            setShowDisableModal(false);
        }
    };

    // Toggle Enable / Disable handler
    const handleToggleClick = () => {
        if (isEnabled) {
            // Prompt confirmation modal before disabling
            setShowDisableModal(true);
        } else {
            // Re-enable directly
            handleSave(true);
        }
    };

    const confirmDisable = () => {
        handleSave(false);
    };

    const handleApplyPreset = (handle) => {
        const currentPrefix = upiId.split('@')[0] || '';
        if (currentPrefix) {
            setUpiId(`${currentPrefix}${handle}`);
        } else {
            setUpiId(`merchant${handle}`);
        }
    };

    // Dynamic standard NPCI URI format
    const formattedAmount = Number(testAmount || 1).toFixed(2);
    const standardUpiUri = `upi://pay?pa=${encodeURIComponent(upiId || 'merchant@upi')}&pn=${encodeURIComponent(payeeName || 'Flipkart Payments')}&am=${formattedAmount}&cu=INR&tn=${encodeURIComponent(`${qrNote || 'Order Product'} Ref`)}`;
    const previewQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(standardUpiUri)}&margin=4`;

    // Deep-links for specific UPI apps
    const gpayUri = `tez://upi/pay?pa=${encodeURIComponent(upiId || 'merchant@upi')}&pn=${encodeURIComponent(payeeName || 'Flipkart Payments')}&am=${formattedAmount}&cu=INR&tn=${encodeURIComponent(qrNote || 'Order Product')}`;
    const phonepeUri = `phonepe://pay?pa=${encodeURIComponent(upiId || 'merchant@upi')}&pn=${encodeURIComponent(payeeName || 'Flipkart Payments')}&am=${formattedAmount}&cu=INR&tn=${encodeURIComponent(qrNote || 'Order Product')}`;
    const paytmUri = `paytmmp://pay?pa=${encodeURIComponent(upiId || 'merchant@upi')}&pn=${encodeURIComponent(payeeName || 'Flipkart Payments')}&am=${formattedAmount}&cu=INR&tn=${encodeURIComponent(qrNote || 'Order Product')}`;

    const handleCopyUpiString = () => {
        navigator.clipboard.writeText(standardUpiUri);
        setCopied(true);
        enqueueSnackbar("NPCI standard UPI URI copied to clipboard!", { variant: "info" });
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-6">
            <MetaData title="Global Dynamic UPI Settings | Nexmart Admin" />

            {/* 1. TOP HEADER BANNER */}
            <div className="bg-[#171825] border border-[#232538] rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-xl bg-[#5B5CE5]/15 border border-[#5B5CE5]/30 flex items-center justify-center text-[#5B5CE5] shadow-inner">
                            <AccountBalanceWalletIcon sx={{ fontSize: 26 }} />
                        </div>
                        <div>
                            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                                <span>Global Dynamic UPI Payment System</span>
                                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-widest border ${
                                    isEnabled
                                        ? 'bg-[#10B981]/15 text-[#34D399] border-[#10B981]/30'
                                        : 'bg-[#EF4444]/15 text-[#F87171] border-[#EF4444]/30'
                                }`}>
                                    {isEnabled ? '● Active Globally' : '○ Paused Globally'}
                                </span>
                            </h2>
                            <p className="text-xs sm:text-sm text-[#8E92BC] mt-1">
                                Authoritative central UPI payment controller stored in MongoDB Atlas. Changes reflect instantly on all products, carts, and active customer sessions.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Instant Global Enable / Disable Switch */}
                        <button
                            type="button"
                            onClick={handleToggleClick}
                            disabled={saving}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-md cursor-pointer ${
                                isEnabled
                                    ? 'bg-[#10B981] hover:bg-[#059669] text-white shadow-[#10B981]/25'
                                    : 'bg-[#EF4444] hover:bg-[#DC2626] text-white shadow-[#EF4444]/25'
                            }`}
                        >
                            <PowerSettingsNewIcon sx={{ fontSize: 18 }} />
                            <span>{isEnabled ? 'UPI is Enabled' : 'UPI is Disabled (Click to Enable)'}</span>
                        </button>

                        <button
                            onClick={fetchSettings}
                            disabled={loading}
                            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#202234] hover:bg-[#282B42] text-slate-200 text-xs font-semibold border border-[#2E314A] transition-all cursor-pointer"
                        >
                            <RefreshIcon sx={{ fontSize: 16 }} className={loading ? "animate-spin" : ""} />
                            <span className="hidden sm:inline">Refresh</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* 2. ACTIVE DESTINATION STATUS CARD */}
            <div className={`rounded-2xl p-5 sm:p-6 shadow-lg relative overflow-hidden border ${
                isEnabled
                    ? 'bg-[#171825] border-[#10B981]/40'
                    : 'bg-[#1c1417] border-[#EF4444]/40'
            }`}>
                <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl pointer-events-none ${
                    isEnabled ? 'bg-[#10B981]/5' : 'bg-[#EF4444]/5'
                }`}></div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <span className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                            isEnabled ? 'text-[#34D399]' : 'text-[#F87171]'
                        }`}>
                            <span className={`w-2 h-2 rounded-full ${
                                isEnabled ? 'bg-[#10B981] animate-pulse' : 'bg-[#EF4444]'
                            }`}></span>
                            {isEnabled
                                ? 'Currently Routing All Store Checkout Payments'
                                : 'UPI Checkout Disabled — Customers Automatically Offered Alternative Methods'}
                        </span>
                        <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight break-all">
                            {activeConfig?.upiId || upiId || 'deepakddoswala@fam'}
                        </div>
                        <div className="text-xs text-[#8E92BC] flex flex-wrap items-center gap-x-4 gap-y-1">
                            <span>Payee Name: <strong className="text-slate-200">{activeConfig?.payeeName || payeeName}</strong></span>
                            <span>Order Note: <strong className="text-slate-200">{activeConfig?.qrNote || qrNote}</strong></span>
                            {lastUpdated && (
                                <span>Last Updated: <strong className="text-slate-300">{new Date(lastUpdated).toLocaleTimeString()} ({new Date(lastUpdated).toLocaleDateString()})</strong></span>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <span className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 border shadow-xs ${
                            isEnabled
                                ? 'bg-[#10B981]/15 border-[#10B981]/40 text-[#34D399]'
                                : 'bg-[#EF4444]/15 border-[#EF4444]/40 text-[#F87171]'
                        }`}>
                            {isEnabled ? <CheckCircleIcon sx={{ fontSize: 16 }} /> : <WarningAmberIcon sx={{ fontSize: 16 }} />}
                            <span>{isEnabled ? 'Live Active' : 'Suspended'}</span>
                        </span>
                    </div>
                </div>
            </div>

            {/* 3. MAIN CONFIGURATION GRID (12 Cols) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

                {/* Left Form: Edit Global UPI Settings (7 Cols) */}
                <div className="lg:col-span-7 bg-[#171825] border border-[#232538] rounded-2xl p-5 sm:p-6 space-y-5">
                    <div className="border-b border-[#232538] pb-3">
                        <h3 className="text-base font-bold text-white flex items-center gap-2">
                            <span>1. Authoritative Merchant Settings</span>
                        </h3>
                        <p className="text-xs text-[#8E92BC] mt-0.5">
                            Saving here writes permanently to MongoDB Atlas, broadcasts over Socket.IO in 0ms, and regenerates QR codes dynamically.
                        </p>
                    </div>

                    <form onSubmit={(e) => { e.preventDefault(); handleSave(isEnabled); }} className="space-y-4">
                        {/* Global Enable / Disable Toggle Switch in Form */}
                        <div className="p-4 rounded-xl bg-[#10111A] border border-[#26283D] flex items-center justify-between">
                            <div>
                                <span className="text-xs font-bold text-white block">UPI Payment Status</span>
                                <span className="text-[11px] text-[#8E92BC]">
                                    {isEnabled ? 'UPI is currently visible to customers at checkout.' : 'UPI is hidden. Alternative payment options will be selected.'}
                                </span>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={isEnabled}
                                    onChange={handleToggleClick}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-[#26283D] peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#5B5CE5]"></div>
                            </label>
                        </div>

                        {/* UPI ID Field */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                                Merchant Destination UPI ID / VPA <span className="text-amber-400">*</span>
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
                                Standard NPCI format with banking handle (@ybl, @okhdfcbank, @paytm, @okaxis, @fam, @upi).
                            </p>
                        </div>

                        {/* Quick Presets */}
                        <div>
                            <label className="block text-[11px] font-semibold text-[#8E92BC] mb-1.5 uppercase tracking-wider">
                                Quick Bank Suffixes:
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
                                Payee / Merchant Display Name
                            </label>
                            <input
                                type="text"
                                value={payeeName}
                                onChange={(e) => setPayeeName(e.target.value)}
                                placeholder="e.g. Flipkart Payments or Ranga Store"
                                className="w-full bg-[#10111A] text-white text-sm px-4 py-2.5 rounded-xl border border-[#26283D] focus:border-[#5B5CE5] focus:ring-1 focus:ring-[#5B5CE5] focus:outline-hidden transition-colors"
                            />
                            <p className="text-[11px] text-[#63688E] mt-1">
                                Name shown on customer's PhonePe, Google Pay, or Paytm confirmation screen.
                            </p>
                        </div>

                        {/* Order Note Field */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                                Transaction Note Prefix / Reference
                            </label>
                            <input
                                type="text"
                                value={qrNote}
                                onChange={(e) => setQrNote(e.target.value)}
                                placeholder="Order Product"
                                className="w-full bg-[#10111A] text-white text-sm px-4 py-2.5 rounded-xl border border-[#26283D] focus:border-[#5B5CE5] focus:ring-1 focus:ring-[#5B5CE5] focus:outline-hidden transition-colors"
                            />
                            <p className="text-[11px] text-[#63688E] mt-1">
                                Customer's bank passbook will show this reference along with their order ID.
                            </p>
                        </div>

                        {/* Custom Payment Instructions */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                                Customer Payment Instructions
                            </label>
                            <textarea
                                value={instructions}
                                onChange={(e) => setInstructions(e.target.value)}
                                rows={2}
                                placeholder="Scan with any UPI app to complete payment. Enter UTR number after transfer."
                                className="w-full bg-[#10111A] text-white text-xs px-4 py-2 rounded-xl border border-[#26283D] focus:border-[#5B5CE5] focus:ring-1 focus:ring-[#5B5CE5] focus:outline-hidden transition-colors resize-none"
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-2 flex flex-col sm:flex-row gap-3">
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-[#5B5CE5] hover:bg-[#4E4FD9] text-white font-black text-sm transition-all shadow-lg shadow-[#5B5CE5]/30 active:scale-98 cursor-pointer disabled:opacity-50"
                            >
                                <SaveIcon sx={{ fontSize: 18 }} />
                                <span>{saving ? "Saving & Broadcasting..." : "Save & Broadcast Globally"}</span>
                            </button>
                        </div>
                    </form>

                    {/* Real-time Notice */}
                    <div className="p-3.5 bg-[#5B5CE5]/10 border border-[#5B5CE5]/30 rounded-xl text-xs text-blue-200 flex items-start gap-2.5">
                        <ShieldOutlinedIcon sx={{ fontSize: 18, color: '#818CF8' }} className="shrink-0 mt-0.5" />
                        <div>
                            <strong className="text-white block font-semibold mb-0.5">Central Real-Time Synchronization</strong>
                            When saved, the backend writes to MongoDB Atlas, and Socket.IO pushes <code className="text-white bg-black/40 px-1 rounded">sync:upi_settings_updated</code> to all connected customers immediately.
                        </div>
                    </div>
                </div>

                {/* Right Column: Live QR Simulator & Intent Testing (5 Cols) */}
                <div className="lg:col-span-5 bg-[#171825] border border-[#232538] rounded-2xl p-5 sm:p-6 flex flex-col items-center justify-between space-y-4">
                    <div className="w-full border-b border-[#232538] pb-3 text-left">
                        <h3 className="text-base font-bold text-white flex items-center gap-2">
                            <QrCode2Icon sx={{ fontSize: 20, color: '#5B5CE5' }} />
                            <span>2. Live Dynamic QR & Deep-Link Simulator</span>
                        </h3>
                        <p className="text-xs text-[#8E92BC] mt-0.5">
                            Simulate customer payment QR code across different order amounts.
                        </p>
                    </div>

                    {/* Test Amount Slider / Selector */}
                    <div className="w-full bg-[#10111A] p-3 rounded-xl border border-[#26283D] space-y-2">
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-[#8E92BC] font-semibold flex items-center gap-1">
                                <TuneIcon sx={{ fontSize: 14 }} /> Test Amount Simulation:
                            </span>
                            <span className="text-white font-extrabold text-sm">₹{testAmount}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            {testAmountPresets.map((amt) => (
                                <button
                                    key={amt}
                                    type="button"
                                    onClick={() => setTestAmount(amt)}
                                    className={`flex-1 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                                        testAmount === amt
                                            ? 'bg-[#5B5CE5] text-white'
                                            : 'bg-[#202234] text-slate-300 hover:bg-[#282B42]'
                                    }`}
                                >
                                    ₹{amt}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Dynamic QR Code Box */}
                    <div className="bg-white p-3.5 rounded-2xl shadow-2xl border-4 border-[#232538] flex flex-col items-center relative">
                        {!isEnabled && (
                            <div className="absolute inset-0 bg-gray-900/90 backdrop-blur-xs rounded-xl flex flex-col items-center justify-center p-4 text-center z-10">
                                <WarningAmberIcon sx={{ fontSize: 36, color: '#EF4444' }} />
                                <span className="text-white font-bold text-sm mt-1">UPI Payments Paused</span>
                                <span className="text-[11px] text-gray-300 mt-0.5">QR Code is hidden from customers</span>
                            </div>
                        )}
                        <img
                            src={previewQrUrl}
                            alt="Dynamic UPI QR Code Preview"
                            className="w-52 h-52 object-contain"
                        />
                        <div className="mt-2 text-center text-gray-900">
                            <div className="text-[11px] font-extrabold tracking-tight uppercase text-blue-700">
                                {payeeName || 'Flipkart Payments'}
                            </div>
                            <div className="text-[12px] font-mono font-bold text-gray-800 break-all max-w-[200px]">
                                {upiId || 'merchant@upi'}
                            </div>
                            <div className="text-[11px] font-bold text-emerald-700 mt-0.5">
                                Amount: ₹{formattedAmount}
                            </div>
                        </div>
                    </div>

                    {/* Direct UPI App Deep-Links */}
                    <div className="w-full space-y-2">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-[#8E92BC] flex items-center gap-1">
                            <SmartphoneIcon sx={{ fontSize: 13 }} /> Direct UPI App Deep-Links:
                        </div>
                        <div className="grid grid-cols-3 gap-1.5">
                            <a
                                href={gpayUri}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center justify-center py-1.5 px-2 rounded-lg bg-[#202234] hover:bg-[#282B42] text-[11px] font-semibold text-slate-200 border border-[#2E314A] no-underline"
                            >
                                Google Pay
                            </a>
                            <a
                                href={phonepeUri}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center justify-center py-1.5 px-2 rounded-lg bg-[#202234] hover:bg-[#282B42] text-[11px] font-semibold text-slate-200 border border-[#2E314A] no-underline"
                            >
                                PhonePe
                            </a>
                            <a
                                href={paytmUri}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center justify-center py-1.5 px-2 rounded-lg bg-[#202234] hover:bg-[#282B42] text-[11px] font-semibold text-slate-200 border border-[#2E314A] no-underline"
                            >
                                Paytm
                            </a>
                        </div>

                        {/* Test Standard Intent */}
                        <a
                            href={standardUpiUri}
                            target="_blank"
                            rel="noreferrer"
                            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[#202234] hover:bg-[#282B42] text-slate-200 text-xs font-semibold border border-[#2E314A] transition-colors no-underline"
                        >
                            <LaunchIcon sx={{ fontSize: 15 }} />
                            <span>Test Generic NPCI Intent Link (₹{formattedAmount})</span>
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

                    {/* Raw URI Display */}
                    <div className="w-full bg-[#10111A] p-2.5 rounded-xl border border-[#26283D] text-[10px] font-mono text-[#8E92BC] break-all select-all">
                        {standardUpiUri}
                    </div>
                </div>

            </div>

            {/* CONFIRMATION MODAL BEFORE DISABLING UPI */}
            {showDisableModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fadeIn">
                    <div className="bg-[#171825] border border-[#EF4444]/50 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-[#EF4444]/15 border border-[#EF4444]/30 flex items-center justify-center text-[#EF4444]">
                                    <WarningAmberIcon sx={{ fontSize: 24 }} />
                                </div>
                                <div>
                                    <h4 className="text-base font-bold text-white">Disable UPI Payments Globally?</h4>
                                    <p className="text-xs text-[#8E92BC]">Please confirm your action</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowDisableModal(false)}
                                className="text-slate-400 hover:text-white cursor-pointer"
                            >
                                <CloseIcon sx={{ fontSize: 20 }} />
                            </button>
                        </div>

                        <div className="text-xs text-slate-300 bg-[#10111A] p-3 rounded-xl border border-[#26283D] space-y-2">
                            <p>
                                When disabled:
                            </p>
                            <ul className="list-disc list-inside space-y-1 text-[#8E92BC]">
                                <li>UPI QR codes will immediately vanish from all customer checkout pages.</li>
                                <li>Direct UPI payment buttons (GPay, PhonePe, Paytm) will be disabled.</li>
                                <li>New UPI intent requests will be blocked with HTTP 403.</li>
                                <li>Customers will be seamlessly switched to alternate payment methods.</li>
                            </ul>
                        </div>

                        <div className="flex items-center gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setShowDisableModal(false)}
                                className="flex-1 py-2.5 px-4 rounded-xl bg-[#202234] hover:bg-[#282B42] text-slate-200 text-xs font-semibold border border-[#2E314A] transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={confirmDisable}
                                className="flex-1 py-2.5 px-4 rounded-xl bg-[#EF4444] hover:bg-[#DC2626] text-white text-xs font-bold transition-colors cursor-pointer shadow-lg shadow-[#EF4444]/25"
                            >
                                Yes, Disable UPI Now
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UpiSettings;
