import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, X, Check, RefreshCw, AlertCircle, Image as ImageIcon, ArrowRight, Loader2 } from 'lucide-react';
import { compressImage } from '@/Utils/imageCompressor';

export default function PosVendorReceiptCaptureModal({
    isOpen,
    onClose,
    onConfirmWithReceipt,
    vendor,
    totalPcs = 0,
    totalCost = 0,
    formatRp,
    isSubmitting = false,
}) {
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isCompressing, setIsCompressing] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (!isOpen) {
            setSelectedFile(null);
            setPreviewUrl(null);
            setIsCompressing(false);
            setErrorMsg(null);
        }
    }, [isOpen]);

    // Cleanup object URL on unmount or file change
    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    if (!isOpen) return null;

    const handleFileSelect = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setErrorMsg(null);
        setIsCompressing(true);

        try {
            // Auto-compress large phone camera photos to ~250KB in background
            const optimizedFile = await compressImage(file, { maxWidth: 1400, quality: 0.82 });
            setSelectedFile(optimizedFile);
            const objectUrl = URL.createObjectURL(optimizedFile);
            setPreviewUrl(objectUrl);
        } catch (err) {
            console.error('Failed to compress image:', err);
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        } finally {
            setIsCompressing(false);
        }
    };

    const handleClearPhoto = () => {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setSelectedFile(null);
        setPreviewUrl(null);
        setErrorMsg(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleTriggerCamera = () => {
        fileInputRef.current?.click();
    };

    const handleConfirm = () => {
        if (!selectedFile) {
            setErrorMsg('Silakan ambil atau pilih foto nota terlebih dahulu.');
            return;
        }
        onConfirmWithReceipt?.(selectedFile);
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 font-sans select-none">
                {/* Backdrop Scrim */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => {
                        if (!isSubmitting) onClose?.();
                    }}
                    className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs cursor-pointer"
                />

                {/* Modal Surface */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    transition={{ type: 'spring', duration: 0.3, bounce: 0 }}
                    className="relative w-full max-w-lg bg-white rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden z-10 flex flex-col max-h-[92vh]"
                >
                    {/* Hidden Camera / File Input */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleFileSelect}
                        className="hidden"
                    />

                    {/* Header */}
                    <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between gap-3 bg-slate-50/60">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200/60 text-teal-700 flex items-center justify-center shrink-0">
                                <Camera className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-sm sm:text-base font-bold text-slate-950 leading-tight">
                                    Foto & Upload Nota Fisik
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    {vendor?.name || 'Mitra'} · <span className="font-mono font-bold text-slate-800">{totalPcs} pcs</span> ({formatRp ? formatRp(totalCost) : `Rp ${totalCost}`})
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
                        {errorMsg && (
                            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-xs text-rose-700 font-medium">
                                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                                <span>{errorMsg}</span>
                            </div>
                        )}

                        {isCompressing ? (
                            <div className="border border-slate-200 rounded-2xl p-10 flex flex-col items-center justify-center text-center gap-3 bg-slate-50">
                                <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
                                <div className="space-y-1">
                                    <p className="text-xs font-bold text-slate-800">
                                        Mengompresi Foto Nota...
                                    </p>
                                    <p className="text-[11px] text-slate-500">
                                        Menyesuaikan ukuran gambar otomatis agar upload secepat kilat dan hemat kuota.
                                    </p>
                                </div>
                            </div>
                        ) : !previewUrl ? (
                            /* Uncaptured State */
                            <div
                                onClick={handleTriggerCamera}
                                className="border-2 border-dashed border-slate-300 hover:border-teal-500 rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-3 bg-slate-50/50 hover:bg-teal-50/30 transition-all cursor-pointer group"
                            >
                                <div className="w-14 h-14 rounded-2xl bg-white shadow-xs border border-slate-200/80 group-hover:border-teal-300 group-hover:scale-105 transition-all flex items-center justify-center text-slate-700 group-hover:text-teal-600">
                                    <Camera className="w-7 h-7" />
                                </div>

                                <div className="space-y-1">
                                    <p className="text-sm font-bold text-slate-800 group-hover:text-teal-900">
                                        Ketuk untuk Mengambil Foto Nota
                                    </p>
                                    <p className="text-xs text-slate-500 max-w-xs">
                                        Membuka kamera HP / Tablet langsung atau memilih file gambar dari perangkat.
                                    </p>
                                </div>

                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs group-hover:border-teal-200 group-hover:text-teal-700">
                                    <Upload className="w-3.5 h-3.5" />
                                    <span>Buka Kamera / Galeri</span>
                                </span>
                            </div>
                        ) : (
                            /* Preview State */
                            <div className="space-y-3">
                                <div className="relative rounded-2xl border border-slate-200 bg-slate-900 overflow-hidden flex items-center justify-center max-h-72">
                                    <img
                                        src={previewUrl}
                                        alt="Preview Nota Fisik"
                                        className="max-h-72 w-auto object-contain"
                                    />
                                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between bg-slate-950/70 backdrop-blur-xs px-3 py-1.5 rounded-xl text-white text-[11px] font-mono">
                                        <span className="truncate">{selectedFile?.name}</span>
                                        <span>{formatFileSize(selectedFile?.size)}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={handleTriggerCamera}
                                        className="flex-1 py-2 px-3 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                                    >
                                        <RefreshCw className="w-3.5 h-3.5" />
                                        <span>Foto Ulang</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleClearPhoto}
                                        className="py-2 px-3 rounded-xl border border-rose-200 hover:border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors cursor-pointer"
                                    >
                                        Hapus
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="rounded-xl bg-slate-50 p-3 border border-slate-200/60 text-[11px] text-slate-500 space-y-1">
                            <p className="font-semibold text-slate-700">💡 Informasi Operasional:</p>
                            <p>
                                Foto nota akan disimpan secara permanen di <strong>Arsip Nota Admin</strong> sebagai bukti fisik penerimaan barang dan mempermudah rekonsiliasi bagi hasil kasir.
                            </p>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-slate-100 bg-slate-50/60 flex items-center justify-end gap-2.5">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting || isCompressing}
                            className="py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-bold transition-all cursor-pointer"
                        >
                            Batal
                        </button>

                        <button
                            type="button"
                            onClick={handleConfirm}
                            disabled={!selectedFile || isSubmitting || isCompressing}
                            className="py-2.5 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <span>Menyimpan...</span>
                            ) : isCompressing ? (
                                <span>Menyiapkan Foto...</span>
                            ) : (
                                <>
                                    <Check className="w-4 h-4 text-emerald-400" />
                                    <span>Simpan Stok & Unggah Nota</span>
                                </>
                            )}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

