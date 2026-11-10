import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';
import ShowChartRoundedIcon from '@mui/icons-material/ShowChartRounded';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import CreditCardOutlinedIcon from '@mui/icons-material/CreditCardOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import ViewCarouselOutlinedIcon from '@mui/icons-material/ViewCarouselOutlined';
import CloudDownloadOutlinedIcon from '@mui/icons-material/CloudDownloadOutlined';
import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import AddBoxOutlinedIcon from '@mui/icons-material/AddBoxOutlined';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import ConfirmationNumberOutlinedIcon from '@mui/icons-material/ConfirmationNumberOutlined';
import HistoryEduOutlinedIcon from '@mui/icons-material/HistoryEduOutlined';
import { useDispatch } from 'react-redux';
import { useSnackbar } from 'notistack';
import { logoutUser } from '../../../actions/userAction';
import './Sidebar.css';

// Main Nav Items matching Nexmart Reference Image
const primaryNavItems = [
    { id: 0, label: "Dashboard", ref: "/admin/dashboard", icon: <GridViewRoundedIcon sx={{ fontSize: 20 }} /> },
    { id: 100, label: "Statistics", ref: "/admin/dashboard#sales-summary", icon: <ShowChartRoundedIcon sx={{ fontSize: 20 }} /> },
    { id: 2, label: "Products", ref: "/admin/products", icon: <Inventory2OutlinedIcon sx={{ fontSize: 20 }} /> },
    { id: 101, label: "Transactions", ref: "/admin/orders?type=transactions", icon: <ReceiptLongOutlinedIcon sx={{ fontSize: 20 }} /> },
    { id: 1, label: "Order", ref: "/admin/orders", icon: <ShoppingCartOutlinedIcon sx={{ fontSize: 20 }} /> },
    { id: 6, label: "Customer", ref: "/admin/users", icon: <PeopleAltOutlinedIcon sx={{ fontSize: 20 }} /> },
    { id: 8, label: "Payment", ref: "/admin/upi-settings", icon: <CreditCardOutlinedIcon sx={{ fontSize: 20 }} />, badge: "UPI" },
    { id: 102, label: "Calendar", ref: "/admin/banners", icon: <CalendarMonthOutlinedIcon sx={{ fontSize: 20 }} /> },
];

// Specialized Store Management Tools
const secondaryNavItems = [
    { id: 5, label: "Posters & Banners", ref: "/admin/banners", icon: <ViewCarouselOutlinedIcon sx={{ fontSize: 18 }} /> },
    { id: 9, label: "Website CMS", ref: "/admin/content", icon: <CampaignOutlinedIcon sx={{ fontSize: 18 }} />, badge: "Live" },
    { id: 10, label: "Coupons & Discounts", ref: "/admin/coupons", icon: <ConfirmationNumberOutlinedIcon sx={{ fontSize: 18 }} /> },
    { id: 4, label: "Flipkart Importer", ref: "/admin/import-flipkart", icon: <CloudDownloadOutlinedIcon sx={{ fontSize: 18 }} />, badge: "1-Click" },
    { id: 11, label: "Activity Logs", ref: "/admin/activity-logs", icon: <HistoryEduOutlinedIcon sx={{ fontSize: 18 }} /> },
    { id: 7, label: "Customer Reviews", ref: "/admin/reviews", icon: <RateReviewOutlinedIcon sx={{ fontSize: 18 }} /> },
];

const Sidebar = ({ activeTab = 0, setToggleSidebar }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { enqueueSnackbar } = useSnackbar();

    const handleLogout = () => {
        dispatch(logoutUser());
        enqueueSnackbar("Logged out successfully", { variant: "success" });
        navigate("/login");
    };

    return (
        <aside className="w-64 shrink-0 bg-[#0F1017] text-[#8E92BC] flex flex-col h-full min-h-screen border-r border-[#1C1E2B] select-none font-sans">
            {/* Nexmart Logo Brand Header */}
            <div className="p-5 flex items-center justify-between border-b border-[#1C1E2B]/80">
                <Link to="/admin/dashboard" className="flex items-center gap-3 no-underline group">
                    {/* Nexmart Geometric Isometric Icon */}
                    <div className="relative w-8 h-8 flex items-center justify-center">
                        <div className="w-4 h-4 rounded-sm bg-[#5B5CE5] absolute top-1 left-1 transform -rotate-12 group-hover:rotate-0 transition-transform shadow-md shadow-[#5B5CE5]/50"></div>
                        <div className="w-4 h-4 rounded-sm bg-[#38BDF8] absolute bottom-1 right-1 transform -rotate-12 group-hover:rotate-0 transition-transform opacity-90"></div>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-white font-extrabold text-lg tracking-tight leading-none">
                            Nexmart
                        </span>
                        <span className="text-[10px] text-[#63688E] font-medium tracking-wider uppercase mt-1">
                            Admin Suite
                        </span>
                    </div>
                </Link>

                {/* Close Button on Mobile Drawer */}
                {setToggleSidebar && (
                    <button
                        onClick={() => setToggleSidebar(false)}
                        className="md:hidden p-1.5 rounded-lg text-[#8E92BC] hover:text-white hover:bg-[#1A1C29] transition-colors"
                    >
                        <CloseRoundedIcon sx={{ fontSize: 20 }} />
                    </button>
                )}
            </div>

            {/* Navigation Menu List */}
            <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto nexmart-sidebar-scroll">
                {/* 1. Primary Nexmart Items */}
                <div className="space-y-1">
                    {primaryNavItems.map((item) => {
                        const isDashboard = item.id === 0 && (location.pathname === '/admin/dashboard' || location.pathname === '/admin');
                        const isActive = isDashboard || (item.id !== 0 && (activeTab === item.id || location.pathname.startsWith(item.ref)));
                        return (
                            <Link
                                key={item.label}
                                to={item.ref}
                                onClick={() => setToggleSidebar && setToggleSidebar(false)}
                                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 no-underline ${
                                    isActive
                                        ? 'bg-[#5B5CE5] text-white shadow-lg shadow-[#5B5CE5]/25 font-bold'
                                        : 'text-[#8E92BC] hover:text-white hover:bg-[#181926]'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className={isActive ? 'text-white' : 'text-[#8E92BC] group-hover:text-white'}>
                                        {item.icon}
                                    </span>
                                    <span>{item.label}</span>
                                </div>

                                {item.badge && (
                                    <span
                                        className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                                            isActive
                                                ? 'bg-white/20 text-white'
                                                : 'bg-[#5B5CE5]/15 text-[#8183F2] border border-[#5B5CE5]/30'
                                        }`}
                                    >
                                        {item.badge}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </div>

                {/* 2. Divider & Secondary Store Suite Header */}
                <div className="pt-4 pb-1 px-3">
                    <span className="text-[10px] font-bold text-[#4E5276] uppercase tracking-wider">
                        Store Management
                    </span>
                </div>

                {/* 3. Secondary Nav Items */}
                <div className="space-y-1">
                    {secondaryNavItems.map((item) => {
                        const isActive = activeTab === item.id || location.pathname === item.ref;
                        return (
                            <Link
                                key={item.label}
                                to={item.ref}
                                onClick={() => setToggleSidebar && setToggleSidebar(false)}
                                className={`flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-150 no-underline ${
                                    isActive
                                        ? 'bg-[#5B5CE5] text-white shadow-lg shadow-[#5B5CE5]/25 font-bold'
                                        : 'text-[#8E92BC] hover:text-white hover:bg-[#181926]'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className={isActive ? 'text-white' : 'text-[#8E92BC] group-hover:text-white'}>
                                        {item.icon}
                                    </span>
                                    <span>{item.label}</span>
                                </div>

                                {item.badge && (
                                    <span
                                        className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                                            isActive
                                                ? 'bg-white/20 text-white'
                                                : 'bg-[#5B5CE5]/15 text-[#8183F2] border border-[#5B5CE5]/30'
                                        }`}
                                    >
                                        {item.badge}
                                    </span>
                                )}
                            </Link>
                        );
                    })}

                    {/* Direct Shortcut to Add Product */}
                    <Link
                        to="/admin/new_product"
                        onClick={() => setToggleSidebar && setToggleSidebar(false)}
                        className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-[#8E92BC] hover:text-white hover:bg-[#181926] transition-all no-underline"
                    >
                        <AddBoxOutlinedIcon sx={{ fontSize: 18 }} />
                        <span>Add Product</span>
                    </Link>
                </div>
            </nav>

            {/* Bottom Pinned Controls: Settings & Logout (Matching Reference Image) */}
            <div className="p-3 border-t border-[#1C1E2B]/80 space-y-1">
                <Link
                    to="/admin/upi-settings"
                    className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#8E92BC] hover:text-white hover:bg-[#181926] transition-all no-underline"
                >
                    <SettingsOutlinedIcon sx={{ fontSize: 20 }} />
                    <span>Settings</span>
                </Link>

                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#EF4444] hover:bg-[#EF4444]/10 transition-all cursor-pointer text-left"
                >
                    <LogoutRoundedIcon sx={{ fontSize: 20 }} />
                    <span>Logout</span>
                </button>

                {/* View Live Store Direct Link */}
                <Link
                    to="/"
                    target="_blank"
                    className="flex items-center justify-between px-3.5 py-2 rounded-xl text-[11px] font-bold text-slate-300 hover:text-white bg-[#181926] hover:bg-[#202234] border border-[#26283D] transition-all no-underline mt-2"
                >
                    <div className="flex items-center gap-2">
                        <StorefrontRoundedIcon sx={{ fontSize: 16, color: '#38BDF8' }} />
                        <span>Customer Store</span>
                    </div>
                    <span className="text-[#38BDF8]">↗</span>
                </Link>
            </div>
        </aside>
    );
};

export default Sidebar;
