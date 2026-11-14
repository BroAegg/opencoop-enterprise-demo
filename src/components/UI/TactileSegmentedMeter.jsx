import React, { useState } from 'react';

/**
 * TactileSegmentedMeter
 * 
 * Multi-variable Apple HIG tactile progress meter with a recessed track groove,
 * specular enamel segment highlights, crisp white separators, and interactive telemetry.
 * Supports N variables (e.g. Member vs Non-Member, Store vs Consignment, Asset Compositions).
 */
export default function TactileSegmentedMeter({
    segments = [],
    total = null,
    height = 'h-3.5 sm:h-4',
    showLegend = true,
    legendPosition = 'bottom',
    className = '',
}) {
    const [hoveredId, setHoveredId] = useState(null);

    // Calculate total if not explicitly provided
    const calculatedTotal = total ?? segments.reduce((sum, s) => sum + (Number(s.value) || 0), 0);

    // Prepare segments with computed percentage
    const computedSegments = segments.map((seg, idx) => {
        const rawVal = Number(seg.value) || 0;
        const pct = calculatedTotal > 0 ? (rawVal / calculatedTotal) * 100 : 0;
        return {
            ...seg,
            id: seg.id || `seg-${idx}`,
            pct: Math.max(0, pct),
            displayPct: pct > 0 && pct < 1 ? pct.toFixed(1) : Math.round(pct),
        };
    });

    const renderLegend = () => {
        if (!showLegend || computedSegments.length === 0) return null;

        return (
            <div className="flex flex-wrap items-center justify-between gap-2.5 text-xs">
                {computedSegments.map((seg) => {
                    const isHovered = hoveredId === seg.id;
                    const isAnyHovered = hoveredId !== null;
                    const dimClass = isAnyHovered && !isHovered ? 'opacity-40' : 'opacity-100';

                    return (
                        <div
                            key={seg.id}
                            onMouseEnter={() => setHoveredId(seg.id)}
                            onMouseLeave={() => setHoveredId(null)}
                            className={`flex items-center gap-1.5 transition-opacity duration-200 cursor-pointer ${dimClass}`}
                        >
                            <span 
                                className={`w-2 h-2 rounded-full shrink-0 ${seg.dotColor || 'bg-slate-700'}`} 
                            />
                            <span className="font-semibold text-slate-700 text-[11px] sm:text-xs">
                                {seg.label}
                            </span>
                            <span className="font-mono font-bold text-slate-900 text-[11px] sm:text-xs">
                                ({seg.displayPct}%)
                            </span>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className={`space-y-2 ${className}`}>
            {legendPosition === 'top' && renderLegend()}

            {/* Recessed Groove Track */}
            <div
                className={`w-full ${height} bg-slate-100 rounded-full p-0.5 border border-slate-200/90 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06),inset_0_-1px_0_white] flex overflow-hidden relative`}
            >
                {computedSegments.map((seg, idx) => {
                    if (seg.pct <= 0) return null;

                    const isHovered = hoveredId === seg.id;
                    const isAnyHovered = hoveredId !== null;
                    const isFirst = idx === 0;
                    const isLast = idx === computedSegments.length - 1;

                    return (
                        <div
                            key={seg.id}
                            onMouseEnter={() => setHoveredId(seg.id)}
                            onMouseLeave={() => setHoveredId(null)}
                            style={{ 
                                width: `${seg.pct}%`,
                                minWidth: seg.pct > 0 ? '6px' : '0px'
                            }}
                            className={`h-full transition-all duration-700 ease-out relative shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] ${
                                seg.color || 'bg-slate-700'
                            } ${!isLast ? 'border-r-2 border-white/95' : ''} ${
                                isFirst ? 'rounded-l-full' : ''
                            } ${
                                isLast ? 'rounded-r-full' : ''
                            } ${
                                isAnyHovered && !isHovered ? 'opacity-40' : 'opacity-100'
                            } ${isHovered ? 'brightness-110 z-10' : ''}`}
                            title={`${seg.label}: ${seg.displayPct}%`}
                        />
                    );
                })}
            </div>

            {legendPosition === 'bottom' && renderLegend()}
        </div>
    );
}

