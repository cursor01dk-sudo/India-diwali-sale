import React from 'react';
import { Link } from 'react-router-dom';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { useDispatch, useSelector } from 'react-redux';
import { addToWishlist, removeFromWishlist } from '../../actions/wishlistAction';
import { useSnackbar } from 'notistack';
import FAssuredBadge from '../Layouts/FAssuredBadge';

const Product = ({ _id, name, images, ratings = 4.0, numOfReviews = 0, price, cuttedPrice, tag = 'Best deals', dealText, deliveryDate = 'Delivery by 31st Oct', isAssured = true, isTopSelling = false }) => {
    const dispatch = useDispatch();
    const { enqueueSnackbar } = useSnackbar();

    const { wishlistItems } = useSelector((state) => state.wishlist);
    const itemInWishlist = wishlistItems.some((i) => i.product === _id);

    const addToWishlistHandler = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (itemInWishlist) {
            dispatch(removeFromWishlist(_id));
            enqueueSnackbar("Removed From Wishlist", { variant: "info" });
        } else {
            dispatch(addToWishlist(_id));
            enqueueSnackbar("Added To Wishlist", { variant: "success" });
        }
    };

    const discount = cuttedPrice > price
        ? Math.round(((cuttedPrice - price) / cuttedPrice) * 100)
        : 0;

    const imageUrl = images && images.length > 0
        ? images[0].url
        : '/assets/diwali/p_hero.jpg';

    const isUrgentTag = tag && (tag.toLowerCase().includes('left') || tag.toLowerCase().includes('trending'));

    return (
        <div className="flex flex-col bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-md transition-shadow p-2 relative group">
            {/* Wishlist Button */}
            <button
                onClick={addToWishlistHandler}
                className="absolute top-2.5 right-2.5 z-10 p-1 rounded-full bg-white/80 hover:bg-white text-gray-400 hover:text-red-500 transition-colors shadow-xs"
                title={itemInWishlist ? "In Wishlist" : "Add to Wishlist"}
            >
                {itemInWishlist ? (
                    <FavoriteIcon sx={{ fontSize: 18, color: '#ef4444' }} />
                ) : (
                    <FavoriteBorderIcon sx={{ fontSize: 18 }} />
                )}
            </button>

            {/* Top Selling Priority Badge */}
            {isTopSelling && (
                <div className="absolute top-2.5 left-2.5 z-10 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-[9px] px-1.5 py-0.5 rounded shadow-xs tracking-wider uppercase flex items-center gap-0.5 select-none pointer-events-none">
                    <span>★</span>
                    <span>TOP SELLING</span>
                </div>
            )}

            {/* Product Image */}
            <Link to={`/product/${_id}`} className="w-full aspect-square relative mb-2 bg-white flex items-center justify-center overflow-hidden rounded-lg">
                <img
                    src={imageUrl}
                    alt={name}
                    className="w-full h-full object-contain p-1 group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                />
            </Link>

            {/* Product Title (2-line clamp with ellipsis & zero overlay) */}
            <Link to={`/product/${_id}`} className="block">
                <h3
                    title={name}
                    className="product-title-clamp text-[12px] font-normal text-gray-800 leading-[17px] h-[34px] mb-1.5 overflow-hidden block hover:text-[#2874f0] transition-colors"
                    style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        lineHeight: '17px',
                        maxHeight: '34px',
                        wordBreak: 'break-word'
                    }}
                >
                    {name}
                </h3>
            </Link>

            {/* Ratings & f Assured Badge */}
            <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                <div className="flex items-center gap-0.5 bg-[#388e3c] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm">
                    <span>{Number(ratings).toFixed(1)}</span>
                    <span className="text-[9px]">★</span>
                </div>
                <span className="text-[11px] text-gray-500">
                    ({numOfReviews})
                </span>
                {isAssured && <FAssuredBadge />}
            </div>

            {/* Price & Discount Row */}
            <div className="flex items-baseline gap-1.5 mt-auto">
                {discount > 0 && (
                    <span className="text-[#388e3c] font-bold text-xs flex items-center">
                        <span className="text-[10px]">↓</span>{discount}%
                    </span>
                )}
                {cuttedPrice > price && (
                    <span className="text-gray-400 line-through text-[11px]">
                        ₹{cuttedPrice}
                    </span>
                )}
                <span className="text-gray-900 font-extrabold text-sm">
                    ₹{price}
                </span>
            </div>

            {/* WOW! Deal */}
            <div className="text-[10px] text-gray-600 mt-0.5">
                <span className="font-extrabold text-[#2874f0] tracking-wider italic">WOW! </span>
                <span>{dealText || `₹${price} with offer`}</span>
            </div>

            {/* Tag badge */}
            {tag && (
                <div className="mt-1">
                    <span className={`text-[10px] font-semibold ${isUrgentTag ? 'text-red-600' : 'text-[#388e3c]'
                        }`}>
                        {tag}
                    </span>
                </div>
            )}

            {/* Delivery Date */}
            <div className="text-[10px] text-gray-500 mt-0.5">
                {deliveryDate}
            </div>
        </div>
    );
};

export default Product;
