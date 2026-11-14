import React from 'react';
import { ScanBarcode, Loader2 } from 'lucide-react';
import FormCurrencyInput from '@/Components/UI/FormCurrencyInput';
import FormInput from '@/Components/UI/FormInput';
import FormNumberInput from '@/Components/UI/FormNumberInput';

/**
 * SupplierCodQuickAddForm
 * 
 * Modular sub-component for quick on-the-fly product registration
 * during POS COD direct store delivery intake.
 * Follows POS design system standards and 'No news is good news' calm styling.
 */
export default function SupplierCodQuickAddForm({
    supplierName = '',
    newProdName = '',
    onNewProdNameChange,
    newProdBarcode = '',
    onNewProdBarcodeChange,
    newProdCost = '',
    onNewProdCostChange,
    newProdPrice = '',
    onNewProdPriceChange,
    newProdQty = '1',
    onNewProdQtyChange,
    newProdUnit = 'pcs',
    onNewProdUnitChange,
    isSubmitting = false,
    onCancel,
    onSubmit,
}) {
    return (
        <form onSubmit={onSubmit} className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-slate-800">
                    Daftarkan Produk Baru {supplierName ? `• ${supplierName}` : ''}
                </span>
                <span className="text-[11px] text-slate-400">
                    Otomatis masuk daftar barang COD
                </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="sm:col-span-2">
                    <FormInput
                        label="Nama Produk"
                        labelClassName="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1"
                        placeholder="Contoh: Yakult Rasa Anggur"
                        value={newProdName}
                        onChange={(e) => onNewProdNameChange(e.target.value)}
                        inputClassName="bg-slate-50 border-slate-200 text-xs font-semibold py-2 focus:bg-white"
                        required
                    />
                </div>

                <div>
                    <FormInput
                        label="Barcode / SKU"
                        labelClassName="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1"
                        placeholder="Scan scanner / kosongkan auto"
                        icon={ScanBarcode}
                        value={newProdBarcode}
                        onChange={(e) => onNewProdBarcodeChange(e.target.value)}
                        inputClassName="font-mono bg-slate-50 border-slate-200 text-xs py-2 focus:bg-white"
                    />
                </div>

                <div>
                    <FormInput
                        label="Satuan"
                        labelClassName="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1"
                        placeholder="pcs / botol / pack"
                        value={newProdUnit}
                        onChange={(e) => onNewProdUnitChange(e.target.value)}
                        inputClassName="bg-slate-50 border-slate-200 text-xs py-2 focus:bg-white"
                    />
                </div>

                <div>
                    <FormCurrencyInput
                        label="Harga Modal Beli (@)"
                        labelClassName="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1"
                        placeholder="2100"
                        value={newProdCost}
                        onChange={(e) => onNewProdCostChange(e.target.value)}
                        inputClassName="bg-slate-50 border-slate-200 text-xs font-bold py-2 focus:bg-white"
                        required
                    />
                </div>

                <div>
                    <FormCurrencyInput
                        label="Harga Jual Kasir (@)"
                        labelClassName="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1"
                        placeholder="2600"
                        value={newProdPrice}
                        onChange={(e) => onNewProdPriceChange(e.target.value)}
                        inputClassName="bg-slate-50 border-slate-200 text-xs font-bold py-2 focus:bg-white"
                        required
                    />
                </div>
            </div>

            <div className="flex items-end justify-between gap-3 pt-1 border-t border-slate-100">
                <div className="w-32">
                    <FormNumberInput
                        label="Qty Masuk"
                        labelClassName="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1"
                        placeholder="1"
                        suffix={newProdUnit || 'pcs'}
                        value={newProdQty}
                        onChange={(e) => onNewProdQtyChange(e.target.value)}
                        inputClassName="bg-slate-50 border-slate-200 text-xs font-bold py-2 focus:bg-white"
                    />
                </div>

                <div className="flex items-center gap-2">
                    {onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 cursor-pointer transition-colors"
                        >
                            Batal
                        </button>
                    )}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-2xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>Menyimpan...</span>
                            </>
                        ) : (
                            <span>Simpan & Tambah ke COD</span>
                        )}
                    </button>
                </div>
            </div>
        </form>
    );
}
