import React from 'react';
import { AlertTriangle, Coffee, RotateCcw, Check } from 'lucide-react';

export const REASON_OPTIONS = [
    {
        id: 'BARANG_HILANG',
        label: 'Barang Hilang / Rusak Toko',
        subtext: 'Hilang di toko, koperasi ganti ke mitra (Akun 5.1.12)',
        icon: AlertTriangle,
        badgeColor: 'text-rose-700 bg-rose-50 border-rose-200',
    },
    {
        id: 'BEBAN_TOKO',
        label: 'Dimakan Staf / Toko',
        subtext: 'Beban Konsumsi Toko (Akun 5.1.13)',
        icon: Coffee,
        badgeColor: 'text-amber-700 bg-amber-50 border-amber-200',
    },
    {
        id: 'SELISIH_FISIK',
        label: 'Koreksi Salah Hitung',
        subtext: 'Selisih Fisik Opname (Akun 5.1.12)',
        icon: RotateCcw,
        badgeColor: 'text-blue-700 bg-blue-50 border-blue-200',
    },
];

export default function QuickAdjustReasonSelector({
    selectedReason,
    onSelectReason,
}) {
    return (
        <div className="space-y-1.5 pt-1">
            <label className="text-xs font-bold text-slate-700 block">
                Alokasi Akuntansi Selisih Kurang
            </label>
            <div className="grid grid-cols-1 gap-2">
                {REASON_OPTIONS.map((opt) => {
                    const Icon = opt.icon;
                    const isSelected = selectedReason === opt.id;
                    return (
                        <button
                            key={opt.id}
                            type="button"
                            onClick={() => onSelectReason(opt.id)}
                            className={`p-2.5 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                                isSelected
                                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                            }`}
                        >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                isSelected ? 'bg-white/10 text-white' : opt.badgeColor
                            }`}>
                                <Icon className="w-4 h-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <span className="font-bold text-xs block leading-tight">
                                    {opt.label}
                                </span>
                                <span className={`text-[10px] block mt-0.5 ${
                                    isSelected ? 'text-slate-300' : 'text-slate-400'
                                }`}>
                                    {opt.subtext}
                                </span>
                            </div>
                            {isSelected && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
