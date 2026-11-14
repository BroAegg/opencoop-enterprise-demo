import React from 'react';
import { Link } from '@inertiajs/react';
import { 
    ArrowUpRight, 
    ArrowDownRight, 
    TrendingUp, 
    TrendingDown, 
    CheckCheck,
    ArrowDownLeft,
} from 'lucide-react';
import TactileCard from '@/Components/UI/TactileCard';

/**
 * TactileSplitBalanceCard
 * 
 * Apple HIG tactile dual-chamber comparison card with a central 3D Delta Bridge.
 * Ideal for:
 * 1. Cash Inflow vs Outflow (Arus Kas).
 * 2. Physical Cash vs Register Book (Shift Kasir Over/Short reconciliation).
 * 3. Budget vs Actual (Realisasi Anggaran).
 * 4. Current vs Previous Period Performance.
 */
export default function TactileSplitBalanceCard({
    title,
    subtitle,
    leftChamber = {
        label: 'Kas Masuk',
        value: 0,
        subtext: null,
        color: 'emerald', // 'emerald' | 'teal' | 'slate'
        icon: ArrowDownLeft,
    },
    rightChamber = {
        label: 'Kas Keluar',
        value: 0,
        subtext: null,
        color: 'rose', // 'rose' | 'amber' | 'slate'
        icon: ArrowUpRight,
    },
    bridgeMode = 'delta', // 'delta' | 'reconciliation'
    showProportionBar = true,
    note,
    href,
    className = '',
}) {
    const formatRp = (num) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(Math.abs(num || 0));
    };

    const leftVal = Number(leftChamber.value) || 0;
    const rightVal = Number(rightChamber.value) || 0;
    const diff = leftVal - rightVal;
    const totalVolume = leftVal + rightVal;
    const leftPct = totalVolume > 0 ? (leftVal / totalVolume) * 100 : 50;

    // Bridge status calculation
    const isSurplus = diff > 0;
    const isDeficit = diff < 0;
    const isBalanced = diff === 0;

    // Chamber color tokens matching Manasuka design system
    const getChamberStyle = (colorType) => {
        switch (colorType) {
            case 'emerald':
                return {
                    iconBg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80 shadow-[inset_0_1px_0_white]',
                    barColor: 'bg-emerald-600',
                };
            case 'rose':
                return {
                    iconBg: 'bg-rose-50 text-rose-700 border-rose-200/80 shadow-[inset_0_1px_0_white]',
                    barColor: 'bg-rose-500',
                };
            case 'amber':
                return {
                    iconBg: 'bg-amber-50 text-amber-700 border-amber-200/80 shadow-[inset_0_1px_0_white]',
                    barColor: 'bg-amber-400',
                };
            case 'teal':
                return {
                    iconBg: 'bg-teal-50 text-[#1F6376] border-teal-200/80 shadow-[inset_0_1px_0_white]',
                    barColor: 'bg-gradient-to-r from-[#164e5d] to-[#1F6376]',
                };
            default:
                return {
                    iconBg: 'bg-slate-100 text-slate-700 border-slate-200/80 shadow-[inset_0_1px_0_white]',
                    barColor: 'bg-slate-400',
                };
        }
    };

    const leftStyle = getChamberStyle(leftChamber.color || 'emerald');
    const rightStyle = getChamberStyle(rightChamber.color || 'rose');

    const LeftIcon = leftChamber.icon || ArrowDownLeft;
    const RightIcon = rightChamber.icon || ArrowUpRight;

    return (
        <TactileCard
            variant="white"
            rounded="3xl"
            className={`p-4 sm:p-5 md:p-6 flex flex-col justify-between relative ${className}`}
        >
            {/* Header with Title, Context Subtitle & Optional Floating Link Button */}
            <div className="flex items-start justify-between pb-3 mb-4 border-b border-slate-100">
                <div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base tracking-tight">
                        {title}
                    </h3>
                    {subtitle && (
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                            {subtitle}
                        </p>
                    )}
                </div>

                {href && (
                    <Link
                        href={href}
                        className="w-8 h-8 rounded-full bg-white hover:bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-800 transition-all shadow-[0_1.5px_4px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.9)] border border-slate-200/70 active:scale-95 shrink-0 ml-3"
                    >
                        <ArrowUpRight className="w-4 h-4 text-slate-500 hover:text-slate-900" />
                    </Link>
                )}
            </div>

            {/* Dual Chambers Container */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 relative mb-4">
                {/* Left Chamber (e.g. Kas Masuk / Kas Fisik) */}
                <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50/90 border border-slate-200/70 shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)] flex flex-col justify-between">
                    <div className="flex items-center gap-2 mb-2">
                        <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-xl flex items-center justify-center border shrink-0 ${leftStyle.iconBg}`}>
                            <LeftIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </div>
                        <span className="text-xs font-semibold text-slate-600 truncate">
                            {leftChamber.label}
                        </span>
                    </div>

                    <div className="text-lg sm:text-xl font-bold font-mono text-slate-900 tracking-tight">
                        {formatRp(leftVal)}
                    </div>

                    {leftChamber.subtext && (
                        <div className="text-[11px] text-slate-500 font-mono mt-1">
                            {leftChamber.subtext}
                        </div>
                    )}
                </div>

                {/* Right Chamber (e.g. Kas Keluar / Buku Sistem) */}
                <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50/90 border border-slate-200/70 shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)] flex flex-col justify-between">
                    <div className="flex items-center gap-2 mb-2">
                        <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-xl flex items-center justify-center border shrink-0 ${rightStyle.iconBg}`}>
                            <RightIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </div>
                        <span className="text-xs font-semibold text-slate-600 truncate">
                            {rightChamber.label}
                        </span>
                    </div>

                    <div className="text-lg sm:text-xl font-bold font-mono text-slate-900 tracking-tight">
                        {formatRp(rightVal)}
                    </div>

                    {rightChamber.subtext && (
                        <div className="text-[11px] text-slate-500 font-mono mt-1">
                            {rightChamber.subtext}
                        </div>
                    )}
                </div>
            </div>

            {/* Central 3D Tactile Delta Bridge */}
            <div className="mb-4">
                <div className="p-2 sm:p-2.5 rounded-2xl bg-slate-100/90 border border-slate-200/80 shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.05),inset_0_-1px_0_white] flex items-center justify-between px-3 sm:px-4">
                    <div className="flex items-center gap-2">
                        {isSurplus && (
                            <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-[0_1px_3px_rgba(5,150,105,0.3),inset_0_1px_0_rgba(255,255,255,0.4)]">
                                <TrendingUp className="w-3.5 h-3.5" />
                            </span>
                        )}
                        {isDeficit && (
                            <span className="w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-[0_1px_3px_rgba(225,29,72,0.3),inset_0_1px_0_rgba(255,255,255,0.4)]">
                                <TrendingDown className="w-3.5 h-3.5" />
                            </span>
                        )}
                        {isBalanced && (
                            <span className="w-6 h-6 rounded-full bg-slate-700 text-white flex items-center justify-center shadow-[0_1px_3px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.4)]">
                                <CheckCheck className="w-3.5 h-3.5" />
                            </span>
                        )}
                        <span className="text-xs font-semibold text-slate-700">
                            {bridgeMode === 'reconciliation'
                                ? (isBalanced ? 'Status Rekonsiliasi' : isSurplus ? 'Selisih Kasir (Lebih)' : 'Selisih Kasir (Kurang)')
                                : (isSurplus ? 'Net Surplus Arus Kas' : isDeficit ? 'Net Defisit Arus Kas' : 'Arus Kas Seimbang')}
                        </span>
                    </div>

                    <div className={`text-xs sm:text-sm font-bold font-mono ${
                        isSurplus ? 'text-emerald-700' : isDeficit ? 'text-rose-700' : 'text-slate-700'
                    }`}>
                        {isBalanced ? 'Rp 0 (Klop)' : `${isSurplus ? '+' : '-'}${formatRp(diff)}`}
                    </div>
                </div>
            </div>

            {/* Proportional Balance Meter */}
            {showProportionBar && totalVolume > 0 && (
                <div className="mb-3">
                    <div className="w-full h-2.5 sm:h-3 bg-slate-100 rounded-full p-0.5 border border-slate-200/90 shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.06),inset_0_-1px_0_white] flex overflow-hidden">
                        <div
                            style={{ width: `${leftPct}%` }}
                            className={`h-full ${leftStyle.barColor} rounded-l-full shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] border-r-2 border-white/95 transition-all duration-700`}
                            title={`${leftChamber.label}: ${Math.round(leftPct)}%`}
                        />
                        <div
                            style={{ width: `${100 - leftPct}%` }}
                            className={`h-full ${rightStyle.barColor} rounded-r-full shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] transition-all duration-700`}
                            title={`${rightChamber.label}: ${Math.round(100 - leftPct)}%`}
                        />
                    </div>
                    <div className="flex justify-between items-center text-[10px] sm:text-[11px] font-mono text-slate-500 mt-1.5 px-0.5">
                        <span>{leftChamber.label} ({Math.round(leftPct)}%)</span>
                        <span>{rightChamber.label} ({Math.round(100 - leftPct)}%)</span>
                    </div>
                </div>
            )}

            {/* Optional Bottom Audit Note */}
            {note && (
                <div className="pt-2.5 mt-1 border-t border-slate-100 text-[11px] text-slate-400 font-medium">
                    {note}
                </div>
            )}
        </TactileCard>
    );
}

