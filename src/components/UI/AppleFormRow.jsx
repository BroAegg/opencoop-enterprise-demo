import React from 'react';

export default function AppleFormRow({ 
    label, 
    children, 
    isLast = false,
    error,
    htmlFor
}) {
    return (
        <div className="relative flex flex-row items-center min-h-[44px] px-4 sm:px-5 group bg-white hover:bg-slate-50/50 transition-colors">
            {!isLast && (
                <div className="absolute bottom-0 right-0 left-4 sm:left-5 h-[1px] bg-slate-100" />
            )}
            
            <div className="w-[40%] sm:w-1/3 py-3 shrink-0 flex items-center pr-2">
                <label htmlFor={htmlFor} className="text-[14px] font-medium text-slate-700">
                    {label}
                </label>
            </div>
            
            <div className="flex-1 w-full flex items-center justify-end py-2">
                {children}
            </div>

            {error && (
                <p className="text-xs text-red-500 absolute bottom-1 right-5">
                    {error}
                </p>
            )}
        </div>
    );
}

