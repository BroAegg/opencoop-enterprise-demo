import React from 'react';
import Modal from '@/Components/UI/Modal';
import Button from '@/Components/UI/Button';
import FormCurrencyInput from '@/Components/UI/FormCurrencyInput';
import { Save } from 'lucide-react';

export default function PaymentModal({ isOpen, onClose, loan, form, onSubmit }) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Catat Pembayaran Angsuran">
            <form onSubmit={onSubmit} className="flex flex-col gap-5 p-6">
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm">
                    <div className="flex justify-between mb-2">
                        <span className="text-slate-500">Angsuran Bulanan Normal:</span>
                        <span className="font-semibold text-slate-900">Rp {Number(loan.monthly_installment).toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-500">Sisa Outstanding:</span>
                        <span className="font-semibold text-slate-900">Rp {Number(loan.remaining_amount).toLocaleString('id-ID')}</span>
                    </div>
                </div>
                
                <FormCurrencyInput 
                    label="Nominal Pembayaran" 
                    id="amount"
                    value={form.data.amount}
                    onChange={e => form.setData('amount', e.target.value)}
                    error={form.errors.amount}
                    required
                />
                
                <div className="flex justify-end gap-3 mt-2">
                    <Button variant="secondary" size="md" type="button" onClick={onClose}>
                        Batal
                    </Button>
                    <Button variant="primary" size="md" type="submit" disabled={form.processing}>
                        <Save className="w-4 h-4" />
                        Simpan Pembayaran
                    </Button>
                </div>
            </form>
        </Modal>
    );
}

