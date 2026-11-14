import React from 'react';

/**
 * TactileCard
 * 
 * Apple HIG-inspired tactile card surface with physical depth,
 * specular top highlights, subtle ambient elevation, and squircle corners.
 */
export default function TactileCard({
    children,
    variant = 'white', // 'white' | 'sunken' | 'teal' | 'amber' | 'hero'
    rounded = 'squircle', // '2xl' | '3xl' | 'squircle'
    rings = false,
    notch = false,
    overflow = 'hidden', // 'hidden' | 'visible'
    className = '',
    ...props
}) {
    const roundedClass = {
        '2xl': 'rounded-2xl',
        '3xl': 'rounded-3xl',
        'squircle': 'rounded-3xl sm:rounded-[2rem]',
    }[rounded] || 'rounded-3xl sm:rounded-[2rem]';

    const variantStyles = {
        white: 'bg-white border border-slate-200/75 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_4px_20px_-4px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.02)] text-slate-900',
        sunken: 'bg-[#F2F3F5] border border-slate-200/60 shadow-[inset_0_2px_5px_rgba(0,0,0,0.04),inset_0_-1px_0_rgba(255,255,255,0.6)] text-slate-900',
        teal: 'bg-gradient-to-br from-[#28849b] via-[#1F6376] to-[#164e5d] text-white border border-teal-500/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_12px_28px_-6px_rgba(31,99,118,0.35)]',
        amber: 'bg-gradient-to-br from-[#fbbf24] via-[#F39E20] to-[#d97706] text-white border border-amber-400/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_12px_28px_-6px_rgba(243,158,32,0.35)]',
        hero: 'bg-gradient-to-b from-white to-[#F8F9FA] border border-white/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_6px_24px_-4px_rgba(0,0,0,0.05)] text-slate-900',
    }[variant] || '';

    const overflowClass = className.includes('overflow-')
        ? ''
        : (overflow === 'visible' ? 'overflow-visible' : 'overflow-hidden');

    return (
        <div
            className={`relative ${overflowClass} transition-all duration-200 ${roundedClass} ${variantStyles} ${className}`}
            {...props}
        >
            {/* Notch Connection Simulation */}
            {notch && (
                <div className="absolute -top-3.5 right-[28%] w-9 h-9 bg-inherit rounded-full border-[5px] border-[#F4F5F7] shadow-sm flex items-center justify-center z-30 hidden lg:flex">
                    <svg className="w-3.5 h-3.5 text-white/90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                </div>
            )}

            {/* Circular pattern depth rings */}
            {rings && variant === 'teal' && (
                <>
                    <div className="absolute -right-8 top-1/2 -translate-y-1/2 w-44 h-44 border border-white/10 rounded-full pointer-events-none"></div>
                    <div className="absolute -right-14 top-1/2 -translate-y-1/2 w-44 h-44 border border-white/10 rounded-full pointer-events-none"></div>
                    <div className="absolute -right-20 top-1/2 -translate-y-1/2 w-44 h-44 border border-white/10 rounded-full pointer-events-none"></div>
                </>
            )}

            {rings && variant === 'amber' && (
                <>
                    <div className="absolute -right-10 -top-10 w-48 h-48 border border-white/20 rounded-full pointer-events-none"></div>
                    <div className="absolute -right-5 -top-5 w-48 h-48 border border-white/20 rounded-full pointer-events-none"></div>
                    <div className="absolute right-0 top-0 w-48 h-48 border border-white/20 rounded-full pointer-events-none"></div>
                </>
            )}

            {children}
        </div>
    );
}

