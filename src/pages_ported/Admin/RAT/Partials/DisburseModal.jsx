import React, { useState } from 'react';
import { Banknote } from 'lucide-react';
import Modal from '@/Components/UI/Modal';
import { formatRupiah } from '@/Utils/format';
import { METHOD_LABELS } from './constants';

export default function DisburseModal({ distribution, onClose, onConfirm, loading }) {
    const [method, setMethod] = useState('TUNAI');

    if (!distribution) return null;

    return (
        <Modal isOpen={!!distribution} onClose={onClose} title="Cairkan SHU Anggota" maxWidth="sm">
            <div className="p-6 space-y-5">
                {/* Recipient Info */}
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-primary font-bold text-base">
                            {distribution.member?.name?.charAt(0) ?? '?'}
                        </span>
                    </div>
                    <div>
                        <p className="text-[14px] font-bold text-slate-900 leading-tight">{distribution.member?.name}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{distribution.member?.member_number}</p>
                    </div>
                </div>

                {/* SHU Breakdown */}
                <div className="space-y-2">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Rincian SHU</p>
                    <div className="flex justify-between items-center py-2.5 border-b border-slate-100">
                        <span className="text-[13px] text-slate-600">Jasa Simpanan</span>
                        <span className="text-[13px] font-semibold text-slate-800 font-mono">{formatRupiah(distribution.jasa_simpanan_amount)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2.5 border-b border-slate-100">
                        <span className="text-[13px] text-slate-600">Jasa Usaha</span>
                        <span className="text-[13px] font-semibold text-slate-800 font-mono">{formatRupiah(distribution.jasa_usaha_amount)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-1">
                        <span className="text-[13px] font-bold text-slate-900">Total SHU</span>
                        <span className="text-[18px] font-bold text-primary font-mono">{formatRupiah(distribution.shu_amount)}</span>
                    </div>
                </div>

                {/* Method Selector */}
                <div className="space-y-2">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Metode Pencairan</p>
                    <div className="flex flex-col gap-2">
                        {Object.entries(METHOD_LABELS).map(([key, label]) => {
                            const isSelected = method === key;
                            return (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => setMethod(key)}
                                    className={`flex items-center justify-between p-3.5 rounded-xl border transition-all text-left min-h-[44px] ${
                                        isSelected
                                            ? 'border-slate-900 bg-slate-50 text-slate-900 font-bold ring-1 ring-slate-900'
                                            : 'border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50/70 font-medium'
                                    }`}
                                >
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                                            isSelected ? 'border-slate-900 bg-slate-900' : 'border-slate-300'
                                        }`}>
                                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                        </div>
                                        <span className="text-[13px] truncate">{label}</span>
                                    </div>
                                    <span className="text-[11px] text-slate-400 font-normal shrink-0 ml-2">
                                        {key === 'SIMPANAN_SUKARELA' && 'Masuk simpanan'}
                                        {key === 'TUNAI' && 'Kasir fisik'}
                                        {key === 'TRANSFER' && 'Rekening bank'}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-1">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 rounded-xl border border-slate-200 text-[13px] font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                        Batal
                    </button>
                    <button
                        onClick={() => onConfirm(method)}
                        disabled={loading}
                        className="flex-1 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white text-[13px] font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? 'Memproses...' : (
                            <>
                                <Banknote className="w-4 h-4" />
                                Cairkan Sekarang
                            </>
                        )}
                    </button>
                </div>
            </div>
        </Modal>
    );
}

