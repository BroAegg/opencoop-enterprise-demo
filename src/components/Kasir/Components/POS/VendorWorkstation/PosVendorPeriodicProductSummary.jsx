import React, { useMemo } from 'react';
import { PackageCheck } from 'lucide-react';

/**
 * PosVendorPeriodicProductSummary
 * 
 * Human-first sold products breakdown for Konsinyasi Berkala.
 * Replaces cryptic database voucher codes (#RCV-xxx) with actual product names and sold quantities.
 */
export default function PosVendorPeriodicProductSummary({
    unpaidBatches = [],
    unsettledBalance = 0,
    formatRp,
    scopeLabel = '',
}) {
    const { products, totalPcs } = useMemo(() => {
        const productMap = new Map();
        let total = 0;

        unpaidBatches.forEach((batch) => {
            (batch.items || []).forEach((item) => {
                const pid = item.product_id;
                const qtySold = Number(item.qty_sold || 0);
                const earned = Number(item.item_earned || (qtySold * Number(item.cost_price || 0)));

                if (qtySold > 0 || earned > 0) {
                    const existing = productMap.get(pid) || {
                        id: pid,
                        name: item.product_name || 'Produk Titipan',
                        qty_sold: 0,
                        amount: 0,
                    };
                    existing.qty_sold += qtySold;
                    existing.amount += earned;
                    total += qtySold;
                    productMap.set(pid, existing);
                }
            });
        });

        const list = Array.from(productMap.values());

        // Fallback if batch items are missing granular sold breakdown
        if (list.length === 0 && unsettledBalance > 0) {
            return {
                products: [{
                    id: 'fallback',
                    name: 'Penjualan Produk Titipan Rak',
                    qty_sold: null,
                    amount: unsettledBalance,
                }],
                totalPcs: 0,
            };
        }

        return { products: list, totalPcs: total };
    }, [unpaidBatches, unsettledBalance]);

    return (
        <div className="space-y-2 font-sans">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 px-0.5">
                <span className="flex items-center gap-1.5">
                    <PackageCheck className="w-3.5 h-3.5 text-slate-500" />
                    <span>Produk Terjual</span>
                    {scopeLabel && (
                        <span className="text-[11px] font-normal text-slate-500 font-mono">
                            ({scopeLabel})
                        </span>
                    )}
                </span>
                {totalPcs > 0 && (
                    <span className="text-slate-500 font-mono">
                        {totalPcs} pcs laku
                    </span>
                )}
            </div>

            <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 divide-y divide-slate-100 overflow-hidden">
                {products.map((p) => (
                    <div key={p.id} className="px-3.5 py-2.5 flex items-center justify-between gap-3 text-xs">
                        <div className="min-w-0">
                            <span className="font-bold text-slate-900 block truncate">
                                {p.name}
                            </span>
                            {p.qty_sold !== null && (
                                <span className="text-[11px] text-slate-500 font-mono">
                                    {p.qty_sold} pcs terjual
                                </span>
                            )}
                        </div>
                        <span className="font-mono font-bold text-slate-900 shrink-0">
                            {formatRp(p.amount)}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
