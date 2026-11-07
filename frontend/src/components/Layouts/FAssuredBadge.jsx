import React from 'react';

const FAssuredBadge = ({ size = 'sm' }) => {
    return (
        <span className="inline-flex items-center gap-0.5 select-none align-middle">
            <span className="bg-[#2874f0] text-[#ffe500] font-black italic rounded-full text-[9px] px-1 py-[1px] leading-none flex items-center justify-center shadow-xs">
                f
            </span>
            <span className="text-[#2874f0] italic font-bold text-[10px] tracking-tight leading-none">
                Assured
            </span>
        </span>
    );
};

export default FAssuredBadge;

