import React from 'react';
import { 
    PauseCircle, X, Trash2, ScanBarcode, Banknote, 
    CheckSquare, Square, CheckCheck 
} from 'lucide-react';

/**
 * PosHeldOrdersHeader: Apple HIG header, category tabs, and floating batch actions for POS Parkir modal.
 */
export default function PosHeldOrdersHeader({
    heldCount = 0,
    activeTab = 'ALL',
    setActiveTab,
    qrisCount = 0,
    cashCount = 0,
    filteredCount = 0,
    isAllFilteredSelected = false,
    toggleSelectAll,
    selectedCount = 0,
    selectedGrandTotal = 0,
    onBatchDelete,
    onOpenBatchConfirm,
    onClose,
}) {
    return (
        <>
            {/* Modal Top Bar */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 shrink-0">
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
                        <PauseCircle className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-slate-900 text-base leading-none">Antrean Parkir POS</h3>
                            <span className="text-[11px] font-bold font-tabular text-slate-700 bg-slate-200/80 px-2 py-0.5 rounded-full">
                                {heldCount} Total
                            </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                            Manajemen antrean cepat untuk rush-hour kasir
                        </p>
                    </div>
                </div>
                <button 
                    type="button" 
                    onClick={onClose} 
                    className="w-9 h-9 rounded-full hover:bg-slate-200/70 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer flex items-center justify-center"
                    title="Tutup (Esc)"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Filter Tabs & Select All */}
            <div className="px-4 py-2.5 border-b border-slate-200/70 bg-white flex items-center justify-between gap-2 overflow-x-auto shrink-0">
                <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
                    <button
                        type="button"
                        onClick={() => setActiveTab('ALL')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                            activeTab === 'ALL'
                                ? 'bg-white text-slate-900 shadow-2xs'
                                : 'text-slate-500 hover:text-slate-900'
                        }`}
                    >
                        <span>Semua</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === 'ALL' ? 'bg-slate-100 font-tabular' : 'bg-slate-200'}`}>
                            {heldCount}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('QRIS')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                            activeTab === 'QRIS'
                                ? 'bg-sky-500 text-white shadow-xs'
                                : 'text-slate-600 hover:text-sky-700'
                        }`}
                    >
                        <ScanBarcode className="w-3.5 h-3.5" />
                        <span>Kasir QRIS</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === 'QRIS' ? 'bg-sky-600 font-tabular' : 'bg-sky-100 text-sky-800'}`}>
                            {qrisCount}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('CASH')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                            activeTab === 'CASH'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-emerald-700'
                        }`}
                    >
                        <Banknote className="w-3.5 h-3.5" />
                        <span>Kasir Tunai</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === 'CASH' ? 'bg-emerald-700 font-tabular' : 'bg-emerald-100 text-emerald-800'}`}>
                            {cashCount}
                        </span>
                    </button>
                </div>

                {filteredCount > 0 && (
                    <button
                        type="button"
                        onClick={toggleSelectAll}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors cursor-pointer select-none"
                    >
                        {isAllFilteredSelected ? (
                            <CheckSquare className="w-4 h-4 text-emerald-600" />
                        ) : (
                            <Square className="w-4 h-4 text-slate-400" />
                        )}
                        <span>{isAllFilteredSelected ? 'Batal Pilih Semua' : 'Pilih Semua'}</span>
                    </button>
                )}
            </div>

            {/* Multi-Select Floating Action Toolbar */}
            {selectedCount > 0 && (
                <div className="bg-emerald-50/90 border-b border-emerald-200/80 px-4 py-2.5 flex items-center justify-between gap-3 text-xs shrink-0">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                        <span className="font-bold text-emerald-950 font-tabular">
                            {selectedCount} pesanan terpilih
                        </span>
                        <span className="text-emerald-700 font-extrabold font-tabular">
                            (Rp {selectedGrandTotal.toLocaleString('id-ID')})
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={onBatchDelete}
                            className="px-2.5 py-1.5 text-rose-700 hover:bg-rose-100 rounded-lg font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Hapus</span>
                        </button>
                        <button
                            type="button"
                            onClick={onOpenBatchConfirm}
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                            <CheckCheck className="w-4 h-4" />
                            <span>ACC & Bayar Sekaligus ({selectedCount})</span>
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
