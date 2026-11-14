import React, { useState, useMemo } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import FormCard from '@/Components/UI/FormCard';
import FormInput from '@/Components/UI/FormInput';
import Button from '@/Components/UI/Button';
import { Layers, CalendarPlus, CheckSquare, Save, ArrowLeft } from 'lucide-react';

export default function Bulk({ pending_transactions }) {
    // Generate Bill Form
    const generateForm = useForm({
        billing_month: new Date().toISOString().slice(0, 7), // YYYY-MM
    });

    // Approve Bulk Form
    const approveForm = useForm({
        transaction_ids: pending_transactions.map(t => t.id),
    });

    const handleGenerateSubmit = (e) => {
        e.preventDefault();
        generateForm.post('/admin/simpanan/bulk/generate', {
            onSuccess: () => {},
        });
    };

    const handleApproveSubmit = (e) => {
        e.preventDefault();
        approveForm.post('/admin/simpanan/bulk/approve', {
            onSuccess: () => approveForm.reset(),
        });
    };

    const handleToggleAll = (e) => {
        if (e.target.checked) {
            approveForm.setData('transaction_ids', pending_transactions.map(t => t.id));
        } else {
            approveForm.setData('transaction_ids', []);
        }
    };

    const handleToggleOne = (id) => {
        const ids = approveForm.data.transaction_ids;
        if (ids.includes(id)) {
            approveForm.setData('transaction_ids', ids.filter(t => t !== id));
        } else {
            approveForm.setData('transaction_ids', [...ids, id]);
        }
    };

    // Calculate total amount selected
    const totalAmountSelected = useMemo(() => {
        return pending_transactions
            .filter(t => approveForm.data.transaction_ids.includes(t.id))
            .reduce((acc, curr) => acc + Number(curr.amount), 0);
    }, [pending_transactions, approveForm.data.transaction_ids]);

    return (
        <AdminLayout pageTitle="Bulk / Potong Gaji">
            <Head title="Bulk Potong Gaji" />
            
            <div className="max-w-4xl mx-auto flex flex-col gap-6">
                
                <div className="mb-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <Link href="/admin/simpanan" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 mb-3 transition-colors">
                            <ArrowLeft className="w-4 h-4 mr-1" />
                            Kembali ke Kasir
                        </Link>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-1 flex items-center gap-2">
                            <Layers className="w-6 h-6 text-primary" />
                            Bulk & Potong Gaji
                        </h1>
                        <p className="text-[13px] text-slate-500 font-medium">
                            Generate tagihan massal dan eksekusi pelunasan potong gaji.
                        </p>
                    </div>
                </div>

                {/* Generate Section */}
                <form onSubmit={handleGenerateSubmit}>
                    <FormCard 
                        title="1. Rilis Tagihan Massal" 
                        description="Sistem akan membuat tagihan Simpanan Wajib dengan status PENDING untuk seluruh anggota aktif pada bulan yang dipilih."
                        footer={
                            <Button variant="secondary" size="md" type="submit" disabled={generateForm.processing}>
                                <CalendarPlus className="w-4 h-4" />
                                {generateForm.processing ? 'Memproses...' : 'Generate Tagihan'}
                            </Button>
                        }
                    >
                        <div className="md:w-1/2">
                            <FormInput 
                                label="Bulan Tagihan" 
                                id="billing_month"
                                type="month"
                                value={generateForm.data.billing_month}
                                onChange={e => generateForm.setData('billing_month', e.target.value)}
                                error={generateForm.errors.billing_month}
                                required
                            />
                        </div>
                    </FormCard>
                </form>

                {/* Approve Section */}
                <form onSubmit={handleApproveSubmit}>
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                    <CheckSquare className="w-5 h-5 text-primary" />
                                    2. Eksekusi Pembayaran (Approval)
                                </h3>
                                <p className="text-sm text-slate-500 mt-1">
                                    Pilih tagihan yang berhasil dipotong dari gaji anggota, lalu setujui pembayarannya.
                                </p>
                            </div>
                        </div>
                        
                        <div className="p-0 overflow-x-auto">
                            {pending_transactions.length === 0 ? (
                                <div className="p-10 text-center flex flex-col items-center">
                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                                        <CheckSquare className="w-8 h-8 text-slate-300" />
                                    </div>
                                    <h3 className="text-base font-semibold text-slate-900">Semua Lunas!</h3>
                                    <p className="text-sm text-slate-500 mt-1">Tidak ada tagihan PENDING saat ini.</p>
                                </div>
                            ) : (
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                                            <th className="p-4 w-12 text-center">
                                                <input 
                                                    type="checkbox" 
                                                    className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary cursor-pointer"
                                                    checked={approveForm.data.transaction_ids.length === pending_transactions.length && pending_transactions.length > 0}
                                                    onChange={handleToggleAll}
                                                />
                                            </th>
                                            <th className="p-4 font-medium">Bulan</th>
                                            <th className="p-4 font-medium">Anggota</th>
                                            <th className="p-4 font-medium">Jenis</th>
                                            <th className="p-4 font-medium text-right">Nominal</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {pending_transactions.map(tx => (
                                            <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="p-4 text-center">
                                                    <input 
                                                        type="checkbox" 
                                                        className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary cursor-pointer"
                                                        checked={approveForm.data.transaction_ids.includes(tx.id)}
                                                        onChange={() => handleToggleOne(tx.id)}
                                                    />
                                                </td>
                                                <td className="p-4 text-sm font-medium text-slate-900 whitespace-nowrap">
                                                    {tx.billing_month}
                                                </td>
                                                <td className="p-4 text-sm font-semibold text-slate-700 whitespace-nowrap">
                                                    {tx.member?.name} <span className="font-normal text-slate-400">({tx.member?.member_number})</span>
                                                </td>
                                                <td className="p-4 text-sm text-slate-600 whitespace-nowrap">
                                                    {tx.type}
                                                </td>
                                                <td className="p-4 text-sm font-bold text-slate-900 text-right whitespace-nowrap">
                                                    Rp {Number(tx.amount).toLocaleString('id-ID')}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        {/* Sticky Action Bar */}
                        {pending_transactions.length > 0 && (
                            <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4 sticky bottom-0 z-10">
                                <div>
                                    <p className="text-sm text-slate-500 font-medium">Total Terpilih: <span className="font-bold text-slate-900 ml-1">{approveForm.data.transaction_ids.length} Tagihan</span></p>
                                    <p className="text-sm text-slate-500 font-medium">Total Nominal: <span className="font-bold text-primary ml-1">Rp {totalAmountSelected.toLocaleString('id-ID')}</span></p>
                                </div>
                                
                                <Button 
                                    variant="primary" 
                                    size="lg" 
                                    type="submit" 
                                    disabled={approveForm.processing || approveForm.data.transaction_ids.length === 0}
                                    className="w-full sm:w-auto px-8"
                                >
                                    <Save className="w-5 h-5" />
                                    {approveForm.processing ? 'Memproses...' : 'Approve & Lunasi'}
                                </Button>
                            </div>
                        )}
                    </div>
                </form>

            </div>
        </AdminLayout>
    );
}

