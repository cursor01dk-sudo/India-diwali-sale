import React, { useState } from 'react';
import Sidebar from './Sidebar/Sidebar';
import MenuIcon from '@mui/icons-material/Menu';
import StorefrontIcon from '@mui/icons-material/Storefront';
import { Link } from 'react-router-dom';

const tabTitles = {
    0: "Dashboard & Analytics",
    1: "Orders & Shipments",
    2: "Product Catalog",
    3: "Add New Product",
    4: "Flipkart 1-Click Importer",
    5: "Banner & Poster Studio",
    6: "User Accounts",
    7: "Customer Reviews",
};

const Dashboard = ({ activeTab = 0, children }) => {
    const [toggleSidebar, setToggleSidebar] = useState(false);

    const currentTitle = tabTitles[activeTab] || "Admin Console";

    return (
        <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col antialiased">
            {/* Top Admin Navigation Bar */}
            <header className="sticky top-0 z-30 bg-[#0f172a] border-b border-slate-800 shadow-md">
                <div className="px-4 sm:px-6 py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {/* Mobile Hamburger Button */}
                        <button
                            onClick={() => setToggleSidebar(true)}
                            className="md:hidden p-2 rounded-xl text-slate-300 hover:bg-slate-800 transition-colors focus:outline-hidden"
                            aria-label="Open menu"
                        >
                            <MenuIcon />
                        </button>

                        <div className="flex items-center gap-2.5">
                            <Link
                                to="/"
                                target="_blank"
                                title="Open Live Store"
                                className="fk-logo-pill flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#ffe11b] hover:bg-[#ffd800] shadow-xs shrink-0 transition-transform active:scale-95 cursor-pointer no-underline"
                                style={{ backgroundColor: '#ffe11b', color: '#111827', textDecoration: 'none' }}
                            >
                                <img
                                    src="/assets/banners/fk_speed_logo.png"
                                    alt="Flipkart"
                                    className="w-3.5 h-3.5 object-contain shrink-0"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                    }}
                                />
                                <span
                                    className="italic font-black text-xs sm:text-[13px] tracking-tight leading-none select-none"
                                    style={{ color: '#111827', fontWeight: 900, textDecoration: 'none' }}
                                >
                                    Flipkart
                                </span>
                            </Link>
                            <div>
                                <h1 className="text-sm sm:text-base font-extrabold text-white leading-tight">
                                    {currentTitle}
                                </h1>
                                <p className="text-[11px] font-medium hidden sm:block" style={{ color: '#94a3b8' }}>
                                    Flipkart Store Management • Live Operations
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right Quick Controls */}
                    <div className="flex items-center gap-2.5 sm:gap-4 text-xs">
                        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[11px] font-semibold">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                            <span>Store Online</span>
                        </div>

                        <Link
                            to="/"
                            target="_blank"
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-md shadow-blue-500/20"
                        >
                            <StorefrontIcon sx={{ fontSize: 16 }} />
                            <span>View Live Store</span>
                            <span className="text-[10px]">↗</span>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Layout Body: Pure Flex (Zero Overlap Guaranteed) */}
            <div className="flex-1 flex w-full">
                {/* Desktop Sidebar: natural flow w-64 shrink-0 */}
                <div className="hidden md:block">
                    <Sidebar activeTab={activeTab} />
                </div>

                {/* Mobile Drawer (Slide-Over with Backdrop) */}
                {toggleSidebar && (
                    <div className="fixed inset-0 z-50 md:hidden flex">
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity"
                            onClick={() => setToggleSidebar(false)}
                        />
                        {/* Drawer content */}
                        <div className="relative z-10">
                            <Sidebar activeTab={activeTab} setToggleSidebar={setToggleSidebar} />
                        </div>
                    </div>
                )}

                {/* Main Content Area: dark theme */}
                <main className="flex-1 min-w-0 bg-[#0b0f19] p-3 sm:p-6 lg:p-8 overflow-y-auto">
                    <div className="max-w-7xl mx-auto space-y-6">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Dashboard;
