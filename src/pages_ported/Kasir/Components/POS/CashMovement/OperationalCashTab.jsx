import React from 'react';
import { CheckCircle2, AlertCircle, Store, ArrowRight } from 'lucide-react';
import FormCurrencyInput from '@/Components/UI/FormCurrencyInput';

const PRESETS_BY_INTENT = {
    TOKO: [10000, 20000, 50000, 100000],
    GAJI_MAKAN: [20000, 50000, 75000, 100000, 150000],
    LAINNYA: [10000, 20000, 50000, 100000],
    CASH_IN: [50000, 100000, 200000, 500000],
    CASH_DROP: [200000, 500000, 1000000, 2000000],
};

const QUICK_DESCRIPTIONS = {
    TOKO: [
        { label: 'Kantong kresek / plastik', cat: 'PACKING' },
        { label: 'Air galon & konsumsi toko', cat: 'KONSUMSI_OPS' },
        { label: 'Alat kebersihan toko', cat: 'PERLENGKAPAN' },
    ],
    GAJI_MAKAN: [
        { label: 'Uang makan kasir harian', cat: 'LAINNYA' },
        { label: 'Gaji harian staf', cat: 'LAINNYA' },
    ],
    LAINNYA: [
        { label: 'Pulsa / paket data kasir', cat: 'LAINNYA' },
        { label: 'Biaya kirim / transport operasional', cat: 'LAINNYA' },
    ],
    CASH_IN: [
        { label: 'Tambahan modal receh laci', cat: 'MODAL_RECEH' },
        { label: 'Sisa uang laci shift sebelumnya', cat: 'MODAL_RECEH' },
    ],
    CASH_DROP: [
        { label: 'Setor uang tunai ke brankas pengurus', cat: 'SETOR_BRANKAS' },
    ],
};

export default function OperationalCashTab({
    type,
    cashOutIntent = 'TOKO',
    amount,
    onAmountChange,
    numericAmount,
    availableCash = 0,
    onCategoryChange,
    description,
    onDescriptionChange,
    opsError,
    isSubmittingOps,
    onSubmit,
    onOpenConsignment,
    onCloseModal,
}) {
    const activeKey = type === 'CASH_OUT' ? cashOutIntent : type;
    const presets = PRESETS_BY_INTENT[activeKey] || PRESETS_BY_INTENT.LAINNYA;
    const quickChips = QUICK_DESCRIPTIONS[activeKey] || [];

    const exceedsCash = (type === 'CASH_OUT' || type === 'CASH_DROP') && numericAmount > availableCash;
    const isSubmitDisabled = isSubmittingOps || numericAmount < 500 || exceedsCash;

    return (
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
            {/* Amount Input */}
            <div>
                <FormCurrencyInput
                    label="Nominal Rupiah"
                    labelClassName="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                    autoFocus
                    value={amount}
                    onChange={(e) => onAmountChange(e.target.value)}
                    placeholder="0"
                    inputClassName="bg-slate-50 border-slate-200 rounded-2xl pr-4 py-3 font-bold font-tabular text-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 transition-all outline-none"
                />

                {/* Quick Nominal Presets (Apple HIG tactile targets) */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                    {presets.map((p) => (
                        <button
                            key={p}
                            type="button"
                            onClick={() => onAmountChange(p.toString())}
                            className={`h-9 px-3 rounded-xl text-xs font-semibold font-tabular border cursor-pointer active:scale-95 transition-all flex items-center justify-center ${
                                numericAmount === p
                                    ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                            }`}
                        >
                            Rp {p.toLocaleString('id-ID')}
                        </button>
                    ))}
                </div>

                {/* Inline Live Balance Notice (Calm No News is Good News feedback) */}
                {exceedsCash && (
                    <div className="flex items-center gap-2 p-2.5 mt-2.5 rounded-xl bg-slate-100 border border-slate-300 text-slate-700 text-xs font-medium">
                        <AlertCircle className="w-4 h-4 shrink-0 text-slate-500" />
                        <span>
                            Nominal melebihi saldo laci kasir saat ini (Tersedia: <strong className="font-mono text-slate-900">Rp {availableCash.toLocaleString('id-ID')}</strong>)
                        </span>
                    </div>
                )}
            </div>

            {/* Description + Context-Aware Quick Chips */}
            <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Keterangan / Keperluan
                </label>
                <input
                    type="text"
                    value={description}
                    onChange={(e) => onDescriptionChange(e.target.value)}
                    placeholder={
                        activeKey === 'GAJI_MAKAN'
                            ? 'Contoh: Uang makan siang kasir...'
                            : activeKey === 'TOKO'
                              ? 'Contoh: Beli 3 ikat kresek uk 24, air galon...'
                              : 'Ketik keterangan arus kas...'
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 transition-all outline-none"
                />

                {quickChips.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                        {quickChips.map((chip) => (
                            <button
                                key={chip.label}
                                type="button"
                                onClick={() => {
                                    onDescriptionChange(chip.label);
                                    onCategoryChange(chip.cat);
                                }}
                                className={`h-8 px-3 rounded-xl text-xs font-medium border cursor-pointer active:scale-95 transition-all flex items-center justify-center ${
                                    description === chip.label
                                        ? 'bg-slate-900 text-white border-slate-900'
                                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                                }`}
                            >
                                + {chip.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Backend Ops Error Banner */}
            {opsError && (
                <div className="flex items-center gap-2 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{opsError}</span>
                </div>
            )}

            {/* Contextual F9 Springboard Link (Only on CASH_OUT when onOpenConsignment is provided) */}
            {type === 'CASH_OUT' && onOpenConsignment && (
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-slate-200/80 text-slate-700 flex items-center justify-center shrink-0">
                            <Store className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-800 truncate">
                                Bayar Supplier COD atau Titipan Mitra?
                            </p>
                            <p className="text-[11px] text-slate-500 truncate">
                                Penerimaan & pelunasan vendor berada di modul Vendor (F9)
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => {
                            onCloseModal?.();
                            onOpenConsignment?.();
                        }}
                        className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer shrink-0 active:scale-95"
                    >
                        <span>Buka F9</span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                </div>
            )}

            {/* Primary Submit Button: Consistent Bottom Anchor */}
            <button
                type="submit"
                disabled={isSubmitDisabled}
                className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200 disabled:shadow-none text-white py-3.5 rounded-2xl font-bold text-sm shadow-xs active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer border border-transparent"
            >
                <CheckCircle2 className="w-4 h-4 text-slate-300" />
                <span>{isSubmittingOps ? 'Menyimpan...' : 'Simpan Arus Kas Laci'}</span>
            </button>
        </form>
    );
}

