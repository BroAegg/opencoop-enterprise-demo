import React from 'react';
import { 
    Barcode as BarcodeIcon, 
    PauseCircle, 
    Wallet, 
    X, 
    Store, 
    Keyboard,
} from 'lucide-react';

/**
 * PosTopActionBar
 * 
 * Apple HIG Top Action Bar for POS:
 * Combines high-velocity Barcode input, Multiplier tag, touch keyboard toggle,
 * and quick-action triggers (F9 Vendor, F6 Cash Movement, F5 Held Orders).
 */
export default function PosTopActionBar({
    searchQuery = '',
    setSearchQuery,
    searchInputRef,
    onKeyDown,
    isTouchDevice = false,
    isManualTyping = false,
    onToggleManualTyping,
    pendingMultiplier = 1,
    onClearMultiplier,
    onOpenConsignmentModal,
    onOpenCashMovement,
    onOpenHeldModal,
    heldOrdersCount = 0,
}) {
    const handleClearText = () => {
        setSearchQuery('');
        if (!isTouchDevice) {
            searchInputRef?.current?.focus();
        } else {
            onToggleManualTyping?.(false);
            searchInputRef?.current?.blur();
        }
    };

    return (
        <div className="flex items-stretch gap-2 sm:gap-2.5 shrink-0 h-12 sm:h-13">
            {/* Barcode / Search Input Field */}
            <div className="flex-1 bg-white p-1.5 sm:p-2 rounded-2xl shadow-2xs border border-slate-200 flex items-center">
                <div className="flex-1 h-full relative flex items-center">
                    <BarcodeIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                    
                    <input 
                        ref={searchInputRef}
                        type="text"
                        inputMode={isTouchDevice && !isManualTyping ? 'none' : 'text'}
                        readOnly={isTouchDevice && !isManualTyping}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={onKeyDown}
                        onClick={() => {
                            if (isTouchDevice && !isManualTyping) {
                                onToggleManualTyping?.(true);
                            }
                        }}
                        placeholder={
                            isTouchDevice && !isManualTyping
                                ? "Scanner Siaga (Scan Barcode) · Sentuh untuk ketik..."
                                : "Scan barcode atau ketik SKU / nama..."
                        }
                        className={`w-full h-full bg-slate-50 border-none rounded-xl pl-11 ${
                            isTouchDevice ? 'pr-20' : (pendingMultiplier > 1 ? 'pr-28' : searchQuery ? 'pr-10' : 'pr-4')
                        } py-2 text-[13px] sm:text-[15px] font-medium shadow-inner focus:ring-2 focus:ring-slate-900/10 focus:bg-white transition-all outline-none`}
                    />

                    {/* Input Right Accessory Actions */}
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5 select-none">
                        {searchQuery && (
                            <button 
                                type="button" 
                                onClick={handleClearText}
                                className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-md transition-colors cursor-pointer"
                                title="Bersihkan teks"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}

                        {/* Keyboard toggle for touch tablets */}
                        {isTouchDevice && (
                            <button
                                type="button"
                                onClick={() => onToggleManualTyping?.(!isManualTyping)}
                                className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                                    isManualTyping
                                        ? 'bg-slate-900 text-white shadow-2xs'
                                        : 'bg-slate-200/80 text-slate-600 hover:bg-slate-300'
                                    }`}
                                title={isManualTyping ? "Ketik manual aktif (Sentuh untuk tutup)" : "Buka keyboard virtual"}
                            >
                                <Keyboard className="w-4 h-4" />
                            </button>
                        )}

                        {/* Multiplier Pill (e.g. ×5 Qty) */}
                        {pendingMultiplier > 1 && (
                            <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-900 text-white text-xs font-bold font-tabular shadow-2xs">
                                <span>×{pendingMultiplier} Qty</span>
                                {onClearMultiplier && (
                                    <button 
                                        type="button" 
                                        onClick={onClearMultiplier}
                                        className="hover:text-rose-300 transition-colors p-0.5 rounded cursor-pointer"
                                        title="Batalkan Multiplier"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Vendor & Mitra Toko Quick Trigger (F9) */}
            <button 
                type="button"
                onClick={onOpenConsignmentModal}
                className="bg-white h-full px-3.5 sm:px-4 rounded-2xl shadow-2xs border border-slate-200 hover:border-slate-300 flex items-center justify-center gap-2 text-slate-700 hover:bg-slate-50 transition-all cursor-pointer active:scale-95 relative shrink-0 min-w-[50px] sm:min-w-[64px]"
                title="Vendor & Mitra Toko: Titipan Harian & Beli Putus COD (F9)"
            >
                <Store className="w-5 h-5 text-slate-700 shrink-0" />
                {!isTouchDevice && (
                    <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono font-bold bg-slate-100 text-slate-500 rounded border border-slate-200/80">F9</kbd>
                )}
            </button>

            {/* Kas Laci / Petty Cash Quick Trigger (F6) */}
            <button 
                type="button"
                onClick={onOpenCashMovement}
                className="bg-white h-full px-3.5 sm:px-4 rounded-2xl shadow-2xs border border-slate-200 hover:border-slate-300 flex items-center justify-center gap-2 text-slate-700 hover:bg-slate-50 transition-all cursor-pointer active:scale-95 relative shrink-0 min-w-[50px] sm:min-w-[64px]"
                title="Arus Kas Laci / Kas Kecil (F6)"
            >
                <Wallet className="w-5 h-5 text-slate-700 shrink-0" />
                {!isTouchDevice && (
                    <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono font-bold bg-slate-100 text-slate-500 rounded border border-slate-200/80">F6</kbd>
                )}
            </button>

            {/* Held Orders Quick Trigger (F5) */}
            <button 
                type="button"
                onClick={onOpenHeldModal}
                className="bg-white h-full px-3.5 sm:px-4 rounded-2xl shadow-2xs border border-slate-200 hover:border-slate-300 flex items-center justify-center gap-2 text-slate-700 hover:bg-slate-50 transition-all relative cursor-pointer active:scale-95 shrink-0 min-w-[50px] sm:min-w-[64px]"
                title="Daftar Transaksi Diparkir (F5)"
            >
                <PauseCircle className="w-5 h-5 text-slate-700 shrink-0" />
                {!isTouchDevice && (
                    <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono font-bold bg-slate-100 text-slate-500 rounded border border-slate-200/80">F5</kbd>
                )}
                {heldOrdersCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-slate-900 text-white text-[11px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-2xs font-tabular">
                        {heldOrdersCount}
                    </span>
                )}
            </button>
        </div>
    );
}
