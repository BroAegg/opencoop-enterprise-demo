import axios from 'axios';

/**
 * Calculates reconciliation metrics for previous drop (Terjual = Received - Remaining).
 */
export function computeDailyFreshReconItems(unpaidBatch, physicalRemainingMap, isFixedMargin, marginRate, discrepancyReasonsMap = {}) {
    if (!unpaidBatch || !unpaidBatch.items) return [];

    return unpaidBatch.items.map((it) => {
        const received = Number(it.qty_received || 0);
        const remaining = physicalRemainingMap[it.product_id] !== undefined
            ? Number(physicalRemainingMap[it.product_id])
            : Number(it.stock_remaining || 0);
        const sold = Math.max(0, received - remaining);
        const systemSold = Number(it.pos_qty ?? it.qty_sold ?? Math.max(0, received - Number(it.stock_remaining || 0)));
        const unscannedDiff = Math.max(0, sold - systemSold);
        const surplusDiff = Math.max(0, systemSold - sold);
        const defaultReason = surplusDiff > 0 ? 'OVER_SCAN' : 'LUPA_SCAN';
        const discrepancyReason = discrepancyReasonsMap[it.product_id] || defaultReason;

        const sellingPrice = Number(it.selling_price || 0);
        const cost = Number(it.cost_price || (isFixedMargin && sellingPrice > 0 ? sellingPrice * (1 - marginRate / 100) : 0));
        const earned = sold * cost;
        const omzet = sold * sellingPrice;
        const margin = Math.max(0, omzet - earned);

        return {
            productId: it.product_id,
            name: it.product_name,
            received,
            remaining,
            sold,
            systemSold,
            unscannedDiff,
            surplusDiff,
            discrepancyReason,
            sellingPrice,
            cost,
            earned,
            omzet,
            margin,
        };
    });
}

/**
 * Executes API settlement and morning drop reception in a unified transaction call.
 */
export async function submitDailyFreshTransactions({
    selectedVendor,
    unpaidBatch,
    shouldSettle,
    shouldReceive,
    totalHakMitra,
    payoutMethod,
    bankReference,
    reconItems,
    incomingQtys,
    receiptFile = null,
}) {
    let settleRes = null;
    let receiveRes = null;

    if (shouldSettle) {
        const physicalCounts = reconItems.map((it) => ({
            product_id: it.productId,
            physical_remaining: it.remaining,
            unscanned_qty: it.unscannedDiff || 0,
            surplus_qty: it.surplusDiff || 0,
            discrepancy_reason: it.discrepancyReason || (it.surplusDiff > 0 ? 'OVER_SCAN' : 'LUPA_SCAN'),
        }));

        settleRes = await axios.post('/kasir/api/consignment/settle', {
            supplier_id: selectedVendor.id,
            receiving_id: unpaidBatch?.receiving_id || null,
            receiving_ids: unpaidBatch?.receiving_ids || null,
            amount: totalHakMitra,
            payment_method: payoutMethod,
            reference_number: payoutMethod === 'BANK_TRANSFER' ? (bankReference?.trim() || null) : null,
            return_shelf_stock: true,
            physical_counts: physicalCounts,
            notes: `Pelunasan (${payoutMethod === 'BANK_TRANSFER' ? 'Transfer Bank' : 'Kasir Tunai'}) & retur fisik (${selectedVendor.name})`,
        });
    }

    if (shouldReceive) {
        const items = Object.entries(incomingQtys)
            .filter(([, qty]) => Number(qty) > 0)
            .map(([productId, qty]) => ({
                product_id: parseInt(productId, 10),
                qty: parseInt(qty, 10),
            }));

        if (items.length > 0) {
            if (receiptFile) {
                const formData = new FormData();
                formData.append('supplier_id', selectedVendor.id);
                formData.append('items', JSON.stringify(items));
                formData.append('notes', `Titipan drop kasir (${selectedVendor.name})`);
                formData.append('receipt_image', receiptFile);

                receiveRes = await axios.post('/kasir/api/consignment/receive', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            } else {
                receiveRes = await axios.post('/kasir/api/consignment/receive', {
                    supplier_id: selectedVendor.id,
                    items,
                    notes: `Titipan drop kasir (${selectedVendor.name})`,
                });
            }
        }
    }

    return { settleRes, receiveRes };
}

/**
 * Builds formatted data payload for the receipt and success feedback modal.
 */
export function buildDailyFreshSuccessData({
    settleRes,
    receiveRes,
    selectedVendor,
    shouldSettle,
    shouldReceive,
    totalHakMitra,
    payoutMethod,
    reconItems,
    incomingQtys,
    vendorProducts,
}) {
    const returnedList = shouldSettle
        ? reconItems.filter((it) => it.remaining > 0).map((it) => ({ name: it.name, qty: it.remaining }))
        : [];
    const incomingList = shouldReceive
        ? Object.entries(incomingQtys)
            .filter(([, qty]) => Number(qty) > 0)
            .map(([pId, qty]) => ({
                name: vendorProducts.find((p) => p.id === Number(pId))?.name || 'Produk',
                qty: Number(qty),
            }))
        : [];

    const rawPayload = {
        settlement: settleRes?.data?.settlement,
        supplier: selectedVendor,
        amount: shouldSettle ? totalHakMitra : 0,
        payment_method: shouldSettle ? payoutMethod : 'CASH',
        sold_items: shouldSettle
            ? reconItems.filter((it) => it.sold > 0).map((it) => ({
                product_name: it.name,
                qty_sold: it.sold,
                cost_price: it.cost,
                subtotal_earned: it.earned,
            }))
            : [],
        returned_items: returnedList.map((r) => ({
            name: r.name,
            qty_returned: r.qty,
        })),
    };

    let title = 'Titipan Pagi Diterima';
    if (shouldSettle && shouldReceive) {
        title = 'Pelunasan & Titipan Selesai';
    } else if (shouldSettle) {
        title = 'Pelunasan & Retur Selesai';
    }

    return {
        title,
        amount: shouldSettle ? totalHakMitra : 0,
        supplierName: selectedVendor.name,
        referenceNumber: settleRes?.data?.settlement?.settlement_number || receiveRes?.data?.receiving?.receiving_number,
        paymentMethod: shouldSettle ? payoutMethod : 'CASH',
        returnedItems: returnedList,
        incomingItems: incomingList,
        rawPayload,
    };
}

/**
 * Merges multiple open drops/batches into 1 consolidated batch object.
 */
export function buildConsolidatedBatch(batchList, dateLabel = null) {
    if (!batchList || batchList.length === 0) return null;
    if (batchList.length === 1) return batchList[0];

    const mergedItemsMap = {};
    let totalReceived = 0;
    let totalSold = 0;
    let totalRemaining = 0;
    let totalEarned = 0;
    let totalRetail = 0;
    const receivingIds = [];

    batchList.forEach((b) => {
        if (b.receiving_id) receivingIds.push(b.receiving_id);
        totalReceived += Number(b.total_received || 0);
        totalSold += Number(b.total_sold || 0);
        totalRemaining += Number(b.total_remaining || 0);
        totalEarned += Number(b.total_earned || 0);
        totalRetail += Number(b.total_retail || 0);

        (b.items || []).forEach((it) => {
            if (!mergedItemsMap[it.product_id]) {
                mergedItemsMap[it.product_id] = { ...it };
            } else {
                mergedItemsMap[it.product_id].qty_received = Number(mergedItemsMap[it.product_id].qty_received || 0) + Number(it.qty_received || 0);
                mergedItemsMap[it.product_id].stock_remaining = Number(mergedItemsMap[it.product_id].stock_remaining || 0) + Number(it.stock_remaining || 0);
                mergedItemsMap[it.product_id].qty_sold = Number(mergedItemsMap[it.product_id].qty_sold || 0) + Number(it.qty_sold || 0);
                mergedItemsMap[it.product_id].pos_qty = Number(mergedItemsMap[it.product_id].pos_qty || 0) + Number(it.pos_qty || 0);
                mergedItemsMap[it.product_id].item_earned = Number(mergedItemsMap[it.product_id].item_earned || 0) + Number(it.item_earned || 0);
                mergedItemsMap[it.product_id].item_retail = Number(mergedItemsMap[it.product_id].item_retail || 0) + Number(it.item_retail || 0);
            }
        });
    });

    return {
        receiving_id: null,
        receiving_ids: receivingIds,
        receiving_number: `Gabungan (${batchList.length} Nota Drop)`,
        received_date: dateLabel || batchList[0]?.received_date,
        received_date_formatted: dateLabel ? `Semua Drop ${dateLabel}` : `Semua Drop (${batchList.length} Batch)`,
        settlement_status: batchList.some((b) => b.settlement_status === 'UNPAID') ? 'UNPAID' : 'SETTLED',
        total_received: totalReceived,
        total_sold: totalSold,
        total_remaining: totalRemaining,
        total_earned: totalEarned,
        total_retail: totalRetail,
        items: Object.values(mergedItemsMap),
        is_consolidated: true,
        batch_count: batchList.length,
    };
}

/**
 * Resolves the primary active batch for daily fresh review.
 */
export function resolveDailyFreshActiveBatch({
    vendorBatches = [],
    unpaidBatches = [],
    isConsolidatedMode = false,
    selectedBatchId = null,
    selectedDate = null,
}) {
    if (!vendorBatches || vendorBatches.length === 0) return null;

    if (isConsolidatedMode && unpaidBatches.length > 1) {
        return buildConsolidatedBatch(unpaidBatches);
    }

    if (selectedBatchId) {
        const found = vendorBatches.find((b) => b.receiving_id === selectedBatchId);
        if (found) return found;
    }

    if (selectedDate) {
        const sameDayBatches = vendorBatches.filter((b) => b.received_date === selectedDate);
        if (sameDayBatches.length === 1) return sameDayBatches[0];
        if (sameDayBatches.length > 1) {
            return buildConsolidatedBatch(sameDayBatches, selectedDate);
        }
    }

    const todayStr = new Date().toISOString().slice(0, 10);
    const unpaidToday = unpaidBatches.find((b) => b.received_date === todayStr);
    if (unpaidToday) return unpaidToday;

    if (unpaidBatches.length > 0) {
        return unpaidBatches[unpaidBatches.length - 1];
    }

    const todayBatch = vendorBatches.find((b) => b.received_date === todayStr);
    return todayBatch || vendorBatches[0] || null;
}
