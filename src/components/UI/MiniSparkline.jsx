import React from 'react';

/**
 * MiniSparkline
 *
 * Apple HIG Monochromatic Mini Sparkline for 7-day or discrete distribution.
 * Quiet, proportional, tabular alignment.
 *
 * @param {Array<{ day?: string, short?: string, qty?: number }>} daily
 * @param {string|null} peakDayShort
 * @param {string} className
 */
export default function MiniSparkline({ daily = [], peakDayShort = null, className = '' }) {
    if (!daily || daily.length === 0) return null;
    const maxQty = Math.max(...daily.map((d) => d.qty || 0), 1);

    return (
        <div className={`flex items-end gap-1.5 h-6 ${className}`}>
            {daily.map((d, i) => {
                const heightPct = Math.max(20, Math.round(((d.qty || 0) / maxQty) * 100));
                const isPeak = (d.qty || 0) > 0 && d.short === peakDayShort;
                const isZero = (d.qty || 0) === 0;

                return (
                    <div
                        key={i}
                        className="flex flex-col items-center gap-1 group relative cursor-default"
                        title={`${d.day || d.short}: ${d.qty || 0} unit${isPeak ? ' (Puncak)' : ''}`}
                    >
                        {/* Vertical Pill Track & Bar */}
                        <div className="w-1.5 sm:w-2 h-3.5 flex items-end justify-center">
                            <div
                                style={{ height: isZero ? '3px' : `${heightPct}%` }}
                                className={`w-full rounded-full transition-all duration-300 ${
                                    isPeak
                                        ? 'bg-slate-800 group-hover:bg-slate-950'
                                        : isZero
                                        ? 'bg-slate-200/80 group-hover:bg-slate-300'
                                        : 'bg-slate-400 group-hover:bg-slate-500'
                                }`}
                            />
                        </div>

                        {/* Quiet, Uniform Axis Day Label */}
                        <span className="text-[9px] font-sans font-medium text-slate-400 group-hover:text-slate-600 transition-colors leading-none">
                            {d.short?.[0]}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}

