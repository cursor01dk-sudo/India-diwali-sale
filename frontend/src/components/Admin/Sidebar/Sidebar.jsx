import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import EqualizerIcon from '@mui/icons-material/Equalizer';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import InventoryIcon from '@mui/icons-material/Inventory';
import GroupIcon from '@mui/icons-material/Group';
import ReviewsIcon from '@mui/icons-material/Reviews';
import AddBoxIcon from '@mui/icons-material/AddBox';
import LogoutIcon from '@mui/icons-material/Logout';
import ViewCarouselIcon from '@mui/icons-material/ViewCarousel';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import CloseIcon from '@mui/icons-material/Close';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import Avatar from '@mui/material/Avatar';
import { useDispatch, useSelector } from 'react-redux';
import { useSnackbar } from 'notistack';
import { logoutUser } from '../../../actions/userAction';
import './Sidebar.css';

const navSections = [
    {
        title: "OVERVIEW",
        items: [
            { id: 0, label: "Dashboard", ref: "/admin/dashboard", icon: <EqualizerIcon sx={{ fontSize: 20 }} /> },
        ]
    },
    {
        title: "FAST ACTIONS",
        items: [
            { id: 4, label: "Import Flipkart Link", ref: "/admin/import-flipkart", icon: <CloudDownloadIcon sx={{ fontSize: 20 }} />, badge: "Scraper" },
            { id: 5, label: "Posters & Banners", ref: "/admin/banners", icon: <ViewCarouselIcon sx={{ fontSize: 20 }} />, badge: "Posters" },
        ]
    },
    {
        title: "STORE INVENTORY",
        items: [
            { id: 2, label: "Products Catalog", ref: "/admin/products", icon: <InventoryIcon sx={{ fontSize: 20 }} /> },
            { id: 3, label: "Add New Product", ref: "/admin/new_product", icon: <AddBoxIcon sx={{ fontSize: 20 }} /> },
            { id: 1, label: "Orders & Shipping", ref: "/admin/orders", icon: <ShoppingBagIcon sx={{ fontSize: 20 }} /> },
        ]
    },
    {
        title: "COMMUNITY & CONTROL",
        items: [
            { id: 6, label: "Users & Customers", ref: "/admin/users", icon: <GroupIcon sx={{ fontSize: 20 }} /> },
            { id: 7, label: "Product Reviews", ref: "/admin/reviews", icon: <ReviewsIcon sx={{ fontSize: 20 }} /> },
        ]
    }
];

const Sidebar = ({ activeTab, setToggleSidebar }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { enqueueSnackbar } = useSnackbar();
    const { user } = useSelector((state) => state.user);

    const handleLogout = () => {
        dispatch(logoutUser());
        enqueueSnackbar("Logged out successfully", { variant: "success" });
        navigate("/login");
    };

    return (
        <aside className="w-64 shrink-0 bg-[#090d16] text-slate-100 flex flex-col h-full min-h-screen border-r border-slate-800 shadow-2xl select-none">
            {/* Header / Brand */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    {/* Official Flipkart Brand Pill */}
                    <Link
                        to="/"
                        target="_blank"
                        title="Open Live Store"
                        className="fk-logo-pill flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#ffe11b] hover:bg-[#ffd800] shadow-md shadow-yellow-500/20 shrink-0 transition-transform active:scale-95 cursor-pointer no-underline"
                        style={{ backgroundColor: '#ffe11b', color: '#111827', textDecoration: 'none' }}
                    >
                        <img
                            src="/assets/banners/fk_speed_logo.png"
                            alt="Flipkart"
                            className="w-4 h-4 object-contain shrink-0"
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
                    <div className="flex flex-col">
                        <span className="font-extrabold text-white text-xs tracking-wider uppercase leading-none">
                            Admin Suite
                        </span>
                        <span className="text-[9px] font-semibold tracking-wider uppercase mt-1 text-slate-400" style={{ color: '#94a3b8' }}>
                            Store Control
                        </span>
                    </div>
                </div>

                {setToggleSidebar && (
                    <button
                        onClick={() => setToggleSidebar(false)}
                        className="md:hidden text-slate-300 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
                    >
                        <CloseIcon fontSize="small" />
                    </button>
                )}
            </div>

            {/* Admin Profile Chip */}
            <div className="mx-3 mt-3 p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center gap-2.5">
                <Avatar
                    sx={{ width: 36, height: 36, bgcolor: '#2874f0', fontSize: 14, fontWeight: 'bold' }}
                    src={user?.avatar?.url}
                >
                    {user?.name ? user.name[0].toUpperCase() : 'A'}
                </Avatar>
                <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-xs font-bold text-white truncate">
                        {user?.name || "Administrator"}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        Admin Active
                    </span>
                </div>
            </div>

            {/* Navigation Menus */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4 sidebar">
                {navSections.map((section, sIdx) => (
                    <div key={sIdx} className="space-y-1">
                        <div className="px-3 text-[10px] font-black uppercase tracking-wider" style={{ color: '#94a3b8' }}>
                            {section.title}
                        </div>
                        {section.items.map((item) => {
                            const isSelected = activeTab === item.id || location.pathname === item.ref;
                            return (
                                <Link
                                    key={item.id}
                                    to={item.ref}
                                    data-active={isSelected ? "true" : "false"}
                                    onClick={() => setToggleSidebar && setToggleSidebar(false)}
                                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 ${
                                        isSelected
                                            ? "bg-[#2874f0] !text-white shadow-lg shadow-blue-500/30"
                                            : "text-slate-200 hover:text-white hover:bg-slate-800/80 active:bg-slate-800"
                                    }`}
                                    style={{ color: isSelected ? '#ffffff' : '#f1f5f9' }}
                                >
                                    <div className="flex items-center gap-2.5">
                                        <span className={isSelected ? "!text-white" : "text-blue-400"} style={{ color: isSelected ? '#ffffff' : '#60a5fa' }}>
                                            {item.icon}
                                        </span>
                                        <span className={`nav-label ${isSelected ? "!text-white font-extrabold" : "text-slate-100 font-semibold"}`} style={{ color: isSelected ? '#ffffff' : '#f1f5f9' }}>
                                            {item.label}
                                        </span>
                                    </div>
                                    {item.badge && (
                                        <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-extrabold uppercase tracking-wider ${
                                            isSelected ? "bg-white/25 !text-white" : "bg-amber-400/20 text-amber-300 border border-amber-400/40"
                                        }`} style={{ color: isSelected ? '#ffffff' : '#fcd34d' }}>
                                            {item.badge}
                                        </span>
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                ))}

                {/* View Live Store Link */}
                <div className="pt-2">
                    <Link
                        to="/"
                        target="_blank"
                        className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-100 hover:text-white hover:bg-slate-800/90 transition-all border border-slate-700 bg-slate-900/80"
                        style={{ color: '#f1f5f9' }}
                    >
                        <StorefrontOutlinedIcon sx={{ fontSize: 18, color: '#38bdf8' }} />
                        <span className="text-slate-100 font-semibold" style={{ color: '#f1f5f9' }}>View Live Store</span>
                        <span className="ml-auto text-xs text-blue-400 font-black">↗</span>
                    </Link>
                </div>
            </div>

            {/* Security Footer & Logout */}
            <div className="p-3 border-t border-slate-800 bg-slate-950/80 space-y-2">
                <div className="p-2 rounded-lg bg-slate-800/60 border border-slate-800 flex items-center gap-2 text-[11px]" style={{ color: '#94a3b8' }}>
                    <ShieldOutlinedIcon sx={{ fontSize: 16, color: '#10b981' }} />
                    <span className="truncate" style={{ color: '#94a3b8' }}>Protected by 256-Bit JWT</span>
                </div>

                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-red-400 hover:text-white hover:bg-red-500/20 border border-red-500/20 transition-all cursor-pointer"
                >
                    <LogoutIcon sx={{ fontSize: 16 }} />
                    <span>Secure Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
