import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const HeroDiwaliBanner = () => {
    const navigate = useNavigate();

    // 10 minutes countdown timer that ticks down every second
    const [timeLeft, setTimeLeft] = useState(597); // 9 minutes 57 seconds

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 600));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const minutes = String(Math.floor(timeLeft / 60)).padStart(2, '0');
    const seconds = String(timeLeft % 60).padStart(2, '0');

    return (
        <div className="w-full bg-white rounded-2xl shadow-xs overflow-hidden border border-orange-100 my-2">
            {/* Banner image */}
            <div 
                className="w-full relative cursor-pointer overflow-hidden aspect-[360/174] bg-[#b91c1c]"
                onClick={() => navigate('/products?keyword=diya')}
            >
                <img
                    src="/assets/diwali/banner.jpg"
                    alt="Flipkart Big Bang Diwali Sale is Live"
                    className="w-full h-full object-cover object-center"
                    loading="eager"
                />
            </div>

            {/* Sale Live strip */}
            <div className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-orange-50 via-white to-orange-50 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-gray-800">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="tracking-tight text-gray-900">SALE LIVE</span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-600 font-normal">Ends in</span>
                    <span className="text-red-600 font-extrabold tracking-wider">{minutes}:{seconds}</span>
                </div>

                <button
                    onClick={() => navigate('/products?keyword=diya')}
                    className="bg-[#2874f0] hover:bg-blue-700 text-white font-bold text-[11px] px-3 py-1 rounded-full flex items-center gap-1 shadow-xs transition-colors"
                >
                    <span>Shop Now</span>
                    <span>&gt;</span>
                </button>
            </div>
        </div>
    );
};

export default HeroDiwaliBanner;

