import React from 'react';
import { useSnackbar } from 'notistack';
import { useDispatch } from 'react-redux';
import { addItemsToCart } from '../../actions/cartAction';
import { removeFromSaveForLater } from '../../actions/saveForLaterAction';
import { getDiscount } from '../../utils/functions';
import { Link } from 'react-router-dom';

const SaveForLaterItem = ({ product, name, seller, price, cuttedPrice, image, stock, quantity }) => {
    const dispatch = useDispatch();
    const { enqueueSnackbar } = useSnackbar();

    const removeFromSaveForLaterHandler = (id) => {
        dispatch(removeFromSaveForLater(id));
        enqueueSnackbar("Removed From Save For Later", { variant: "success" });
    };

    const moveToCartHandler = (id, quantity) => {
        dispatch(addItemsToCart(id, quantity));
        removeFromSaveForLaterHandler(id);
        enqueueSnackbar("Product Added To Cart", { variant: "success" });
    };

    const discountPct = getDiscount(price, cuttedPrice);

    return (
        <div className="py-3.5 px-3 sm:px-6 border-b border-gray-200/80 bg-white flex flex-col gap-2.5" key={product}>
            <div className="flex gap-3 sm:gap-4 items-start w-full group">
                <Link
                    to={`/product/${product}`}
                    className="w-20 h-20 sm:w-28 sm:h-28 shrink-0 flex items-center justify-center p-1 bg-white rounded border border-gray-100 hover:opacity-95 transition-opacity"
                >
                    <img draggable="false" className="h-full w-full object-contain" src={image} alt={name} />
                </Link>

                <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                        <Link
                            to={`/product/${product}`}
                            className="text-xs sm:text-sm font-medium text-gray-900 leading-snug line-clamp-2 hover:text-[#2874f0] transition-colors block tracking-tight"
                        >
                            {name}
                        </Link>
                        <span className="text-[11px] text-gray-500 mt-0.5 block">Seller: {seller || 'Flipkart Assured'}</span>
                    </div>

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
                </div>
            </div>

            <div className="flex items-center justify-start gap-4 pt-2 border-t border-gray-100 text-xs font-extrabold uppercase tracking-wider text-gray-600">
                <button
                    type="button"
                    onClick={() => moveToCartHandler(product, quantity)}
                    className="hover:text-[#2874f0] transition-colors cursor-pointer text-[11px] sm:text-xs"
                >
                    Move to cart
                </button>
                <span className="text-gray-300 select-none">|</span>
                <button
                    type="button"
                    onClick={() => removeFromSaveForLaterHandler(product)}
                    className="hover:text-red-600 transition-colors cursor-pointer text-[11px] sm:text-xs"
                >
                    Remove
                </button>
            </div>
        </div>
    );
};

export default SaveForLaterItem;
