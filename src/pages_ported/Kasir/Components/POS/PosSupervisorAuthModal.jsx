import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, X, Delete, Loader2, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import { playScanSound } from '@/Utils/barcodeScanner';

export default function PosSupervisorAuthModal({
    isOpen = false,
    onClose,
    onAuthorized,
    actionTitle = 'Otorisasi Supervisor',
    actionDescription = 'Masukkan PIN 6 digit Pengurus / Supervisor untuk melanjutkan aksi ini.',
}) {
    const [pin, setPin] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [shake, setShake] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setPin('');
            setErrorMessage('');
            setShake(false);
            setIsLoading(false);
        }
    }, [isOpen]);

    // Handle physical keyboard input
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e) => {
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
            submitPin(newPin);
        }
    };

    const handleDelete = () => {
        if (isLoading) return;
        setPin(prev => prev.slice(0, -1));
        setErrorMessage('');
    };

    const submitPin = async (fullPin) => {
        setIsLoading(true);
        setErrorMessage('');
        try {
            const res = await axios.post('/kasir/api/supervisor/verify-pin', { pin: fullPin });
            playScanSound('multiplier');
            onAuthorized({
                pin: fullPin,
                supervisor: res.data.supervisor,
            });
            onClose();
        } catch (err) {
            playScanSound('error');
            setErrorMessage(err.response?.data?.message || 'PIN Supervisor salah atau tidak berwenang.');
            setShake(true);
            setTimeout(() => {
                setShake(false);
                setPin('');
            }, 600);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    const modalContent = (
        <AnimatePresence>
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-[60] flex items-center justify-center p-4 overflow-y-auto"
            >
                <motion.div 
                    initial={{ scale: 0.95, opacity: 0, y: 15 }} 
                    animate={{ scale: 1, opacity: 1, y: 0 }} 
                    exit={{ scale: 0.95, opacity: 0, y: 15 }}
                    className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-200 my-auto text-center"
                >
                    {/* Header */}
                    <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                        <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
                            <ShieldAlert className="w-5 h-5" />
                            <span>{actionTitle}</span>
                        </div>
                        <button 
                            type="button" 
                            onClick={onClose} 
                            disabled={isLoading}
                            className="w-10 h-10 rounded-full hover:bg-slate-200/70 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer flex items-center justify-center"
                            title="Tutup (Esc)"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="p-6 flex flex-col items-center">
                        <p className="text-xs text-slate-500 font-medium mb-5">
                            {actionDescription}
                        </p>

                        {/* PIN Dots Display */}
                        <motion.div 
                            animate={shake ? { x: [-10, 10, -8, 8, -4, 4, 0] } : {}}
                            transition={{ duration: 0.4 }}
                            className="flex items-center justify-center gap-3 mb-6"
                        >
                            {[0, 1, 2, 3, 4, 5].map((idx) => {
                                const filled = pin.length > idx;
                                return (
                                    <div
                                        key={idx}
                                        className={`w-3.5 h-3.5 rounded-full transition-all ${
                                            filled 
                                                ? 'bg-slate-900 scale-110 shadow-xs ring-4 ring-slate-200' 
                                                : 'bg-slate-200'
                                        }`}
                                    />
                                );
                            })}
                        </motion.div>

                        {/* Error Message */}
                        {errorMessage && (
                            <p className="text-xs font-semibold text-rose-600 mb-4 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200">
                                {errorMessage}
                            </p>
                        )}

                        {/* Tactile Keypad */}
                        <div className="grid grid-cols-3 gap-2.5 w-full max-w-[240px]">
                            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                                <button
                                    key={digit}
                                    type="button"
                                    onClick={() => handlePressDigit(digit)}
                                    disabled={isLoading}
                                    className="h-14 rounded-2xl bg-slate-50 hover:bg-slate-100 active:bg-slate-200 font-bold text-xl text-slate-800 transition-colors flex items-center justify-center border border-slate-200/80 cursor-pointer select-none active:scale-95"
                                >
                                    {digit}
                                </button>
                            ))}
                            <div className="h-14" />
                            <button
                                type="button"
                                onClick={() => handlePressDigit('0')}
                                disabled={isLoading}
                                className="h-14 rounded-2xl bg-slate-50 hover:bg-slate-100 active:bg-slate-200 font-bold text-xl text-slate-800 transition-colors flex items-center justify-center border border-slate-200/80 cursor-pointer select-none active:scale-95"
                            >
                                0
                            </button>
                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={isLoading || pin.length === 0}
                                className="h-14 rounded-2xl bg-slate-50 hover:bg-rose-50 active:bg-rose-100 text-slate-500 hover:text-rose-600 transition-colors flex items-center justify-center border border-slate-200/80 cursor-pointer select-none active:scale-95 disabled:opacity-40"
                                title="Hapus Digit"
                            >
                                <Delete className="w-5 h-5" />
                            </button>
                        </div>

                        {isLoading && (
                            <div className="mt-4 flex items-center gap-2 text-xs font-bold text-slate-700">
                                <Loader2 className="w-4 h-4 animate-spin text-slate-600" />
                                <span>Memverifikasi otorisasi...</span>
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );

    if (typeof document !== 'undefined') {
        return createPortal(modalContent, document.body);
    }

    return modalContent;
}

