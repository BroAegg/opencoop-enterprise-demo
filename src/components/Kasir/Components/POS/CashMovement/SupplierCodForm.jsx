import React, { useState, useRef } from 'react';
import {
    Building2,
    Search,
    X,
    Check,
    PackageCheck,
    Plus,
    Truck,
    ShieldCheck,
    AlertCircle,
} from 'lucide-react';
import SupplierCodQuickAddForm from './SupplierCodQuickAddForm';
import CodCatalogSelector from './Components/CodCatalogSelector';
import CodIncomingItemsList from './Components/CodIncomingItemsList';
import CodReturnItemsList from './Components/CodReturnItemsList';
import CodInvoiceSummarySection from './Components/CodInvoiceSummarySection';

/**
 * SupplierCodForm
 * 
 * Unified COD (Direct Store Delivery) payment, receiving, and return form for POS Kasir.
 * Modular orchestrator leveraging dedicated subcomponents for catalog selection,
 * incoming items, returns/damaged items, and net settlement equations.
 */
export default function SupplierCodForm({
    amount,
    onAmountChange,
    numericAmount,
    availableCash,
    supplierName,
    onSupplierNameChange,
    selectedSupplier,
    onSelectSupplier,
    invoiceNumber,
    onInvoiceNumberChange,
    description,
    onDescriptionChange,
    suppliers = [],
    isLoadingSuppliers = false,
    errorMessage,
    onSubmit,
    // Itemized COD Receiving (Barang Masuk)
    codItems = [],
    supplierProducts = [],
    isLoadingSupplierProducts = false,
    onAddCodItem,
    onUpdateCodItemQty,
    onUpdateCodItemCost,
    onRemoveCodItem,
    user = null,
    // Itemized COD Returns (Barang Retur / Tarik Sisa)
    returnItems = [],
    onAddReturnItem,
    onUpdateReturnItemQty,
    onUpdateReturnItemCost,
    onUpdateReturnItemReason,
    onRemoveReturnItem,
    totalIncomingCost = 0,
    totalReturnCost = 0,
    netPayable = 0,
    isPureSwap = false,
    // Quick Add New Product
    isQuickAddOpen = false,
    onToggleQuickAdd,
    quickProdName = '',
    onQuickProdNameChange,
    quickProdBarcode = '',
    onQuickProdBarcodeChange,
    quickProdCost = '',
    onQuickProdCostChange,
    quickProdPrice = '',
    onQuickProdPriceChange,
    quickProdQty = '1',
    onQuickProdQtyChange,
    quickProdUnit = 'pcs',
    onQuickProdUnitChange,
    isSubmittingQuickProd = false,
    onQuickAddSubmit,
    onOpenQuickAddWithPrefill,
}) {
    const [searchFocused, setSearchFocused] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [productFilter, setProductFilter] = useState('');
    const [catalogMode, setCatalogMode] = useState('INCOMING'); // 'INCOMING' | 'RETURN'
    const searchDropdownRef = useRef(null);

    // Filter suppliers by query
    const filteredSuppliers = suppliers.filter((s) => {
        const q = (searchQuery || supplierName || '').toLowerCase().trim();
        if (!q) return true;
        const nameMatch = (s.name || '').toLowerCase().includes(q);
        const compMatch = (s.company_name || '').toLowerCase().includes(q);
        return nameMatch || compMatch;
    });

    const visibleProducts = supplierProducts.filter((p) => {
        if (!productFilter.trim()) return true;
        const q = productFilter.toLowerCase().trim();
        return (p.name || '').toLowerCase().includes(q) || (p.sku || '').toLowerCase().includes(q);
    });

    const totalItemsPcs = codItems.reduce((acc, it) => acc + (it.qty || 0), 0);
    const totalReturnPcs = returnItems.reduce((acc, it) => acc + (it.qty || 0), 0);
    const isSupervisorUser = user && (user.role === 'PENGURUS' || user.role === 'STAF');
    const isOverDrawerLimit = numericAmount > availableCash;
    const isPureSwapCondition = isPureSwap || (codItems.length > 0 && returnItems.length > 0 && numericAmount === 0);
    const canSubmit = supplierName.trim().length > 0 && invoiceNumber.trim().length > 0 && (
        isPureSwapCondition || (numericAmount >= 500 && !isOverDrawerLimit)
    );

    const handleSelectSupplierItem = (s) => {
        onSelectSupplier(s);
        onSupplierNameChange(s.company_name ? `${s.name} (${s.company_name})` : s.name);
        setSearchFocused(false);
        setSearchQuery('');
    };

    const handleClearSupplier = () => {
        onSelectSupplier(null);
        onSupplierNameChange('');
        setSearchQuery('');
    };

    return (
        <form onSubmit={onSubmit} className="space-y-4">
            {/* 1. Supplier / Sales Name: Locked Summary if selected, or Search Dropdown */}
            {selectedSupplier ? (
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0">
                            <Building2 className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                                <span className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                                    {selectedSupplier.name}
                                </span>
                                {selectedSupplier.code && (
                                    <span className="font-mono text-xs text-slate-400">· {selectedSupplier.code}</span>
                                )}
                            </div>
                            <span className="text-[11px] text-slate-500 block truncate">
                                {selectedSupplier.company_name || 'Pembelian Langsung Kasir (Beli Putus Toko)'}
                            </span>
                        </div>
                    </div>
                    <span className="text-[10px] font-semibold text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded-md shrink-0">
                        {selectedSupplier.partnership_type_label || selectedSupplier.partnership_type || 'KONSINYASI'}
                    </span>
                </div>
            ) : (
                <div className="relative" ref={searchDropdownRef}>
                    <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                            Supplier / Sales Driver <span className="text-rose-500">*</span>
                        </label>
                    </div>

                    <div className="relative">
                        <input
                            type="text"
                            value={supplierName}
                            onChange={(e) => {
                                onSupplierNameChange(e.target.value);
                                setSearchQuery(e.target.value);
                            }}
                            onFocus={() => setSearchFocused(true)}
                            placeholder="Cari nama supplier (cth: Yakult, Walls)..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-9 py-2.5 text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 transition-all outline-none"
                        />
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                            <Search className="w-4 h-4" />
                        </div>

                        {supplierName && (
                            <button
                                type="button"
                                onClick={handleClearSupplier}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-200/50 cursor-pointer"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>

                    {/* Dropdown Suggestions */}
                    {searchFocused && (
                        <div
                            className="absolute left-0 right-0 mt-1.5 bg-white rounded-2xl shadow-xl border border-slate-200 z-30 max-h-56 overflow-y-auto divide-y divide-slate-100"
                            onMouseDown={(e) => e.preventDefault()}
                        >
                            {filteredSuppliers.length > 0 ? (
                                <div className="p-1">
                                    <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                        Supplier Terdaftar
                                    </div>
                                    {filteredSuppliers.slice(0, 6).map((sup) => (
                                        <button
                                            key={sup.id}
                                            type="button"
                                            onClick={() => handleSelectSupplierItem(sup)}
                                            className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors flex items-center justify-between cursor-pointer group"
                                        >
                                            <div className="min-w-0 pr-2">
                                                <p className="text-xs font-bold text-slate-800 group-hover:text-slate-950 truncate">
                                                    {sup.name}
                                                </p>
                                                {sup.company_name && (
                                                    <p className="text-[11px] text-slate-500 truncate">
                                                        {sup.company_name}
                                                    </p>
                                                )}
                                            </div>
                                            <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 shrink-0">
                                                {sup.partnership_type_label || sup.partnership_type || 'KONSINYASI'}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            ) : null}

                            {supplierName.trim() && (
                                <div className="p-1.5 bg-slate-50">
                                    <button
                                        type="button"
                                        onClick={() => setSearchFocused(false)}
                                        className="w-full text-left px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:border-slate-300 flex items-center gap-2 cursor-pointer shadow-2xs"
                                    >
                                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                        <span className="truncate">Gunakan nama: <strong>"{supplierName.trim()}"</strong></span>
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* 2. Itemized Receiving Section (Barang Masuk) */}
            <div className="rounded-2xl bg-slate-50/70 border border-slate-200/80 p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-800">
                        <PackageCheck className="w-4 h-4 text-slate-500 shrink-0" strokeWidth={1.75} />
                        <span className="text-xs font-bold">Barang Masuk</span>
                    </div>

                    <div className="flex items-center gap-2">
                        {totalItemsPcs > 0 && (
                            <span className="text-[10px] font-bold text-slate-700 bg-white px-2 py-0.5 rounded-md border border-slate-200 font-tabular">
                                {totalItemsPcs} pcs
                            </span>
                        )}
                        {selectedSupplier && (
                            <button
                                type="button"
                                onClick={onToggleQuickAdd}
                                className={`text-[11px] font-semibold px-2.5 py-1 rounded-xl border transition-all flex items-center gap-1 cursor-pointer active:scale-95 shadow-2xs ${
                                    isQuickAddOpen
                                        ? 'bg-slate-900 text-white border-slate-900'
                                        : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
                                }`}
                            >
                                <Plus className="w-3 h-3" />
                                <span>{isQuickAddOpen ? 'Tutup Form' : 'Produk Baru'}</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Modular Quick Add Form */}
                {isQuickAddOpen && selectedSupplier && (
                    <SupplierCodQuickAddForm
                        supplierName={selectedSupplier.name}
                        newProdName={quickProdName}
                        onNewProdNameChange={onQuickProdNameChange}
                        newProdBarcode={quickProdBarcode}
                        onNewProdBarcodeChange={onQuickProdBarcodeChange}
                        newProdCost={quickProdCost}
                        onNewProdCostChange={onQuickProdCostChange}
                        newProdPrice={quickProdPrice}
                        onNewProdPriceChange={onQuickProdPriceChange}
                        newProdQty={quickProdQty}
                        onNewProdQtyChange={onQuickProdQtyChange}
                        newProdUnit={quickProdUnit}
                        onNewProdUnitChange={onQuickProdUnitChange}
                        isSubmitting={isSubmittingQuickProd}
                        onCancel={onToggleQuickAdd}
                        onSubmit={onQuickAddSubmit}
                    />
                )}

                {/* Catalog Chips & Barcode Scanner */}
                <CodCatalogSelector
                    selectedSupplier={selectedSupplier}
                    catalogMode={catalogMode}
                    setCatalogMode={setCatalogMode}
                    totalItemsPcs={totalItemsPcs}
                    totalReturnPcs={totalReturnPcs}
                    productFilter={productFilter}
                    setProductFilter={setProductFilter}
                    visibleProducts={visibleProducts}
                    codItems={codItems}
                    returnItems={returnItems}
                    onAddCodItem={onAddCodItem}
                    onAddReturnItem={onAddReturnItem}
                    onOpenQuickAddWithPrefill={onOpenQuickAddWithPrefill}
                    isLoadingSupplierProducts={isLoadingSupplierProducts}
                />

                {/* Itemized Received List (Barang Masuk) */}
                <CodIncomingItemsList
                    codItems={codItems}
                    onUpdateCodItemCost={onUpdateCodItemCost}
                    onUpdateCodItemQty={onUpdateCodItemQty}
                    onRemoveCodItem={onRemoveCodItem}
                />
            </div>

            {/* 3. Itemized Return Section (Barang Retur / Tarik Sisa) */}
            <CodReturnItemsList
                returnItems={returnItems}
                totalReturnPcs={totalReturnPcs}
                totalReturnCost={totalReturnCost}
                catalogMode={catalogMode}
                setCatalogMode={setCatalogMode}
                onUpdateReturnItemCost={onUpdateReturnItemCost}
                onUpdateReturnItemReason={onUpdateReturnItemReason}
                onUpdateReturnItemQty={onUpdateReturnItemQty}
                onRemoveReturnItem={onRemoveReturnItem}
            />

            {/* 4. Equation Calculation Banner & Cash Drawer Nominal / Invoice Inputs */}
            <CodInvoiceSummarySection
                codItems={codItems}
                returnItems={returnItems}
                isPureSwapCondition={isPureSwapCondition}
                totalIncomingCost={totalIncomingCost}
                totalReturnCost={totalReturnCost}
                netPayable={netPayable}
                amount={amount}
                onAmountChange={onAmountChange}
                availableCash={availableCash}
                isOverDrawerLimit={isOverDrawerLimit}
                invoiceNumber={invoiceNumber}
                onInvoiceNumberChange={onInvoiceNumberChange}
                description={description}
                onDescriptionChange={onDescriptionChange}
            />

            {/* 5. Error Message Display */}
            {errorMessage && (
                <div className="flex items-center gap-2 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                </div>
            )}

            {/* 6. Submit Button (Clean, Calm Authority) */}
            <button
                type="submit"
                disabled={!canSubmit}
                className="w-full mt-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none text-white py-3.5 rounded-2xl font-bold text-sm shadow-xs active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
                {isPureSwapCondition ? (
                    <>
                        <PackageCheck className="w-4 h-4 text-emerald-300" />
                        <span>Konfirmasi Tukar Guling (Rp 0)</span>
                    </>
                ) : isSupervisorUser ? (
                    <>
                        <Truck className="w-4 h-4 text-slate-300" />
                        <span>Konfirmasi Bayar & Terima Barang{totalItemsPcs > 0 ? ` (${totalItemsPcs} pcs)` : ''}</span>
                    </>
                ) : (
                    <>
                        <ShieldCheck className="w-4 h-4 text-slate-300" />
                        <span>Otorisasi PIN & Bayar Nota (Rp {numericAmount.toLocaleString('id-ID')})</span>
                    </>
                )}
            </button>
        </form>
    );
}
