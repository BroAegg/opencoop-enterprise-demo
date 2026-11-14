import React from 'react';
import { ScanBarcode } from 'lucide-react';

export default function PosCashTenderSection({
    cashReceived = 0,
    setCashReceived,
    quickCashOptions = [],
    onSwitchToQris = null,
}) {
    return (
        <div className="flex flex-col flex-1 min-h-0 justify-between gap-3">
            {/* Quick Cash Buttons */}
            <div>
                <h3 className="text-[11px] font-bold mb-2 text-slate-400 uppercase tracking-wider">
                    Nominal Cepat (Quick Cash)
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {quickCashOptions.map((amt, idx) => (
                        <button 
                            key={idx} 
                            type="button" 
                            onClick={() => setCashReceived(amt)}
                            className={`py-2.5 sm:py-3 px-3 rounded-xl text-xs sm:text-sm font-bold font-tabular transition-all border cursor-pointer active:scale-95 min-h-[44px] flex items-center justify-center ${
                                Number(cashReceived) === amt
                                    ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                                    : 'bg-slate-100 border-slate-200 text-slate-800 hover:bg-slate-200/80'
                            }`}
                        >
                            {idx === 0 ? 'Uang Pas' : `Rp ${amt.toLocaleString('id-ID')}`}
                        </button>
                    ))}
                </div>
            </div>
            
            {/* Numpad */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Papan Ketik (Numpad)
                    </h3>
                    <span className="text-[10px] text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                        Numpad Fisik Aktif
                    </span>
                </div>
                <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 'C', 0, '000'].map((num) => (
                        <button 
                            key={num} 
                            type="button" 
                            onClick={() => {
                                if (num === 'C') {
                                    setCashReceived(0);
                                } else {
                                    const current = (cashReceived || 0).toString();
                                    setCashReceived(Number(current === '0' ? num : current + num));
                                }
                            }}
                            className={`rounded-xl h-12 sm:h-13 text-xl font-bold font-tabular transition-all flex items-center justify-center active:scale-95 border cursor-pointer ${
                                num === 'C' 
                                    ? 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100' 
                                    : 'bg-slate-50 text-slate-800 border-slate-200/90 hover:bg-slate-100'
                            }`}
                        >
                            {num}
                        </button>
                    ))}
                </div>
            </div>

            {/* Anti-Receh Quick QRIS Escape Hatch */}
            {onSwitchToQris && (
                <div className="pt-2.5 mt-1 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-slate-400 font-medium truncate">
                        Kurang uang receh / antrean panjang?
                    </span>
                    <button
                        type="button"
                        onClick={onSwitchToQris}
                        className="shrink-0 px-2.5 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
                    >
                        <ScanBarcode className="w-3.5 h-3.5 text-sky-600" />
                        <span>Saran QRIS</span>
                        <kbd className="text-[9px] font-mono bg-white px-1 py-0.2 rounded text-sky-700 border border-sky-200">F2</kbd>
                    </button>
                </div>
            )}
        </div>
    );
}
