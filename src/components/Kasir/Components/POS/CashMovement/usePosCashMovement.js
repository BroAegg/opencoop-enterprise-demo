import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from '@/Components/UI/Toast';
import { playScanSound } from '@/Utils/barcodeScanner';

/**
 * usePosCashMovement
 * 
 * Manages store internal operational petty cash movements (Kas Laci F6).
 * Handles Cash In (Modal Receh), Cash Out (Toko, Gaji & Makan, Lainnya),
 * and Cash Drop (Setor Brankas).
 */
export default function usePosCashMovement({ isOpen, onSuccess, onClose, initialIntent = null }) {
    // Direction: 'CASH_OUT' | 'CASH_IN' | 'CASH_DROP'
    const [type, setType] = useState('CASH_OUT');
    // Cash-out intent: 'TOKO' | 'GAJI_MAKAN' | 'LAINNYA'
    const [cashOutIntent, setCashOutIntent] = useState(
        initialIntent && initialIntent !== 'SUPPLIER_COD' ? initialIntent : 'TOKO'
    );
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('PACKING');
    const [description, setDescription] = useState('');
    const [isSubmittingOps, setIsSubmittingOps] = useState(false);
    const [opsError, setOpsError] = useState('');
    const [availableCash, setAvailableCash] = useState(0);

    const selectDirection = useCallback((newType) => {
        setType(newType);
        setOpsError('');
        if (newType === 'CASH_IN') {
            setCategory('MODAL_RECEH');
        } else if (newType === 'CASH_DROP') {
            setCategory('SETOR_BRANKAS');
        } else if (newType === 'CASH_OUT') {
            if (cashOutIntent === 'TOKO') setCategory('PACKING');
            else setCategory('LAINNYA');
        }
    }, [cashOutIntent]);

    const selectCashOutIntent = useCallback((intent) => {
        setType('CASH_OUT');
        setCashOutIntent(intent);
        setOpsError('');
        if (intent === 'TOKO') {
            setCategory('PACKING');
        } else if (intent === 'GAJI_MAKAN' || intent === 'LAINNYA') {
            setCategory('LAINNYA');
        }
    }, []);

    const fetchShiftCash = useCallback(async () => {
        try {
            const res = await axios.get('/kasir/api/shift/current');
            const est = res.data?.metrics?.estimated_cash;
            if (typeof est === 'number') {
                setAvailableCash(est);
            }
        } catch {
            // Ignore if no active shift or offline
        }
    }, []);

    useEffect(() => {
        if (isOpen) {
            setOpsError('');
            if (initialIntent && initialIntent !== 'SUPPLIER_COD') {
                setType('CASH_OUT');
                setCashOutIntent(initialIntent);
                setCategory(initialIntent === 'TOKO' ? 'PACKING' : 'LAINNYA');
            }
            fetchShiftCash();
        }
    }, [isOpen, initialIntent, fetchShiftCash]);

    const numericAmount = parseInt((amount || '').toString().replace(/\D/g, ''), 10) || 0;

    const handleOpsSubmit = async (e) => {
        if (e) e.preventDefault();

        if (numericAmount < 500) {
            setOpsError('Nominal kas minimal Rp 500');
            return;
        }

        if (type === 'CASH_OUT' && numericAmount > availableCash) {
            setOpsError(`Nominal melebihi saldo laci kasir (Tersedia: Rp ${availableCash.toLocaleString('id-ID')})`);
            return;
        }

        if (type === 'CASH_DROP' && numericAmount > availableCash) {
            setOpsError(`Nominal setor melebihi uang kas laci (Tersedia: Rp ${availableCash.toLocaleString('id-ID')})`);
            return;
        }

        if (!description.trim()) {
            setOpsError('Keterangan pengeluaran / pemasukan wajib diisi');
            return;
        }

        setIsSubmittingOps(true);
        setOpsError('');

        try {
            const res = await axios.post('/kasir/api/shift/movement', {
                type,
                amount: numericAmount,
                category,
                description: description.trim(),
            });

            playScanSound('multiplier');
            toast.success(res.data.message || 'Kas shift berhasil dicatat!');
            onSuccess?.();
            onClose();
            setAmount('');
            setDescription('');
        } catch (err) {
            playScanSound('error');
            setOpsError(err.response?.data?.message || 'Gagal mencatat arus kas.');
        } finally {
            setIsSubmittingOps(false);
        }
    };

    return {
        type,
        cashOutIntent,
        selectDirection,
        selectCashOutIntent,
        amount,
        setAmount,
        numericAmount,
        category,
        setCategory,
        description,
        setDescription,
        isSubmittingOps,
        opsError,
        availableCash,
        handleOpsSubmit,
    };
}
