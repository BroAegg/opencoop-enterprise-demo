import { useState } from 'react';
import axios from 'axios';
import { toast } from '@/Components/UI/Toast';
import { playScanSound } from '@/Utils/barcodeScanner';
import { thermalPrinter } from '@/Utils/thermalPrinterDriver';
import { printReceiptInPage } from '@/Utils/inPageReceiptPrinter';

export default function useRiwayatVoidAndReceipt({
    trxList = [],
    setTrxList,
    coop,
}) {
    const [selectedTrx, setSelectedTrx] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isVoidAuthOpen, setIsVoidAuthOpen] = useState(false);
    const [voidCandidate, setVoidCandidate] = useState(null);
    const [voidReason, setVoidReason] = useState('Pembeli membatalkan pesanan');

    const handlePrintReceipt = (trxOrId) => {
        const trx = typeof trxOrId === 'object' ? trxOrId : trxList.find(t => t.id === trxOrId);
        const pStat = thermalPrinter.getStatus();
        if (pStat.isConnected && trx) {
            thermalPrinter.printTransaction(trx, coop)
                .then(() => toast.success('Struk berhasil dicetak ulang via ESC/POS!'))
                .catch(() => {
                    printReceiptInPage(trx, coop);
                });
            return;
        }

        if (trx) {
            printReceiptInPage(trx, coop);
        } else {
            const id = trx?.id || trxOrId;
            window.open(`/kasir/receipt/${id}`, '_blank', 'width=400,height=600');
        }
    };

    const handlePromptVoid = (trx) => {
        setVoidCandidate(trx);
        setVoidReason('Pembeli membatalkan pesanan');
        setIsVoidAuthOpen(true);
    };

    const handleAuthorizedVoid = async ({ pin }) => {
        if (!voidCandidate) return;

        try {
            const res = await axios.post(`/kasir/api/transaction/${voidCandidate.id}/void`, {
                pin,
                reason: voidReason,
            });

            playScanSound('multiplier');
            toast.success(res.data.message || 'Transaksi berhasil di-VOID.');

            setTrxList(prev => prev.map(t => t.id === voidCandidate.id ? res.data.transaction : t));
            setVoidCandidate(null);
        } catch (err) {
            playScanSound('error');
            toast.error(err.response?.data?.message || 'Gagal membatalkan transaksi.');
        }
    };

    const handleSwitchPaymentMethod = async (trx, newMethod) => {
        try {
            const res = await axios.post(`/kasir/api/transaction/${trx.id}/switch-payment-method`, {
                new_payment_method: newMethod,
            });
            playScanSound('multiplier');
            toast.success(res.data.message || `Metode pembayaran berhasil diubah ke ${newMethod}.`);
            const updated = res.data.transaction;
            if (updated) {
                setTrxList(prev => prev.map(t => t.id === trx.id ? updated : t));
                setSelectedTrx(updated);
            }
        } catch (err) {
            playScanSound('error');
            toast.error(err.response?.data?.message || 'Gagal mengubah metode pembayaran.');
        }
    };

    return {
        selectedTrx,
        setSelectedTrx,
        isDetailOpen,
        setIsDetailOpen,
        isVoidAuthOpen,
        setIsVoidAuthOpen,
        voidCandidate,
        handlePrintReceipt,
        handlePromptVoid,
        handleAuthorizedVoid,
        handleSwitchPaymentMethod,
    };
}

