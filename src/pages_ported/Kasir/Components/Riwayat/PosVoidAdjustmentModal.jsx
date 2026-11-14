import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, X, Delete, Loader2, Ban, Package, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import { playScanSound } from '@/Utils/barcodeScanner';
import { toast } from '@/Components/UI/Toast';

export default function PosVoidAdjustmentModal({
    isOpen = false,
    onClose,
    adjustment = null,
    onSuccess,
}) {
    const [pin, setPin] = useState('');
    const [reason, setReason] = useState('Salah hitung fisik di rak');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [shake, setShake] = useState(false);

    const quickReasons = [
        'Salah hitung fisik di rak',
        'Salah scan / barcode tertukar',
        'Koreksi ganda / duplikat',
        'Salah input kuantitas',
    ];

    useEffect(() => {
        if (!isOpen) {
            setPin('');
            setReason('Salah hitung fisik di rak');
            setErrorMessage('');
            setShake(false);
            setIsLoading(false);
        }
    }, [isOpen]);

    // Keyboard entry support
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e) => {
            // If user is typing in reason input, let normal typing happen
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }

            if (e.key >= '0' && e.key <= '9') {
                e.preventDefault();
                handlePressDigit(e.key);
            } else if (e.key === 'Backspace') {
                e.preventDefault();
                handleDelete();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, pin, isLoading]);

    const handlePressDigit = (digit) => {
        if (pin.length >= 6 || isLoading) return;
        const newPin = pin + digit;
        setPin(newPin);
        setErrorMessage('');

        if (newPin.length === 6) {
            submitVoid(newPin);
        }
    };

    const handleDelete = () => {
        if (isLoading) return;
        setPin(prev => prev.slice(0, -1));
        setErrorMessage('');
    };

    const submitVoid = async (fullPin) => {
        if (!adjustment || isLoading) return;

        setIsLoading(true);
        setErrorMessage('');
        try {
            const res = await axios.post(`/kasir/api/stock-opname/${adjustment.id}/void`, {
                pin: fullPin,
                reason: reason.trim() || 'Kesalahan koreksi stok fisik',
            });

            playScanSound('multiplier');
            toast.success(res.data.message || 'Koreksi stok berhasil di-VOID.');

            if (onSuccess) {
                onSuccess(res.data.stock_opname);
            }
            onClose();
        } catch (err) {
            playScanSound('error');
            const msg = err.response?.data?.message || 'PIN Supervisor salah atau gagal membatalkan koreksi.';
            setErrorMessage(msg);
            setShake(true);
            setTimeout(() => {
                setShake(false);
                setPin('');
            }, 600);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen || !adjustment) return null;

    const diff = Number(adjustment.difference || 0);

    return (
        <AnimatePresence>
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-[60] flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
            >
                <motion.div 
                    initial={{ scale: 0.95, opacity: 0, y: 15 }} 
                    animate={{ 
                        scale: 1, 
                        opacity: 1, 
                        y: 0,
                        x: shake ? [-10, 10, -10, 10, 0] : 0 
                    }} 
                    transition={{ duration: shake ? 0.4 : 0.2 }}
                    exit={{ scale: 0.95, opacity: 0, y: 15 }}
                    className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 my-auto"
                >
                    {/* Header */}
                    <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
                        <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200/80 shrink-0">
                                <Ban className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 text-sm sm:text-base">Batalkan Koreksi Stok (VOID)</h3>
                                <p className="text-[11px] text-slate-500 font-medium">Otorisasi PIN Supervisor POS</p>
                            </div>
                        </div>
                        <button 
                            type="button" 
                            onClick={onClose} 
                            disabled={isLoading}
                            className="w-8 h-8 rounded-xl hover:bg-slate-200/70 text-slate-400 hover:text-slate-700 transition-colors flex items-center justify-center cursor-pointer"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="p-5 space-y-4">
                        {/* Info Produk Banner */}
                        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                            <div className="flex items-start justify-between gap-2">
                                <div>
                                    <div className="font-bold text-xs text-slate-900 leading-snug flex items-center gap-1.5">
                                        <Package className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                        <span>{adjustment.product?.name || 'Produk'}</span>
                                    </div>
                                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                                        SKU: {adjustment.product?.sku || '-'} • Sesi: {adjustment.session?.session_number || `#${adjustment.session_id}`}
                                    </div>
                                </div>
                                <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                                    diff < 0 ? 'bg-rose-100 text-rose-700' : diff > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
                                }`}>
                                    {diff > 0 ? `+${diff}` : diff} {adjustment.product?.unit || 'pcs'}
                                </span>
                            </div>

                            <div className="flex items-center justify-between text-[11px] bg-white p-2 rounded-xl border border-slate-100 font-mono">
                                <span className="text-slate-500">Rak: {adjustment.physical_stock} / Sistem: {adjustment.system_stock}</span>
                                <span className="font-bold text-slate-900">Rp {Number(adjustment.adjustment_value || 0).toLocaleString('id-ID')}</span>
                            </div>
                        </div>

                        {/* Alasan Void */}
                        <div className="space-y-1.5">
                            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                                Alasan Pembatalan:
                            </label>
                            <div className="flex flex-wrap gap-1">
                                {quickReasons.map((qr) => (
                                    <button
                                        key={qr}
                                        type="button"
                                        onClick={() => setReason(qr)}
                                        className={`px-2 py-0.5 rounded-lg text-[10px] font-medium border transition-colors ${
                                            reason === qr
                                                ? 'bg-slate-900 text-white border-slate-900'
                                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                                        }`}
                                    >
                                        {qr}
                                    </button>
                                ))}
                            </div>
                            <input
                                type="text"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Tulis alasan void..."
                                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-slate-900 font-medium text-slate-800"
                            />
                        </div>

                        {/* PIN Dots Indicator */}
                        <div className="flex flex-col items-center justify-center pt-2">
                            <span className="text-xs font-semibold text-slate-700 mb-2">
                                Masukkan PIN Supervisor (6 Digit)
                            </span>
                            <div className="flex items-center gap-3">
                                {[...Array(6)].map((_, idx) => (
                                    <div
                                        key={idx}
                                        className={`w-3.5 h-3.5 rounded-full transition-all duration-150 ${
                                            pin.length > idx
                                                ? 'bg-rose-600 scale-110 shadow-xs'
                                                : 'bg-slate-200 border border-slate-300'
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Error Message */}
                        {errorMessage && (
                            <div className="flex items-center justify-center gap-1.5 text-rose-600 text-xs font-semibold bg-rose-50 py-1.5 px-3 rounded-xl border border-rose-200 text-center animate-shake">
                                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                                <span>{errorMessage}</span>
                            </div>
                        )}

                        {/* Numeric Keypad */}
                        <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
                            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                                <button
                                    key={digit}
                                    type="button"
                                    onClick={() => handlePressDigit(digit)}
                                    disabled={isLoading}
                                    className="h-11 rounded-2xl bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-slate-800 font-bold text-base transition-colors flex items-center justify-center border border-slate-200/80 cursor-pointer shadow-2xs"
                                >
                                    {digit}
                                </button>
                            ))}
                            <div className="flex items-center justify-center">
                                {isLoading && <Loader2 className="w-5 h-5 text-rose-600 animate-spin" />}
                            </div>
                            <button
                                type="button"
                                onClick={() => handlePressDigit('0')}
                                disabled={isLoading}
                                className="h-11 rounded-2xl bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-slate-800 font-bold text-base transition-colors flex items-center justify-center border border-slate-200/80 cursor-pointer shadow-2xs"
                            >
                                0
                            </button>
                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={isLoading || pin.length === 0}
                                className="h-11 rounded-2xl bg-slate-50 hover:bg-rose-50 active:bg-rose-100 text-slate-600 hover:text-rose-600 font-medium transition-colors flex items-center justify-center border border-slate-200/80 cursor-pointer shadow-2xs disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                <Delete className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

