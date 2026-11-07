import React from 'react';
import { useSnackbar } from 'notistack';
import { useDispatch } from 'react-redux';
import { addItemsToCart, removeItemsFromCart } from '../../actions/cartAction';
import { getDeliveryDate, getDiscount } from '../../utils/functions';
import { saveForLater } from '../../actions/saveForLaterAction';
import { Link } from 'react-router-dom';
import FAssuredBadge from '../Layouts/FAssuredBadge';

const CartItem = ({ product, name, seller, price, cuttedPrice, image, stock, quantity, inCart }) => {
    const dispatch = useDispatch();
    const { enqueueSnackbar } = useSnackbar();

    const increaseQuantity = (id, quantity, stock) => {
        const newQty = quantity + 1;
        if (quantity >= stock) {
            enqueueSnackbar("Maximum Order Quantity", { variant: "warning" });
            return;
        }
        dispatch(addItemsToCart(id, newQty));
    };

    const decreaseQuantity = (id, quantity) => {
        const newQty = quantity - 1;
        if (quantity <= 1) return;
        dispatch(addItemsToCart(id, newQty));
    };

    const removeCartItem = (id) => {
        dispatch(removeItemsFromCart(id));
        enqueueSnackbar("Product Removed From Cart", { variant: "success" });
    };

    const saveForLaterHandler = (id) => {
        dispatch(saveForLater(id));
        removeCartItem(id);
        enqueueSnackbar("Saved For Later", { variant: "success" });
    };

    const discountPct = getDiscount(price, cuttedPrice);

    return (
        <div className="py-3.5 px-3 sm:px-6 border-b border-gray-200/80 bg-white flex flex-col gap-2.5" key={product}>
            {/* Horizontal Product Details Row (Natural Flipkart Proportions) */}
            <div className="flex gap-3 sm:gap-4 items-start w-full group">
                {/* Product Thumbnail Box */}
                <Link
                    to={`/product/${product}`}
                    className="w-20 h-20 sm:w-28 sm:h-28 shrink-0 flex items-center justify-center p-1 bg-white rounded border border-gray-100 hover:opacity-95 transition-opacity"
                >
                    <img
                        draggable="false"
                        className="h-full w-full object-contain"
                        src={image}
                        alt={name}
                    />
                </Link>

                {/* Info Column */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                        <Link
                            to={`/product/${product}`}
                            className="text-xs sm:text-sm font-medium text-gray-900 leading-snug line-clamp-2 hover:text-[#2874f0] transition-colors block tracking-tight"
                        >
                            {name}
                        </Link>

                        <div className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-1.5 flex-wrap">
                            <span>Seller: {seller || 'Flipkart Assured'}</span>
                            <FAssuredBadge />
                        </div>
                    </div>

                    {/* Price Row */}
                    <div className="flex items-baseline gap-2 mt-1.5">
                        <span className="text-sm sm:text-base font-black text-gray-950">
                            ₹{(price * quantity).toLocaleString()}
                        </span>
                        {cuttedPrice > price && (
                            <span className="text-xs text-gray-400 line-through">
                                ₹{(cuttedPrice * quantity).toLocaleString()}
                            </span>
                        )}
                        {discountPct > 0 && (
                            <span className="text-xs font-bold text-[#388e3c]">
                                {discountPct}% off
                            </span>
                        )}
                    </div>

                    {/* Delivery ETA */}
                    <div className="text-[11px] text-gray-600 mt-1 flex items-center gap-1">
                        <span>Delivery by {getDeliveryDate()}</span>
                        <span className="text-gray-400">|</span>
                        <span className="text-[#388e3c] font-bold">Free</span>
                        <span className="text-gray-400 line-through text-[10px]">₹40</span>
                    </div>
                </div>
            </div>

            {/* Bottom Actions Row: Stepper + Save for Later + Remove */}
            <div className="flex items-center justify-between sm:justify-start gap-4 pt-2 border-t border-gray-100/90">
                {/* Compact Quantity Stepper */}
                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        onClick={() => decreaseQuantity(product, quantity)}
                        disabled={quantity <= 1}
                        className="w-6 h-6 rounded-full border border-gray-300 bg-white hover:bg-gray-100 active:scale-95 flex items-center justify-center text-xs font-bold text-gray-700 disabled:opacity-30 cursor-pointer select-none"
                    >
                        -
                    </button>
                    <span className="w-8 py-0.5 text-center text-xs font-bold text-gray-900 bg-gray-50 border border-gray-200 rounded-xs select-none">
                        {quantity}
                    </span>
                    <button
                        type="button"
                        onClick={() => increaseQuantity(product, quantity, stock)}
                        className="w-6 h-6 rounded-full border border-gray-300 bg-white hover:bg-gray-100 active:scale-95 flex items-center justify-center text-xs font-bold text-gray-700 cursor-pointer select-none"
                    >
                        +
                    </button>
                </div>

                {/* Action Links */}
                {inCart && (
                    <div className="flex items-center gap-3 sm:gap-4 sm:ml-4 text-xs font-extrabold uppercase tracking-wider text-gray-600">
                        <button
                            type="button"
                            onClick={() => saveForLaterHandler(product)}
                            className="hover:text-[#2874f0] transition-colors cursor-pointer text-[11px] sm:text-xs"
                        >
                            Save for later
                        </button>
                        <span className="text-gray-300 select-none">|</span>
                        <button
                            type="button"
                            onClick={() => removeCartItem(product)}
                            className="hover:text-red-600 transition-colors cursor-pointer text-[11px] sm:text-xs"
                        >
                            Remove
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartItem;
