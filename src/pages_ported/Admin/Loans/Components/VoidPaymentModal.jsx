import React from 'react';
import Modal from '@/Components/UI/Modal';
import Button from '@/Components/UI/Button';
import { AlertCircle } from 'lucide-react';

export default function VoidPaymentModal({ isOpen, onClose, voidPaymentData, form, onSubmit }) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Void / Batalkan Transaksi">
            <form onSubmit={onSubmit} className="flex flex-col gap-5 p-6">
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-sm text-rose-900">
                    <div className="flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                        <p>
                            <strong>Peringatan!</strong> Anda akan membatalkan Kwitansi <strong>{voidPaymentData?.receipt}</strong>. 
                            Sistem akan membuat <strong>Jurnal Balik</strong> (Reversed Journal) secara otomatis dan uang akan dikembalikan ke saldo kewajiban anggota.
                        </p>
                    </div>
                </div>

                <div>
                    <label htmlFor="reason" className="block text-sm font-semibold text-slate-700 mb-1">
                        Alasan Pembatalan <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                        id="reason"
                        value={form.data.reason}
                        onChange={e => form.setData('reason', e.target.value)}
                        className={`w-full rounded-lg border bg-white px-3 py-2 text-[14px] outline-none transition-all placeholder:text-slate-400 focus:ring-2 ${form.errors.reason ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100' : 'border-slate-200 focus:border-primary focus:ring-primary/10'}`}
                        rows="3"
                        placeholder="Contoh: Kasir salah input nominal bayar"
                        required
                    ></textarea>
                    {form.errors.reason && <p className="mt-1 text-xs text-rose-500 font-medium">{form.errors.reason}</p>}
                </div>
                
                <div className="flex justify-end gap-3 mt-2">
                    <Button variant="secondary" size="md" type="button" onClick={onClose}>
                        Tutup
                    </Button>
                    <Button variant="primary" size="md" type="submit" disabled={form.processing || form.data.reason.length < 5}>
                        Proses Void
                    </Button>
                </div>
            </form>
        </Modal>
    );
}

