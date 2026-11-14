import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import MemberSelectorCard from './Components/Create/MemberSelectorCard';
import LoanTermsCard from './Components/Create/LoanTermsCard';
import LoanTakeoverCard from './Components/Create/LoanTakeoverCard';
import LoanSimulationCard from './Components/Create/LoanSimulationCard';

export default function Create({ members = [], activeLoans = {} }) {
    const [isTakeover, setIsTakeover] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        member_id: '',
        source: 'Manasuka',
        base_amount: '',
        tenor: '10',
        interest_rate: '0',
        admin_fee: '25000',
        purpose: '',
        takeover_loan_id: '',
        bmt_account_number: '',
    });

    const memberActiveLoans = data.member_id && activeLoans[data.member_id] ? activeLoans[data.member_id] : [];

    const selectedTakeoverLoan = data.takeover_loan_id
        ? memberActiveLoans.find((l) => String(l.id) === String(data.takeover_loan_id))
        : null;

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/admin/pembiayaan');
    };

    return (
        <AdminLayout pageTitle="Pengajuan Pembiayaan" backUrl="/admin/pembiayaan">
            <Head title="Pengajuan Pembiayaan — Koperasi Manasuka" />

            <div className="max-w-6xl mx-auto flex flex-col gap-6 pb-16">
                {/* Header Context */}
                <div className="pb-1 border-b border-slate-200/80">
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-1">
                        Form Pengajuan Pembiayaan
                    </h1>
                    <p className="text-[13px] text-slate-500 font-medium">
                        Simulasikan angsuran dan daftarkan pengajuan pembiayaan baru anggota secara terstruktur.
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                        {/* Left Column: Input Sections (7 Cols) */}
                        <div className="lg:col-span-7 flex flex-col gap-6">
                            {/* 1. Member Selector & Context */}
                            <MemberSelectorCard
                                members={members}
                                selectedMemberId={data.member_id}
                                onSelectMember={(id) => {
                                    setData((prev) => ({
                                        ...prev,
                                        member_id: id,
                                        takeover_loan_id: '',
                                    }));
                                    setIsTakeover(false);
                                }}
                                activeLoans={activeLoans}
                                error={errors.member_id}
                            />

                            {/* 2. Loan Parameters & Source */}
                            <LoanTermsCard
                                data={data}
                                setData={setData}
                                errors={errors}
                            />

                            {/* 3. Top-Up / Take Over (Conditional) */}
                            {memberActiveLoans.length > 0 && (
                                <LoanTakeoverCard
                                    memberActiveLoans={memberActiveLoans}
                                    isTakeover={isTakeover}
                                    setIsTakeover={setIsTakeover}
                                    takeoverLoanId={data.takeover_loan_id}
                                    setTakeoverLoanId={(id) => setData('takeover_loan_id', id)}
                                    baseAmount={data.base_amount}
                                    error={errors.takeover_loan_id}
                                />
                            )}
                        </div>

                        {/* Right Column: Sticky Simulator & Actions (5 Cols) */}
                        <div className="lg:col-span-5 lg:sticky lg:top-6 self-start">
                            <LoanSimulationCard
                                data={data}
                                selectedTakeoverLoan={selectedTakeoverLoan}
                                isTakeover={isTakeover}
                                processing={processing}
                                canSubmit={Boolean(data.member_id && data.base_amount && data.tenor)}
                            />
                        </div>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}

