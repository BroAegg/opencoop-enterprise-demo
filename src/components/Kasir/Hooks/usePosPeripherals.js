import { useState, useEffect, useCallback } from 'react';
import { thermalPrinter } from '@/Utils/thermalPrinterDriver';
import { printReceiptInPage } from '@/Utils/inPageReceiptPrinter';
import { toast } from '@/Components/UI/Toast';

/**
 * usePosPeripherals: Peripheral & Hardware Device Manager for POS.
 * 
 * Encapsulates:
 * - Thermal printer connection lifecycle & subscription
 * - Hardware settings window event bridge
 * - Online / Offline network heartbeat
 * - Direct thermal receipt printing with fallback
 */
export function usePosPeripherals({ coop, onOpenHardwareModal } = {}) {
    const [isPrinterConnected, setIsPrinterConnected] = useState(() => thermalPrinter.getStatus().isConnected);
    const [isOnline, setIsOnline] = useState(() => typeof navigator !== 'undefined' ? navigator.onLine : true);

    useEffect(() => {
        thermalPrinter.autoReconnect();
        const unsubscribe = thermalPrinter.subscribe((st) => setIsPrinterConnected(st.isConnected));

        const handleOpenHardware = () => {
            onOpenHardwareModal?.();
        };

        window.addEventListener('open-pos-hardware-settings', handleOpenHardware);

        return () => {
            unsubscribe();
            window.removeEventListener('open-pos-hardware-settings', handleOpenHardware);
        };
    }, [onOpenHardwareModal]);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const printReceipt = useCallback(async (trx) => {
        if (!trx) return;
        const pStat = thermalPrinter.getStatus();
        if (pStat.isConnected) {
            try {
                await thermalPrinter.printTransaction(trx, coop);
                toast.success('Struk berhasil dicetak ke printer thermal!');
                return;
            } catch (err) {
                console.warn('Direct thermal print error:', err);
                toast.error(`Gagal mencetak ke printer: ${err.message || 'Periksa kabel USB'}`);
            }
        } else {
            toast.warning('Printer belum terhubung! Silakan buka Pengaturan Printer.');
            onOpenHardwareModal?.();
        }
        printReceiptInPage(trx, coop);
    }, [coop, onOpenHardwareModal]);

    return {
        isPrinterConnected,
        isOnline,
        printReceipt,
        thermalPrinter,
    };
}
