import React from 'react';
import { ArrowDownRight, ArrowUpRight, Plus, Receipt, Vault } from 'lucide-react';

const CATEGORY_LABELS = {
    'KONSUMSI_OPS': 'Air Galon & Konsumsi',
    'PACKING': 'Kantong Kresek / Plastik',
    'PERLENGKAPAN': 'Kebersihan & Toko',
    'MODAL_RECEH': 'Injeksi Modal Receh',
    'SETOR_BRANKAS': 'Setor Brankas / Drop',
    'BAYAR_SUPPLIER': 'Bayar Utang / Bagi Hasil Supplier',
    'SUPPLIER_COD': 'Bayar Supplier (COD)',
    'LAINNYA': 'Lain-lain',
};

export default function ShiftMovementsHistory({ movements = [], onOpenCashMovement }) {
    return (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-2.5">
                    <Receipt className="w-4 h-4 text-slate-500 shrink-0" strokeWidth={1.75} />
                    <div>
                        <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                            Mutasi Kas Laci (Petty Cash)
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Daftar pemasukan dan pengeluaran kas kecil selama shift berjalan
                        </p>
                    </div>
                </div>
                {onOpenCashMovement && (
                    <button
                        type="button"
                        onClick={onOpenCashMovement}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-all cursor-pointer shadow-xs active:scale-95"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Catat Kas (F6)</span>
                    </button>
                )}
            </div>

            {/* Ledger List */}
            {movements.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                    <Receipt className="w-7 h-7 mx-auto mb-2 text-slate-300" strokeWidth={1.5} />
                    <p className="text-xs font-medium">Belum ada mutasi kas kecil pada shift ini.</p>
                </div>
            ) : (
                <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto custom-scrollbar">
                    {movements.map((mov) => {
                        const isOut = mov.type === 'CASH_OUT';
                        const isDrop = mov.type === 'CASH_DROP';
                        const amount = Number(mov.amount || 0);

                        return (
                            <div key={mov.id} className="p-3.5 sm:p-4 hover:bg-slate-50/60 transition-colors flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3 min-w-0">
                                    {/* Naked Inline Glyph Indicator */}
                                    <div className="shrink-0 text-slate-400">
                                        {isOut ? (
                                            <ArrowDownRight className="w-4 h-4 text-slate-500" strokeWidth={2} />
                                        ) : isDrop ? (
                                            <Vault className="w-4 h-4 text-slate-500" strokeWidth={2} />
                                        ) : (
                                            <ArrowUpRight className="w-4 h-4 text-slate-700" strokeWidth={2} />
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-slate-900 text-xs sm:text-sm truncate">
                                                {CATEGORY_LABELS[mov.category] || mov.category}
                                            </span>
                                            <span className="text-[11px] font-mono text-slate-400">
                                                &bull; {new Date(mov.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        {mov.description && (
                                            <p className="text-xs text-slate-500 truncate mt-0.5">
                                                {mov.description}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="text-right shrink-0">
                                    <span className="font-bold font-tabular text-xs sm:text-sm text-slate-900">
                                        {isOut || isDrop ? '-' : '+'}Rp {amount.toLocaleString('id-ID')}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

