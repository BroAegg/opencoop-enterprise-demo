import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import { ChevronRight, Copy, Check } from 'lucide-react';
import StatusBadge from '@/Components/UI/StatusBadge';
import TactileTooltip from '@/Components/UI/TactileTooltip';

/**
 * TactileGroupedRow
 * 
 * Apple HIG Inset Grouped row for spec sheets, key-value data, and settings.
 * Features:
 * - 3D tactile pastel icon container
 * - Inset hairline divider
 * - Monospace numeric alignment
 * - One-click clipboard copy with visual confirmation
 * - Interactive drill-down hover state with Chevron
 */
export default function TactileGroupedRow({
    icon: Icon,
    iconColor = 'teal', // 'teal' | 'emerald' | 'amber' | 'rose' | 'slate' | 'sky' | 'indigo'
    label,
    sublabel,
    value,
    valueMono = true,
    copyable = false,
    copyValue = null,
    badge,
    href,
    onClick,
    isLast = false,
    className = '',
}) {
    const [copied, setCopied] = useState(false);

    const handleCopy = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const textToCopy = copyValue ?? (typeof value === 'string' ? value : String(value || ''));
        if (textToCopy) {
            navigator.clipboard.writeText(textToCopy);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const iconStyleMap = {
        teal: 'bg-teal-50 text-[#1F6376] border-teal-200/70',
        emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200/70',
        amber: 'bg-amber-50 text-amber-700 border-amber-200/70',
        rose: 'bg-rose-50 text-rose-700 border-rose-200/70',
        slate: 'bg-slate-100 text-slate-700 border-slate-200/80',
        sky: 'bg-sky-50 text-sky-700 border-sky-200/70',
        indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200/70',
    };

    const activeIconStyle = iconStyleMap[iconColor] || iconStyleMap.teal;
    const isInteractive = Boolean(href || onClick);

    const innerContent = (
        <div className={`flex items-center justify-between py-3 sm:py-3.5 px-4 sm:px-5 transition-colors duration-150 ${
            isInteractive ? 'hover:bg-slate-50/80 active:bg-slate-100/80 cursor-pointer' : ''
        } ${!isLast ? 'border-b border-slate-100/90' : ''} ${className}`}>
            {/* Left: Icon + Label & Sublabel */}
            <div className="flex items-center gap-3 min-w-0 pr-3">
                {Icon && (
                    <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center border shrink-0 shadow-[inset_0_1px_0_white,0_1px_2px_rgba(0,0,0,0.04)] ${activeIconStyle}`}>
                        <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </div>
                )}
                <div className="min-w-0">
                    <div className="text-xs sm:text-sm font-semibold text-slate-800 tracking-tight truncate">
                        {label}
                    </div>
                    {sublabel && (
                        <div className="text-[11px] text-slate-400 font-normal mt-0.5 truncate">
                            {sublabel}
                        </div>
                    )}
                </div>
            </div>

            {/* Right: Badge, Value, Copy Button, or Chevron */}
            <div className="flex items-center gap-2 shrink-0">
                {badge && (
                    <div>
                        {React.isValidElement(badge) ? badge : <StatusBadge status={badge} dot={true} />}
                    </div>
                )}

                {value !== undefined && value !== null && (
                    <span className={`text-xs sm:text-sm font-semibold text-slate-900 ${
                        valueMono ? 'font-mono font-bold tracking-tight' : ''
                    }`}>
                        {value}
                    </span>
                )}

                {copyable && (
                    <TactileTooltip content={copied ? 'Tersalin!' : 'Salin ke clipboard'} placement="top">
                        <button
                            type="button"
                            onClick={handleCopy}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100/90 transition-all active:scale-95 ml-1"
                        >
                            {copied ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600 animate-in zoom-in-75 duration-200" />
                            ) : (
                                <Copy className="w-3.5 h-3.5" />
                            )}
                        </button>
                    </TactileTooltip>
                )}

                {isInteractive && (
                    <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 ml-1 transition-transform group-hover:translate-x-0.5" />
                )}
            </div>
        </div>
    );

    if (href) {
        return (
            <Link href={href} className="block group">
                {innerContent}
            </Link>
        );
    }

    if (onClick) {
        return (
            <div onClick={onClick} role="button" tabIndex={0} className="group">
                {innerContent}
            </div>
        );
    }

    return innerContent;
}

