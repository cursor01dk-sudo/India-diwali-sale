import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import HomeIcon from '@mui/icons-material/Home';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';

const MobileBottomNav = () => {
    const { cartItems } = useSelector(state => state.cart);
    const { isAuthenticated } = useSelector(state => state.user);

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 md:hidden shadow-lg safe-area-pb">
            <div className="flex justify-around items-center h-13 px-1">
                <NavLink
                    to="/"
                    className={({ isActive }) =>
                        `flex flex-col items-center justify-center flex-1 py-1 text-[11px] font-medium transition-colors ${
                            isActive ? 'text-[#2874f0]' : 'text-gray-600 hover:text-gray-900'
                        }`
                    }
                >
                    {({ isActive }) => (
                        <>
                            {isActive ? <HomeIcon sx={{ fontSize: 22 }} /> : <HomeOutlinedIcon sx={{ fontSize: 22 }} />}
                            <span className="mt-0.5">Home</span>
                        </>
                    )}
                </NavLink>

                <NavLink
                    to="/products"
                    className={({ isActive }) =>
                        `flex flex-col items-center justify-center flex-1 py-1 text-[11px] font-medium transition-colors ${
                            isActive ? 'text-[#2874f0]' : 'text-gray-600 hover:text-gray-900'
                        }`
                    }
                >
                    <CategoryOutlinedIcon sx={{ fontSize: 22 }} />
                    <span className="mt-0.5">Categories</span>
                </NavLink>

                <NavLink
                    to="/products?keyword=diya"
                    className={({ isActive }) =>
                        `flex flex-col items-center justify-center flex-1 py-1 text-[11px] font-medium transition-colors ${
                            isActive ? 'text-[#2874f0]' : 'text-gray-600 hover:text-gray-900'
                        }`
                    }
                >
                    <NotificationsNoneOutlinedIcon sx={{ fontSize: 22 }} />
                    <span className="mt-0.5">Sale</span>
                </NavLink>

                <NavLink
                    to={isAuthenticated ? "/account" : "/login"}
                    className={({ isActive }) =>
                        `flex flex-col items-center justify-center flex-1 py-1 text-[11px] font-medium transition-colors ${
                            isActive ? 'text-[#2874f0]' : 'text-gray-600 hover:text-gray-900'
                        }`
                    }
                >
                    <PersonOutlineOutlinedIcon sx={{ fontSize: 22 }} />
                    <span className="mt-0.5">Account</span>
                </NavLink>

                <NavLink
                    to="/cart"
                    className={({ isActive }) =>
                        `flex flex-col items-center justify-center flex-1 py-1 text-[11px] font-medium transition-colors relative ${
                            isActive ? 'text-[#2874f0]' : 'text-gray-600 hover:text-gray-900'
                        }`
                    }
                >
                    <div className="relative">
                        <ShoppingCartOutlinedIcon sx={{ fontSize: 22 }} />
                        {cartItems && cartItems.length > 0 && (
                            <span className="absolute -top-1.5 -right-2 bg-red-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                                {cartItems.length}
                            </span>
                        )}
                    </div>
                    <span className="mt-0.5">Cart</span>
                </NavLink>
            </div>
        </nav>
    );
};

export default MobileBottomNav;

