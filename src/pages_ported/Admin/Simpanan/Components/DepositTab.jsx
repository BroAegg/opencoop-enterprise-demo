import React from 'react';
import AppleFormGroup from '@/Components/UI/AppleFormGroup';
import AppleFormRow from '@/Components/UI/AppleFormRow';
import Button from '@/Components/UI/Button';
import { Save, AlertTriangle } from 'lucide-react';

export default function DepositTab({
    depositForm,
    members,
    memberOptions,
    onSubmit
}) {
    const selectedMember = members.find(x => x.id == depositForm.data.member_id);
    const tunggakanCount = selectedMember?.simpanan_transactions?.length || 0;

    return (
        <form onSubmit={onSubmit} className="flex flex-col gap-6">
            {depositForm.data.member_id && tunggakanCount > 0 && (
                <div className="p-3 bg-amber-50 text-amber-700 text-sm rounded-lg flex items-start gap-2 border border-amber-100 mb-0">
                    <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                    <div>
                        <strong className="font-semibold block">Ada Tunggakan!</strong>
                        Anggota ini memiliki <b>{tunggakanCount} bulan</b> tunggakan simpanan wajib. Silakan gunakan tab <b>Rapel Tunggakan</b> untuk melunasinya.
                    </div>
                </div>
            )}

            <AppleFormGroup 
                title="Formulir Setoran" 
                description="Penerimaan setoran simpanan rutin."
                footer={
                    <>
                        <Button variant="secondary" size="md" type="button" onClick={() => depositForm.reset()}>
                            Reset
                        </Button>
                        <Button variant="primary" size="md" type="submit" disabled={depositForm.processing}>
                            <Save className="w-4 h-4" />
                            {depositForm.processing ? 'Memproses...' : 'Proses Setoran'}
                        </Button>
                    </>
                }
            >
                <AppleFormRow label="Anggota" htmlFor="deposit_member" error={depositForm.errors.member_id}>
                    <select 
                        id="deposit_member"
                        className="w-full sm:max-w-xs text-right bg-transparent border-none focus:ring-0 text-[15px] p-0 text-slate-900"
                        value={depositForm.data.member_id}
                        onChange={e => depositForm.setData('member_id', e.target.value)}
                    >
                        <option value="" disabled>Pilih Anggota...</option>
                        {memberOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                </AppleFormRow>
                
                <AppleFormRow label="Jenis Simpanan" htmlFor="deposit_type" error={depositForm.errors.type}>
                    <select 
                        id="deposit_type"
                        className="w-full sm:max-w-xs text-right bg-transparent border-none focus:ring-0 text-[15px] p-0 text-slate-900"
                        value={depositForm.data.type}
                        onChange={e => depositForm.setData('type', e.target.value)}
                    >
                        <option value="POKOK">Simpanan Pokok</option>
                        <option value="WAJIB">Simpanan Wajib (Manual)</option>
                        <option value="SUKARELA">Simpanan Sukarela</option>
                    </select>
                </AppleFormRow>

                <AppleFormRow label="Nominal" htmlFor="deposit_amount" error={depositForm.errors.amount}>
                    <div className="flex items-center justify-end w-full sm:max-w-xs">
                        <span className="text-slate-400 mr-2 text-[15px]">Rp</span>
                        <input 
                            type="number"
                            id="deposit_amount"
                            className="w-full text-right bg-transparent border-none focus:ring-0 text-[15px] p-0 text-slate-900 font-medium placeholder-slate-300"
                            value={depositForm.data.amount}
                            onChange={e => depositForm.setData('amount', e.target.value)}
                            placeholder="0"
                            required
                        />
                    </div>
                </AppleFormRow>

                <AppleFormRow label="Keterangan" htmlFor="deposit_description" isLast error={depositForm.errors.description}>
                    <input 
                        type="text"
                        id="deposit_description"
                        className="w-full sm:max-w-md text-right bg-transparent border-none focus:ring-0 text-[15px] p-0 text-slate-900 placeholder-slate-300"
                        value={depositForm.data.description}
                        onChange={e => depositForm.setData('description', e.target.value)}
                        placeholder="Opsional"
                    />
                </AppleFormRow>
            </AppleFormGroup>
        </form>
    );
}

