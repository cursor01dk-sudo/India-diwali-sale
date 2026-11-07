import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import MetaData from '../Layouts/MetaData';
import CartItem from './CartItem';
import EmptyCart from './EmptyCart';
import PriceSidebar from './PriceSidebar';
import SaveForLaterItem from './SaveForLaterItem';

const Cart = () => {
    const navigate = useNavigate();
    const { cartItems } = useSelector((state) => state.cart);
    const { saveForLaterItems } = useSelector((state) => state.saveForLater);

    const placeOrderHandler = () => {
        navigate('/order/confirm');
    };

    const hasItems = cartItems && cartItems.length > 0;
    const totalAmount = hasItems
        ? cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        : 0;

    return (
        <>
            <MetaData title="Shopping Cart | Flipkart.com" />
            <main className="w-full mt-16 sm:mt-20 pb-20 sm:pb-8 min-h-screen bg-[#f1f2f4]">
                {/* Main 2-Column Container */}
                <div className="flex flex-col sm:flex-row gap-3.5 w-full sm:w-11/12 mt-0 sm:mt-4 m-auto">
                    {/* Cart Items Column */}
                    <div className="flex-1 min-w-0">
                        {/* Cart Header & Items */}
                        <div className="flex flex-col bg-white shadow-xs rounded-xs border border-gray-200/80 overflow-hidden">
                            <div className="px-3 sm:px-6 py-3 border-b border-gray-200/80 flex items-center justify-between">
                                <span className="font-bold text-sm sm:text-base text-gray-900">
                                    My Cart ({cartItems.length})
                                </span>
                            </div>

                            {!hasItems ? (
                                <EmptyCart />
                            ) : (
                                cartItems.map((item) => (
                                    <CartItem key={item.product} {...item} inCart={true} />
                                ))
                            )}

                            {/* Desktop Place Order Footer (Hidden on Mobile) */}
                            {hasItems && (
                                <div className="hidden sm:flex justify-end p-4 border-t border-gray-100 bg-white">
                                    <button
                                        type="button"
                                        onClick={placeOrderHandler}
                                        className="py-3 px-10 bg-[#fb641b] hover:bg-[#e85a14] active:bg-[#d44f10] text-white font-extrabold text-xs uppercase tracking-wider rounded-xs shadow-sm hover:shadow transition-all cursor-pointer"
                                    >
                                        Place Order
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Saved For Later Container */}
                        {saveForLaterItems && saveForLaterItems.length > 0 && (
                            <div className="flex flex-col mt-4 bg-white shadow-xs rounded-xs border border-gray-200/80 overflow-hidden">
                                <span className="font-bold text-sm sm:text-base px-3 sm:px-6 py-3 border-b border-gray-200/80 text-gray-900">
                                    Saved For Later ({saveForLaterItems.length})
                                </span>
                                {saveForLaterItems.map((item) => (
                                    <SaveForLaterItem key={item.product} {...item} />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Price Sidebar */}
                    <div id="price-details-card" className="w-full sm:w-4/12">
                        <PriceSidebar cartItems={cartItems} />
                    </div>
                </div>

                {/* Mobile Sticky Bottom Bar (Authentic Flipkart Style) */}
                {hasItems && (
                    <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 px-4 py-2.5 shadow-2xl flex items-center justify-between safe-area-pb">
                        <div>
                            <div className="text-sm font-black text-gray-950">
                                ₹{totalAmount.toLocaleString()}
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    const el = document.getElementById('price-details-card');
                                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                                }}
                                className="text-[10px] font-bold text-[#2874f0] hover:underline cursor-pointer block"
                            >
                                View price details
                            </button>
                        </div>

                        <button
                            type="button"
                            onClick={placeOrderHandler}
                            className="py-2.5 px-7 bg-[#fb641b] hover:bg-[#e85a14] active:scale-95 text-white font-extrabold text-xs uppercase tracking-wider rounded-xs shadow-md transition-all cursor-pointer"
                        >
                            Place Order
                        </button>
                    </div>
                )}
            </main>
        </>
    );
};

export default Cart;
