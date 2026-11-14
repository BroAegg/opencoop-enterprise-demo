import React from 'react';
import TactileCard from './TactileCard';

/**
 * TactileHeroGreetingCard
 * Apple HIG-inspired executive hero card with fluid, fully responsive ambient corner gradients.
 * The top-right azure glow and bottom-left amber glow adapt responsively at any viewport width.
 */
export default function TactileHeroGreetingCard({
    name = '',
    greeting = '',
    title = 'berikut performa Koperasi.',
    metricLabel,
    metricValue,
    growth,
    growthLabel,
    children,
    topGlowClass = 'from-sky-100/80 via-blue-50/30 to-transparent',
    bottomGlowClass = 'from-amber-100/85 via-amber-50/35 to-transparent',
    className = '',
    rounded = 'squircle',
}) {
    const isPositiveGrowth = growth !== undefined && growth !== null && Number(growth) >= 0;

    const formattedValue = typeof metricValue === 'number'
        ? new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(metricValue)
        : metricValue;

    const greetingHeading = greeting || (name ? `Hi ${name},` : 'Selamat Datang,');

    return (
        <TactileCard
            variant="hero"
            rounded={rounded}
            className={`relative p-6 sm:p-8 flex flex-col justify-between group h-full overflow-hidden select-none ${className}`}
        >
            {/* 1. Fluid Relative Radial Gradient Mesh (Never disappears at small card sizes) */}
            <div
                className={`absolute -top-6 -right-6 w-3/5 h-3/5 max-w-[240px] max-h-[240px] bg-radial ${topGlowClass} rounded-full blur-2xl pointer-events-none transition-all duration-300`}
            />
            <div
                className={`absolute -bottom-6 -left-6 w-3/5 h-3/5 max-w-[260px] max-h-[260px] bg-radial ${bottomGlowClass} rounded-full blur-2xl pointer-events-none transition-all duration-300`}
            />

            {/* 2. Secondary soft ambient glow orbs for high-fidelity physical depth */}
            <div className="absolute top-0 right-0 w-36 h-36 bg-blue-100/40 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-44 h-44 bg-amber-100/50 rounded-full blur-3xl pointer-events-none" />

            {/* 3. Foreground Content Layer */}
            <div className="relative z-10 h-full flex flex-col justify-between gap-6">
                {/* Header Greeting */}
                <div>
                    <h1 className="text-xl sm:text-2xl lg:text-2xl xl:text-3xl font-semibold text-slate-900 tracking-tight leading-[1.25] mb-1">
                        {greetingHeading}
                        {title && (
                            <>
                                <br />
                                <span>{title}</span>
                            </>
                        )}
                    </h1>
                </div>

                {/* Flexible Middle Content Slot (Optional, without bar chart by default) */}
                {children && (
                    <div className="my-auto py-2">
                        {children}
                    </div>
                )}

                {/* Footer Metric Section */}
                {(metricLabel || metricValue !== undefined) && (
                    <div className="pt-2">
                        {metricLabel && (
                            <p className="text-slate-500 text-xs sm:text-sm font-medium mb-1">
                                {metricLabel}
                            </p>
                        )}

                        <div className="flex items-baseline gap-2.5 flex-wrap">
                            {formattedValue && (
                                <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-mono">
                                    {formattedValue}
                                </span>
                            )}

                            {growth !== undefined && growth !== null && (
                                <span
                                    className={`text-xs px-2.5 py-0.5 rounded-full font-bold shadow-2xs font-mono transition-transform group-hover:scale-105 ${
                                        isPositiveGrowth
                                            ? 'bg-emerald-600 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_1.5px_3px_rgba(5,150,105,0.3)]'
                                            : 'bg-rose-600 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_1.5px_3px_rgba(225,29,72,0.3)]'
                                    }`}
                                >
                                    {isPositiveGrowth ? '+' : ''}{growth}%
                                </span>
                            )}
                        </div>

                        {growthLabel && (
                            <p className="text-slate-400 text-[11px] sm:text-xs mt-1 font-medium">
                                {growthLabel}
                            </p>
                        )}
                    </div>
                )}
            </div>
        </TactileCard>
    );
}

