import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import WorkIcon from '@mui/icons-material/Work';
import StarsIcon from '@mui/icons-material/Stars';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import HelpIcon from '@mui/icons-material/Help';
import FacebookIcon from '@mui/icons-material/Facebook';
import YouTubeIcon from '@mui/icons-material/YouTube';
import InstagramIcon from '@mui/icons-material/Instagram';
import CloseIcon from '@mui/icons-material/Close';
import paymentMethods from '../../../assets/images/payment-methods.svg';

const footerColumns = {
    about: [
        { name: "Contact Us" },
        { name: "About Us" },
        { name: "Careers" },
        { name: "Flipkart Stories" },
        { name: "Press" },
        { name: "Corporate Information" },
    ],
    groupCompanies: [
        { name: "Myntra", external: "https://www.myntra.com" },
        { name: "Cleartrip", external: "https://www.cleartrip.com" },
        { name: "Shopsy", external: "https://www.shopsy.in" },
    ],
    help: [
        { name: "Payments" },
        { name: "Shipping" },
        { name: "Cancellation & Returns" },
        { name: "FAQ" },
    ],
    consumerPolicy: [
        { name: "Cancellation & Returns" },
        { name: "Terms Of Use" },
        { name: "Security" },
        { name: "Privacy" },
        { name: "Sitemap" },
        { name: "Grievance Redressal" },
        { name: "EPR Compliance" },
        { name: "FSSAI Food Safety Connect App" },
    ],
};

const modalDetails = {
    "Contact Us": {
        title: "Contact Us - 24x7 Customer Support",
        content: (
            <div className="space-y-4 text-xs text-gray-700 leading-relaxed">
                <p>Flipkart Customer Support is dedicated to resolving all your shopping queries, delivery tracking, and returns 24 hours a day, 7 days a week.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl">
                        <div className="font-bold text-gray-900 text-xs">Customer Helpline</div>
                        <div className="text-sm font-black text-[#2874f0] mt-1">044-45614700 / 044-67415800</div>
                        <div className="text-[11px] text-gray-500 mt-0.5">Toll-free 24/7 Support</div>
                    </div>
                    <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl">
                        <div className="font-bold text-gray-900 text-xs">Support Email</div>
                        <div className="text-sm font-black text-[#2874f0] mt-1">support@flipkart.com</div>
                        <div className="text-[11px] text-gray-500 mt-0.5">Response within 2-4 hours</div>
                    </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="font-bold text-gray-900 mb-1">Registered Address</div>
                    <div>Flipkart Internet Private Limited, Buildings Alyssa, Begonia & Clove Embassy Tech Village, Outer Ring Road, Devarabeesanahalli Village, Bengaluru, 560103, Karnataka, India.</div>
                </div>
            </div>
        )
    },
    "About Us": {
        title: "About Flipkart Group",
        content: (
            <div className="space-y-3 text-xs text-gray-700 leading-relaxed">
                <p>The Flipkart Group is one of India's leading digital commerce entities and includes group companies Flipkart, Myntra, Flipkart Wholesale, Cleartrip, and Shopsy.</p>
                <p>Started in 2007, Flipkart has enabled millions of consumers, sellers, merchants, and small businesses to participate in India's e-commerce revolution, with a registered customer base exceeding 500 million and over 150 million products across 80+ categories.</p>
                <div className="grid grid-cols-3 gap-2.5 py-2 text-center">
                    <div className="p-2.5 bg-blue-50 rounded-xl border border-blue-100">
                        <div className="text-base font-black text-[#2874f0]">500M+</div>
                        <div className="text-[11px] text-gray-600">Registered Users</div>
                    </div>
                    <div className="p-2.5 bg-blue-50 rounded-xl border border-blue-100">
                        <div className="text-base font-black text-[#2874f0]">150M+</div>
                        <div className="text-[11px] text-gray-600">Products Catalog</div>
                    </div>
                    <div className="p-2.5 bg-blue-50 rounded-xl border border-blue-100">
                        <div className="text-base font-black text-[#2874f0]">1.4M+</div>
                        <div className="text-[11px] text-gray-600">Sellers Across India</div>
                    </div>
                </div>
            </div>
        )
    },
    "Careers": {
        title: "Careers at Flipkart - Innovate & Grow",
        content: (
            <div className="space-y-3 text-xs text-gray-700 leading-relaxed">
                <p>Join a team of visionaries, builders, and innovators who are shaping the future of Indian commerce. We offer opportunities across Engineering, Product, Supply Chain, Business, and Design.</p>
                <ul className="list-disc pl-4 space-y-1 text-gray-600">
                    <li>Engineering & Technology (Bangalore, Hyderabad)</li>
                    <li>Product Management & Design</li>
                    <li>Supply Chain, Logistics & Ekart Operations</li>
                    <li>Business Development & Seller Management</li>
                </ul>
                <div className="pt-1">
                    <a href="https://www.flipkartcareers.com" target="_blank" rel="noreferrer" className="inline-block px-4 py-2 bg-[#2874f0] text-white font-bold rounded-lg text-xs hover:bg-blue-700">
                        Explore Open Positions &rarr;
                    </a>
                </div>
            </div>
        )
    },
    "Flipkart Stories": {
        title: "Flipkart Stories - Official Storytelling Portal",
        content: (
            <div className="space-y-3 text-xs text-gray-700 leading-relaxed">
                <p>Flipkart Stories highlights empowering stories of entrepreneurs, artisans, delivery heroes, and sustainability initiatives across Bharat.</p>
                <p>Discover behind-the-scenes accounts of Big Billion Days, renewable energy milestones in supply chains, and innovations bringing commerce to rural India.</p>
            </div>
        )
    },
    "Press": {
        title: "Flipkart Press & Media Center",
        content: (
            <div className="space-y-3 text-xs text-gray-700 leading-relaxed">
                <p>Official media updates, press releases, corporate announcements, and high-resolution brand assets for journalists and media partners.</p>
                <p>For press inquiries, contact: <strong className="text-gray-900">press@flipkart.com</strong></p>
            </div>
        )
    },
    "Corporate Information": {
        title: "Corporate Information & Governance",
        content: (
            <div className="space-y-2 text-xs text-gray-700 leading-relaxed">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-1">
                    <div><strong>Legal Entity:</strong> Flipkart Internet Private Limited</div>
                    <div><strong>CIN:</strong> U51109KA2012PTC066107</div>
                    <div><strong>Date of Incorporation:</strong> 01 October 2012</div>
                    <div><strong>Registered State:</strong> Karnataka, India</div>
                    <div><strong>Auditors:</strong> S.R. Batliboi & Co. LLP</div>
                </div>
            </div>
        )
    },
    "Myntra": {
        title: "Myntra - India's Trendiest Fashion Destination",
        content: (
            <div className="space-y-3 text-xs text-gray-700 leading-relaxed">
                <p>Myntra is a Flipkart Group company that is India's leading platform for fashion, lifestyle, and beauty products. Shop authentic top international and Indian brands.</p>
                <a href="https://www.myntra.com" target="_blank" rel="noreferrer" className="inline-block px-4 py-2 bg-[#2874f0] text-white font-bold rounded-lg text-xs hover:bg-blue-700">
                    Visit Myntra.com &rarr;
                </a>
            </div>
        )
    },
    "Cleartrip": {
        title: "Cleartrip - Flight & Hotel Bookings",
        content: (
            <div className="space-y-3 text-xs text-gray-700 leading-relaxed">
                <p>Cleartrip, a Flipkart company, offers seamless flight, hotel, and bus bookings with flexible cancellations and SuperCoin redemption on travel.</p>
                <a href="https://www.cleartrip.com" target="_blank" rel="noreferrer" className="inline-block px-4 py-2 bg-[#2874f0] text-white font-bold rounded-lg text-xs hover:bg-blue-700">
                    Visit Cleartrip.com &rarr;
                </a>
            </div>
        )
    },
    "Shopsy": {
        title: "Shopsy by Flipkart - Hyper-Value Shopping",
        content: (
            <div className="space-y-3 text-xs text-gray-700 leading-relaxed">
                <p>Shopsy brings millions of budget-friendly fashion, lifestyle, and household products directly from verified manufacturers across India at lowest prices.</p>
                <a href="https://www.shopsy.in" target="_blank" rel="noreferrer" className="inline-block px-4 py-2 bg-[#2874f0] text-white font-bold rounded-lg text-xs hover:bg-blue-700">
                    Visit Shopsy.in &rarr;
                </a>
            </div>
        )
    },
    "Payments": {
        title: "Safe & Secure Payments on Flipkart",
        content: (
            <div className="space-y-3 text-xs text-gray-700 leading-relaxed">
                <p>All payment transactions on Flipkart are encrypted with 256-bit bank-grade SSL technology. We support multiple payment options:</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 bg-gray-50 rounded-lg border border-gray-100">• UPI (PhonePe, GPay, Paytm)</div>
                    <div className="p-2 bg-gray-50 rounded-lg border border-gray-100">• Credit & Debit Cards</div>
                    <div className="p-2 bg-gray-50 rounded-lg border border-gray-100">• Net Banking (50+ Banks)</div>
                    <div className="p-2 bg-gray-50 rounded-lg border border-gray-100">• Cash on Delivery (COD)</div>
                </div>
            </div>
        )
    },
    "Shipping": {
        title: "Flipkart Shipping & Delivery Guidelines",
        content: (
            <div className="space-y-3 text-xs text-gray-700 leading-relaxed">
                <p>Our dedicated Ekart delivery fleet reaches over 19,000 pincodes across India.</p>
                <ul className="list-disc pl-4 space-y-1 text-gray-600">
                    <li><strong>Standard Delivery:</strong> Delivered within 2-4 business days.</li>
                    <li><strong>Flipkart Assured:</strong> Stringent 6-step quality checks and priority speed.</li>
                    <li><strong>Live Tracking:</strong> Real-time SMS and app notifications at every milestone.</li>
                </ul>
            </div>
        )
    },
    "Cancellation & Returns": {
        title: "Cancellation & 7-Day Easy Returns Policy",
        content: (
            <div className="space-y-3 text-xs text-gray-700 leading-relaxed">
                <p>We provide a seamless 7-day return and replacement policy on all eligible purchases.</p>
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 space-y-1">
                    <div className="font-bold">Hassle-Free Return Process:</div>
                    <div>1. Go to "My Orders" and select your product.</div>
                    <div>2. Click "Return / Replace" and choose your reason.</div>
                    <div>3. Ekart pickup executive collects from your doorstep.</div>
                    <div>4. Instant refund credited to your original payment method.</div>
                </div>
            </div>
        )
    },
    "FAQ": {
        title: "Frequently Asked Questions (FAQ)",
        content: (
            <div className="space-y-3 text-xs text-gray-700 leading-relaxed">
                <div className="space-y-2">
                    <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="font-bold text-gray-900">How do I track my order?</div>
                        <div className="text-gray-600 mt-0.5">Go to "My Orders" from the header profile dropdown to view live Ekart delivery progress.</div>
                    </div>
                    <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="font-bold text-gray-900">What are SuperCoins?</div>
                        <div className="text-gray-600 mt-0.5">Earn SuperCoins on every purchase and redeem them for extra discounts, partner coupons, and subscriptions.</div>
                    </div>
                </div>
            </div>
        )
    },
    "Terms Of Use": {
        title: "Terms Of Use - Flipkart Marketplace",
        content: (
            <div className="space-y-2 text-xs text-gray-700 leading-relaxed">
                <p>This document is an electronic record under the Information Technology Act, 2000. By accessing Flipkart.com, you agree to comply with our user agreement, policies, and applicable Indian regulations governing digital commerce.</p>
                <p>All trademarks, logos, and brand names displayed on the platform are the property of their respective owners.</p>
            </div>
        )
    },
    "Security": {
        title: "Payment Security & Fraud Prevention",
        content: (
            <div className="space-y-2 text-xs text-gray-700 leading-relaxed">
                <p>Flipkart adheres strictly to PCI-DSS Level 1 compliance and RBI 2-Factor Authentication guidelines. Card details are tokenized securely and never stored in plain text.</p>
                <p className="text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200"><strong>Safety Tip:</strong> Flipkart never asks for your OTP, CVV, or banking passwords over phone or SMS.</p>
            </div>
        )
    },
    "Privacy": {
        title: "Privacy Policy - How We Safeguard Your Data",
        content: (
            <div className="space-y-2 text-xs text-gray-700 leading-relaxed">
                <p>We respect your privacy and are committed to safeguarding your personal data in accordance with the Digital Personal Data Protection (DPDP) Act.</p>
                <p>Your delivery address, contact details, and order history are securely stored and only used to fulfill deliveries, process refunds, and customize shopping recommendations.</p>
            </div>
        )
    },
    "Sitemap": {
        title: "Flipkart Store Sitemap",
        content: (
            <div className="space-y-3 text-xs text-gray-700">
                <p>Explore popular categories and departments on Flipkart:</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {["Mobiles", "Electronics", "Fashion", "Appliances", "Beauty", "Home & Furniture", "Grocery", "Personal Care"].map((cat, i) => (
                        <Link key={i} to={`/products?category=${encodeURIComponent(cat)}`} className="p-2 bg-gray-50 hover:bg-blue-50 rounded-lg border border-gray-200 font-medium text-[#2874f0] text-center">
                            {cat}
                        </Link>
                    ))}
                </div>
            </div>
        )
    },
    "Grievance Redressal": {
        title: "Grievance Redressal Mechanism",
        content: (
            <div className="space-y-2 text-xs text-gray-700 leading-relaxed">
                <p>In accordance with the Information Technology Act 2000 and rules made thereunder, the contact details of the Grievance Officer are provided below:</p>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-1">
                    <div><strong>Grievance Officer:</strong> Mr. Shreemantha M</div>
                    <div><strong>Designation:</strong> Senior Director - Customer Experience</div>
                    <div><strong>Email:</strong> grievance.officer@flipkart.com</div>
                    <div><strong>Address:</strong> Embassy Tech Village, Outer Ring Road, Bengaluru 560103, Karnataka</div>
                </div>
            </div>
        )
    },
    "EPR Compliance": {
        title: "Extended Producer Responsibility (EPR) Compliance",
        content: (
            <div className="space-y-2 text-xs text-gray-700 leading-relaxed">
                <p>Flipkart is committed to sustainable electronic waste management under the E-Waste (Management) Rules, 2016. We collaborate with authorized recyclers to ensure safe, eco-friendly collection and recycling of e-waste across India.</p>
            </div>
        )
    },
    "FSSAI Food Safety Connect App": {
        title: "FSSAI Food Safety & Quality Standards",
        content: (
            <div className="space-y-2 text-xs text-gray-700 leading-relaxed">
                <p>Flipkart Grocery and food merchants are certified by the Food Safety and Standards Authority of India (FSSAI). Consumers can report food safety concerns directly via the FSSAI Food Safety Connect App.</p>
            </div>
        )
    },
    "Become a Seller": {
        title: "Sell on Flipkart - Reach 500 Million+ Shoppers",
        content: (
            <div className="space-y-3 text-xs text-gray-700 leading-relaxed">
                <p>Start selling your products across India with 0% commission on select categories, low return fees, and pan-India logistics powered by Ekart.</p>
                <ul className="list-disc pl-4 space-y-1 text-gray-600">
                    <li>Access to 500M+ registered online shoppers</li>
                    <li>7-day regular payment cycles</li>
                    <li>Simple onboarding with GSTIN and active Bank Account</li>
                </ul>
                <div className="pt-2">
                    <a href="https://seller.flipkart.com/sell-online" target="_blank" rel="noreferrer" className="inline-block px-4 py-2 bg-[#2874f0] text-white font-bold rounded-lg text-xs hover:bg-blue-700">
                        Register as Seller &rarr;
                    </a>
                </div>
            </div>
        )
    },
    "Advertise": {
        title: "Flipkart Ads - Grow Your Brand",
        content: (
            <div className="space-y-3 text-xs text-gray-700 leading-relaxed">
                <p>Accelerate your product visibility with Flipkart Ads. Target active intent-driven shoppers with Sponsored Products, Display Ads, and Brand Stories.</p>
                <a href="https://brands.flipkart.com" target="_blank" rel="noreferrer" className="inline-block px-4 py-2 bg-[#2874f0] text-white font-bold rounded-lg text-xs hover:bg-blue-700">
                    Launch Ad Campaign &rarr;
                </a>
            </div>
        )
    },
    "Gift Cards": {
        title: "Flipkart Gift Cards - The Perfect Present",
        content: (
            <div className="space-y-3 text-xs text-gray-700 leading-relaxed">
                <p>Instant digital gift cards for birthdays, anniversaries, and corporate gifting. Delivered via email or SMS in seconds with up to 1 year validity.</p>
                <Link to="/products" className="inline-block px-4 py-2 bg-[#ffe11b] text-gray-950 font-bold rounded-lg text-xs hover:bg-amber-400">
                    Explore Gift Cards & Offers &rarr;
                </Link>
            </div>
        )
    },
    "Help Center": {
        title: "24x7 Help Center & Self-Service Hub",
        content: (
            <div className="space-y-3 text-xs text-gray-700 leading-relaxed">
                <p>Get instant answers for order cancellations, delivery reschedules, refund status, and warranty claims.</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                    <Link to="/orders" className="p-2.5 bg-blue-50 text-[#2874f0] font-bold rounded-lg border border-blue-100 text-center">
                        Track My Orders
                    </Link>
                    <Link to="/account" className="p-2.5 bg-blue-50 text-[#2874f0] font-bold rounded-lg border border-blue-100 text-center">
                        Manage Profile
                    </Link>
                </div>
            </div>
        )
    }
};

const Footer = () => {
    const location = useLocation();
    const isAdminRoute = location.pathname.startsWith("/admin");

    const [activeModal, setActiveModal] = useState(null);

    const handleLinkClick = (item) => {
        if (item.external) {
            window.open(item.external, '_blank');
        } else {
            setActiveModal(item.name);
        }
    };

    if (isAdminRoute) {
        return null;
    }

    return (
        <>
            {/* MAIN FOOTER (MATCHING REFERENCE IMAGE PIXEL-PERFECTLY) */}
            <footer className="w-full bg-[#172337] text-white text-[12px] pt-10 pb-6 border-b border-[#454d5e]">
                <div className="max-w-7xl mx-auto px-4 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* LEFT 4 COLUMNS (ABOUT, GROUP COMPANIES, HELP, CONSUMER POLICY) */}
                    <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-6">
                        
                        {/* 1. ABOUT */}
                        <div className="space-y-2.5">
                            <h3 className="text-[#878787] text-[11px] font-semibold uppercase tracking-wider mb-3">
                                ABOUT
                            </h3>
                            <ul className="space-y-1.5">
                                {footerColumns.about.map((item, idx) => (
                                    <li key={idx}>
                                        <button
                                            onClick={() => handleLinkClick(item)}
                                            className="text-white hover:underline text-[12px] text-left transition-colors"
                                        >
                                            {item.name}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* 2. GROUP COMPANIES */}
                        <div className="space-y-2.5">
                            <h3 className="text-[#878787] text-[11px] font-semibold uppercase tracking-wider mb-3">
                                GROUP COMPANIES
                            </h3>
                            <ul className="space-y-1.5">
                                {footerColumns.groupCompanies.map((item, idx) => (
                                    <li key={idx}>
                                        <button
                                            onClick={() => handleLinkClick(item)}
                                            className="text-white hover:underline text-[12px] text-left transition-colors"
                                        >
                                            {item.name}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* 3. HELP */}
                        <div className="space-y-2.5">
                            <h3 className="text-[#878787] text-[11px] font-semibold uppercase tracking-wider mb-3">
                                HELP
                            </h3>
                            <ul className="space-y-1.5">
                                {footerColumns.help.map((item, idx) => (
                                    <li key={idx}>
                                        <button
                                            onClick={() => handleLinkClick(item)}
                                            className="text-white hover:underline text-[12px] text-left transition-colors"
                                        >
                                            {item.name}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* 4. CONSUMER POLICY */}
                        <div className="space-y-2.5">
                            <h3 className="text-[#878787] text-[11px] font-semibold uppercase tracking-wider mb-3">
                                CONSUMER POLICY
                            </h3>
                            <ul className="space-y-1.5">
                                {footerColumns.consumerPolicy.map((item, idx) => (
                                    <li key={idx}>
                                        <button
                                            onClick={() => handleLinkClick(item)}
                                            className="text-white hover:underline text-[12px] text-left transition-colors"
                                        >
                                            {item.name}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>

                    </div>

                    {/* VERTICAL DIVIDER & RIGHT 2 COLUMNS (MAIL US & REGISTERED OFFICE) */}
                    <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-6 lg:border-l lg:border-[#454d5e] lg:pl-8">
                        
                        {/* 5. MAIL US & SOCIAL */}
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-[#878787] text-[11px] font-semibold uppercase tracking-wider mb-2">
                                    Mail Us:
                                </h3>
                                <p className="text-white text-[12px] leading-5 text-gray-300">
                                    Flipkart Internet Private Limited,<br />
                                    Buildings Alyssa, Begonia &<br />
                                    Clove Embassy Tech Village,<br />
                                    Outer Ring Road, Devarabeesanahalli Village,<br />
                                    Bengaluru, 560103,<br />
                                    Karnataka, India
                                </p>
                            </div>

                            {/* Social Icons row */}
                            <div className="pt-1">
                                <h4 className="text-[#878787] text-[11px] font-semibold uppercase tracking-wider mb-2">
                                    Social:
                                </h4>
                                <div className="flex items-center gap-3">
                                    <a
                                        href="https://www.facebook.com/flipkart"
                                        target="_blank"
                                        rel="noreferrer"
                                        className="w-7 h-7 rounded-full border border-gray-500 hover:border-white text-white flex items-center justify-center transition-colors"
                                        title="Facebook"
                                    >
                                        <FacebookIcon sx={{ fontSize: 16 }} />
                                    </a>
                                    <a
                                        href="https://twitter.com/flipkart"
                                        target="_blank"
                                        rel="noreferrer"
                                        className="w-7 h-7 rounded-full border border-gray-500 hover:border-white text-white flex items-center justify-center font-bold text-xs transition-colors"
                                        title="X / Twitter"
                                    >
                                        <span className="text-[12px]">𝕏</span>
                                    </a>
                                    <a
                                        href="https://www.youtube.com/flipkart"
                                        target="_blank"
                                        rel="noreferrer"
                                        className="w-7 h-7 rounded-full border border-gray-500 hover:border-white text-white flex items-center justify-center transition-colors"
                                        title="YouTube"
                                    >
                                        <YouTubeIcon sx={{ fontSize: 16 }} />
                                    </a>
                                    <a
                                        href="https://www.instagram.com/flipkart"
                                        target="_blank"
                                        rel="noreferrer"
                                        className="w-7 h-7 rounded-full border border-gray-500 hover:border-white text-white flex items-center justify-center transition-colors"
                                        title="Instagram"
                                    >
                                        <InstagramIcon sx={{ fontSize: 16 }} />
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* 6. REGISTERED OFFICE ADDRESS */}
                        <div className="space-y-2">
                            <h3 className="text-[#878787] text-[11px] font-semibold uppercase tracking-wider mb-2">
                                Registered Office Address:
                            </h3>
                            <p className="text-white text-[12px] leading-5 text-gray-300">
                                Flipkart Internet Private Limited,<br />
                                Buildings Alyssa, Begonia &<br />
                                Clove Embassy Tech Village,<br />
                                Outer Ring Road, Devarabeesanahalli Village,<br />
                                Bengaluru, 560103,<br />
                                Karnataka, India<br />
                                CIN : U51109KA2012PTC066107<br />
                                Telephone: <a href="tel:04445614700" className="text-[#2874f0] font-medium hover:underline">044-45614700</a> / <a href="tel:04467415800" className="text-[#2874f0] font-medium hover:underline">044-67415800</a>
                            </p>
                        </div>

                    </div>

                </div>
            </footer>

            {/* BOTTOM STRIP (BECOME A SELLER, ADVERTISE, GIFT CARDS, HELP CENTER, COPYRIGHT, CARDS) */}
            <div className="w-full bg-[#172337] border-t border-[#454d5e] py-6 px-4 sm:px-8 text-white text-xs">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    
                    {/* Quick action links */}
                    <div className="flex items-center flex-wrap gap-4 sm:gap-8 font-medium">
                        <button
                            onClick={() => handleLinkClick({ name: "Become a Seller" })}
                            className="flex items-center gap-1.5 hover:underline transition-colors"
                        >
                            <WorkIcon sx={{ fontSize: 16, color: '#facc15' }} />
                            <span>Become a Seller</span>
                        </button>

                        <button
                            onClick={() => handleLinkClick({ name: "Advertise" })}
                            className="flex items-center gap-1.5 hover:underline transition-colors"
                        >
                            <StarsIcon sx={{ fontSize: 16, color: '#facc15' }} />
                            <span>Advertise</span>
                        </button>

                        <button
                            onClick={() => handleLinkClick({ name: "Gift Cards" })}
                            className="flex items-center gap-1.5 hover:underline transition-colors"
                        >
                            <CardGiftcardIcon sx={{ fontSize: 16, color: '#facc15' }} />
                            <span>Gift Cards</span>
                        </button>

                        <button
                            onClick={() => handleLinkClick({ name: "Help Center" })}
                            className="flex items-center gap-1.5 hover:underline transition-colors"
                        >
                            <HelpIcon sx={{ fontSize: 16, color: '#facc15' }} />
                            <span>Help Center</span>
                        </button>
                    </div>

                    {/* Copyright & Payment methods logos */}
                    <div className="flex flex-col sm:flex-row items-center gap-4 text-gray-300 text-xs">
                        <span>&copy; 2007-2026 Flipkart.com</span>
                        <img
                            src={paymentMethods}
                            alt="Payment Methods: Visa, MasterCard, Maestro, RuPay, NetBanking, COD"
                            className="h-5 object-contain filter brightness-110"
                        />
                    </div>

                </div>
            </div>

            {/* DETAILS MODAL FOR CLICKED FOOTER ITEMS */}
            {activeModal && modalDetails[activeModal] && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
                    <div className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-5 sm:p-6 shadow-2xl relative border border-gray-200">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-4">
                            <div className="flex items-center gap-2">
                                <span className="bg-[#2874f0] text-[#ffe500] font-black italic rounded-full text-[11px] w-5 h-5 flex items-center justify-center leading-none">
                                    f
                                </span>
                                <h3 className="font-bold text-gray-900 text-sm sm:text-base">
                                    {modalDetails[activeModal].title}
                                </h3>
                            </div>
                            <button
                                onClick={() => setActiveModal(null)}
                                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors"
                            >
                                <CloseIcon sx={{ fontSize: 18 }} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="py-1">
                            {modalDetails[activeModal].content}
                        </div>

                        {/* Modal Footer */}
                        <div className="mt-5 pt-3 border-t border-gray-100 flex justify-end">
                            <button
                                onClick={() => setActiveModal(null)}
                                className="px-4 py-2 bg-[#2874f0] hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Footer;
