import React from 'react';
import AppleFormGroup from '@/Components/UI/AppleFormGroup';
import AppleFormRow from '@/Components/UI/AppleFormRow';
import Button from '@/Components/UI/Button';
import { ArrowUpRight, AlertTriangle } from 'lucide-react';

export default function WithdrawTab({
    withdrawForm,
    members,
    memberOptions,
    onSubmit
}) {
    const selectedMember = members.find(x => x.id == withdrawForm.data.member_id);

    return (
        <form onSubmit={onSubmit} className="flex flex-col gap-6">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5 text-sm text-amber-900 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-amber-600" />
                <div>
                    <strong className="block font-semibold mb-1">Awas! Anda sedang mengeluarkan Uang Kas.</strong>
                    Pastikan uang fisik diserahkan kepada anggota yang bersangkutan. Hanya Simpanan Sukarela yang dapat ditarik. Untuk menarik Simpanan Pokok dan Wajib, gunakan fitur <b>Tutup Buku (Checkout Anggota)</b> di profil anggota.
                </div>
            </div>

            <AppleFormGroup 
                title="Tarik Tunai (Withdraw)" 
                description="Pencairan Simpanan Sukarela ke kas anggota."
                footer={
                    <>
                        <Button variant="secondary" size="md" type="button" onClick={() => withdrawForm.reset()}>
                            Reset
                        </Button>
                        <Button variant="danger" size="md" type="submit" disabled={withdrawForm.processing}>
                            <ArrowUpRight className="w-4 h-4" />
                            {withdrawForm.processing ? 'Memproses...' : 'Tarik Uang Kas'}
                        </Button>
                    </>
                }
            >
                <AppleFormRow label="Anggota" htmlFor="withdraw_member" error={withdrawForm.errors.member_id}>
                    <select 
                        id="withdraw_member"
                        className="w-full sm:max-w-xs text-right bg-transparent border-none focus:ring-0 text-[15px] p-0 text-slate-900"
                        value={withdrawForm.data.member_id}
                        onChange={e => withdrawForm.setData('member_id', e.target.value)}
                    >
                        <option value="" disabled>Pilih Anggota...</option>
                        {memberOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                </AppleFormRow>
                
                {withdrawForm.data.member_id && (
                    <div className="px-4 sm:px-5 py-2 bg-slate-50/50 flex justify-end">
                        <p className="text-xs text-slate-500">
                            Sisa Saldo Sukarela: <strong className="text-slate-900">Rp {Number(selectedMember?.simpanan_sukarela_cache || 0).toLocaleString('id-ID')}</strong>
                        </p>
                    </div>
                )}

                <AppleFormRow label="Nominal Penarikan" htmlFor="withdraw_amount" error={withdrawForm.errors.amount}>
                    <div className="flex items-center justify-end w-full sm:max-w-xs">
                        <span className="text-slate-400 mr-2 text-[15px]">Rp</span>
                        <input 
                            type="number"
                            id="withdraw_amount"
                            className="w-full text-right bg-transparent border-none focus:ring-0 text-[15px] p-0 text-slate-900 font-medium placeholder-slate-300"
                            value={withdrawForm.data.amount}
                            onChange={e => withdrawForm.setData('amount', e.target.value)}
                            placeholder="0"
                            required
                        />
                    </div>
                </AppleFormRow>

                <AppleFormRow label="Keterangan" htmlFor="withdraw_description" isLast error={withdrawForm.errors.description}>
                    <input 
                        type="text"
                        id="withdraw_description"
                        className="w-full sm:max-w-md text-right bg-transparent border-none focus:ring-0 text-[15px] p-0 text-slate-900 placeholder-slate-300"
                        value={withdrawForm.data.description}
                        onChange={e => withdrawForm.setData('description', e.target.value)}
                        placeholder="Opsional"
                    />
                </AppleFormRow>
            </AppleFormGroup>
        </form>
    );
}

