import React, { useState, useMemo } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import PillTabs from '@/Components/UI/PillTabs';
import { WalletCards, ArrowDownRight, ArrowUpRight, CalendarDays } from 'lucide-react';
import DepositTab from './Components/DepositTab';
import RapelTab from './Components/RapelTab';
import WithdrawTab from './Components/WithdrawTab';

export default function Index({ members }) {
    const [activeTab, setActiveTab] = useState('setoran');

    // Setup forms
    const depositForm = useForm({
        member_id: '',
        type: 'WAJIB',
        amount: '',
        description: '',
        billing_month: '',
    });

    const withdrawForm = useForm({
        member_id: '',
        amount: '',
        description: '',
    });

    const rapelForm = useForm({
        member_id: '',
        transaction_ids: [],
    });

    const handleDepositSubmit = (e) => {
        e.preventDefault();
        depositForm.post('/admin/simpanan/deposit', {
            onSuccess: () => depositForm.reset('amount', 'description', 'billing_month'),
        });
    };

    const handleWithdrawSubmit = (e) => {
        e.preventDefault();
        withdrawForm.post('/admin/simpanan/withdraw', {
            onSuccess: () => withdrawForm.reset('amount', 'description'),
        });
    };

    const handleRapelSubmit = (e) => {
        e.preventDefault();
        rapelForm.post('/admin/simpanan/rapel', {
            onSuccess: () => rapelForm.reset('member_id', 'transaction_ids'),
        });
    };

    const memberOptions = members.map(m => ({
        value: m.id,
        label: `${m.name} (${m.member_number})`
    }));

    // For Rapel Tab
    const selectedRapelMember = useMemo(() => {
        if (!rapelForm.data.member_id) return null;
        return members.find(m => m.id == rapelForm.data.member_id);
    }, [rapelForm.data.member_id, members]);

    const pendingTransactions = selectedRapelMember?.simpanan_transactions || [];

    const handleToggleRapelTransaction = (id) => {
        const ids = rapelForm.data.transaction_ids;
        if (ids.includes(id)) {
            rapelForm.setData('transaction_ids', ids.filter(t => t !== id));
        } else {
            rapelForm.setData('transaction_ids', [...ids, id]);
        }
    };

    const tabs = [
        { id: 'setoran', label: 'Setoran', icon: ArrowDownRight },
        { id: 'rapel', label: 'Rapel Tunggakan', icon: CalendarDays },
        { id: 'penarikan', label: 'Tarik Tunai', icon: ArrowUpRight },
    ];

    return (
        <AdminLayout pageTitle="Kasir Simpanan">
            <Head title="Kasir Simpanan" />
            
            <div className="max-w-3xl mx-auto flex flex-col gap-6">
                
                <div className="mb-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-1 flex items-center gap-2">
                            <WalletCards className="w-6 h-6 text-primary" />
                            Kasir Simpanan
                        </h1>
                        <p className="text-[13px] text-slate-500 font-medium">
                            Penerimaan setoran, pelunasan tunggakan, dan pencairan simpanan.
                        </p>
                    </div>
                    <Link href="/admin/simpanan/bulk" className="text-sm font-medium text-primary bg-primary/10 px-4 py-2 rounded-xl hover:bg-primary/20 transition-colors shrink-0">
                        Mode Potong Gaji (Bulk)
                    </Link>
                </div>

                <PillTabs 
                    variant="segmented"
                    tabs={tabs} 
                    activeTab={activeTab} 
                    onChange={setActiveTab} 
                    className="mb-4 w-full sm:w-auto"
                />

                {activeTab === 'setoran' && (
                    <DepositTab
                        depositForm={depositForm}
                        members={members}
                        memberOptions={memberOptions}
                        onSubmit={handleDepositSubmit}
                    />
                )}

                {activeTab === 'rapel' && (
                    <RapelTab
                        rapelForm={rapelForm}
                        memberOptions={memberOptions}
                        selectedRapelMember={selectedRapelMember}
                        pendingTransactions={pendingTransactions}
                        onToggleRapelTransaction={handleToggleRapelTransaction}
                        onSubmit={handleRapelSubmit}
                    />
                )}

                {activeTab === 'penarikan' && (
                    <WithdrawTab
                        withdrawForm={withdrawForm}
                        members={members}
                        memberOptions={memberOptions}
                        onSubmit={handleWithdrawSubmit}
                    />
                )}
            </div>
        </AdminLayout>
    );
}

