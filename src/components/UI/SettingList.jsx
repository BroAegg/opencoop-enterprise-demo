import React from 'react';

export function SettingListGroup({ title, description, children, className = "" }) {
    return (
        <div className={`flex flex-col mb-6 last:mb-0 ${className}`}>
            {(title || description) && (
                <div className="ml-4 mb-2">
                    {title && <h3 className="text-[13px] font-semibold text-slate-500 uppercase tracking-wider">{title}</h3>}
                    {description && <p className="text-[12px] text-slate-400 mt-0.5">{description}</p>}
                </div>
            )}
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden flex flex-col">
                {children}
            </div>
        </div>
    );
}

export function SettingListRow({ 
    icon: Icon, 
    iconColorClass = "bg-slate-100 text-slate-600", 
    label, 
    description, 
    value, 
    children, 
    isLast = false, 
    onClick,
    vertical = false
}) {
    if (vertical) {
        return (
            <div className="flex flex-col p-4 transition-colors relative hover:bg-slate-50/50">
                {!isLast && <div className="absolute bottom-0 right-0 left-4 h-[1px] bg-slate-100"></div>}
                <div className="flex items-center gap-3 mb-3">
                    {Icon && (
                        <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 shadow-sm ${iconColorClass}`}>
                            <Icon className="w-4 h-4" />
                        </div>
                    )}
                    <div className="flex flex-col">
                        <span className="text-[15px] font-normal text-slate-900">{label}</span>
                        {description && <span className="text-[12px] text-slate-500">{description}</span>}
                    </div>
                </div>
                <div className="w-full pl-[40px]">
                    {children}
                </div>
            </div>
        );
    }

    return (
        <div 
            onClick={onClick}
            className={`flex items-center justify-between p-3 px-4 transition-colors relative ${onClick ? 'cursor-pointer hover:bg-slate-50' : 'hover:bg-slate-50/50'}`}
        >
            {!isLast && (
                <div className="absolute bottom-0 right-0 left-[52px] h-[1px] bg-slate-100"></div>
            )}
            <div className="flex items-center gap-3 min-w-0 pr-4 py-1">
                {Icon && (
                    <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 shadow-sm ${iconColorClass}`}>
                        <Icon className="w-4 h-4" />
                    </div>
                )}
                <div className="flex flex-col truncate">
                    <span className="text-[15px] font-normal text-slate-900 truncate">{label}</span>
                    {description && <span className="text-[12px] text-slate-500 truncate mt-0.5">{description}</span>}
                </div>
            </div>
            <div className="flex flex-1 items-center justify-end shrink-0">
                {value !== undefined ? (
                    <span className="text-[15px] font-normal text-slate-500 truncate">{value}</span>
                ) : (
                    <div className="w-full flex justify-end">
                        {children}
                    </div>
                )}
            </div>
        </div>
    );
}

