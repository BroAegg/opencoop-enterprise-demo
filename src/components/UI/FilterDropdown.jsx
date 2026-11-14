import React from 'react';
import { Filter, ChevronDown } from 'lucide-react';

export default function FilterDropdown({ 
    label, 
    options = [], 
    value, 
    onChange,
    className = ""
}) {
    return (
        <div className={`relative ${className}`}>
            <div className="flex items-center">
                <div className="absolute left-3 pointer-events-none text-slate-400">
                    <Filter className="w-3.5 h-3.5" strokeWidth={1.5} />
                </div>
                <select
                    value={value}
                    onChange={onChange}
                    className="appearance-none bg-white border border-slate-200/80 rounded-xl pl-8 pr-8 py-2 text-[12px] font-medium text-slate-700 shadow-sm focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all cursor-pointer hover:bg-slate-50"
                >
                    <option value="">{label}</option>
                    {options.map((opt, i) => (
                        <option key={i} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
                <div className="absolute right-3 pointer-events-none text-slate-400">
                    <ChevronDown className="w-3.5 h-3.5" strokeWidth={1.5} />
                </div>
            </div>
        </div>
    );
}

