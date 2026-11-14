import React from 'react';

export default function WalletPass({
    title,
    amount,
    icon: Icon,
    variant = 'titanium',
    subTitle = 'Saldo Aktif',
    hoverable = false,
    className = '',
    style = {},
    rightAction = null,
    children
}) {
    const variants = {
        'titanium': {
            bg: 'bg-gradient-to-br from-slate-200 via-slate-100 to-slate-400 border-t border-white/60',
            text: 'text-slate-800',
            subText: 'text-slate-500',
            iconBg: 'material-liquid-glass',
            iconColor: 'text-slate-800'
        },
        'liquid-glass': {
            bg: 'material-liquid-glass',
            text: 'text-slate-800',
            subText: 'text-slate-500',
            iconBg: 'material-liquid-glass-dark',
            iconColor: 'text-emerald-600'
        },
        'premium': {
            bg: 'bg-gradient-to-br from-indigo-800 via-violet-700 to-purple-900 border-t border-white/20',
            text: 'text-white',
            subText: 'text-indigo-200',
            iconBg: 'material-liquid-glass-dark',
            iconColor: 'text-white'
        },
        'daily': {
            bg: 'bg-gradient-to-br from-emerald-500 via-teal-400 to-cyan-600 border-t border-white/20',
            text: 'text-white',
            subText: 'text-emerald-100',
            iconBg: 'material-liquid-glass-dark',
            iconColor: 'text-white'
        },
        'danger': {
            bg: 'bg-gradient-to-br from-orange-500 via-red-500 to-rose-700 border-t border-white/20',
            text: 'text-white',
            subText: 'text-orange-200',
            iconBg: 'material-liquid-glass-dark',
            iconColor: 'text-white'
        },
        'dark-titanium': {
            bg: 'bg-gradient-to-br from-slate-800 via-slate-900 to-black border-t border-white/10',
            text: 'text-white',
            subText: 'text-slate-400',
            iconBg: 'material-liquid-glass-dark',
            iconColor: 'text-slate-300'
        }
    };

    const theme = variants[variant] || variants['titanium'];

    const baseClasses = `relative w-full rounded-[32px] p-6 sm:p-8 shadow-xl overflow-hidden group transition-all duration-500 ease-out ${theme.bg} ${theme.text}`;
    const hoverClasses = hoverable ? 'hover:scale-[1.02] hover:-translate-y-1 hover:shadow-2xl cursor-pointer' : '';

    return (
        <div className={`${baseClasses} ${hoverClasses} ${className}`} style={style}>
            {/* Abstract noise / material texture */}
            <div className="absolute inset-0 opacity-[0.04] mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")'}}></div>
            
            {/* Abstract subtle glow */}
            <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 transition-transform duration-700 group-hover:scale-110 ${variant === 'dark-titanium' ? 'bg-slate-500/20' : 'bg-white/10'}`}></div>
            
            <div className="relative z-10 flex flex-col h-full justify-between min-h-[140px]">
                {/* Header */}
                <div className="flex justify-between items-center w-full mb-6">
                    <div className="flex items-center gap-2.5">
                        {Icon && (
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${theme.iconBg}`}>
                                <Icon className={`w-4 h-4 ${theme.iconColor}`} strokeWidth={2} />
                            </div>
                        )}
                        <h3 className={`text-[12px] font-bold uppercase tracking-widest ${theme.subText}`}>
                            {title}
                        </h3>
                    </div>
                    {rightAction && (
                        <div className="shrink-0">
                            {rightAction}
                        </div>
                    )}
                </div>

                {/* Amount */}
                <div className="w-full mb-2">
                    <p className={`text-[11px] font-bold uppercase tracking-wider mb-1.5 ${theme.subText}`}>
                        {subTitle}
                    </p>
                    <p className={`text-3xl sm:text-4xl font-bold tracking-tight font-mono ${theme.text}`}>
                        {typeof amount === 'number' ? `Rp ${amount.toLocaleString('id-ID')}` : amount}
                    </p>
                </div>

                {/* Additional Content / Children */}
                {children && (
                    <div className="mt-4 pt-4 border-t border-white/10 w-full">
                        {children}
                    </div>
                )}
            </div>
        </div>
    );
}

