import React from 'react';
import { Link } from '@inertiajs/react';
import { ArrowUpRight } from 'lucide-react';
import TactileCard from './TactileCard';
import StatusBadge from './StatusBadge';

const RECESSED_PRESETS = {
    amber: {
        solid: {
            container: 'bg-gradient-to-b from-amber-400 via-amber-400 to-amber-300/90 border border-amber-500/40 border-t-amber-700/60 border-b-white/90 shadow-[inset_0_3px_5px_rgba(146,64,14,0.35),inset_0_1px_2px_rgba(0,0,0,0.20),inset_0_-1.5px_1px_rgba(255,255,255,0.7)]',
            icon: 'text-slate-950 drop-shadow-[0_1px_0_rgba(255,255,255,0.4)]',
        },
        tinted: {
            container: 'bg-gradient-to-b from-amber-100/95 via-amber-50 to-amber-100/60 border border-amber-300/60 border-t-amber-500/50 border-b-white shadow-[inset_0_3px_5px_rgba(180,83,9,0.22),inset_0_1px_2px_rgba(0,0,0,0.10),inset_0_-1.5px_1px_rgba(255,255,255,0.95)]',
            icon: 'text-amber-800 drop-shadow-[0_1px_0_rgba(255,255,255,0.8)]',
        },
    },
    teal: {
        solid: {
            container: 'bg-gradient-to-b from-[#1F6376] to-[#164e5d] border border-teal-700/50 border-t-teal-950/60 border-b-white/40 shadow-[inset_0_3px_5px_rgba(0,0,0,0.40),inset_0_1px_2px_rgba(0,0,0,0.25),inset_0_-1.5px_1px_rgba(255,255,255,0.35)]',
            icon: 'text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)]',
        },
        tinted: {
            container: 'bg-gradient-to-b from-teal-100/95 via-teal-50 to-teal-100/60 border border-teal-300/60 border-t-teal-500/50 border-b-white shadow-[inset_0_3px_5px_rgba(15,76,92,0.22),inset_0_1px_2px_rgba(0,0,0,0.10),inset_0_-1.5px_1px_rgba(255,255,255,0.95)]',
            icon: 'text-teal-900 drop-shadow-[0_1px_0_rgba(255,255,255,0.8)]',
        },
    },
    emerald: {
        solid: {
            container: 'bg-gradient-to-b from-emerald-600 to-emerald-700 border border-emerald-700/50 border-t-emerald-950/60 border-b-white/40 shadow-[inset_0_3px_5px_rgba(0,0,0,0.40),inset_0_1px_2px_rgba(0,0,0,0.25),inset_0_-1.5px_1px_rgba(255,255,255,0.35)]',
            icon: 'text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)]',
        },
        tinted: {
            container: 'bg-gradient-to-b from-emerald-100/95 via-emerald-50 to-emerald-100/60 border border-emerald-300/60 border-t-emerald-500/50 border-b-white shadow-[inset_0_3px_5px_rgba(4,120,87,0.22),inset_0_1px_2px_rgba(0,0,0,0.10),inset_0_-1.5px_1px_rgba(255,255,255,0.95)]',
            icon: 'text-emerald-900 drop-shadow-[0_1px_0_rgba(255,255,255,0.8)]',
        },
    },
    rose: {
        solid: {
            container: 'bg-gradient-to-b from-rose-500 to-rose-600 border border-rose-700/50 border-t-rose-950/60 border-b-white/40 shadow-[inset_0_3px_5px_rgba(0,0,0,0.40),inset_0_1px_2px_rgba(0,0,0,0.25),inset_0_-1.5px_1px_rgba(255,255,255,0.35)]',
            icon: 'text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)]',
        },
        tinted: {
            container: 'bg-gradient-to-b from-rose-100/95 via-rose-50 to-rose-100/60 border border-rose-300/60 border-t-rose-500/50 border-b-white shadow-[inset_0_3px_5px_rgba(190,18,60,0.22),inset_0_1px_2px_rgba(0,0,0,0.10),inset_0_-1.5px_1px_rgba(255,255,255,0.95)]',
            icon: 'text-rose-900 drop-shadow-[0_1px_0_rgba(255,255,255,0.8)]',
        },
    },
    blue: {
        solid: {
            container: 'bg-gradient-to-b from-blue-500 to-blue-600 border border-blue-700/50 border-t-blue-950/60 border-b-white/40 shadow-[inset_0_3px_5px_rgba(0,0,0,0.40),inset_0_1px_2px_rgba(0,0,0,0.25),inset_0_-1.5px_1px_rgba(255,255,255,0.35)]',
            icon: 'text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)]',
        },
        tinted: {
            container: 'bg-gradient-to-b from-blue-100/95 via-blue-50 to-blue-100/60 border border-blue-300/60 border-t-blue-500/50 border-b-white shadow-[inset_0_3px_5px_rgba(29,78,216,0.22),inset_0_1px_2px_rgba(0,0,0,0.10),inset_0_-1.5px_1px_rgba(255,255,255,0.95)]',
            icon: 'text-blue-900 drop-shadow-[0_1px_0_rgba(255,255,255,0.8)]',
        },
    },
    slate: {
        solid: {
            container: 'bg-gradient-to-b from-slate-600 to-slate-700 border border-slate-700/50 border-t-slate-900/60 border-b-white/40 shadow-[inset_0_3px_5px_rgba(0,0,0,0.40),inset_0_1px_2px_rgba(0,0,0,0.25),inset_0_-1.5px_1px_rgba(255,255,255,0.35)]',
            icon: 'text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)]',
        },
        tinted: {
            container: 'bg-gradient-to-b from-slate-200/90 via-slate-100 to-slate-200/60 border border-slate-300/60 border-t-slate-400/50 border-b-white shadow-[inset_0_3px_5px_rgba(0,0,0,0.16),inset_0_1px_2px_rgba(0,0,0,0.08),inset_0_-1.5px_1px_rgba(255,255,255,0.95)]',
            icon: 'text-slate-800 drop-shadow-[0_1px_0_rgba(255,255,255,0.8)]',
        },
    },
};

/**
 * TactileMetricCard
 * 
 * Reusable KPI widget with physical depth, top specular highlight,
 * optional embossed icon ring or recessed well, large tabular bold numbers, and tactile link button.
 */
export default function TactileMetricCard({
    title,
    value,
    subtitle,
    icon: Icon,
    iconColor,
    iconBg,
    iconVariant = 'raised', // 'raised' | 'recessed'
    iconTone = 'slate', // 'amber' | 'teal' | 'emerald' | 'rose' | 'blue' | 'slate'
    iconDepth = 'solid', // 'solid' | 'tinted'
    href,
    badge,
    badgeColor = 'text-slate-700 bg-white border-slate-200/60',
    variant = 'sunken', // 'sunken' | 'white'
    className = '',
}) {
    const isRecessed = iconVariant === 'recessed';
    const preset = isRecessed
        ? RECESSED_PRESETS[iconTone]?.[iconDepth] || RECESSED_PRESETS.amber.solid
        : null;

    const resolvedIconBg = iconBg || (isRecessed ? preset?.container : 'bg-white border-slate-200/70');
    const resolvedIconColor = iconColor || (isRecessed ? preset?.icon : 'text-slate-600');
    const defaultShadow = isRecessed
        ? ''
        : 'shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_2px_4px_rgba(0,0,0,0.04)] border';

    return (
        <TactileCard
            variant={variant}
            rounded="squircle"
            className={`p-5 sm:p-6 flex flex-col justify-between ${className}`}
        >
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2.5">
                    {Icon && (
                        <div
                            className={`w-9.5 h-9.5 rounded-2xl flex items-center justify-center shrink-0 transition-all select-none ${defaultShadow} ${resolvedIconBg} ${resolvedIconColor}`}
                        >
                            <Icon className="w-4 h-4" />
                        </div>
                    )}
                    <span className="text-xs sm:text-sm text-slate-500 font-semibold leading-tight whitespace-pre-line">
                        {title}
                    </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                    {badge && (
                        React.isValidElement(badge) ? (
                            badge
                        ) : (
                            <StatusBadge status={badge} dot={true} />
                        )
                    )}

                    {href && (
                        <Link
                            href={href}
                            className="w-8 h-8 rounded-full bg-white hover:bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-800 transition-all shadow-[0_1.5px_4px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.9)] border border-slate-200/70 active:scale-95"
                            title={`Lihat ${typeof title === 'string' ? title.replace('\n', ' ') : ''}`}
                        >
                            <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                    )}
                </div>
            </div>

            <div>
                <h4 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight font-mono">
                    {value}
                </h4>
                {subtitle && (
                    <p className="text-xs sm:text-[13px] text-slate-500 mt-1 font-medium leading-relaxed">
                        {subtitle}
                    </p>
                )}
            </div>
        </TactileCard>
    );
}

