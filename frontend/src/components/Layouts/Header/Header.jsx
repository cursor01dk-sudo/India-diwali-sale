import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import SearchIcon from '@mui/icons-material/Search';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import CheckroomOutlinedIcon from '@mui/icons-material/CheckroomOutlined';
import SmartphoneOutlinedIcon from '@mui/icons-material/SmartphoneOutlined';
import LaptopMacOutlinedIcon from '@mui/icons-material/LaptopMacOutlined';
import FaceRetouchingNaturalOutlinedIcon from '@mui/icons-material/FaceRetouchingNaturalOutlined';
import WeekendOutlinedIcon from '@mui/icons-material/WeekendOutlined';
import TvOutlinedIcon from '@mui/icons-material/TvOutlined';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import FastfoodOutlinedIcon from '@mui/icons-material/FastfoodOutlined';
import DirectionsCarFilledOutlinedIcon from '@mui/icons-material/DirectionsCarFilledOutlined';
import SportsCricketOutlinedIcon from '@mui/icons-material/SportsCricketOutlined';
import ChairOutlinedIcon from '@mui/icons-material/ChairOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import TwoWheelerOutlinedIcon from '@mui/icons-material/TwoWheelerOutlined';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import FlightTakeoffOutlinedIcon from '@mui/icons-material/FlightTakeoffOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';

const searchPlaceholders = [
    'Search for Products, Brands and More',
    'Search for "mobiles"',
    'Search for "party speakers"',
    'Search for "diwali diyas"'
];

const Header = () => {
    const navigate = useNavigate();
    const { isAuthenticated, user } = useSelector((state) => state.user);

    const cachedUser = (() => {
        try {
            const s = localStorage.getItem('user');
            return s ? JSON.parse(s) : null;
        } catch (e) { return null; }
    })();
    const effectiveUser = user || cachedUser;
    const effectiveAuth = isAuthenticated || Boolean(cachedUser && localStorage.getItem('token'));
    const { cartItems } = useSelector((state) => state.cart);

    const location = useLocation();
    const [keyword, setKeyword] = useState('');
    const [placeholderIndex, setPlaceholderIndex] = useState(0);
    const [selectedTab, setSelectedTab] = useState('Flipkart');
    const [selectedCategory, setSelectedCategory] = useState('For You');
    const [moreOpen, setMoreOpen] = useState(false);

    useEffect(() => {
        if (location.pathname === '/') {
            setSelectedCategory('For You');
        }
    }, [location.pathname]);

    useEffect(() => {
        const interval = setInterval(() => {
            setPlaceholderIndex((prev) => (prev + 1) % searchPlaceholders.length);
        }, 3200);
        return () => clearInterval(interval);
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (keyword.trim()) {
            navigate(`/products/${keyword.trim()}`);
        } else {
            navigate('/products');
        }
    };

    const categoriesList = [
        { name: 'For You', icon: ShoppingBagOutlinedIcon, path: '/' },
        { name: 'Fashion', icon: CheckroomOutlinedIcon, path: '/products' },
        { name: 'Mobiles', icon: SmartphoneOutlinedIcon, path: '/products' },
        { name: 'Electronics', icon: LaptopMacOutlinedIcon, path: '/products' },
        { name: 'Beauty', icon: FaceRetouchingNaturalOutlinedIcon, path: '/products' },
        { name: 'Home', icon: WeekendOutlinedIcon, path: '/products' },
        { name: 'Appliances', icon: TvOutlinedIcon, path: '/products' },
        { name: 'Toys, ba...', icon: SmartToyOutlinedIcon, path: '/products' },
        { name: 'Food & H...', icon: FastfoodOutlinedIcon, path: '/products' },
        { name: 'Auto Acc...', icon: DirectionsCarFilledOutlinedIcon, path: '/products' },
        { name: 'Sports & ...', icon: SportsCricketOutlinedIcon, path: '/products' },
        { name: 'Furniture', icon: ChairOutlinedIcon, path: '/products' },
        { name: 'Books', icon: MenuBookOutlinedIcon, path: '/products' },
        { name: '2 Wheele...', icon: TwoWheelerOutlinedIcon, path: '/products' }
    ];

    const handleCategoryClick = (cat) => {
        setSelectedCategory(cat.name);
        if (cat.path === '/') {
            navigate('/');
        } else {
            navigate('/products');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <header className="w-full bg-white text-gray-800 border-b border-gray-100 z-40 sticky top-0 shadow-xs">
            <div className="max-w-7xl mx-auto px-2 sm:px-6 pt-1.5 sm:pt-2 pb-1 sm:pb-1.5">

                {/* 1. TOP TABS & LOCATION (EXACT MATCH TO REFERENCE SCREENSHOT) */}
                <div className="flex items-center justify-between pb-1 text-xs">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                        {/* Flipkart yellow active pill */}
                        <button
                            onClick={() => { setSelectedTab('Flipkart'); navigate('/'); }}
                            className={`flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1 rounded-xl font-bold transition-all shadow-2xs cursor-pointer ${
                                selectedTab === 'Flipkart'
                                    ? 'bg-[#ffe11b] hover:bg-[#ffd800]'
                                    : 'bg-[#f0f2f5] text-gray-700 hover:bg-gray-200'
                            }`}
                            style={selectedTab === 'Flipkart' ? { backgroundColor: '#ffe11b', color: '#111827' } : {}}
                        >
                            <img
                                src="/assets/banners/fk_speed_logo.png"
                                alt="f"
                                className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 object-contain"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                }}
                            />
                            <span 
                                className="italic font-black text-xs sm:text-[13px] tracking-tight leading-none"
                                style={{ color: selectedTab === 'Flipkart' ? '#111827' : '#374151', fontWeight: 900 }}
                            >
                                Flipkart
                            </span>
                        </button>

                        {/* Travel pill */}
                        <button
                            onClick={() => setSelectedTab('Travel')}
                            className={`flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1 rounded-xl font-semibold transition-all cursor-pointer ${
                                selectedTab === 'Travel'
                                    ? 'bg-[#ffe11b] text-gray-950'
                                    : 'bg-[#f0f2f5] text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            <FlightTakeoffOutlinedIcon sx={{ fontSize: { xs: 13, sm: 15 }, color: '#eb483b' }} />
                            <span className="italic font-extrabold text-gray-800 text-xs sm:text-[13px] tracking-tight leading-none">
                                Travel
                            </span>
                        </button>
                    </div>

                    {/* Location Info (Right) */}
                    <div className="flex items-center gap-1 text-[10px] sm:text-[11px] text-gray-700 cursor-pointer hover:text-blue-600 shrink-0">
                        <LocationOnOutlinedIcon sx={{ fontSize: { xs: 13, sm: 15 }, color: '#111827' }} />
                        <span className="hidden md:inline text-gray-900 font-semibold">Location not set</span>
                        <span className="text-[#2874f0] font-bold hover:underline flex items-center">
                            <span className="md:hidden">Select location</span>
                            <span className="hidden md:inline">Select delivery location</span>
                            <span className="ml-0.5">&gt;</span>
                        </span>
                    </div>
                </div>

                {/* 2. SEARCH & RIGHT NAV ACTIONS (EXACT MATCH TO REFERENCE SCREENSHOT) */}
                <div className="flex items-center justify-between gap-2.5 sm:gap-4 py-1 sm:py-1.5">
                    {/* Search Input Box with prominent blue border */}
                    <form onSubmit={handleSearch} className="flex-1 relative min-w-0">
                        <div className="w-full flex items-center bg-white rounded-xl sm:rounded-2xl px-2.5 sm:px-3.5 py-1.5 sm:py-2 border-[1.5px] sm:border-2 border-[#2b84ea] hover:border-[#1a73e8] transition-colors shadow-2xs">
                            <SearchIcon sx={{ fontSize: { xs: 17, sm: 20 }, color: '#717478', marginRight: { xs: '6px', sm: '8px' }, shrink: 0 }} />
                            <input
                                type="text"
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                                placeholder={searchPlaceholders[placeholderIndex]}
                                className="w-full bg-transparent text-xs sm:text-sm text-gray-900 placeholder-gray-500 outline-hidden font-normal"
                            />
                        </div>
                    </form>

                    {/* Right Action Icons: Login, More, Cart */}
                    <div className="flex items-center gap-2 sm:gap-4.5 text-xs font-semibold text-gray-800 shrink-0">
                        {/* Admin Badge ONLY visible when logged in as Admin */}
                        {effectiveAuth && effectiveUser?.role === "admin" && (
                            <Link
                                to="/admin/dashboard"
                                className="bg-amber-400 hover:bg-amber-500 text-gray-950 font-black px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md text-[10px] sm:text-[11px] shadow-2xs flex items-center gap-0.5 transition-colors"
                                title="Open Admin Control Panel"
                            >
                                <span>⚡ Admin</span>
                            </Link>
                        )}

                        {/* Login */}
                        <Link
                            to={effectiveAuth ? "/account" : "/login"}
                            className="flex items-center gap-0.5 sm:gap-1 hover:text-[#2874f0] cursor-pointer"
                        >
                            <PersonOutlineOutlinedIcon sx={{ fontSize: { xs: 17, sm: 20 } }} />
                            <span className="text-[11px] sm:text-xs font-semibold">
                                {effectiveAuth ? effectiveUser?.name?.split(' ')[0] : 'Login'}
                            </span>
                            <KeyboardArrowDownIcon sx={{ fontSize: { xs: 12, sm: 15 }, color: '#4b5563' }} />
                        </Link>

                        {/* More dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setMoreOpen(!moreOpen)}
                                className="flex items-center gap-0.5 hover:text-[#2874f0] cursor-pointer"
                            >
                                <span className="text-[11px] sm:text-xs font-semibold">More</span>
                                <KeyboardArrowDownIcon sx={{ fontSize: { xs: 12, sm: 15 }, color: '#4b5563' }} />
                            </button>

                            {moreOpen && (
                                <div className="absolute right-0 top-6 w-52 bg-white border border-gray-200 rounded-xl shadow-xl py-1 z-50 animate-fadeIn text-xs">
                                    {effectiveAuth && effectiveUser?.role === "admin" && (
                                        <>
                                            <Link
                                                to="/admin/dashboard"
                                                onClick={() => setMoreOpen(false)}
                                                className="block px-3 py-2 hover:bg-gray-100 text-[#2874f0] font-bold border-b border-gray-100"
                                            >
                                                ⚙️ Admin Dashboard
                                            </Link>
                                            <Link
                                                to="/admin/import-flipkart"
                                                onClick={() => setMoreOpen(false)}
                                                className="flex items-center gap-2 px-3 py-2 hover:bg-amber-50 text-amber-900 font-bold"
                                            >
                                                <span>⚡ Import Flipkart URL</span>
                                            </Link>
                                            <Link
                                                to="/admin/banners"
                                                onClick={() => setMoreOpen(false)}
                                                className="flex items-center gap-2 px-3 py-2 hover:bg-blue-50 text-[#2874f0] font-bold"
                                            >
                                                <CampaignOutlinedIcon sx={{ fontSize: 16 }} />
                                                <span>Manage Posters</span>
                                            </Link>
                                            <Link
                                                to="/admin/upi-settings"
                                                onClick={() => setMoreOpen(false)}
                                                className="flex items-center gap-2 px-3 py-2 hover:bg-emerald-50 text-emerald-800 font-bold"
                                            >
                                                <span>💰 UPI & Gateway Settings</span>
                                            </Link>
                                            <Link
                                                to="/admin/products"
                                                onClick={() => setMoreOpen(false)}
                                                className="block px-3 py-2 hover:bg-gray-100 text-gray-700 border-b border-gray-100"
                                            >
                                                Product Catalog & Prices
                                            </Link>
                                        </>
                                    )}
                                    <Link
                                        to="/orders"
                                        onClick={() => setMoreOpen(false)}
                                        className="block px-3 py-2 hover:bg-gray-100 text-gray-700"
                                    >
                                        My Orders
                                    </Link>
                                    <a
                                        href="https://www.flipkart.com/helpcentre"
                                        target="_blank"
                                        rel="noreferrer"
                                        onClick={() => setMoreOpen(false)}
                                        className="block px-3 py-2 hover:bg-gray-100 text-gray-700 border-t border-gray-100"
                                    >
                                        24x7 Customer Care
                                    </a>
                                </div>
                            )}
                        </div>

                        {/* Cart */}
                        <Link to="/cart" className="flex items-center gap-1 hover:text-[#2874f0] relative cursor-pointer">
                            <ShoppingCartOutlinedIcon sx={{ fontSize: { xs: 17, sm: 20 } }} />
                            <span className="text-[11px] sm:text-xs font-semibold">Cart</span>
                            {cartItems?.length > 0 && (
                                <span className="bg-red-600 text-white rounded-full text-[9px] sm:text-[10px] w-3.5 h-3.5 sm:w-4 sm:h-4 flex items-center justify-center font-bold">
                                    {cartItems.length}
                                </span>
                            )}
                        </Link>
                    </div>
                </div>

                {/* 3. CATEGORIES ICON STRIP (14 CATEGORIES MATCHING SCREENSHOT) */}
                <div className="flex items-center justify-between gap-2.5 sm:gap-3 overflow-x-auto no-scrollbar pt-2 pb-1 border-t border-gray-100">
                    {categoriesList.map((cat) => {
                        const IconComponent = cat.icon;
                        const isSelected = selectedCategory === cat.name;
                        return (
                            <button
                                key={cat.name}
                                onClick={() => handleCategoryClick(cat)}
                                className={`flex flex-col items-center shrink-0 cursor-pointer group pb-1 transition-all ${
                                    isSelected ? 'border-b-2 border-gray-900 text-gray-900 font-bold' : 'text-gray-600'
                                }`}
                            >
                                <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-all ${
                                    isSelected ? 'bg-amber-100 text-gray-900' : 'bg-transparent text-gray-600 group-hover:text-black'
                                }`}>
                                    <IconComponent sx={{ fontSize: { xs: 18, sm: 20 } }} />
                                </div>
                                <span className="text-[9.5px] sm:text-[11px] whitespace-nowrap mt-0.5">{cat.name}</span>
                            </button>
                        );
                    })}
                </div>

            </div>
        </header>
    );
};

export default Header;
