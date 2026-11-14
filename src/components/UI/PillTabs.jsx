import React from 'react';

export default function PillTabs({ 
    tabs = [], 
    activeTab, 
    onChange, 
    variant = 'pills', // 'pills' | 'segmented' | 'teal'
    size = 'md', // 'xs' | 'sm' | 'md'
    className = '',
    fade = true,
    fadeColor = 'from-[#F4F5F7]'
}) {
    const isSm = size === 'sm';
    const isXs = size === 'xs';
    const isCompact = isSm || isXs;

    // Apple Segmented Control variant (used in iOS / Admin Dashboard / Inventory Receiving / Toolbars)
    if (variant === 'segmented') {
        const containerClasses = isXs
            ? 'p-0.5 rounded-md border border-slate-200/70 bg-slate-200/70 shadow-[inset_0_1.5px_2px_rgba(0,0,0,0.06),inset_0_-1px_0_rgba(255,255,255,0.7)] gap-0.5'
            : isSm
                ? 'p-0.5 rounded-lg border border-slate-200/70 bg-slate-200/70 shadow-[inset_0_1.5px_2.5px_rgba(0,0,0,0.06),inset_0_-1px_0_rgba(255,255,255,0.7)] gap-0.5'
                : 'p-1 rounded-2xl border border-slate-200/70 bg-slate-200/70 shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.06),inset_0_-1px_0_rgba(255,255,255,0.7)] gap-1';

        const btnClasses = isXs
            ? 'px-2 py-0.5 text-[10px] font-semibold rounded gap-1'
            : isSm
                ? 'px-2.5 py-1 text-[11px] font-semibold rounded-md gap-1.5'
                : 'px-3 sm:px-5 py-1.5 sm:py-2 text-[12px] sm:text-[13px] font-semibold rounded-xl gap-1.5 sm:gap-2';

        const iconClasses = isXs
            ? 'w-2.5 h-2.5'
            : isSm
                ? 'w-3 h-3'
                : 'w-3.5 h-3.5 sm:w-4 sm:h-4';

        return (
            <div className={`relative max-w-full min-w-0 ${className}`}>
                <div className="flex justify-start overflow-x-auto no-scrollbar py-1 px-0.5 max-w-full">
                    <div className={`flex items-center backdrop-blur-sm min-w-max ${containerClasses}`}>
                        {tabs.map((tab) => {
                            const isActive = activeTab === tab.id;
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => onChange(tab.id)}
                                    className={`${btnClasses} transition-all duration-200 flex items-center justify-center whitespace-nowrap active:scale-[0.98] ${
                                        isActive 
                                            ? 'bg-white text-slate-900 shadow-[0_2px_8px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.9)] font-bold' 
                                            : 'text-slate-500 hover:text-slate-900 hover:bg-white/40'
                                    }`}
                                >
                                    {Icon && <Icon className={`${iconClasses} ${isActive ? 'text-[#1F6376]' : 'text-slate-400'}`} />}
                                    <span>
                                        {tab.shortLabel ? (
                                            <>
                                                <span className="sm:hidden">{tab.shortLabel}</span>
                                                <span className="hidden sm:inline">{tab.label}</span>
                                            </>
                                        ) : (
                                            tab.label
                                        )}
                                    </span>
                                    {(tab.count !== undefined || tab.badge !== undefined) && (
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono font-semibold tabular-nums transition-colors ${
                                            tab.badgeClassName
                                                ? tab.badgeClassName
                                                : (isActive 
                                                    ? 'bg-slate-100 text-slate-800' 
                                                    : 'bg-slate-300/60 text-slate-600')
                                        }`}>
                                            {tab.count ?? tab.badge}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }

    // Default & Teal Pills variant (Apple floating pills)
    const isDark = variant === 'dark' || variant === 'slate';

    return (
        <div className={`relative max-w-full min-w-0 -mx-4 sm:mx-0 ${className}`}>
            <div className="flex overflow-x-auto no-scrollbar gap-2 pb-1 px-4 sm:px-0 max-w-full">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    const Icon = tab.icon;
                    const btnPad = isCompact
                        ? 'px-3 sm:px-3.5 py-1.5 text-[11.5px] sm:text-xs font-semibold'
                        : 'px-4 sm:px-5 py-2 sm:py-2.5 text-[12px] sm:text-[13px] font-bold';

                    return (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => onChange(tab.id)}
                            className={`${btnPad} rounded-full whitespace-nowrap transition-all duration-200 flex items-center gap-1.5 sm:gap-2 active:scale-95 shrink-0 ${
                                isActive 
                                    ? (tab.activeClassName || (isDark 
                                        ? 'bg-slate-900 text-white shadow-md shadow-slate-900/15'
                                        : 'bg-[#1F6376] text-white shadow-md shadow-[#1F6376]/25 ring-1 ring-white/20'))
                                    : (tab.inactiveClassName || 'bg-white/80 backdrop-blur-sm text-slate-600 border border-slate-200/60 hover:bg-white hover:text-slate-900 hover:border-slate-300')
                            }`}
                        >
                            {tab.dotColor && (
                                <span className={`w-2 h-2 rounded-full shrink-0 ${tab.dotColor} ${tab.pulse && !isActive ? 'animate-pulse' : ''}`} />
                            )}
                            {Icon && <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />}
                            <span>
                                {tab.shortLabel ? (
                                    <>
                                        <span className="sm:hidden">{tab.shortLabel}</span>
                                        <span className="hidden sm:inline">{tab.label}</span>
                                    </>
                                ) : (
                                    tab.label
                                )}
                            </span>
                            {(tab.count !== undefined || tab.badge !== undefined) && (
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold transition-colors ${
                                    isActive 
                                        ? 'bg-white/25 text-white' 
                                        : (tab.badgeClassName || 'bg-slate-100 text-slate-600 border border-slate-200/50')
                                }`}>
                                    {tab.count ?? tab.badge}
                                </span>
                            )}
                        </button>
                    );
                })}
                <div className="w-6 shrink-0 sm:hidden"></div>
            </div>
            {fade && (
                <div className={`absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l ${fadeColor} to-transparent pointer-events-none sm:hidden`}></div>
            )}
        </div>
    );
}

