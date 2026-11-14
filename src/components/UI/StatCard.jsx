import React from 'react';
import Card from './Card';

/**
 * StatCard
 *
 * Apple HIG Material & Specular Depth Standard.
 * - Pure white canvas with subtle physical material depth.
 * - Hairline specular top reflection (pantulan cahaya kaca halus).
 * - Multi-layer ambient soft diffusion shadow (inset + ambient drop).
 * - Smooth micro-hover physics with zero rainbow noise.
 * - Confident tabular typography with clean currency baseline alignment.
 */
export default function StatCard({ 
    title, 
    value, 
    label, 
    icon: Icon, 
    change, 
    changeDirection = 'up', 
    prefix,
    suffix,
    compact = true,
    allowZero = true,
    showPlusSign = false,
    className = '',
    onClick
}) {
    const cardTitle = title || label;

    const renderValue = () => {
        // Nil/zero → soft dash (only if allowZero is false)
        const isEmpty = value === null || value === undefined || value === '' ||
            (typeof value === 'number' && isNaN(value)) ||
            (!allowZero && (value === 0 || value === '0' || value === 'Rp 0'));

        if (isEmpty) {
            return (
                <span className="text-3xl font-medium text-slate-300 select-none tracking-tight">
                    -
                </span>
            );
        }

        const isRupiah = prefix === 'Rp' || (typeof value === 'string' && value.startsWith('Rp '));
        
        let num = value;
        if (typeof value === 'string' && value.startsWith('Rp ')) {
            const rawStr = value.replace('Rp ', '').replace(/\./g, '').replace(',', '.');
            num = parseFloat(rawStr);
        }

        if (isRupiah && !isNaN(num) && num !== null && num !== '') {
            const parsedNum = parseFloat(num);
            const isNegative = parsedNum < 0;
            const absNum = Math.abs(parsedNum);
            let formattedNum = absNum.toLocaleString('id-ID');
            
            if (compact) {
                if (absNum >= 1000000000000) {
                    formattedNum = (absNum / 1000000000000).toFixed(2).replace(/\.?0+$/, '').replace('.', ',') + ' T';
                } else if (absNum >= 1000000000) {
                    formattedNum = (absNum / 1000000000).toFixed(2).replace(/\.?0+$/, '').replace('.', ',') + ' M';
                } else if (absNum >= 1000000) {
                    formattedNum = (absNum / 1000000).toFixed(2).replace(/\.?0+$/, '').replace('.', ',') + ' Jt';
                }
            }

            const valueStr = String(formattedNum);
            let textSize = "text-2xl sm:text-3xl";
            if (valueStr.length > 8) textSize = "text-xl sm:text-2xl";

            const textColor = isNegative ? 'text-rose-600' : 'text-slate-900';
            const prefixColor = isNegative ? 'text-rose-500' : 'text-slate-400';

            return (
                <div className="flex items-baseline gap-1 truncate">
                    {isNegative && (
                        <span className={`text-base sm:text-lg font-bold ${prefixColor} select-none -mr-0.5`}>
                            -
                        </span>
                    )}
                    {showPlusSign && !isNegative && parsedNum > 0 && (
                        <span className="text-base sm:text-lg font-bold text-slate-400 select-none -mr-0.5">
                            +
                        </span>
                    )}
                    <span className={`text-base sm:text-lg font-semibold ${prefixColor} select-none`}>
                        Rp
                    </span>
                    <span className={`${textSize} font-bold tracking-tight ${textColor} truncate`}>
                        {formattedNum}
                    </span>
                </div>
            );
        }

        // Standard formatting for count / other values
        const rawNum = typeof value === 'number' ? value : parseFloat(value);
        const isNegativeVal = !isNaN(rawNum) && rawNum < 0;
        const absVal = !isNaN(rawNum) ? Math.abs(rawNum) : value;

        let displayValue = absVal;
        if (typeof absVal === 'number') {
            displayValue = absVal.toLocaleString('id-ID');
        } else if (typeof absVal === 'string' && !isNaN(Number(absVal)) && absVal.trim() !== '') {
            displayValue = Number(absVal).toLocaleString('id-ID');
        }
        
        const valueStr2 = String(displayValue);
        let textSize2 = "text-2xl sm:text-3xl";
        if (valueStr2.length > 8) textSize2 = "text-xl sm:text-2xl";

        const textColor2 = isNegativeVal ? 'text-rose-600' : 'text-slate-900';
        const prefixColor2 = isNegativeVal ? 'text-rose-500' : 'text-slate-400';

        return (
            <div className="flex items-baseline gap-1 truncate">
                {isNegativeVal && (
                    <span className={`text-base sm:text-lg font-bold ${prefixColor2} select-none -mr-0.5`}>
                        -
                    </span>
                )}
                {prefix && !isRupiah && (
                    <span className={`text-base sm:text-lg font-semibold ${prefixColor2} select-none`}>
                        {prefix}
                    </span>
                )}
                <span className={`${textSize2} font-bold tracking-tight ${textColor2} truncate`}>
                    {displayValue}
                </span>
                {suffix && (
                    <span className="text-xs sm:text-sm font-medium text-slate-400 ml-1 select-none">
                        {suffix}
                    </span>
                )}
            </div>
        );
    };

    return (
        <Card 
            hover 
            innerPadding="p-5" 
            className={`w-full h-[126px] sm:h-[130px] flex flex-col justify-between bg-white border border-slate-200/80 rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_2px_8px_-2px_rgba(0,0,0,0.03),0_6px_20px_-6px_rgba(0,0,0,0.05)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,1),0_4px_14px_-2px_rgba(0,0,0,0.06),0_12px_28px_-8px_rgba(0,0,0,0.08)] hover:border-slate-300/90 relative overflow-hidden group transition-all duration-300 ${className}`}
            onClick={onClick}
        >
            {/* Apple HIG Specular Top Highlight (Hairline glass reflection) */}
            <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-slate-200/60 to-transparent pointer-events-none" />
            <div className="absolute top-0 inset-x-0 h-10 bg-gradient-to-b from-slate-50/40 via-white/20 to-transparent pointer-events-none" />

            {/* Top Row: Title, Minimalist Slate Icon, and Optional Semantic Change Badge */}
            <div className="relative z-10 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                    {Icon && (
                        <Icon className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors shrink-0" strokeWidth={1.75} />
                    )}
                    <h3 className="text-[13px] font-medium text-slate-500 group-hover:text-slate-700 transition-colors truncate" title={cardTitle}>
                        {cardTitle}
                    </h3>
                </div>

                {change && (
                    <div className={`text-[10.5px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-0.5 shrink-0 select-none ${
                        changeDirection === 'up' 
                            ? 'text-emerald-700 bg-emerald-50 border border-emerald-200/60' 
                            : changeDirection === 'warning'
                            ? 'text-amber-800 bg-amber-50 border border-amber-200/60'
                            : changeDirection === 'neutral'
                            ? 'text-slate-600 bg-slate-100 border border-slate-200/60'
                            : 'text-rose-700 bg-rose-50 border border-rose-200/60'
                    }`}>
                        {changeDirection === 'up' ? '+' : changeDirection === 'down' ? '-' : ''}{change}
                    </div>
                )}
            </div>

            {/* Bottom Row: Confident Hero Number */}
            <div className="relative z-10 min-w-0">
                {renderValue()}
            </div>
        </Card>
    );
}

