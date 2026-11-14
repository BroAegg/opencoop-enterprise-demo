import React from 'react';
import FormCard from '@/Components/UI/FormCard';
import FormSelect from '@/Components/UI/FormSelect';
import Button from '@/Components/UI/Button';
import { Save } from 'lucide-react';

export default function RapelTab({
    rapelForm,
    memberOptions,
    selectedRapelMember,
    pendingTransactions,
    onToggleRapelTransaction,
    onSubmit
}) {
    return (
        <form onSubmit={onSubmit} className="flex flex-col gap-6">
            <FormCard 
                title="Pelunasan Rapel / Tunggakan" 
                description="Pilih anggota untuk melihat tagihan bulan sebelumnya yang belum dibayar, lalu centang bulan yang ingin dilunasi."
                footer={
                    <>
                        <Button variant="secondary" size="md" type="button" onClick={() => rapelForm.reset()}>
                            Reset
                        </Button>
                        <Button variant="primary" size="md" type="submit" disabled={rapelForm.processing || rapelForm.data.transaction_ids.length === 0}>
                            <Save className="w-4 h-4" />
                            {rapelForm.processing ? 'Memproses...' : `Lunasi ${rapelForm.data.transaction_ids.length} Bulan`}
                        </Button>
                    </>
                }
            >
                <div className="grid grid-cols-1 gap-5">
                    <div>
                        <FormSelect 
                            label="Anggota" 
                            id="rapel_member"
                            value={rapelForm.data.member_id}
                            onChange={e => rapelForm.setData('member_id', e.target.value)}
                            error={rapelForm.errors.member_id}
                            options={memberOptions}
                            placeholder="Pilih Anggota..."
                        />
                    </div>

                    {selectedRapelMember && (
                        <div className="mt-2">
                            <label className="block text-sm font-semibold text-slate-700 mb-3">
                                Daftar Tunggakan
                            </label>
                            
                            {pendingTransactions.length === 0 ? (
                                <div className="p-6 bg-slate-50 border border-slate-100 rounded-xl text-center">
                                    <p className="text-slate-500 text-sm font-medium">Anggota ini tidak memiliki tunggakan (Semua tagihan lunas).</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {pendingTransactions.map(tx => (
                                        <label 
                                            key={tx.id} 
                                            className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-colors ${rapelForm.data.transaction_ids.includes(tx.id) ? 'bg-primary/5 border-primary/30' : 'bg-white border-slate-200 hover:bg-slate-50'}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <input 
                                                    type="checkbox" 
                                                    className="w-5 h-5 text-primary rounded border-slate-300 focus:ring-primary"
                                                    checked={rapelForm.data.transaction_ids.includes(tx.id)}
                                                    onChange={() => onToggleRapelTransaction(tx.id)}
                                                />
                                                <div>
                                                    <p className="font-semibold text-slate-900 text-sm">
                                                        Tagihan Simpanan Wajib
                                                    </p>
                                                    <p className="text-xs text-slate-500 mt-0.5">
                                                        Bulan: {tx.billing_month}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="font-bold text-slate-900 text-sm">
                                                Rp {Number(tx.amount).toLocaleString('id-ID')}
                                            </div>
                                        </label>
                                    ))}
                                    <div className="flex justify-between items-center px-2 py-4 border-t border-slate-100 mt-2">
                                        <span className="text-sm font-semibold text-slate-600">Total Dibayar:</span>
                                        <span className="text-lg font-bold text-primary">
                                            Rp {pendingTransactions
                                                    .filter(tx => rapelForm.data.transaction_ids.includes(tx.id))
                                                    .reduce((acc, curr) => acc + Number(curr.amount), 0)
                                                    .toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                </div>
                            )}
                            {rapelForm.errors.transaction_ids && (
                                <p className="text-red-500 text-xs mt-2">{rapelForm.errors.transaction_ids}</p>
                            )}
                        </div>
                    )}
                </div>
            </FormCard>
        </form>
    );
}

