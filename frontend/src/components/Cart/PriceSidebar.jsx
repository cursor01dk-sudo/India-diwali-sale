import React from 'react';

const PriceSidebar = ({ cartItems = [] }) => {
    const hasItems = cartItems && cartItems.length > 0;
    const mrpTotal = hasItems
        ? cartItems.reduce((sum, item) => sum + ((item.cuttedPrice || item.price * 1.25) * item.quantity), 0)
        : 0;
    const itemTotal = hasItems
        ? cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        : 0;
    const totalSavings = Math.max(0, mrpTotal - itemTotal);

    return (
        <div className="w-full bg-white rounded-xs border border-gray-200/80 shadow-xs overflow-hidden sticky top-20">
            <h2 className="px-4 py-3 border-b border-gray-200/80 font-bold text-xs uppercase tracking-wider text-gray-500">
                Price Details
            </h2>

            <div className="p-4 space-y-3.5 text-xs text-gray-800">
                <div className="flex justify-between">
                    <span>Price ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})</span>
                    <span className="font-semibold text-gray-900">₹{mrpTotal.toLocaleString()}</span>
                </div>

                <div className="flex justify-between">
                    <span>Discount</span>
                    <span className="font-semibold text-[#388e3c]">- ₹{totalSavings.toLocaleString()}</span>
                </div>

                <div className="flex justify-between">
                    <span>Delivery Charges</span>
                    <span className="font-semibold text-[#388e3c]">FREE</span>
                </div>

                <div className="border-t border-dashed border-gray-200 my-1"></div>

                <div className="flex justify-between text-sm font-extrabold text-gray-950">
                    <span>Total Amount</span>
                    <span className="text-base text-gray-950 font-black">₹{itemTotal.toLocaleString()}</span>
                </div>

                <div className="border-t border-dashed border-gray-200 my-1"></div>

                {totalSavings > 0 && (
                    <div className="text-[11px] font-bold text-[#388e3c]">
                        You will save ₹{totalSavings.toLocaleString()} on this order
                    </div>
                )}
            </div>
        </div>
    );
};

export default PriceSidebar;
