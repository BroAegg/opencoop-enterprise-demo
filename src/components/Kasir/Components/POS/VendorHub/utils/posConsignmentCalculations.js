/**
 * posConsignmentCalculations.js
 * 
 * Pure mathematical calculations for consignment evening return and physical reconciliation.
 * Implements "No News is Good News" principle:
 * When physical tray counts + POS sales exactly match morning drop (diff === 0), system is silent.
 * Discrepancies are isolated and quantified with calm neutral facts, avoiding cognitive alarm.
 */

export function calculateReturMetrics({
    displayReconcileProducts = [],
    physicalRemainingMap = {},
    activeBatch = null,
    totalUnsettledBalance = 0,
    hasPastUnsettled = false,
    includePastBalance = true,
    pastUnsettledBalance = 0,
    discrepancyMode = 'STORE_ABSORB', // 'STORE_ABSORB' | 'POS_RECORDED'
    returnShelfStock = true,
}) {
    let totalSold = 0;
    let totalReturned = 0;
    let currentBatchEarned = 0;
    let totalShortagePcs = 0;
    let totalShortageValue = 0;
    let totalSurplusPcs = 0;
    let totalSurplusValue = 0;

    const items = displayReconcileProducts.map((p) => {
        const remaining = physicalRemainingMap[p.id] !== undefined
            ? Number(physicalRemainingMap[p.id])
            : p.system_stock;

        let sold = 0;
        let subtotal = 0;
        let accountedFor = remaining;
        let diff = 0;
        let expectedRemaining = remaining;
        const initialCount = p.qty_received > 0 ? p.qty_received : p.system_stock;

        if (p.has_batch || (p.qty_received > 0 && Boolean(activeBatch))) {
            // Fresh / Morning batch workflow
            const unreturnedCount = Math.max(0, initialCount - remaining);
            sold = (discrepancyMode === 'POS_RECORDED' && p.qty_received > 0)
                ? Math.min(p.qty_sold_pos, unreturnedCount)
                : unreturnedCount;
            subtotal = sold * p.cost_price;

            accountedFor = p.qty_sold_pos + remaining;
            diff = p.qty_received > 0 ? accountedFor - p.qty_received : 0;
            expectedRemaining = p.qty_received > 0
                ? Math.max(0, p.qty_received - p.qty_sold_pos)
                : remaining;

            if (diff < 0) {
                const shortPcs = Math.abs(diff);
                totalShortagePcs += shortPcs;
                totalShortageValue += shortPcs * p.cost_price;
            } else if (diff > 0) {
                totalSurplusPcs += diff;
                totalSurplusValue += diff * p.cost_price;
            }
            if (returnShelfStock) {
                totalReturned += remaining;
            }
        } else {
            // Shelf goods / Non-batch POS sales reconciliation (e.g. Cemilan, Snack, Kopi)
            // Sold quantity is recorded directly by POS cashier scanner
            sold = p.qty_sold_pos;
            subtotal = sold * p.cost_price;
            accountedFor = p.qty_sold_pos;
            diff = 0;
            expectedRemaining = p.system_stock;
            if (returnShelfStock) {
                totalReturned += remaining;
            }
        }

        totalSold += sold;
        currentBatchEarned += subtotal;

        return {
            id: p.id,
            name: p.name,
            initialCount,
            qty_received: p.qty_received,
            qty_sold_pos: p.qty_sold_pos,
            system_stock: p.system_stock,
            is_perishable: p.is_perishable,
            requires_daily_return: p.requires_daily_return,
            has_batch: Boolean(p.has_batch),
            remaining,
            sold,
            costPrice: p.cost_price,
            subtotal,
            accountedFor,
            diff,
            expectedRemaining,
        };
    });

    // Tentukan jumlah yang harus dicairkan
    const isBatchSettled = Boolean(activeBatch?.settlement_status === 'SETTLED');
    let currentBatchPayable = currentBatchEarned;
    if (isBatchSettled) {
        currentBatchPayable = 0;
    } else if (activeBatch && totalUnsettledBalance > 0) {
        currentBatchPayable = Math.min(currentBatchEarned, totalUnsettledBalance);
    } else if (activeBatch && totalUnsettledBalance <= 0) {
        currentBatchPayable = 0;
    } else if (!activeBatch) {
        currentBatchPayable = totalUnsettledBalance > 0 ? totalUnsettledBalance : 0;
    }

    const totalPayable = (hasPastUnsettled && includePastBalance)
        ? currentBatchPayable + pastUnsettledBalance
        : (isBatchSettled ? (hasPastUnsettled ? pastUnsettledBalance : 0) : currentBatchPayable);

    const hasDiscrepancy = totalShortagePcs > 0 || totalSurplusPcs > 0;

    return {
        items,
        totalSold,
        totalReturned,
        currentBatchEarned,
        currentBatchPayable,
        pastUnsettledBalance,
        hasPastUnsettled,
        isBatchSettled,
        totalPayable: Math.max(0, totalPayable),
        totalShortagePcs,
        totalShortageValue,
        totalSurplusPcs,
        totalSurplusValue,
        hasDiscrepancy,
    };
}

/**
 * Builds normalized product list for Retur Sore reconciliation workspace
 */
export function buildDisplayReconcileProducts(vendorProducts = [], activeBatch = null, vendorBatches = []) {
    const prodMap = new Map((vendorProducts || []).map(p => [p.id, p]));

    if (activeBatch && activeBatch.items?.length > 0) {
        // Collect all batches for the same received date (if vendor had multiple drops on the same day)
        const targetDate = activeBatch.received_date;
        const sameDayBatches = (targetDate && vendorBatches?.length > 0)
            ? vendorBatches.filter(b => b.received_date === targetDate)
            : [activeBatch];

        // Aggregate items across all same-day batches
        const batchItemsMap = new Map();
        sameDayBatches.forEach(b => {
            (b.items || []).forEach(it => {
                const pid = it.product_id;
                if (!batchItemsMap.has(pid)) {
                    batchItemsMap.set(pid, {
                        product_id: pid,
                        product_name: it.product_name,
                        sku: it.sku,
                        cost_price: Number(it.cost_price || 0),
                        selling_price: Number(it.selling_price || 0),
                        qty_received: Number(it.qty_received || 0),
                        qty_sold: Number(it.qty_sold || 0),
                        stock_remaining: Number(it.stock_remaining || 0),
                    });
                } else {
                    const existing = batchItemsMap.get(pid);
                    existing.qty_received += Number(it.qty_received || 0);
                    existing.qty_sold += Number(it.qty_sold || 0);
                    existing.stock_remaining += Number(it.stock_remaining || 0);
                }
            });
        });

        const list = Array.from(batchItemsMap.values()).map(it => {
            const p = prodMap.get(it.product_id);
            const isPerishable = Boolean(p?.is_perishable || p?.requires_daily_return || false);
            return {
                id: it.product_id,
                name: it.product_name,
                sku: it.sku,
                cost_price: it.cost_price,
                selling_price: it.selling_price,
                qty_received: it.qty_received,
                qty_sold_pos: it.qty_sold,
                system_stock: it.stock_remaining,
                is_perishable: isPerishable,
                requires_daily_return: isPerishable,
                has_batch: true,
            };
        });

        vendorProducts.forEach(p => {
            const isPerishable = Boolean(p.is_perishable || p.requires_daily_return);
            if (!batchItemsMap.has(p.id) && (Number(p.stock || 0) > 0 || Number(p.unsettled_qty_sold || 0) > 0)) {
                list.push({
                    id: p.id,
                    name: p.name,
                    sku: p.sku,
                    cost_price: Number(p.cost_price || 0),
                    selling_price: Number(p.selling_price || 0),
                    qty_received: 0,
                    qty_sold_pos: Number(p.unsettled_qty_sold || 0),
                    system_stock: Number(p.stock || 0),
                    is_perishable: isPerishable,
                    requires_daily_return: isPerishable,
                    has_batch: false,
                });
            }
        });

        return list;
    }

    return (vendorProducts || []).map(p => {
        const isPerishable = Boolean(p.is_perishable || p.requires_daily_return);
        const unsettledSold = Number(p.unsettled_qty_sold || 0);
        return {
            id: p.id,
            name: p.name,
            sku: p.sku,
            cost_price: Number(p.cost_price || 0),
            selling_price: Number(p.selling_price || 0),
            qty_received: 0,
            qty_sold_pos: unsettledSold,
            system_stock: Number(p.stock || 0),
            is_perishable: isPerishable,
            requires_daily_return: isPerishable,
            has_batch: false,
        };
    });
}

/**
 * Filter products according to category scope (Perishable vs Shelf)
 */
export function filterScopedProducts(products = [], activeScope = 'ALL') {
    if (activeScope === 'PERISHABLE') {
        const filtered = products.filter(p => p.is_perishable || p.requires_daily_return);
        return filtered.length > 0 ? filtered : products;
    }
    if (activeScope === 'SHELF') {
        const filtered = products.filter(p => !p.is_perishable && !p.requires_daily_return);
        return filtered.length > 0 ? filtered : products;
    }
    return products;
}

