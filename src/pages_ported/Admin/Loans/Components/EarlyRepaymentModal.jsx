import React from 'react';
import Modal from '@/Components/UI/Modal';
import Button from '@/Components/UI/Button';
import { AlertCircle, Zap } from 'lucide-react';

export default function EarlyRepaymentModal({ 
    isOpen, 
    onClose, 
    remainingPrincipal, 
    remainingInterest, 
    totalToPay, 
    onSubmit 
}) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Pelunasan Dipercepat (Syariah)">
            <form onSubmit={onSubmit} className="flex flex-col gap-5 p-6">
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-900">
                    <div className="flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <p>
                            <strong>Kontrak Pembiayaan Syariah:</strong> Margin yang sudah disepakati di awal (akad jual beli) tetap menjadi kewajiban anggota. Tidak ada penghapusan margin untuk pelunasan dipercepat.
                        </p>
                    </div>
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm flex flex-col gap-3">
                    <div className="flex justify-between border-b border-slate-200 pb-2">
                        <span className="text-slate-500">Sisa Pokok:</span>
                        <span className="font-semibold text-slate-900">Rp {remainingPrincipal.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 pb-2">
                        <span className="text-slate-500">Sisa Margin:</span>
                        <span className="font-semibold text-slate-900">Rp {remainingInterest.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between pt-1">
                        <span className="text-slate-700 font-bold">Total Pelunasan Hari Ini:</span>
                        <span className="font-bold text-emerald-600 text-lg">Rp {totalToPay.toLocaleString('id-ID')}</span>
                    </div>
                </div>
                
                <div className="flex justify-end gap-3 mt-2">
                    <Button variant="secondary" size="md" type="button" onClick={onClose}>
                        Batal
                    </Button>
                    <Button variant="primary" size="md" type="submit">
                        <Zap className="w-4 h-4" />
                        Proses Pelunasan Penuh
                    </Button>
                </div>
            </form>
        </Modal>
    );
}

