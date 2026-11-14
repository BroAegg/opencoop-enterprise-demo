import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import TactileCard from '@/Components/UI/TactileCard';
import StatusBadge from '@/Components/UI/StatusBadge';
import RadialGaugeDial from './Radial/RadialGaugeDial';

/**
 * TactileRadialGauge
 * 
 * Apple HIG tactile circular dial and speedometer meter with physical recessed track,
 * specular 3D stroke highlight, physical thumb indicator cap, and rich center telemetry.
 * Supports:
 * - Type: 'ring' (360° circular ring) or 'arch' (240° speedometer gauge)
 * - Single gauge or concentric multi-rings
 * - Embedded standalone or wrapped as an executive card
 */
export default function TactileRadialGauge({
    value = 0,
    max = 100,
    type = 'ring', // 'ring' | 'arch'
    size = 'md', // 'sm' | 'md' | 'lg'
    color = 'teal', // 'teal' | 'emerald' | 'amber' | 'rose'
    label,
    sublabel,
    valuePrefix = '',
    valueSuffix = '%',
    showHandle = true,
    rings = null, // Array of { value, max, color, label } for concentric rings
    title,
    subtitle,
    badge,
    card = false,
    href,
    className = '',
}) {
    const isMultiRing = Array.isArray(rings) && rings.length > 0;

    const sizeMap = {
        sm: { box: 140, radius: 52, stroke: 10, handleR: 6, textVal: 'text-lg', textSub: 'text-[10px]' },
        md: { box: 180, radius: 68, stroke: 14, handleR: 8, textVal: 'text-2xl', textSub: 'text-xs' },
        lg: { box: 220, radius: 84, stroke: 18, handleR: 10, textVal: 'text-3xl', textSub: 'text-sm' },
    };

    const cfg = sizeMap[size] || sizeMap.md;
    const center = cfg.box / 2;

    const colorMap = {
        teal: { stroke: '#1F6376', gradient: ['#164e5d', '#2dd4bf'], text: 'text-[#1F6376]', dot: 'bg-[#1F6376]' },
        emerald: { stroke: '#059669', gradient: ['#047857', '#34d399'], text: 'text-emerald-700', dot: 'bg-emerald-600' },
        amber: { stroke: '#f59e0b', gradient: ['#d97706', '#fbbf24'], text: 'text-amber-700', dot: 'bg-amber-500' },
        rose: { stroke: '#e11d48', gradient: ['#be123c', '#f43f5e'], text: 'text-rose-700', dot: 'bg-rose-500' },
        slate: { stroke: '#64748b', gradient: ['#475569', '#94a3b8'], text: 'text-slate-600', dot: 'bg-slate-400' },
    };

    const activeColor = colorMap[color] || colorMap.teal;
    const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;

    const dialContent = (
        <div className="relative flex flex-col items-center justify-center">
            <div className="relative flex items-center justify-center">
                <RadialGaugeDial
                    type={type}
                    pct={pct}
                    color={color}
                    activeColor={activeColor}
                    cfg={cfg}
                    center={center}
                    showHandle={showHandle}
                    isMultiRing={isMultiRing}
                    rings={rings}
                    colorMap={colorMap}
                />

                {/* Center Metrics Telemetry */}
                {!isMultiRing ? (
                    <div className={`absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-2 ${type === 'arch' ? 'pb-3' : ''}`}>
                        <span className={`${cfg.textVal} font-bold font-mono tracking-tight text-slate-900`}>
                            {valuePrefix}{typeof value === 'number' && Number.isInteger(value) ? value : value.toFixed(1)}{valueSuffix}
                        </span>
                        {label && (
                            <span className={`${cfg.textSub} font-semibold text-slate-500 uppercase tracking-wider mt-0.5`}>
                                {label}
                            </span>
                        )}
                        {sublabel && (
                            <span className="text-[10px] font-mono text-slate-400 mt-0.5">
                                {sublabel}
                            </span>
                        )}
                    </div>
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                        <span className="text-xl font-bold font-mono text-slate-900">{rings.length}</span>
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Rings</span>
                    </div>
                )}
            </div>

            {/* Multi-Ring Legend */}
            {isMultiRing && (
                <div className="flex flex-wrap items-center justify-center gap-3 mt-4 text-xs font-semibold">
                    {rings.map((r, idx) => {
                        const rColorDef = colorMap[r.color] || colorMap.teal;
                        const rPct = (r.max || 100) > 0 ? Math.round((r.value / (r.max || 100)) * 100) : 0;
                        return (
                            <div key={idx} className="flex items-center gap-1.5">
                                <span className={`w-2 h-2 rounded-full ${rColorDef.dot}`} />
                                <span className="text-slate-700">{r.label}:</span>
                                <span className="font-mono font-bold text-slate-900">{rPct}%</span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );

    if (card || title) {
        return (
            <TactileCard variant="white" rounded="3xl" className={`p-5 sm:p-6 flex flex-col justify-between ${className}`}>
                <div className="flex items-start justify-between pb-3 mb-4 border-b border-slate-100">
                    <div>
                        <h3 className="font-bold text-slate-900 text-sm sm:text-base tracking-tight">{title}</h3>
                        {subtitle && <p className="text-xs text-slate-500 font-medium mt-0.5">{subtitle}</p>}
                    </div>

                    <div className="flex items-center gap-2">
                        {badge && (
                            React.isValidElement(badge) ? badge : <StatusBadge status={badge} dot={true} />
                        )}
                        {href && (
                            <a
                                href={href}
                                className="w-8 h-8 rounded-full bg-white hover:bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-800 transition-all shadow-[0_1.5px_4px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.9)] border border-slate-200/70 active:scale-95 shrink-0"
                            >
                                <ArrowUpRight className="w-4 h-4 text-slate-500 hover:text-slate-900" />
                            </a>
                        )}
                    </div>
                </div>

                <div className="my-2 flex justify-center">{dialContent}</div>
            </TactileCard>
        );
    }

    return dialContent;
}

