import React, { useState } from 'react';
import Sidebar from './Sidebar/Sidebar';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import WbSunnyOutlinedIcon from '@mui/icons-material/WbSunnyOutlined';
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../../actions/userAction';
import { useSnackbar } from 'notistack';

const tabTitles = {
    0: "Dashboard",
    1: "Order Management",
    2: "Product Catalog",
    3: "Add New Product",
    4: "Flipkart 1-Click Importer",
    5: "Banner & Poster Studio",
    6: "Customer Accounts",
    7: "Customer Reviews",
    8: "UPI & Payment Gateway",
};

const Dashboard = ({ activeTab = 0, children }) => {
    const [toggleSidebar, setToggleSidebar] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [userDropdown, setUserDropdown] = useState(false);
    const { user } = useSelector((state) => state.user);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/admin/products?search=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    const handleLogout = () => {
        dispatch(logoutUser());
        enqueueSnackbar("Logged out successfully", { variant: "success" });
        navigate("/login");
    };

    return (
        <div className="min-h-screen bg-[#0E1017] text-[#9CA3AF] flex flex-col antialiased font-sans">
            {/* Nexmart Top Admin Header Navbar */}
            <header className="sticky top-0 z-40 bg-[#0F1017]/95 backdrop-blur-md border-b border-[#1C1E2B] px-4 sm:px-6 py-3">
                <div className="max-w-[1700px] mx-auto flex items-center justify-between gap-4">
                    {/* Left: Mobile Menu + Search Bar */}
                    <div className="flex items-center gap-3 flex-1 max-w-md">
                        {/* Mobile Hamburger Button */}
                        <button
                            onClick={() => setToggleSidebar(true)}
                            className="md:hidden p-2 rounded-xl text-[#8E92BC] hover:text-white hover:bg-[#181926] transition-colors focus:outline-hidden"
                            aria-label="Open menu"
                        >
                            <MenuRoundedIcon sx={{ fontSize: 22 }} />
                        </button>

                        {/* Search Input Bar (Matching Nexmart Reference) */}
                        <form onSubmit={handleSearchSubmit} className="relative w-full">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search here..."
                                className="w-full bg-[#181926] border border-[#26283D] text-slate-100 placeholder-[#63688E] text-xs font-medium rounded-xl py-2.5 pl-4 pr-10 outline-hidden transition-all focus:border-[#5B5CE5] focus:ring-1 focus:ring-[#5B5CE5]"
                            />
                            <button
                                type="submit"
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#63688E] hover:text-white transition-colors cursor-pointer"
                            >
                                <SearchRoundedIcon sx={{ fontSize: 18 }} />
                            </button>
                        </form>
                    </div>

                    {/* Right Controls: Theme Toggle, Notifications, Admin Profile Pill */}
                    <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs font-bold text-slate-400 hidden xl:block">
                            {tabTitles[activeTab] || "Admin Console"}
                        </span>
                        {/* Live Store Shortcut */}
                        <Link
                            to="/"
                            target="_blank"
                            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#181926] hover:bg-[#202234] border border-[#26283D] text-slate-300 hover:text-white text-xs font-semibold transition-all no-underline"
                        >
                            <StorefrontRoundedIcon sx={{ fontSize: 16, color: '#38BDF8' }} />
                            <span>Live Store ↗</span>
                        </Link>

                        {/* Theme Toggle Button (Reference Sun Icon) */}
                        <button
                            type="button"
                            className="w-9 h-9 rounded-full bg-[#181926] border border-[#26283D] text-[#8E92BC] hover:text-white hover:border-[#3A3D59] flex items-center justify-center transition-all cursor-pointer"
                            title="Toggle Theme"
                        >
                            <WbSunnyOutlinedIcon sx={{ fontSize: 18 }} />
                        </button>

                        {/* Notifications Bell with Red Badge "2" (Matching Reference) */}
                        <div className="relative">
                            <button
                                type="button"
                                className="w-9 h-9 rounded-full bg-[#181926] border border-[#26283D] text-[#8E92BC] hover:text-white hover:border-[#3A3D59] flex items-center justify-center transition-all cursor-pointer"
                                title="Notifications"
                            >
                                <NotificationsNoneRoundedIcon sx={{ fontSize: 19 }} />
                            </button>
                            {/* Red Pill Notification Badge */}
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#EF4444] text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-xs">
                                2
                            </span>
                        </div>

                        {/* Admin User Profile Pill (Matching Reference Zachary A. / Owner Admin) */}
                        <div className="relative">
                            <button
                                onClick={() => setUserDropdown(!userDropdown)}
                                className="flex items-center gap-2.5 p-1 sm:pr-2.5 rounded-full hover:bg-[#181926] border border-transparent hover:border-[#26283D] transition-all cursor-pointer text-left"
                            >
                                <img
                                    src={user?.avatar?.url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"}
                                    alt="Admin Profile"
                                    className="w-8 h-8 rounded-full object-cover border border-[#3A3D59]"
                                />
                                <div className="hidden sm:flex flex-col">
                                    <span className="text-xs font-bold text-white leading-tight">
                                        {user?.name || "Zachary A."}
                                    </span>
                                    <span className="text-[10px] text-[#63688E] font-medium leading-tight">
                                        Owner Admin
                                    </span>
                                </div>
                                <KeyboardArrowDownRoundedIcon sx={{ fontSize: 16, color: '#8E92BC' }} />
                            </button>

                            {/* User Profile Dropdown Menu */}
                            {userDropdown && (
                                <div className="absolute right-0 top-12 w-48 bg-[#181926] border border-[#26283D] rounded-xl shadow-2xl py-1 z-50 text-xs text-slate-200">
                                    <div className="px-3 py-2 border-b border-[#26283D]">
                                        <p className="font-bold text-white truncate">{user?.name || "Store Administrator"}</p>
                                        <p className="text-[10px] text-[#63688E] truncate">{user?.email || "admin@flipkart.com"}</p>
                                    </div>
                                    <Link
                                        to="/admin/upi-settings"
                                        onClick={() => setUserDropdown(false)}
                                        className="block px-3 py-2 hover:bg-[#202234] text-slate-200 no-underline"
                                    >
                                        ⚡ UPI Payment Gateway
                                    </Link>
                                    <Link
                                        to="/admin/banners"
                                        onClick={() => setUserDropdown(false)}
                                        className="block px-3 py-2 hover:bg-[#202234] text-slate-200 no-underline"
                                    >
                                        🖼️ Poster & Banner Studio
                                    </Link>
                                    <Link
                                        to="/account"
                                        onClick={() => setUserDropdown(false)}
                                        className="block px-3 py-2 hover:bg-[#202234] text-slate-200 no-underline"
                                    >
                                        👤 My Account Profile
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left px-3 py-2 text-[#EF4444] hover:bg-[#EF4444]/10 border-t border-[#26283D] font-semibold"
                                    >
                                        🚪 Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Application Shell: Sidebar + Content */}
            <div className="flex-1 flex w-full">
                {/* Desktop Sidebar: Permanent Width */}
                <div className="hidden md:block">
                    <Sidebar activeTab={activeTab} />
                </div>

                {/* Mobile Drawer (Slide-Over Backdrop) */}
                {toggleSidebar && (
                    <div className="fixed inset-0 z-50 md:hidden flex">
                        <div
                            className="fixed inset-0 bg-black/80 backdrop-blur-xs transition-opacity"
                            onClick={() => setToggleSidebar(false)}
                        />
                        <div className="relative z-10">
                            <Sidebar activeTab={activeTab} setToggleSidebar={setToggleSidebar} />
                        </div>
                    </div>
                )}

                {/* Main Content Scroll Area */}
                <main className="flex-1 min-w-0 bg-[#0E1017] p-3 sm:p-5 lg:p-7 overflow-y-auto">
                    <div className="max-w-[1700px] mx-auto space-y-6">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Dashboard;
