import React, { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

const FormSelect = forwardRef(({ 
    label, 
    error, 
    options = [], 
    id,
    className = '',
    helpText,
    ...props 
}, ref) => {
    return (
        <div className={`flex flex-col gap-1.5 ${className}`}>
            {label && (
                <label htmlFor={id} className="text-[13px] font-medium text-slate-700">
                    {label}
                    {props.required && <span className="text-rose-500 ml-1">*</span>}
                </label>
            )}
            
            <div className="relative flex items-center">
                <select
                    id={id}
                    ref={ref}
                    className={`
                        w-full rounded-xl py-2.5 pl-4 pr-10 text-sm font-normal transition-colors appearance-none cursor-pointer text-slate-900
                        ${error 
                            ? 'bg-white border border-rose-400 focus:border-rose-500 focus:ring-4 focus:ring-rose-400/20' 
                            : 'bg-slate-50/90 border border-slate-200/80 shadow-inner hover:bg-slate-100/60 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 focus:shadow-none'}
                        disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:shadow-none disabled:cursor-not-allowed
                    `}
                    {...props}
                >
                    {/* Placeholder option if value is empty */}
                    {props.placeholder && (
                        <option value="" disabled hidden>
                            {props.placeholder}
                        </option>
                    )}
                    {options.map((option, index) => (
                        <option key={index} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                
                <div className="absolute right-3.5 pointer-events-none text-slate-400">
                    <ChevronDown className="w-4 h-4" strokeWidth={1.5} />
                </div>
            </div>

            {helpText && !error && (
                <p className="text-[11px] text-slate-500 mt-0.5">{helpText}</p>
            )}
            
            {error && (
                <p className="text-[11px] text-rose-500 font-medium mt-0.5">{error}</p>
            )}
        </div>
    );
});

export default FormSelect;

