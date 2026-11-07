import React from 'react';

// Official Google Pay HD Icon
export const GooglePayIcon = ({ className = "w-7 h-7" }) => (
    <div className={`flex items-center justify-center bg-white rounded-full p-1 shadow-2xs border border-gray-100 ${className}`}>
        <svg viewBox="0 0 24 24" className="w-full h-full" fill="none">
            <path
                d="M23.5 12.27c0-.82-.07-1.61-.2-2.37H12v4.49h6.46c-.28 1.48-1.12 2.74-2.38 3.58v2.98h3.85c2.25-2.07 3.57-5.12 3.57-8.68z"
                fill="#4285F4"
            />
            <path
                d="M12 24c3.24 0 5.96-1.07 7.95-2.91l-3.85-2.98c-1.08.72-2.46 1.15-4.1 1.15-3.15 0-5.82-2.13-6.78-4.99H1.24v3.08C3.25 21.36 7.33 24 12 24z"
                fill="#34A853"
            />
            <path
                d="M5.22 14.27c-.25-.72-.39-1.49-.39-2.27s.14-1.55.39-2.27V6.65H1.24C.45 8.24 0 10.06 0 12s.45 3.76 1.24 5.35l3.98-3.08z"
                fill="#FBBC05"
            />
            <path
                d="M12 4.74c1.76 0 3.35.61 4.59 1.79l3.44-3.44C17.95 1.18 15.24 0 12 0 7.33 0 3.25 2.64 1.24 6.65l3.98 3.08c.96-2.86 3.63-4.99 6.78-4.99z"
                fill="#EA4335"
            />
        </svg>
    </div>
);

// Official PhonePe HD Icon
export const PhonePeIcon = ({ className = "w-7 h-7" }) => (
    <div className={`flex items-center justify-center bg-[#5f259f] rounded-full p-1 shadow-2xs ${className}`}>
        <svg viewBox="0 0 40 40" className="w-full h-full" fill="none">
            <path
                d="M20 0C8.954 0 0 8.954 0 20s8.954 20 20 20 20-8.954 20-20S31.046 0 20 0z"
                fill="#5F259F"
            />
            <path
                d="M20.2 9.5c-4.8 0-7.8 2.6-7.8 6.8 0 3.1 1.6 5.2 4.3 6.1l-4.5 10.4h3.7l3.7-8.8h.6c4.6 0 7.8-2.5 7.8-7.2 0-4.3-3.1-7.3-7.8-7.3zm-.2 11.2h-3.3v-8h3.3c2.7 0 4.4 1.4 4.4 4 0 2.6-1.7 4-4.4 4z"
                fill="#FFFFFF"
            />
            <path
                d="M26.2 13.8l-1.6 1.6 3.2 3.2-3.2 3.2 1.6 1.6 4.8-4.8-4.8-4.8z"
                fill="#FFFFFF"
            />
        </svg>
    </div>
);

// Official Paytm HD Icon
export const PaytmIcon = ({ className = "w-7 h-7" }) => (
    <div className={`flex items-center justify-center bg-white rounded-full p-0.5 shadow-2xs border border-gray-100 ${className}`}>
        <svg viewBox="0 0 36 36" className="w-full h-full" fill="none">
            <circle cx="18" cy="18" r="17" fill="#002970" />
            <path
                d="M9.5 13h3.2c1.7 0 2.8.9 2.8 2.4 0 1.6-1.1 2.5-2.8 2.5h-1.6v3.6H9.5V13zm3.1 3.5c.7 0 1.2-.3 1.2-1.1 0-.7-.5-1-1.2-1h-1.5v2.1h1.5z"
                fill="#FFFFFF"
            />
            <path
                d="M17.8 17.6c0-1.8 1.3-2.8 3.1-2.8 1.8 0 3.1 1 3.1 2.8v3.9h-1.5v-1.1c-.5.8-1.4 1.3-2.4 1.3-1.6 0-2.8-1-2.8-2.4 0-1.5 1.1-2.3 2.8-2.5l2.4-.2v-.3c0-.9-.6-1.4-1.6-1.4-.9 0-1.5.4-1.6 1.1l-1.5-.4zm4.7 1.6l-2 .2c-1 .1-1.6.5-1.6 1.3 0 .8.6 1.3 1.5 1.3.9 0 1.7-.5 2-1.2v-1.6z"
                fill="#00BAF2"
            />
            <path
                d="M25.6 15h1.7l1.8 4.4 1.8-4.4h1.7l-2.7 6.1-1.6 3.5h-1.6l1.2-2.5L25.6 15z"
                fill="#00BAF2"
            />
        </svg>
    </div>
);

// Official Unified Payments Interface (UPI / BHIM) HD Icon
export const UpiIcon = ({ className = "w-7 h-7" }) => (
    <div className={`flex items-center justify-center bg-white rounded-full p-1 shadow-2xs border border-gray-100 ${className}`}>
        <svg viewBox="0 0 32 32" className="w-full h-full" fill="none">
            <path
                d="M19.5 5.5l-6.8 12.8h4.2l3.2-6.1 3.2 6.1h4.2L20.7 5.5h-1.2z"
                fill="#097939"
            />
            <path
                d="M12.5 5.5L5.7 18.3h4.2l3.2-6.1 3.2 6.1h4.2L13.7 5.5h-1.2z"
                fill="#F47820"
            />
            <path
                d="M10 21.5h2.5v2.5H10v-2.5zm4 0h2.5v2.5H14v-2.5zm4 0h2.5v2.5H18v-2.5zm4 0h2.5v2.5H22v-2.5z"
                fill="#002D62"
            />
        </svg>
    </div>
);

// UPI Box Badge (for the left payment method tab)
export const UpiPillBadge = () => (
    <div className="w-7 h-5 rounded border border-gray-800 text-gray-900 font-black text-[9px] flex items-center justify-center tracking-tighter leading-none shrink-0">
        UPI
    </div>
);

// Flipkart Yellow Brand Pill Logo (matches the top header of screenshot)
export const FlipkartBrandPill = () => (
    <div
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#ffe11b] hover:bg-[#ffd800] transition-colors cursor-pointer shadow-2xs select-none"
        style={{ backgroundColor: '#ffe11b', color: '#111827' }}
    >
        <img
            src="/assets/payment/fk_official_speed_logo.png"
            alt="Flipkart"
            className="w-4 h-4 rounded-full object-contain shrink-0"
        />
        <span
            className="italic font-black text-xs sm:text-[13px] tracking-tight leading-none"
            style={{ color: '#111827', fontWeight: 900 }}
        >
            Flipkart
        </span>
    </div>
);

// Official UPI Verified Badge (Used in Header & Payment Card)
export const FlipkartPaymentsLogo = ({ className = "" }) => (
    <div className={`inline-flex items-center justify-center gap-2 select-none ${className}`}>
        <img
            src="/assets/payment/upi.svg"
            alt="UPI"
            className="h-4 object-contain shrink-0"
        />
        <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-[#1b5e20] bg-[#eafaf1] border border-emerald-200/90 px-2 py-0.5 rounded-full shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#388e3c]"></span>
            <span>UPI Verified</span>
        </div>
    </div>
);

const brandIcons = {
    GooglePayIcon,
    PhonePeIcon,
    PaytmIcon,
    UpiIcon,
    UpiPillBadge,
    FlipkartBrandPill,
    FlipkartPaymentsLogo
};

export default brandIcons;
