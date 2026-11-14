import axios from 'axios';
import { toast } from '@/Components/UI/Toast';
import { getOfflineQueueCount } from '@/Utils/posCatalogDb';
import { syncOfflineQueue } from '@/Utils/posOfflineQueue';

/**
 * executeConsignmentSettlement
 * 
 * Preflights offline queue, validates drawer cash limits, constructs settlement payload,
 * and submits settlement to the backend API.
 */
export async function executeConsignmentSettlement({
    selectedVendor,
    selectedVendorId,
    activeBatch,
    vendorBatches = [],
    hasPastUnsettled,
    includePastBalance,
    returCalculations,
    payoutMethod,
    splitCashAmount,
    splitTransferAmount,
    bankReference,
    returnShelfStock,
    scopedReconcileProducts,
    physicalRemainingMap,
    discrepancyMode,
    isPayingViaSplit,
    isPayingViaTransfer,
    availableCash,
    isExceedingDrawer,
    fetchConsignmentData,
}) {
    // 0. Pre-flight check: Ensure offline queue is synced before settlement
    try {
        const queueCount = await getOfflineQueueCount();
        if (queueCount > 0) {
            if (typeof navigator !== 'undefined' && !navigator.onLine) {
                toast.error(`Terdapat ${queueCount} transaksi kasir offline yang belum disinkronkan. Mohon sambungkan internet terlebih dahulu.`);
                return false;
            }
            toast.info(`Menyinkronkan ${queueCount} transaksi offline terlebih dahulu...`);
            await syncOfflineQueue();
            await fetchConsignmentData?.(true);
        }
    } catch (queueErr) {
        console.warn('Gagal cek antrean transaksi offline:', queueErr);
    }

    if (payoutMethod === 'CASH' && isExceedingDrawer) {
        toast.error(`Kas laci tidak mencukupi (Tersedia: Rp ${availableCash.toLocaleString('id-ID')}). Silakan gunakan opsi Split atau Transfer Bank.`);
        return false;
    }

    if (payoutMethod === 'SPLIT' && Number(splitCashAmount || 0) > availableCash) {
        toast.error(`Porsi tunai laci (Rp ${Number(splitCashAmount).toLocaleString('id-ID')}) melebihi kas fisik laci (Rp ${availableCash.toLocaleString('id-ID')}).`);
        return false;
    }

    const physicalCounts = scopedReconcileProducts.map(p => ({
        product_id: p.id,
        physical_remaining: physicalRemainingMap[p.id] !== undefined ? Number(physicalRemainingMap[p.id]) : p.system_stock,
    }));

    const discrepancySuffix = returCalculations.hasDiscrepancy
        ? ` [Selisih: ${discrepancyMode === 'POS_RECORDED' ? 'Sesuai Scan POS' : 'Tanggung Toko'}]`
        : '';

    const isBatchSettled = Boolean(activeBatch?.settlement_status === 'SETTLED');
    if (returCalculations.totalPayable <= 0 && !returnShelfStock) {
        toast.info(isBatchSettled ? 'Batch ini sudah lunas dicairkan.' : 'Tidak ada bagi hasil yang perlu dicairkan.');
        return false;
    }

    const targetDate = activeBatch?.received_date;
    const hasMultipleSameDayBatches = Boolean(targetDate && vendorBatches?.filter(b => b.received_date === targetDate).length > 1);

    const resolvedReceivingId = (hasPastUnsettled && includePastBalance) || isBatchSettled || hasMultipleSameDayBatches
        ? null
        : (activeBatch?.receiving_id || null);

    const payload = {
        supplier_id: selectedVendorId,
        receiving_id: resolvedReceivingId,
        amount: returCalculations.totalPayable,
        payment_method: payoutMethod,
        cash_amount: isPayingViaSplit ? Number(splitCashAmount || 0) : null,
        transfer_amount: isPayingViaSplit ? splitTransferAmount : null,
        reference_number: (isPayingViaTransfer || isPayingViaSplit) ? (bankReference.trim() || null) : null,
        return_shelf_stock: Boolean(returnShelfStock),
        physical_counts: returnShelfStock ? physicalCounts : null,
        notes: returnShelfStock
            ? `Retur sore & payout kasir F9 (${selectedVendor.name}) - ${isPayingViaSplit ? 'Kombinasi Tunai & Transfer' : (isPayingViaTransfer ? 'Transfer Bank' : 'Kas Laci')}${discrepancySuffix}`
            : `Pencairan bagi hasil berjalan kasir F9 (${selectedVendor.name}) - Stok toko tetap aman - ${isPayingViaSplit ? 'Kombinasi Tunai & Transfer' : (isPayingViaTransfer ? 'Transfer Bank' : 'Kas Laci')}`,
    };

    const res = await axios.post('/kasir/api/consignment/settle', payload);
    const defaultSuccessMsg = returnShelfStock
        ? (isPayingViaSplit
            ? `Bagi hasil kombinasi berhasil dicairkan (Rp ${Number(splitCashAmount).toLocaleString('id-ID')} Tunai + Rp ${splitTransferAmount.toLocaleString('id-ID')} Transfer) & sisa fisik diretur!`
            : (isPayingViaTransfer
                ? 'Bagi hasil berhasil diselesaikan via Transfer Bank & sisa fisik diretur!'
                : 'Bagi hasil dan retur sore berhasil dibayarkan dari kas laci!'))
        : (isPayingViaSplit
            ? `Bagi hasil penjualan berhasil dicairkan (Rp ${Number(splitCashAmount).toLocaleString('id-ID')} Tunai + Rp ${splitTransferAmount.toLocaleString('id-ID')} Transfer). Stok toko tetap aman!`
            : (isPayingViaTransfer
                ? 'Bagi hasil penjualan berhasil dicairkan via Transfer Bank. Stok toko tetap aman!'
                : `Bagi hasil penjualan Rp ${returCalculations.totalPayable.toLocaleString('id-ID')} berhasil dicairkan dari kas laci. Stok toko tetap aman!`));

    toast.success(res.data?.message || defaultSuccessMsg);
    return true;
}

