import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, AlertCircle, Info, CheckCircle2, Loader2, X } from 'lucide-react';

/**
 * TactileConfirmDialog
 * Apple HIG-inspired tactile confirmation dialog with high-fidelity bevels and risk descriptors.
 * Replaces ugly browser-native `window.confirm(...)` across the entire Manasuka ERP.
 */
export default function TactileConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title = 'Konfirmasi Aksi',
    description,
    confirmText = 'Ya, Lanjutkan',
    cancelText = 'Batal',
    variant = 'danger', // 'danger' | 'warning' | 'info' | 'success'
    icon: CustomIcon = null,
    consequenceList = [],
    isLoading = false,
}) {
    const [internalLoading, setInternalLoading] = useState(false);
    const loading = isLoading || internalLoading;

    if (!isOpen) return null;

    const handleConfirm = async () => {
        if (loading) return;
        try {
            setInternalLoading(true);
            const result = onConfirm?.();
            if (result instanceof Promise) {
                await result;
            }
        } finally {
            setInternalLoading(false);
        }
    };

    const variantConfig = {
        danger: {
            icon: CustomIcon || AlertTriangle,
            badgeClass: 'bg-rose-100/80 border-rose-200/80 text-rose-600 shadow-[inset_0_1px_0_white]',
            glowClass: 'bg-rose-500/10',
            buttonClass: 'bg-rose-600 hover:bg-rose-700 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_2px_4px_rgba(225,29,72,0.3)] border border-rose-700/60',
            titleClass: 'text-slate-900',
        },
        warning: {
            icon: CustomIcon || AlertCircle,
            badgeClass: 'bg-amber-100/80 border-amber-200/80 text-amber-700 shadow-[inset_0_1px_0_white]',
            glowClass: 'bg-amber-500/10',
            buttonClass: 'bg-amber-600 hover:bg-amber-700 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_2px_4px_rgba(217,119,6,0.3)] border border-amber-700/60',
            titleClass: 'text-slate-900',
        },
        info: {
            icon: CustomIcon || Info,
            badgeClass: 'bg-[#1F6376]/10 border-[#1F6376]/20 text-[#1F6376] shadow-[inset_0_1px_0_white]',
            glowClass: 'bg-[#1F6376]/10',
            buttonClass: 'bg-[#1F6376] hover:bg-[#164a59] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_2px_4px_rgba(31,99,118,0.3)] border border-[#164a59]',
            titleClass: 'text-slate-900',
        },
        success: {
            icon: CustomIcon || CheckCircle2,
            badgeClass: 'bg-emerald-100/80 border-emerald-200/80 text-emerald-700 shadow-[inset_0_1px_0_white]',
            glowClass: 'bg-emerald-500/10',
            buttonClass: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_2px_4px_rgba(5,150,105,0.3)] border border-emerald-700/60',
            titleClass: 'text-slate-900',
        },
    }[variant] || variantConfig.danger;

    const IconComponent = variantConfig.icon;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 select-none">
                {/* Backdrop Blur */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
                    onClick={loading ? undefined : onClose}
                />

                {/* Tactile Dialog Window */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 12 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 12 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                    className="relative w-full max-w-md bg-white rounded-3xl border border-slate-200/90 shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden z-10"
                >
                    {/* Close 'X' Button */}
                    {!loading && (
                        <button
                            type="button"
                            onClick={onClose}
                            className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}

                    <div className="p-6">
                        {/* Header Section with Tactile Icon Badge */}
                        <div className="flex items-start gap-4 mb-4">
                            <div className="relative shrink-0">
                                <div className={`absolute -inset-1 rounded-2xl ${variantConfig.glowClass} blur-xs`} />
                                <div className={`relative w-12 h-12 rounded-2xl border flex items-center justify-center ${variantConfig.badgeClass}`}>
                                    <IconComponent className="w-6 h-6 stroke-[1.8]" />
                                </div>
                            </div>

                            <div className="min-w-0 pr-6">
                                <h3 className={`text-base font-bold tracking-tight ${variantConfig.titleClass}`}>
                                    {title}
                                </h3>
                                {description && (
                                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                        {description}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Consequence Risk Checklist */}
                        {consequenceList.length > 0 && (
                            <div className="mb-5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2 font-mono">
                                    Dampak Tindakan Ini:
                                </span>
                                <ul className="space-y-1.5 text-xs text-slate-600">
                                    {consequenceList.map((item, idx) => (
                                        <li key={idx} className="flex items-start gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                                            <span className="leading-tight">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Tactile Action Buttons */}
                        <div className="flex items-center justify-end gap-2.5 pt-2">
                            <button
                                type="button"
                                disabled={loading}
                                onClick={onClose}
                                className="px-4 py-2.5 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 active:scale-95 text-xs font-semibold text-slate-700 shadow-2xs transition-all disabled:opacity-50"
                            >
                                {cancelText}
                            </button>

                            <button
                                type="button"
                                disabled={loading}
                                onClick={handleConfirm}
                                className={`px-4 py-2.5 rounded-xl text-xs font-bold active:scale-95 transition-all flex items-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed ${variantConfig.buttonClass}`}
                            >
                                {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                <span>{confirmText}</span>
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

