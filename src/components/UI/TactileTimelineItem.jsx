import React from 'react';
import { Link } from '@inertiajs/react';
import { ArrowUpRight } from 'lucide-react';
import StatusBadge from '@/Components/UI/StatusBadge';

/**
 * TactileTimelineItem
 * 
 * Individual node and card for TactileTimelineFeed.
 * Features:
 * - 3D tactile node bead with physical specular highlight & live pulse
 * - Vertical connecting recessed track groove
 * - Squircle micro-card with hover elevation
 * - Monospace financial delta tag & contextual metadata
 */
export default function TactileTimelineItem({
    title,
    description,
    timestamp,
    actor,
    actorRole,
    value,
    valueType = 'positive', // 'positive' | 'negative' | 'neutral'
    badge,
    icon: Icon,
    nodeColor = 'teal', // 'teal' | 'emerald' | 'amber' | 'rose' | 'slate'
    live = false,
    href,
    onClick,
    isLast = false,
    children,
    className = '',
}) {
    const nodeColorMap = {
        teal: {
            bead: 'bg-[#1F6376] text-white border-teal-600/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_2px_4px_rgba(31,99,118,0.3)]',
            pulse: 'bg-[#1F6376]',
        },
        emerald: {
            bead: 'bg-emerald-600 text-white border-emerald-500/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_2px_4px_rgba(5,150,105,0.3)]',
            pulse: 'bg-emerald-500',
        },
        amber: {
            bead: 'bg-amber-400 text-slate-950 border-amber-500/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_2px_4px_rgba(245,158,11,0.3)]',
            pulse: 'bg-amber-400',
        },
        rose: {
            bead: 'bg-rose-600 text-white border-rose-500/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_2px_4px_rgba(225,29,72,0.3)]',
            pulse: 'bg-rose-500',
        },
        slate: {
            bead: 'bg-slate-700 text-white border-slate-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_2px_4px_rgba(0,0,0,0.2)]',
            pulse: 'bg-slate-500',
        },
    };

    const activeNode = nodeColorMap[nodeColor] || nodeColorMap.teal;
    const isInteractive = Boolean(href || onClick);

    const cardContent = (
        <div className={`p-3 sm:p-4 rounded-2xl bg-white border border-slate-200/80 shadow-[0_1.5px_3px_rgba(0,0,0,0.03),inset_0_1px_0_white] transition-all duration-200 ${
            isInteractive ? 'hover:border-slate-300 hover:shadow-xs group cursor-pointer active:scale-[0.99]' : ''
        }`}>
            {/* Primary Row: Title (or Actor) & Net Financial Value */}
            <div className="flex items-start justify-between gap-2.5 mb-1.5">
                <div className="min-w-0 flex-1">
                    {title ? (
                        <h5 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight leading-snug">
                            {title}
                        </h5>
                    ) : actor ? (
                        <span className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight block">
                            {actor}
                        </span>
                    ) : null}
                </div>

                <div className="flex items-center gap-1.5 shrink-0 text-right">
                    {value && (
                        <span className={`text-xs sm:text-sm font-black font-mono tracking-tight ${
                            valueType === 'positive' ? 'text-emerald-700' : valueType === 'negative' ? 'text-rose-700' : 'text-slate-900'
                        }`}>
                            {value}
                        </span>
                    )}
                    {isInteractive && (
                        <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-800 transition-colors shrink-0" />
                    )}
                </div>
            </div>

            {/* Context Meta Row: Badges, Actors, Roles, and Timestamp */}
            {(Boolean(actor && title) || actorRole || badge || timestamp) && (
                <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1.5 text-xs">
                    <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                        {actor && title && (
                            <span className="text-[11px] font-bold text-slate-700 font-mono tracking-tight">
                                {actor}
                            </span>
                        )}
                        {actorRole && (
                            <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200/60">
                                {actorRole}
                            </span>
                        )}
                        {badge && (
                            <div>
                                {React.isValidElement(badge) ? badge : <StatusBadge status={badge} dot={true} />}
                            </div>
                        )}
                    </div>

                    {timestamp && (
                        <span className="text-[10px] sm:text-[11px] font-mono text-slate-400 ml-auto shrink-0">
                            {timestamp}
                        </span>
                    )}
                </div>
            )}

            {/* Event Description */}
            {description && (
                <p className="text-xs text-slate-500 leading-relaxed mt-1.5">
                    {description}
                </p>
            )}

            {/* Custom Content / Children */}
            {children && (
                <div className="mt-3">
                    {children}
                </div>
            )}
        </div>
    );

    return (
        <div className={`relative flex items-start gap-3 sm:gap-4 ${!isLast ? 'pb-6' : ''} ${className}`}>
            {/* Vertical Connecting Track Groove */}
            {!isLast && (
                <div className="absolute left-[13px] sm:left-[15px] top-7 bottom-0 w-0.5 bg-slate-200/80 shadow-[inset_0_1px_1px_rgba(0,0,0,0.06),0_1px_0_white]" />
            )}

            {/* 3D Physical Node Bead */}
            <div className="relative shrink-0 z-10 pt-0.5">
                <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border ${activeNode.bead}`}>
                    {Icon ? (
                        <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    ) : (
                        <div className="w-2 h-2 rounded-full bg-white shadow-2xs" />
                    )}
                </div>

                {/* Ambient Live Ping Animation */}
                {live && (
                    <span className={`absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full ${activeNode.pulse} animate-ping opacity-75`} />
                )}
            </div>

            {/* Card Content or Link */}
            <div className="flex-1 min-w-0">
                {href ? (
                    <Link href={href} className="block">
                        {cardContent}
                    </Link>
                ) : onClick ? (
                    <div onClick={onClick} role="button" tabIndex={0}>
                        {cardContent}
                    </div>
                ) : (
                    cardContent
                )}
            </div>
        </div>
    );
}

