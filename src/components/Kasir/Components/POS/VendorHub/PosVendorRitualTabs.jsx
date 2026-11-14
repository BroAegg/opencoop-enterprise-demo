import React from 'react';
import {
    ArrowDownToLine,
    HandCoins,
    BookOpen,
    X,
} from 'lucide-react';

/**
 * PosVendorRitualTabs
 * 
 * Top bar ritual switcher for POS Kasir Vendor Hub (F9).
 * Provides tactile keyboard-aware switching between Drop Pagi (F1),
 * Retur & Bayar (F2), and Info & Stok (F3).
 */
export default function PosVendorRitualTabs({
    activeTab,
    setActiveTab,
    selectedVendor = null,
    onClose,
    isSubmitting = false,
    isAllShelf = false,
}) {
    const isBeliPutus = selectedVendor?.partnership_type === 'BELI_PUTUS';

    if (isBeliPutus) {
        return (
            <div className="flex items-center justify-between gap-3 mb-4 shrink-0">
                <div className="grid grid-cols-2 gap-2 flex-1">
                    <button
                        type="button"
                        onClick={() => setActiveTab('DROP_PAGI')}
                        className={`py-2 px-3 rounded-2xl border-2 flex flex-col items-center gap-0.5 transition-all cursor-pointer ${
                            activeTab === 'DROP_PAGI'
                                ? 'border-slate-900 bg-slate-900 text-white shadow-2xs'
                                : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                        }`}
                    >
                        <div className="flex items-center gap-1.5">
                            <ArrowDownToLine className="w-3.5 h-3.5" />
                            <span className="font-bold text-xs">Restock & Bayar Laci (COD)</span>
                        </div>
                        <kbd className={`text-[9px] font-mono ${activeTab === 'DROP_PAGI' ? 'text-slate-300' : 'text-slate-400'}`}>
                            F1
                        </kbd>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('DIREKTORI')}
                        className={`py-2 px-3 rounded-2xl border-2 flex flex-col items-center gap-0.5 transition-all cursor-pointer ${
                            activeTab === 'DIREKTORI'
                                ? 'border-slate-900 bg-slate-900 text-white shadow-2xs'
                                : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                        }`}
                    >
                        <div className="flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5" />
                            <span className="font-bold text-xs">Katalog & Info Suplier</span>
                        </div>
                        <kbd className={`text-[9px] font-mono ${activeTab === 'DIREKTORI' ? 'text-slate-300' : 'text-slate-400'}`}>
                            F2
                        </kbd>
                    </button>
                </div>

                <button
                    type="button"
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="hidden md:flex w-10 h-10 bg-white rounded-xl shadow-2xs hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors border border-slate-200 cursor-pointer shrink-0 items-center justify-center"
                    title="Tutup (Esc)"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-between gap-3 mb-4 shrink-0">
            {/* Ritual Buttons matching PosPaymentModal */}
            <div className="grid grid-cols-3 gap-2 flex-1">
                <button
                    type="button"
                    onClick={() => setActiveTab('DROP_PAGI')}
                    className={`py-2 px-3 rounded-2xl border-2 flex flex-col items-center gap-0.5 transition-all cursor-pointer ${
                        activeTab === 'DROP_PAGI'
                            ? 'border-slate-900 bg-slate-900 text-white shadow-2xs'
                            : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                >
                    <div className="flex items-center gap-1.5">
                        <ArrowDownToLine className="w-3.5 h-3.5" />
                        <span className="font-bold text-xs">{isAllShelf ? 'Restock Barang' : 'Drop Pagi'}</span>
                    </div>
                    <kbd className={`text-[9px] font-mono ${activeTab === 'DROP_PAGI' ? 'text-slate-300' : 'text-slate-400'}`}>
                        F1
                    </kbd>
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab('RETUR_SORE')}
                    className={`py-2 px-3 rounded-2xl border-2 flex flex-col items-center gap-0.5 transition-all cursor-pointer ${
                        activeTab === 'RETUR_SORE'
                            ? 'border-slate-900 bg-slate-900 text-white shadow-2xs'
                            : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                >
                    <div className="flex items-center gap-1.5">
                        <HandCoins className="w-3.5 h-3.5" />
                        <span className="font-bold text-xs">{isAllShelf ? 'Pencairan Saldo' : 'Retur & Bayar'}</span>
                    </div>
                    <kbd className={`text-[9px] font-mono ${activeTab === 'RETUR_SORE' ? 'text-slate-300' : 'text-slate-400'}`}>
                        F2
                    </kbd>
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab('DIREKTORI')}
                    className={`py-2 px-3 rounded-2xl border-2 flex flex-col items-center gap-0.5 transition-all cursor-pointer ${
                        activeTab === 'DIREKTORI'
                            ? 'border-slate-900 bg-slate-900 text-white shadow-2xs'
                            : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                >
                    <div className="flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span className="font-bold text-xs">Info & Riwayat</span>
                    </div>
                    <kbd className={`text-[9px] font-mono ${activeTab === 'DIREKTORI' ? 'text-slate-300' : 'text-slate-400'}`}>
                        F3
                    </kbd>
                </button>
            </div>

            {/* Close Button on Desktop */}
            <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="hidden md:flex w-10 h-10 bg-white rounded-xl shadow-2xs hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors border border-slate-200 cursor-pointer shrink-0 items-center justify-center"
                title="Tutup (Esc)"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}
