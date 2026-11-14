import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import { 
    AlertTriangle, 
    ShieldAlert, 
    CheckCircle2, 
    Info, 
    X, 
    ArrowRight 
} from 'lucide-react';
import StatusBadge from '@/Components/UI/StatusBadge';

/**
 * TactileCallout
 * 
 * Apple HIG tactile notification and auditing callout banner.
 * Replaces generic flat alerts with physical recessed well, 3D specular icon badge,
 * contextual typography, and quick action CTA button.
 */
export default function TactileCallout({
    variant = 'info', // 'info' | 'warning' | 'danger' | 'success' | 'neutral'
    icon: CustomIcon,
    title,
    message,
    badge,
    action, // { label, onClick, href } or ReactNode
    dismissible = false,
    onDismiss,
    timestamp,
    className = '',
}) {
    const [dismissed, setDismissed] = useState(false);

    if (dismissed) return null;

    const handleDismiss = () => {
        setDismissed(true);
        if (onDismiss) onDismiss();
    };

    const variantStyles = {
        info: {
            container: 'bg-white border-teal-200/80 shadow-[0_2px_8px_rgba(31,99,118,0.06),inset_0_1px_0_white]',
            iconBg: 'bg-[#1F6376] text-white border-teal-600/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_2px_4px_rgba(31,99,118,0.25)]',
            icon: Info,
            titleColor: 'text-slate-900',
            badgeBg: 'bg-teal-50 text-[#1F6376] border-teal-200/80',
            btnBg: 'bg-[#1F6376] hover:bg-[#164e5d] text-white shadow-[0_1.5px_4px_rgba(31,99,118,0.25),inset_0_1px_0_rgba(255,255,255,0.25)]',
        },
        warning: {
            container: 'bg-white border-amber-200/90 shadow-[0_2px_8px_rgba(245,158,11,0.06),inset_0_1px_0_white]',
            iconBg: 'bg-amber-400 text-slate-950 border-amber-500/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_2px_4px_rgba(245,158,11,0.25)]',
            icon: AlertTriangle,
            titleColor: 'text-slate-900',
            badgeBg: 'bg-amber-50 text-amber-800 border-amber-200/80',
            btnBg: 'bg-amber-500 hover:bg-amber-600 text-white shadow-[0_1.5px_4px_rgba(245,158,11,0.25),inset_0_1px_0_rgba(255,255,255,0.25)]',
        },
        danger: {
            container: 'bg-white border-rose-200/90 shadow-[0_2px_8px_rgba(225,29,72,0.06),inset_0_1px_0_white]',
            iconBg: 'bg-rose-600 text-white border-rose-500/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_2px_4px_rgba(225,29,72,0.25)]',
            icon: ShieldAlert,
            titleColor: 'text-slate-900',
            badgeBg: 'bg-rose-50 text-rose-800 border-rose-200/80',
            btnBg: 'bg-rose-600 hover:bg-rose-700 text-white shadow-[0_1.5px_4px_rgba(225,29,72,0.25),inset_0_1px_0_rgba(255,255,255,0.25)]',
        },
        success: {
            container: 'bg-white border-emerald-200/90 shadow-[0_2px_8px_rgba(5,150,105,0.06),inset_0_1px_0_white]',
            iconBg: 'bg-emerald-600 text-white border-emerald-500/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_2px_4px_rgba(5,150,105,0.25)]',
            icon: CheckCircle2,
            titleColor: 'text-slate-900',
            badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
            btnBg: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-[0_1.5px_4px_rgba(5,150,105,0.25),inset_0_1px_0_rgba(255,255,255,0.25)]',
        },
        neutral: {
            container: 'bg-white border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.04),inset_0_1px_0_white]',
            iconBg: 'bg-slate-800 text-white border-slate-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_2px_4px_rgba(0,0,0,0.15)]',
            icon: Info,
            titleColor: 'text-slate-900',
            badgeBg: 'bg-slate-100 text-slate-800 border-slate-200/80',
            btnBg: 'bg-slate-800 hover:bg-slate-900 text-white shadow-[0_1.5px_4px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.2)]',
        },
    };

    const currentStyle = variantStyles[variant] || variantStyles.info;
    const IconComponent = CustomIcon || currentStyle.icon;

    const renderAction = () => {
        if (!action) return null;

        if (React.isValidElement(action)) {
            return action;
        }

        if (typeof action === 'object' && action.label) {
            const btnClasses = `inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 shrink-0 border border-white/20 ${currentStyle.btnBg}`;

            if (action.href) {
                return (
                    <Link href={action.href} className={btnClasses}>
                        <span>{action.label}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                );
            }

            return (
                <button type="button" onClick={action.onClick} className={btnClasses}>
                    <span>{action.label}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                </button>
            );
        }

        return null;
    };

    return (
        <div className={`p-4 sm:p-5 rounded-3xl border transition-all duration-300 relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${currentStyle.container} ${className}`}>
            {/* Left: 3D Specular Icon + Texts */}
            <div className="flex items-start gap-3.5 min-w-0 pr-2">
                <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center border shrink-0 ${currentStyle.iconBg}`}>
                    <IconComponent className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>

                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <h4 className={`text-xs sm:text-sm font-bold tracking-tight ${currentStyle.titleColor}`}>
                            {title}
                        </h4>
                        {badge && (
                            <div className="shrink-0">
                                {React.isValidElement(badge) ? (
                                    badge
                                ) : (
                                    <StatusBadge 
                                        status={variant === 'warning' ? 'WARNING' : variant === 'danger' ? 'DANGER' : variant === 'success' ? 'SUCCESS' : variant === 'neutral' ? 'CLOSED' : 'INFO'} 
                                        dot={true}
                                    >
                                        {badge}
                                    </StatusBadge>
                                )}
                            </div>
                        )}
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed mt-1">
                        {message}
                    </p>

                    {timestamp && (
                        <span className="text-[10px] font-mono text-slate-400 mt-1 block">
                            {timestamp}
                        </span>
                    )}
                </div>
            </div>

            {/* Right: CTA Action & Dismiss Button */}
            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                {renderAction()}

                {dismissible && (
                    <button
                        type="button"
                        onClick={handleDismiss}
                        className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-all active:scale-95 border border-slate-200/60"
                        title="Tutup pemberitahuan"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                )}
            </div>
        </div>
    );
}

