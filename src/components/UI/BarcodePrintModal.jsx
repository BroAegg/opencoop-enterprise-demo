import React, { useEffect, useRef, useState } from 'react';
import Modal from '@/Components/UI/Modal';
import Button from '@/Components/UI/Button';
import { Barcode, Printer } from 'lucide-react';
import JsBarcode from 'jsbarcode';
import { printBarcodeDocument } from './Barcode/printDocumentHelper';
import CashierCardItem from './Barcode/CashierCardItem';
import StickerCardItem from './Barcode/StickerCardItem';
import SingleMasterCardItem from './Barcode/SingleMasterCardItem';
import BarcodeModeHeader from './Barcode/BarcodeModeHeader';

/**
 * BarcodePrintModal
 *
 * Clean Apple HIG Print & Asset Sheet:
 * - single_master -> File Desain Kemasan Pabrik (55x25mm Vector SVG & PDF Kemasan)
 * - sticker_grid  -> Lembar Stiker Siap Cetak (A4 Grid 102 Barcodes)
 * - cashier_sheet -> Katalog Barcode Meja Kasir (A4 Display)
 */
const normalizeMode = (mode) => {
    if (!mode) return 'single_master';
    const lower = String(mode).toLowerCase();
    if (lower.includes('single') || lower.includes('master') || lower.includes('packaging')) return 'single_master';
    if (lower.includes('sticker')) return 'sticker_grid';
    if (lower.includes('cashier')) return 'cashier_sheet';
    return 'single_master';
};

export default function BarcodePrintModal({ 
    isOpen, 
    onClose, 
    products = [], 
    supplierName = '',
    initialMode = 'single_master'
}) {
    const [activePrintMode, setActivePrintMode] = useState(() => normalizeMode(initialMode));
    const [selectedProductId, setSelectedProductId] = useState('ALL');
    const [copiedSku, setCopiedSku] = useState(null);

    const containerRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            setActivePrintMode(normalizeMode(initialMode));
            setSelectedProductId('ALL');
        }
    }, [isOpen, initialMode]);

    const validProducts = (products || []).map((p) => ({
        ...p,
        code: String(p.barcode || p.sku || `PRD-${p.id}`).trim(),
        displayName: p.name || 'Produk',
    }));

    const TOTAL_SLOTS = 102;
    const COLUMNS = 6;
    const ROWS = 17;

    let renderList = [];
    if (activePrintMode === 'cashier_sheet' || activePrintMode === 'single_master') {
        renderList = selectedProductId === 'ALL' 
            ? validProducts 
            : validProducts.filter((p) => String(p.id) === String(selectedProductId));
    } else {
        if (selectedProductId !== 'ALL') {
            const targetProduct = validProducts.find((p) => String(p.id) === String(selectedProductId)) || validProducts[0];
            if (targetProduct) {
                renderList = Array.from({ length: TOTAL_SLOTS }, (_, idx) => ({
                    ...targetProduct,
                    renderKey: `${targetProduct.id}-${idx}`,
                }));
            }
        } else {
            const prodCount = validProducts.length;
            if (prodCount > 0) {
                const baseRows = Math.floor(ROWS / prodCount);
                const extraRows = ROWS % prodCount;
                validProducts.forEach((prod, pIdx) => {
                    const allocatedRows = baseRows + (pIdx < extraRows ? 1 : 0);
                    const slots = allocatedRows * COLUMNS;
                    for (let i = 0; i < slots; i++) {
                        renderList.push({
                            ...prod,
                            renderKey: `${prod.id}-${pIdx}-${i}`,
                        });
                    }
                });
            }
        }
    }

    useEffect(() => {
        if (!isOpen || !containerRef.current) return;

        const timeout = setTimeout(() => {
            renderList.forEach((item, index) => {
                const svgId = `barcode-svg-${item.renderKey || item.id || index}`;
                const el = document.getElementById(svgId);
                if (el && item.code) {
                    try {
                        JsBarcode(el, String(item.code), {
                            format: 'CODE128',
                            displayValue: true,
                            fontSize: activePrintMode === 'single_master' ? 14 : activePrintMode === 'cashier_sheet' ? 12 : 8,
                            textMargin: activePrintMode === 'single_master' ? 3 : 1,
                            margin: activePrintMode === 'single_master' ? 2 : 1,
                            height: activePrintMode === 'single_master' ? 48 : activePrintMode === 'cashier_sheet' ? 42 : 22,
                            width: activePrintMode === 'single_master' ? 1.8 : activePrintMode === 'cashier_sheet' ? 1.5 : 1.1,
                        });
                    } catch (e) {
                        console.warn('Barcode gen failed for', item.code, e);
                    }
                }
            });
        }, 120);

        return () => clearTimeout(timeout);
    }, [isOpen, activePrintMode, selectedProductId, renderList.length]);

    const handleCopy = (sku) => {
        navigator.clipboard.writeText(sku);
        setCopiedSku(sku);
        setTimeout(() => setCopiedSku(null), 2000);
    };

    const handlePrint = () => {
        const printContents = containerRef.current?.innerHTML;
        printBarcodeDocument({
            activePrintMode,
            supplierName,
            printContents,
        });
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title="Label & Barcode Produk" 
            maxWidth={activePrintMode === 'single_master' && renderList.length === 1 ? 'xl' : '4xl'}
        >
            <div className="flex flex-col flex-1 overflow-hidden">
                {/* 1. Modal Top Bar: Segmented Mode Selector & Context Filter */}
                <div className="shrink-0 px-4 sm:px-6 py-3 border-b border-slate-100 bg-[#FAFAFB] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <BarcodeModeHeader
                        activePrintMode={activePrintMode}
                        setActivePrintMode={setActivePrintMode}
                    />

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                        {validProducts.length > 1 && (
                            <div className="flex items-center gap-1.5">
                                <label className="text-xs font-semibold text-slate-500 shrink-0">Produk:</label>
                                <select
                                    value={selectedProductId}
                                    onChange={(e) => setSelectedProductId(e.target.value)}
                                    className="text-xs font-semibold text-slate-800 bg-white border border-slate-200/90 rounded-xl px-2.5 py-1.5 focus:ring-2 focus:ring-[#1F6376]/20 focus:border-[#1F6376] w-full sm:w-auto shadow-2xs"
                                >
                                    <option value="ALL">Semua Produk ({validProducts.length})</option>
                                    {validProducts.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.displayName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {activePrintMode !== 'single_master' && (
                            <Button
                                variant="primary"
                                size="sm"
                                icon={Printer}
                                onClick={handlePrint}
                            >
                                {activePrintMode === 'cashier_sheet' ? 'Cetak Meja Kasir' : 'Cetak Stiker (A4)'}
                            </Button>
                        )}
                    </div>
                </div>

                {/* 2. Scrollable Preview Canvas */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 bg-slate-50/70 min-h-[280px] max-h-[62vh]">
                    <div
                        ref={containerRef}
                        className={
                            activePrintMode === 'cashier_sheet'
                                ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3'
                                : activePrintMode === 'single_master'
                                ? renderList.length === 1 
                                    ? 'max-w-md mx-auto'
                                    : 'grid grid-cols-1 md:grid-cols-2 gap-3.5'
                                : 'grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-1.5'
                        }
                    >
                        {renderList.map((item, idx) => {
                            const uniqueKey = item.renderKey || item.id || idx;
                            const svgId = `barcode-svg-${uniqueKey}`;

                            if (activePrintMode === 'cashier_sheet') {
                                return (
                                    <CashierCardItem
                                        key={uniqueKey}
                                        item={item}
                                        svgId={svgId}
                                        copiedSku={copiedSku}
                                        onCopy={handleCopy}
                                    />
                                );
                            }

                            if (activePrintMode === 'single_master') {
                                return (
                                    <SingleMasterCardItem
                                        key={uniqueKey}
                                        item={item}
                                        svgId={svgId}
                                        supplierName={supplierName}
                                        copiedSku={copiedSku}
                                        onCopy={handleCopy}
                                    />
                                );
                            }

                            return (
                                <StickerCardItem
                                    key={uniqueKey}
                                    item={item}
                                    svgId={svgId}
                                />
                            );
                        })}
                    </div>

                    {renderList.length === 0 && (
                        <div className="text-center py-12 text-slate-400 text-xs font-medium">
                            <Barcode className="w-8 h-8 mx-auto mb-2 opacity-30" />
                            Tidak ada barcode untuk ditampilkan.
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
}

