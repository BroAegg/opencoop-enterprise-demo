import React, { useRef, useEffect, useCallback, useState } from 'react';

export default function WheelPicker({ options, value, onChange, placeholder, className = '' }) {
    const containerRef = useRef(null);
    const itemHeight = 40; // in px
    
    const displayOptions = placeholder 
        ? [{ value: '', label: placeholder }, ...options] 
        : options;

    const [activeIndex, setActiveIndex] = useState(0);

    // Initial scroll on mount or programmatic change
    useEffect(() => {
        if (!containerRef.current) return;
        const index = displayOptions.findIndex(o => o.value === value);
        const targetIndex = index !== -1 ? index : 0;
        
        const expectedScrollTop = targetIndex * itemHeight;
        // Only force scroll if it's far from current (prevents killing momentum scroll)
        if (Math.abs(containerRef.current.scrollTop - expectedScrollTop) > itemHeight / 2) {
            containerRef.current.scrollTop = expectedScrollTop;
        }
        setActiveIndex(targetIndex);
    }, [value, displayOptions]);

    const handleScroll = useCallback(() => {
        if (!containerRef.current) return;
        const scrollTop = containerRef.current.scrollTop;
        const index = Math.round(scrollTop / itemHeight);
        const validIndex = Math.max(0, Math.min(index, displayOptions.length - 1));
        
        if (activeIndex !== validIndex) {
            setActiveIndex(validIndex);
            const selectedValue = displayOptions[validIndex].value;
            // Only fire onChange if it actually changed
            if (selectedValue !== value) {
                onChange(selectedValue);
            }
        }
    }, [displayOptions, value, onChange, activeIndex]);

    return (
        <div className={`relative h-[120px] w-full overflow-hidden bg-white rounded-xl border border-slate-200 ${className}`}>
            {/* Highlight band */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[40px] bg-slate-100/50 border-y border-slate-200/60 pointer-events-none" />
            
            <div 
                ref={containerRef}
                className="h-full w-full overflow-y-scroll snap-y snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                onScroll={handleScroll}
            >
                {/* Spacer top */}
                <div style={{ height: '40px' }} className="shrink-0" />
                
                {displayOptions.map((opt, i) => {
                    const isSelected = activeIndex === i;
                    return (
                        <div 
                            key={i}
                            className={`h-[40px] snap-center flex items-center justify-center transition-all duration-200 select-none ${
                                isSelected ? 'text-primary font-bold text-[15px]' : 'text-slate-400 font-medium text-[13px] opacity-70'
                            }`}
                        >
                            {opt.label}
                        </div>
                    );
                })}
                
                {/* Spacer bottom */}
                <div style={{ height: '40px' }} className="shrink-0" />
            </div>
        </div>
    );
}

