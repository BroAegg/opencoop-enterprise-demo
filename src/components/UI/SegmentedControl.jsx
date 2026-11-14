import React from 'react';

/**
 * SegmentedControl
 * 
 * Apple HIG-compliant tactile segmented control for toggleable options, filters, and sub-tabs.
 * Ensures consistent 40px or compact touch targets, active platter elevation, and clear typography.
 */
export default function SegmentedControl({
    options = [],
    value,
    onChange,
    size = 'sm', // 'xs' | 'sm' | 'md'
    fullWidth = true,
    pill = false,
    className = '',
    disabled = false,
}) {
    // Size tokens
    const sizeConfig = {
        xs: {
            container: pill ? 'p-0.5 rounded-full text-[11px]' : 'p-0.5 rounded-lg text-[11px]',
            button: pill ? 'py-1 px-2.5 rounded-full text-[11px]' : 'py-1 px-2 rounded-lg text-[11px]',
            icon: 'w-3 h-3',
            gap: 'gap-0.5',
        },
        sm: {
            container: pill ? 'p-1 rounded-full text-xs' : 'p-0.5 rounded-xl text-xs',
            button: pill ? 'py-1.5 px-3 rounded-full text-xs' : 'py-1.5 px-2.5 rounded-lg text-xs',
            icon: 'w-3.5 h-3.5',
            gap: 'gap-1',
        },
        md: {
            container: pill ? 'p-1.5 rounded-full text-xs sm:text-sm' : 'p-1 rounded-2xl text-xs sm:text-sm',
            button: pill ? 'py-2 px-3.5 rounded-full text-xs sm:text-sm' : 'py-2 px-3 rounded-xl text-xs sm:text-sm',
            icon: 'w-4 h-4',
            gap: 'gap-1',
        },
    }[size] || {
        container: pill ? 'p-1 rounded-full text-xs' : 'p-0.5 rounded-xl text-xs',
        button: pill ? 'py-1.5 px-3 rounded-full text-xs' : 'py-1.5 px-2.5 rounded-lg text-xs',
        icon: 'w-3.5 h-3.5',
        gap: 'gap-1',
    };

    return (
        <div
            role="tablist"
            className={`bg-slate-200/70 border border-slate-200/70 shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.06),inset_0_-1px_0_rgba(255,255,255,0.7)] backdrop-blur-sm flex items-center ${sizeConfig.container} ${sizeConfig.gap} ${
                fullWidth ? 'w-full' : 'inline-flex'
            } ${disabled ? 'opacity-50 pointer-events-none' : ''} ${className}`}
        >
            {options.map((option, idx) => {
                const opt = typeof option === 'string' ? { id: option, value: option, label: option } : option;
                const optKey = opt.id ?? opt.value ?? `seg-opt-${idx}`;
                const isActive = (opt.id !== undefined && value === opt.id) || (opt.value !== undefined && value === opt.value);
                const Icon = opt.icon;
                const isOptionDisabled = disabled || opt.disabled;

                return (
                    <button
                        key={optKey}
                        role="tab"
                        type="button"
                        aria-selected={isActive}
                        disabled={isOptionDisabled}
                        onClick={() => !isOptionDisabled && onChange?.(opt.id ?? opt.value)}
                        className={`font-semibold flex items-center justify-center gap-1.5 transition-all duration-200 select-none cursor-pointer ${
                            fullWidth ? 'flex-1 min-w-0' : 'shrink-0'
                        } ${
                            sizeConfig.button
                        } ${
                            isActive
                                ? 'bg-white text-slate-900 shadow-[0_2px_8px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.9)] font-bold'
                                : 'text-slate-500 hover:text-slate-800 hover:bg-white/40 active:scale-[0.98]'
                        } ${isOptionDisabled ? 'opacity-50 cursor-not-allowed' : ''} ${opt.className || ''}`}
                    >
                        {Icon && (
                            <Icon
                                className={`${sizeConfig.icon} shrink-0 ${
                                    isActive ? 'text-[#1F6376]' : 'text-slate-400'
                                }`}
                            />
                        )}
                        <span className="truncate">
                            {opt.shortLabel ? (
                                <>
                                    <span className="sm:hidden">{opt.shortLabel}</span>
                                    <span className="hidden sm:inline">{opt.label}</span>
                                </>
                            ) : (
                                opt.label
                            )}
                        </span>
                        {opt.count !== undefined && (
                            <span
                                className={`font-mono text-[10px] font-normal tabular-nums ${
                                    isActive ? 'text-slate-600 font-semibold' : 'text-slate-400'
                                }`}
                            >
                                ({opt.count})
                            </span>
                        )}
                        {opt.badge && (
                            <span
                                className={`text-[10px] px-1.5 py-0.2 rounded-full font-medium ${
                                    isActive ? 'bg-[#1F6376] text-white' : 'bg-slate-200 text-slate-600'
                                }`}
                            >
                                {opt.badge}
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
}

