import React from 'react';
import Modal from '@/Components/UI/Modal';
import Button from '@/Components/UI/Button';
import { AlertCircle } from 'lucide-react';

export default function SetOffModal({ isOpen, onClose, loan, form, onSubmit }) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Restrukturisasi / Sita Simpanan">
            <form onSubmit={onSubmit} className="flex flex-col gap-5 p-6">
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-sm text-rose-900">
                    <div className="flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                        <div>
                            <p className="mb-2">
                                <strong>Peringatan Restrukturisasi!</strong> Anda akan menggunakan saldo <strong>Simpanan Sukarela</strong> milik anggota untuk membayar paksa (sebagian/seluruh) hutang ini.
                            </p>
                            <ul className="list-disc pl-5 text-rose-800 font-medium">
                                <li>Sisa Hutang: Rp {Number(loan.remaining_amount).toLocaleString('id-ID')}</li>
                                <li>Saldo Simpanan Sukarela: Rp {Number(loan.member.simpanan_sukarela_cache).toLocaleString('id-ID')}</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div>
                    <label htmlFor="setoff_amount" className="block text-sm font-semibold text-slate-700 mb-1">
                        Nominal yang Disita <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <span className="text-slate-500 sm:text-sm font-medium">Rp</span>
                        </div>
                        <input
                            type="number"
                            id="setoff_amount"
                            value={form.data.amount}
                            onChange={e => form.setData('amount', e.target.value)}
                            className={`block w-full rounded-lg border pl-9 pr-12 py-2.5 text-sm outline-none transition-all focus:ring-2 ${
                                form.errors.amount ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100' : 'border-slate-200 focus:border-primary focus:ring-primary/10'
                            }`}
                            placeholder="0"
                            required
                            min="1"
                            max={Math.min(loan.remaining_amount, loan.member.simpanan_sukarela_cache)}
                        />
                    </div>
                    {form.errors.amount && <p className="mt-1 text-xs text-rose-500 font-medium">{form.errors.amount}</p>}
                </div>

                <div className="flex justify-end gap-3 mt-4">
                    <Button variant="secondary" size="md" type="button" onClick={onClose}>
                        Batal
                    </Button>
                    <Button variant="danger" size="md" type="submit" disabled={form.processing} className="bg-rose-600 hover:bg-rose-700 text-white border-transparent">
                        <AlertCircle className="w-4 h-4 mr-2" />
                        Eksekusi Sita Simpanan
                    </Button>
                </div>
            </form>
        </Modal>
    );
}

