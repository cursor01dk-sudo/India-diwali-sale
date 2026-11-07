import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import VolunteerActivismOutlinedIcon from '@mui/icons-material/VolunteerActivismOutlined';
import FAssuredBadge from '../Layouts/FAssuredBadge';
import MetaData from '../Layouts/MetaData';
import states from '../../utils/states';
import { addItemsToCart, removeItemsFromCart, saveShippingInfo } from '../../actions/cartAction';

const OrderConfirm = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { enqueueSnackbar } = useSnackbar();

    const { cartItems, shippingInfo } = useSelector((state) => state.cart);
    const { user } = useSelector((state) => state.user);

    // Retrieve items from Redux or LocalStorage (handles direct Buy Now transition seamlessly)
    let storedCart = [];
    try {
        storedCart = JSON.parse(localStorage.getItem('cartItems') || '[]');
    } catch (e) { }

    const effectiveCartItems = (cartItems && cartItems.length > 0) ? cartItems : storedCart;
    const hasCartItems = effectiveCartItems && effectiveCartItems.length > 0;
    const displayItems = effectiveCartItems || [];

    // Guard: Only redirect if BOTH Redux and LocalStorage are truly empty (e.g. order finished & cart emptied)
    useEffect(() => {
        let stored = [];
        try {
            stored = JSON.parse(localStorage.getItem('cartItems') || '[]');
        } catch (e) { }

        if ((!cartItems || cartItems.length === 0) && stored.length === 0) {
            navigate('/', { replace: true });
        }
    }, [cartItems, navigate]);

    const [qty, setQty] = useState(1);
    const [useGst, setUseGst] = useState(false);
    const [donationAmount, setDonationAmount] = useState(() => {
        try {
            return Number(sessionStorage.getItem('fk_donation_amount')) || 0;
        } catch (e) {
            return 0;
        }
    });
    const [isCustomDonation, setIsCustomDonation] = useState(false);
    const [customDonationInput, setCustomDonationInput] = useState('');

    // Address inline expanding form state
    const hasInitialAddress = Boolean(shippingInfo && shippingInfo.address && shippingInfo.phoneNo);
    const [isEditingAddress, setIsEditingAddress] = useState(!hasInitialAddress);

    const [formData, setFormData] = useState({
        name: shippingInfo?.name || user?.name || '',
        phoneNo: shippingInfo?.phoneNo || '',
        pincode: shippingInfo?.pincode || '',
        locality: shippingInfo?.locality || '',
        address: shippingInfo?.address || '',
        city: shippingInfo?.city || '',
        state: shippingInfo?.state || 'Haryana',
        landmark: shippingInfo?.landmark || '',
        alternatePhone: shippingInfo?.alternatePhone || '',
        addressType: shippingInfo?.addressType || 'HOME'
    });

    const handleAddressFieldChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSaveAddress = (e) => {
        if (e) e.preventDefault();

        const cleanName = formData.name.trim() || shippingInfo?.name || user?.name || 'Customer';
        const cleanPhone = formData.phoneNo ? String(formData.phoneNo).replace(/\D/g, '').slice(-10) : (shippingInfo?.phoneNo || '9876543210');
        const cleanPincode = formData.pincode ? String(formData.pincode).replace(/\D/g, '').slice(0, 6) : (shippingInfo?.pincode || '110001');
        const cleanAddress = formData.address.trim() || shippingInfo?.address || 'Customer Delivery Address';
        const cleanCity = formData.city.trim() || shippingInfo?.city || 'Delhi';
        const cleanLocality = formData.locality.trim() || shippingInfo?.locality || '';
        const cleanLandmark = formData.landmark.trim() || shippingInfo?.landmark || '';
        const cleanAlternatePhone = formData.alternatePhone.trim() || shippingInfo?.alternatePhone || '';
        const cleanState = formData.state || shippingInfo?.state || 'Haryana';
        const cleanAddressType = formData.addressType || shippingInfo?.addressType || 'HOME';

        const updatedShipping = {
            name: cleanName,
            phoneNo: cleanPhone,
            pincode: cleanPincode,
            locality: cleanLocality,
            address: cleanAddress,
            city: cleanCity,
            state: cleanState,
            landmark: cleanLandmark,
            alternatePhone: cleanAlternatePhone,
            addressType: cleanAddressType,
            country: 'India'
        };

        dispatch(saveShippingInfo(updatedShipping));
        setIsEditingAddress(false);
        enqueueSnackbar("Delivery address updated successfully!", { variant: "success" });
    };

    const handleCancelAddress = () => {
        setIsEditingAddress(false);
    };

    const updateQuantity = (id, newQty) => {
        if (newQty < 1) {
            dispatch(removeItemsFromCart(id));
            return;
        }
        setQty(newQty);
        dispatch(addItemsToCart(id, newQty));
    };

    // Calculate dynamic totals & Protect Promise Fee & Donation
    const protectFee = 19;
    const mrpTotal = displayItems.reduce((acc, item) => acc + (item.cuttedPrice || (item.price * 1.25)) * (item.quantity || qty), 0);
    const itemTotal = displayItems.reduce((acc, item) => acc + item.price * (item.quantity || qty), 0);
    const totalSavings = Math.max(0, mrpTotal - itemTotal);
    const finalPayable = itemTotal + protectFee + (Number(donationAmount) || 0);

    // Delivery date calculation (3 days from now)
    const deliveryDateObj = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    const dynamicDeliveryStr = `Delivery by ${deliveryDateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' })}`;

    const handleContinue = () => {
        // Automatically save address from form if being edited or not yet persisted
        const cleanName = formData.name.trim() || shippingInfo?.name || user?.name || 'Customer';
        const cleanPhone = formData.phoneNo ? String(formData.phoneNo).replace(/\D/g, '').slice(-10) : (shippingInfo?.phoneNo || '9876543210');
        const cleanPincode = formData.pincode ? String(formData.pincode).replace(/\D/g, '').slice(0, 6) : (shippingInfo?.pincode || '110001');
        const cleanAddress = formData.address.trim() || shippingInfo?.address || 'Customer Delivery Address';
        const cleanCity = formData.city.trim() || shippingInfo?.city || 'Delhi';
        const cleanLocality = formData.locality.trim() || shippingInfo?.locality || '';
        const cleanLandmark = formData.landmark.trim() || shippingInfo?.landmark || '';
        const cleanAlternatePhone = formData.alternatePhone.trim() || shippingInfo?.alternatePhone || '';
        const cleanState = formData.state || shippingInfo?.state || 'Haryana';
        const cleanAddressType = formData.addressType || shippingInfo?.addressType || 'HOME';

        const updatedShipping = {
            name: cleanName,
            phoneNo: cleanPhone,
            pincode: cleanPincode,
            locality: cleanLocality,
            address: cleanAddress,
            city: cleanCity,
            state: cleanState,
            landmark: cleanLandmark,
            alternatePhone: cleanAlternatePhone,
            addressType: cleanAddressType,
            country: 'India'
        };

        dispatch(saveShippingInfo(updatedShipping));
        setIsEditingAddress(false);
        try {
            sessionStorage.setItem('fk_donation_amount', donationAmount || 0);
        } catch (e) { }
        navigate('/process/payment');
    };

    if (!hasCartItems) {
        return null;
    }

    return (
        <div className="min-h-screen bg-[#f1f3f6] pb-24 text-[#212121]">
            <MetaData title="Flipkart.com: Order Summary" />

            {/* 1. TOP STEPPER BAR (MATCHING REFERENCE SCREENSHOT) */}
            <div className="bg-white border-b border-gray-200 py-3.5 px-4 mb-4 shadow-2xs">
                <div className="max-w-2xl mx-auto flex items-center justify-between text-xs sm:text-sm">
                    {/* 1. Address Completed */}
                    <div className="flex items-center gap-1.5 text-gray-700 font-semibold">
                        <CheckCircleIcon sx={{ fontSize: 18, color: '#2874f0' }} />
                        <span className="text-gray-500 font-bold">Address</span>
                    </div>

                    <div className="h-[2px] w-12 sm:w-28 bg-[#2874f0]"></div>

                    {/* 2. Order Summary Active */}
                    <div className="flex items-center gap-2 text-gray-900 font-extrabold">
                        <span className="w-5 h-5 rounded-full bg-[#2874f0] text-white flex items-center justify-center text-[11px] font-black shadow-xs">
                            2
                        </span>
                        <span className="text-gray-950 font-black">Order Summary</span>
                    </div>

                    <div className="h-[2px] w-12 sm:w-28 bg-gray-200"></div>

                    {/* 3. Payment Pending */}
                    <div className="flex items-center gap-1.5 text-gray-400 font-medium">
                        <span className="w-5 h-5 rounded-full border border-gray-300 text-gray-400 flex items-center justify-center text-[11px] font-bold">
                            3
                        </span>
                        <span>Payment</span>
                    </div>
                </div>
            </div>

            {/* MAIN 2-COLUMN CHECKOUT CONTAINER */}
            <main className="max-w-6xl mx-auto px-2 sm:px-4 py-1">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">

                    {/* LEFT COLUMN: ORDER ITEMS & ADDRESS (8 COLS) */}
                    <div className="lg:col-span-8 space-y-3.5">

                        {/* STEP 1: DELIVER TO / ADDRESS BOX */}
                        <div className="bg-white rounded-xs border border-gray-200 shadow-2xs overflow-hidden transition-all duration-300">
                            {!isEditingAddress ? (
                                /* Compact Preview Mode */
                                <div className="p-4 flex items-start justify-between gap-3">
                                    <div className="space-y-1 text-xs">
                                        <div className="text-gray-500 font-bold uppercase tracking-wider text-[11px]">
                                            Deliver to:
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-extrabold text-sm text-gray-900 tracking-tight">
                                                {shippingInfo?.name || 'Customer Name'}
                                            </span>
                                            <span className="text-[10px] bg-gray-100 text-gray-600 font-extrabold px-1.5 py-0.5 rounded uppercase">
                                                {shippingInfo?.addressType || 'HOME'}
                                            </span>
                                        </div>
                                        <p className="text-gray-700 text-xs leading-relaxed max-w-xl">
                                            {[shippingInfo?.address, shippingInfo?.locality, shippingInfo?.city, shippingInfo?.state, shippingInfo?.pincode].filter(Boolean).join(', ')}
                                        </p>
                                        <p className="text-gray-950 font-bold text-xs pt-0.5">
                                            {shippingInfo?.phoneNo}
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => setIsEditingAddress(true)}
                                        className="px-3.5 py-1.5 text-xs font-bold text-[#2874f0] border border-gray-300 rounded hover:bg-blue-50 transition-colors shadow-2xs cursor-pointer shrink-0"
                                    >
                                        Change
                                    </button>
                                </div>
                            ) : (
                                /* Expanding Inline Address Form ("Spreads" right here) */
                                <div className="p-4 sm:p-6 bg-white space-y-4 animate-fadeIn">
                                    <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                                        <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wide">
                                            {hasInitialAddress ? 'Edit Delivery Address' : 'Add Delivery Address'}
                                        </h3>
                                        {hasInitialAddress && (
                                            <button
                                                type="button"
                                                onClick={handleCancelAddress}
                                                className="text-xs text-[#2874f0] font-bold hover:underline cursor-pointer"
                                            >
                                                Cancel
                                            </button>
                                        )}
                                    </div>

                                    <form onSubmit={handleSaveAddress} className="space-y-3.5 text-xs">
                                        {/* Row 1: Name & Mobile */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                                                    Full Name <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleAddressFieldChange}
                                                    placeholder="Enter recipient's full name"
                                                    className="w-full p-2.5 border border-gray-300 rounded focus:border-[#2874f0] focus:outline-hidden"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                                                    10-digit mobile number <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="tel"
                                                    name="phoneNo"
                                                    maxLength="10"
                                                    value={formData.phoneNo}
                                                    onChange={handleAddressFieldChange}
                                                    placeholder="e.g. 9876543210"
                                                    className="w-full p-2.5 border border-gray-300 rounded focus:border-[#2874f0] focus:outline-hidden"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        {/* Row 2: Pincode & Locality */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                                                    Pincode <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="pincode"
                                                    maxLength="6"
                                                    value={formData.pincode}
                                                    onChange={handleAddressFieldChange}
                                                    placeholder="6 digits [0-9] PIN code"
                                                    className="w-full p-2.5 border border-gray-300 rounded focus:border-[#2874f0] focus:outline-hidden"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                                                    Locality / Village / Area <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="locality"
                                                    value={formData.locality}
                                                    onChange={handleAddressFieldChange}
                                                    placeholder="e.g. Near Gurudwara Sahib, Sector 14"
                                                    className="w-full p-2.5 border border-gray-300 rounded focus:border-[#2874f0] focus:outline-hidden"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        {/* Row 3: Full Street Address */}
                                        <div>
                                            <label className="block text-[11px] font-bold text-gray-700 mb-1">
                                                Address (Area and Street) <span className="text-red-500">*</span>
                                            </label>
                                            <textarea
                                                rows="2"
                                                name="address"
                                                value={formData.address}
                                                onChange={handleAddressFieldChange}
                                                placeholder="Flat, House no., Building, Company, Apartment"
                                                className="w-full p-2.5 border border-gray-300 rounded focus:border-[#2874f0] focus:outline-hidden"
                                                required
                                            />
                                        </div>

                                        {/* Row 4: City & State */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                                                    City / District / Town <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="city"
                                                    value={formData.city}
                                                    onChange={handleAddressFieldChange}
                                                    placeholder="e.g. Kaithal, Chandigarh, Delhi"
                                                    className="w-full p-2.5 border border-gray-300 rounded focus:border-[#2874f0] focus:outline-hidden"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                                                    State <span className="text-red-500">*</span>
                                                </label>
                                                <select
                                                    name="state"
                                                    value={formData.state}
                                                    onChange={handleAddressFieldChange}
                                                    className="w-full p-2.5 border border-gray-300 rounded focus:border-[#2874f0] focus:outline-hidden bg-white"
                                                    required
                                                >
                                                    {states.map((st) => (
                                                        <option key={st.code} value={st.name}>
                                                            {st.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        {/* Row 5: Optional Landmark & Alternate Phone */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                                                    Landmark (Optional)
                                                </label>
                                                <input
                                                    type="text"
                                                    name="landmark"
                                                    value={formData.landmark}
                                                    onChange={handleAddressFieldChange}
                                                    placeholder="e.g. Near Water Tank"
                                                    className="w-full p-2.5 border border-gray-300 rounded focus:border-[#2874f0] focus:outline-hidden"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                                                    Alternate Phone (Optional)
                                                </label>
                                                <input
                                                    type="tel"
                                                    name="alternatePhone"
                                                    maxLength="10"
                                                    value={formData.alternatePhone}
                                                    onChange={handleAddressFieldChange}
                                                    placeholder="10-digit number"
                                                    className="w-full p-2.5 border border-gray-300 rounded focus:border-[#2874f0] focus:outline-hidden"
                                                />
                                            </div>
                                        </div>

                                        {/* Address Type Selection */}
                                        <div className="pt-1">
                                            <label className="block text-[11px] font-bold text-gray-700 mb-2">
                                                Address Type
                                            </label>
                                            <div className="flex items-center gap-6">
                                                <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-800">
                                                    <input
                                                        type="radio"
                                                        name="addressType"
                                                        value="HOME"
                                                        checked={formData.addressType === 'HOME'}
                                                        onChange={handleAddressFieldChange}
                                                        className="accent-[#2874f0]"
                                                    />
                                                    <span>Home (All day delivery)</span>
                                                </label>
                                                <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-800">
                                                    <input
                                                        type="radio"
                                                        name="addressType"
                                                        value="WORK"
                                                        checked={formData.addressType === 'WORK'}
                                                        onChange={handleAddressFieldChange}
                                                        className="accent-[#2874f0]"
                                                    />
                                                    <span>Work (Delivery between 10 AM - 5 PM)</span>
                                                </label>
                                            </div>
                                        </div>

                                        {/* Action Buttons: Save & Cancel */}
                                        <div className="flex items-center gap-4 pt-3 border-t border-gray-200">
                                            <button
                                                type="submit"
                                                className="py-2.5 px-6 rounded-xs bg-[#fb641b] hover:bg-[#e85a14] text-white font-extrabold text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer"
                                            >
                                                Save and Deliver Here
                                            </button>
                                            {hasInitialAddress && (
                                                <button
                                                    type="button"
                                                    onClick={handleCancelAddress}
                                                    className="py-2 px-4 text-xs font-bold text-[#2874f0] hover:underline cursor-pointer"
                                                >
                                                    Cancel
                                                </button>
                                            )}
                                        </div>
                                    </form>
                                </div>
                            )}
                        </div>

                        {/* STEP 2: ORDER SUMMARY ITEMS */}
                        <div className="space-y-3">
                            {displayItems.map((item, idx) => {
                                const discountPct = item.cuttedPrice > item.price
                                    ? Math.round(((item.cuttedPrice - item.price) / item.cuttedPrice) * 100)
                                    : 21;
                                const itemQty = item.quantity || qty;

                                return (
                                    <div key={idx} className="bg-white rounded-xs border border-gray-200 shadow-2xs overflow-hidden">
                                        {/* Top Discount banner */}
                                        <div className="px-4 py-2 bg-emerald-50/70 border-b border-gray-100 text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                                            <span>Top Discount of the Sale</span>
                                        </div>

                                        <div className="p-4 sm:p-5 flex flex-col sm:flex-row gap-4 items-start">
                                            {/* Left Thumbnail */}
                                            <div className="w-20 h-24 sm:w-24 sm:h-28 shrink-0 bg-white border border-gray-100 rounded-md p-1 flex items-center justify-center">
                                                <img
                                                    src={item.image || item.images?.[0]?.url || '/assets/products/samsung_f70e/f70e_1.jpg'}
                                                    alt={item.name}
                                                    className="w-full h-full object-contain"
                                                />
                                            </div>

                                            {/* Details & Price */}
                                            <div className="flex-1 min-w-0 space-y-1.5">
                                                <h2 className="text-sm font-bold text-gray-900 leading-snug">
                                                    {item.name}
                                                </h2>
                                                {item.subtitle && (
                                                    <div className="text-xs text-gray-500 font-medium">
                                                        {item.subtitle}
                                                    </div>
                                                )}

                                                {/* Ratings Row */}
                                                <div className="flex items-center gap-2 text-xs">
                                                    <div className="flex items-center gap-0.5 bg-[#388e3c] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm">
                                                        <span>{item.ratings || '4.2'}</span>
                                                        <span>★</span>
                                                    </div>
                                                    <span className="text-gray-500 text-xs">({(item.numOfReviews || 10013).toLocaleString()})</span>
                                                    <FAssuredBadge />
                                                </div>

                                                {/* Quantity Dropdown */}
                                                <div className="pt-1 flex items-center gap-2">
                                                    <div className="relative inline-flex items-center">
                                                        <select
                                                            value={itemQty}
                                                            onChange={(e) => updateQuantity(item.product, Number(e.target.value))}
                                                            className="appearance-none border border-gray-300 rounded px-3 py-1 pr-6 text-xs font-bold text-gray-800 bg-white hover:border-gray-400 focus:outline-hidden cursor-pointer"
                                                        >
                                                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                                                                <option key={num} value={num}>
                                                                    Qty: {num}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        <span className="absolute right-1.5 pointer-events-none text-gray-600 text-xs">
                                                            ▾
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Price & Protect Promise Line */}
                                                <div className="pt-1">
                                                    <div className="flex items-baseline gap-2">
                                                        <span className="text-[#388e3c] font-black text-xs">
                                                            ↓{discountPct}%
                                                        </span>
                                                        <span className="text-gray-400 line-through text-xs font-medium">
                                                            ₹{(item.cuttedPrice || (item.price * 1.25)).toLocaleString()}
                                                        </span>
                                                        <span className="text-gray-950 font-black text-base">
                                                            ₹{item.price.toLocaleString()}
                                                        </span>
                                                    </div>

                                                    <div className="text-[11px] text-gray-600 flex items-center gap-1 mt-1 font-medium">
                                                        <span>+ ₹{protectFee} Protect Promise Fee</span>
                                                        <InfoOutlinedIcon sx={{ fontSize: 13, color: '#9ca3af' }} />
                                                    </div>
                                                </div>

                                                {/* Delivery Date */}
                                                <div className="text-xs font-semibold text-gray-800 pt-1">
                                                    {dynamicDeliveryStr}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Use GST Invoice Checkbox */}
                                        <div className="px-4 py-3 bg-gray-50/70 border-t border-gray-100 flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                id="gst-checkbox"
                                                checked={useGst}
                                                onChange={(e) => setUseGst(e.target.checked)}
                                                className="w-4 h-4 rounded text-[#2874f0] accent-[#2874f0] cursor-pointer"
                                            />
                                            <label htmlFor="gst-checkbox" className="text-xs font-semibold text-gray-700 cursor-pointer">
                                                Use GST Invoice
                                            </label>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* STEP 2.5: DONATION TO CHILD WELFARE & STOP CHILD LABOUR */}
                        <div className="bg-white rounded-xs border border-gray-200 p-4 shadow-2xs transition-all">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-start gap-3 flex-1 min-w-0">
                                    <div className="w-9 h-9 rounded-full bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
                                        <VolunteerActivismOutlinedIcon sx={{ fontSize: 20 }} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-xs sm:text-sm font-black text-gray-900 tracking-tight">
                                            Donate to Child Welfare & Eradicate Child Labour
                                        </h4>
                                        <p className="text-[11px] text-gray-600 mt-1 leading-relaxed">
                                            Support education, shelter, and meals for vulnerable children. Every small contribution creates an impact.
                                        </p>
                                    </div>
                                </div>

                                {/* Medium balanced child welfare thumbnail on the right */}
                                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl overflow-hidden border border-rose-200/80 shadow-2xs shrink-0 self-center">
                                    <img
                                        src="/assets/images/child_welfare_thumb.jpg"
                                        alt="Child Welfare & Education"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </div>

                                    {/* Donation Preset Amount Pills */}
                                    <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap items-center gap-2">
                                        <span className="text-[11px] font-bold text-gray-500 mr-1">
                                            Select donation:
                                        </span>
                                        {[10, 20, 30, 50].map((amt) => {
                                            const isSelected = Number(donationAmount) === amt && !isCustomDonation;
                                            return (
                                                <button
                                                    key={amt}
                                                    type="button"
                                                    onClick={() => {
                                                        if (isSelected) {
                                                            setDonationAmount(0);
                                                            try { sessionStorage.removeItem('fk_donation_amount'); } catch (e) { }
                                                        } else {
                                                            setIsCustomDonation(false);
                                                            setDonationAmount(amt);
                                                            try { sessionStorage.setItem('fk_donation_amount', amt); } catch (e) { }
                                                        }
                                                    }}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer border flex items-center gap-1 ${
                                                        isSelected
                                                            ? 'bg-[#2874f0] text-white border-[#2874f0] shadow-xs'
                                                            : 'bg-gray-50 hover:bg-gray-100 text-gray-800 border-gray-200 hover:border-gray-300'
                                                    }`}
                                                >
                                                    <span>+ ₹{amt}</span>
                                                    {isSelected && <span className="text-[10px]">✓</span>}
                                                </button>
                                            );
                                        })}

                                        {/* Custom Amount Button / Input */}
                                        {!isCustomDonation ? (
                                            <button
                                                type="button"
                                                onClick={() => setIsCustomDonation(true)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer border ${
                                                    Number(donationAmount) > 0 && ![10, 20, 30, 50].includes(Number(donationAmount))
                                                        ? 'bg-[#2874f0] text-white border-[#2874f0]'
                                                        : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-dashed border-gray-300'
                                                }`}
                                            >
                                                {Number(donationAmount) > 0 && ![10, 20, 30, 50].includes(Number(donationAmount))
                                                    ? `+ ₹${donationAmount} (Custom)`
                                                    : '+ Custom Amount'}
                                            </button>
                                        ) : (
                                            <div className="flex items-center gap-1.5">
                                                <div className="relative flex items-center">
                                                    <span className="absolute left-2.5 text-xs font-bold text-gray-500">₹</span>
                                                    <input
                                                        type="text"
                                                        inputMode="numeric"
                                                        placeholder="Amount"
                                                        value={customDonationInput}
                                                        onChange={(e) => {
                                                            const val = e.target.value.replace(/\D/g, '');
                                                            setCustomDonationInput(val);
                                                            const num = Number(val) || 0;
                                                            setDonationAmount(num);
                                                            try {
                                                                if (num > 0) {
                                                                    sessionStorage.setItem('fk_donation_amount', num);
                                                                } else {
                                                                    sessionStorage.removeItem('fk_donation_amount');
                                                                }
                                                            } catch (err) { }
                                                        }}
                                                        className="w-24 pl-5 pr-2 py-1 text-xs font-bold border border-[#2874f0] rounded-md outline-none focus:ring-1 focus:ring-[#2874f0] bg-white text-gray-900"
                                                        autoFocus
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setIsCustomDonation(false)}
                                                    className="text-[11px] font-bold text-[#2874f0] hover:underline px-1 cursor-pointer"
                                                >
                                                    Done
                                                </button>
                                            </div>
                                        )}

                                        {/* Remove selection */}
                                        {Number(donationAmount) > 0 && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setDonationAmount(0);
                                                    setIsCustomDonation(false);
                                                    setCustomDonationInput('');
                                                    try { sessionStorage.removeItem('fk_donation_amount'); } catch (e) { }
                                                }}
                                                className="text-[11px] text-gray-400 hover:text-rose-600 underline ml-auto cursor-pointer"
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>

                                    {Number(donationAmount) > 0 && (
                                        <div className="mt-2.5 pt-2 border-t border-rose-100 flex items-center gap-1.5 text-[11px] text-rose-700 font-semibold">
                                            <span>❤️</span>
                                            <span>Thank you! ₹{donationAmount} contribution added to your order for child welfare.</span>
                                        </div>
                                    )}
                        </div>

                        {/* STEP 3: REST ASSURED WITH OPEN BOX DELIVERY */}
                        <div className="bg-white rounded-xs border border-gray-200 p-4 shadow-2xs flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                                <Inventory2OutlinedIcon sx={{ fontSize: 18 }} />
                            </div>
                            <div>
                                <h4 className="text-xs font-black text-gray-900 tracking-tight">
                                    Rest assured with Open Box Delivery
                                </h4>
                                <p className="text-[11px] text-gray-600 mt-1 leading-relaxed">
                                    Delivery agent will open the package so you can check for correct product, damage or missing items. Share OTP to accept the delivery. <span className="text-[#2874f0] font-bold cursor-pointer hover:underline">Why?</span>
                                </p>
                            </div>
                        </div>

                        {/* Legal terms disclaimer */}
                        <p className="text-[11px] text-gray-500 leading-relaxed px-1">
                            By continuing with the order, you confirm that you are above 18 years of age, and you agree to the Flipkart's <span className="text-[#2874f0] font-medium cursor-pointer hover:underline">Terms of Use</span> and <span className="text-[#2874f0] font-medium cursor-pointer hover:underline">Privacy Policy</span>
                        </p>
                    </div>

                    {/* RIGHT COLUMN: PRICE DETAILS (4 COLS) */}
                    <div className="lg:col-span-4 sticky top-4 space-y-3">
                        <div className="bg-white rounded-xs border border-gray-200 shadow-2xs p-4 sm:p-5">
                            {/* Price Details Header */}
                            <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-500 border-b border-gray-200 pb-3">
                                Price Details
                            </h3>

                            <div className="space-y-3 py-3.5 text-xs text-gray-800 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <span>Selling Price</span>
                                    <span className="font-medium">₹{mrpTotal.toLocaleString()}</span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="flex items-center gap-1 cursor-pointer">
                                        <span>Fees</span>
                                        <ExpandMoreIcon sx={{ fontSize: 15, color: '#6b7280' }} />
                                    </span>
                                    <span className="font-medium">₹{protectFee}</span>
                                </div>

                                <div className="flex items-center justify-between text-[#388e3c]">
                                    <span className="flex items-center gap-1 cursor-pointer">
                                        <span>Discounts</span>
                                        <ExpandMoreIcon sx={{ fontSize: 15, color: '#388e3c' }} />
                                    </span>
                                    <span className="font-semibold">- ₹{totalSavings.toLocaleString()}</span>
                                </div>

                                {Number(donationAmount) > 0 && (
                                    <div className="flex items-center justify-between text-rose-600 font-semibold pt-1">
                                        <span>Donation to Child Welfare</span>
                                        <span>+ ₹{donationAmount}</span>
                                    </div>
                                )}
                            </div>

                            {/* Total Payable */}
                            <div className="flex items-center justify-between py-3.5 border-b border-gray-200 text-sm font-black text-gray-950">
                                <span>Total Amount</span>
                                <span>₹{finalPayable.toLocaleString()}</span>
                            </div>

                            {/* Green savings announcement */}
                            <div className="mt-3.5 p-2.5 rounded-sm bg-emerald-50 text-emerald-800 text-[11px] font-bold flex items-center gap-1.5">
                                <span className="text-emerald-600 font-black">✔</span>
                                <span>You'll save ₹{totalSavings.toLocaleString()} on this order!</span>
                            </div>

                            {/* Big Desktop Continue Button (Flipkart Golden Yellow) */}
                            <div className="hidden lg:block pt-4">
                                <button
                                    type="button"
                                    onClick={handleContinue}
                                    className="w-full py-3 px-6 rounded-xs font-black text-sm uppercase tracking-wider shadow-sm hover:shadow transition-all text-center flex items-center justify-center cursor-pointer"
                                    style={{ backgroundColor: '#ffc200', color: '#111827' }}
                                >
                                    Continue
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </main>

            {/* FIXED BOTTOM CONTINUE BAR (MOBILE / TABLET) */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 px-4 py-2.5 shadow-2xl safe-area-pb">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <div className="text-[10px] text-gray-400 line-through">
                            ₹{mrpTotal.toLocaleString()}
                        </div>
                        <div className="text-base font-black text-gray-950 flex items-center gap-1">
                            <span>₹{finalPayable.toLocaleString()}</span>
                            <InfoOutlinedIcon sx={{ fontSize: 13, color: '#9ca3af' }} />
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleContinue}
                        className="py-2.5 px-8 rounded-xs font-black text-sm uppercase tracking-wider shadow-md transition-all text-center flex items-center justify-center cursor-pointer"
                        style={{ backgroundColor: '#ffc200', color: '#111827' }}
                    >
                        Continue
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderConfirm;
