import React from 'react';

export default function Tabs({ 
    tabs = [], 
    activeTab, 
    onChange,
    variant = 'line', // 'line' | 'enclosed'
    className = ""
}) {
    const isEnclosed = variant === 'enclosed';

    return (
        <div className={`border-b border-slate-200/80 ${className}`}>
            <nav className={`-mb-px flex overflow-x-auto no-scrollbar ${isEnclosed ? 'gap-2' : 'space-x-6'}`} aria-label="Tabs">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    const Icon = tab.icon;
                    const badgeContent = tab.badge ?? tab.count;
                    
                    if (isEnclosed) {
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => onChange && onChange(tab.id)}
                                className={`
                                    px-4 py-3 text-xs font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 active:scale-[0.98]
                                    ${isActive
                                        ? 'border-primary text-primary bg-primary/5 rounded-t-xl'
                                        : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
                                    }
                                `}
                            >
                                {Icon && (
                                    <Icon 
                                        className={`w-3.5 h-3.5 ${isActive ? 'text-primary' : 'text-slate-400'}`} 
                                        strokeWidth={isActive ? 2 : 1.5} 
                                    />
                                )}
                                <span>{tab.label}</span>
                                {badgeContent !== undefined && (
                                    <span className={`rounded-full py-0.5 px-2 text-[10px] font-bold ${
                                        isActive ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'
                                    }`}>
                                        {badgeContent}
                                    </span>
                                )}
                            </button>
                        );
                    }

                    return (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => onChange && onChange(tab.id)}
                            className={`
                                group relative flex items-center gap-2 py-4 px-1 text-[13px] font-medium whitespace-nowrap transition-colors
                                ${isActive 
                                    ? 'text-primary font-bold' 
                                    : 'text-slate-500 hover:text-slate-700'
                                }
                            `}
                        >
                            {Icon && (
                                <Icon 
                                    className={`w-[18px] h-[18px] ${isActive ? 'text-primary' : 'text-slate-400 group-hover:text-slate-500'}`} 
                                    strokeWidth={isActive ? 2 : 1.5} 
                                />
                            )}
                            <span>{tab.label}</span>
                            
                            {/* Active indicator bar */}
                            {isActive && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
                            )}
                            
                            {/* Badge */}
                            {badgeContent !== undefined && (
                                <span className={`ml-1.5 rounded-full py-0.5 px-2 text-[10px] font-bold shadow-sm ${
                                    isActive ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-500'
                                }`}>
                                    {badgeContent}
                                </span>
                            )}
                        </button>
                    );
                })}
            </nav>
        </div>
    );
}

