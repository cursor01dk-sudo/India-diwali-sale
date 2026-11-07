import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CheckIcon from '@mui/icons-material/Check';
import MetaData from '../Layouts/MetaData';

const OrderSuccess = () => {
    const navigate = useNavigate();

    // Prevent going back to payment or checkout - redirect directly to Home
    useEffect(() => {
        window.history.pushState(null, document.title, window.location.href);

        const handlePopState = () => {
            navigate('/', { replace: true });
        };

        window.addEventListener('popstate', handlePopState);
        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, [navigate]);

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-12 text-center">
            <MetaData title="Order Placed Successfully! | Flipkart" />

            <div className="max-w-sm mx-auto flex flex-col items-center animate-fadeIn">
                {/* Soft Green Circle with Checkmark */}
                <div className="w-20 h-20 rounded-full bg-[#e8f5e9] flex items-center justify-center mb-6 shadow-xs">
                    <div className="w-12 h-12 rounded-full bg-[#c8e6c9] flex items-center justify-center text-[#2e7d32]">
                        <CheckIcon sx={{ fontSize: 32, strokeWidth: 2, stroke: '#2e7d32' }} />
                    </div>
                </div>

                {/* Heading */}
                <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight mb-2">
                    Order Placed Successfully!
                </h1>

                {/* Subtitle */}
                <p className="text-xs sm:text-sm text-gray-500 leading-relaxed mb-8 max-w-xs">
                    Thank you for your purchase. We have received your order details and are preparing it for shipment.
                </p>

                {/* Orange Action Button */}
                <button
                    onClick={() => navigate('/', { replace: true })}
                    className="w-full py-3.5 px-6 rounded-xl bg-[#fb641b] hover:bg-[#e05615] text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer"
                >
                    CONTINUE SHOPPING
                </button>
            </div>
        </div>
    );
};

export default OrderSuccess;
