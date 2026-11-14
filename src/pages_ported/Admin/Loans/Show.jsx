import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Card from '@/Components/UI/Card';
import StatCard from '@/Components/UI/StatCard';
import StatusBadge from '@/Components/UI/StatusBadge';
import DataTable from '@/Components/UI/DataTable';
import Button from '@/Components/UI/Button';
import FormInput from '@/Components/UI/FormInput';
import Modal from '@/Components/UI/Modal';
import { Check, HandCoins, ArrowDownRight, Clock, AlertCircle, Save, Zap, Printer } from 'lucide-react';
import PaymentModal from './Components/PaymentModal';
import EarlyRepaymentModal from './Components/EarlyRepaymentModal';
import VoidPaymentModal from './Components/VoidPaymentModal';
import SetOffModal from './Components/SetOffModal';

export default function Show({ loan }) {
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isEarlyRepaymentModalOpen, setIsEarlyRepaymentModalOpen] = useState(false);
    const [isSetOffModalOpen, setIsSetOffModalOpen] = useState(false);
    const [voidPaymentData, setVoidPaymentData] = useState(null);

    const voidForm = useForm({
        reason: '',
    });
    
    const setOffForm = useForm({
        amount: loan.remaining_amount || '',
    });
    
    const paymentForm = useForm({
        amount: loan.monthly_installment || '',
    });

    const handlePaymentSubmit = (e) => {
        e.preventDefault();
        paymentForm.post(`/admin/pembiayaan/${loan.id}/payment`, {
            onSuccess: () => setIsPaymentModalOpen(false),
        });
    };

    const handleEarlyRepaymentSubmit = (e) => {
        e.preventDefault();
        router.post(`/admin/pembiayaan/${loan.id}/early-repayment`, {}, {
            onSuccess: () => setIsEarlyRepaymentModalOpen(false),
        });
    };

    const handleVoidSubmit = (e) => {
        e.preventDefault();
        if (voidPaymentData) {
            voidForm.post(`/admin/pembiayaan/${loan.id}/payments/${voidPaymentData.paymentId}/void`, {
                onSuccess: () => {
                    setVoidPaymentData(null);
                    voidForm.reset();
                }
            });
        }
    };

    const handleSetOffSubmit = (e) => {
        e.preventDefault();
        setOffForm.post(`/admin/pembiayaan/${loan.id}/set-off`, {
            onSuccess: () => setIsSetOffModalOpen(false),
        });
    };

    const handleApprove = () => {
        if (confirm('Anda yakin ingin menyetujui pembiayaan ini?')) {
            router.post(`/admin/pembiayaan/${loan.id}/approve`);
        }
    };

    const handleDisburse = () => {
        if (confirm('Anda yakin ingin mencairkan dana pembiayaan ini? Tindakan ini akan menjurnal transaksi ke buku besar.')) {
            router.post(`/admin/pembiayaan/${loan.id}/disburse`);
        }
    };

    const paymentColumns = [
        { header: 'Tanggal', accessor: 'payment_date', cell: row => <span className={row.status === 'VOID' ? 'line-through text-slate-400' : ''}>{new Date(row.payment_date).toLocaleDateString('id-ID')}</span> },
        { header: 'No. Kwitansi', accessor: 'receipt_number', cell: row => <span className={`font-mono text-[11px] ${row.status === 'VOID' ? 'line-through text-slate-400' : ''}`}>{row.receipt_number || '-'}</span> },
        { header: 'Angsuran Pokok', accessor: 'principal_amount', cell: row => <span className={row.status === 'VOID' ? 'line-through text-slate-400' : ''}>Rp {Number(row.principal_amount).toLocaleString('id-ID')}</span> },
        { header: 'Margin', accessor: 'interest_amount', cell: row => <span className={row.status === 'VOID' ? 'line-through text-slate-400' : ''}>Rp {Number(row.interest_amount).toLocaleString('id-ID')}</span> },
        { header: 'Total Bayar', accessor: 'amount', cell: row => <span className={`font-medium ${row.status === 'VOID' ? 'line-through text-slate-400' : 'text-slate-900'}`}>Rp {Number(row.amount).toLocaleString('id-ID')}</span> },
        { header: 'Status', accessor: 'status', cell: row => row.status === 'VOID' ? <span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded border border-rose-100">VOID</span> : <span className="text-[11px] font-medium text-slate-500">Sukses</span> },
        { 
            header: '', 
            accessor: 'actions', 
            cell: row => {
                const isToday = new Date(row.created_at).toDateString() === new Date().toDateString();
                if (row.status === 'PAID' && isToday) {
                    return (
                        <button 
                            type="button" 
                            onClick={() => setVoidPaymentData({ paymentId: row.id, receipt: row.receipt_number })}
                            className="text-[11px] font-medium text-rose-500 hover:text-rose-700 hover:bg-rose-50 px-2 py-1 rounded transition-colors"
                        >
                            Batalkan
                        </button>
                    );
                }
                return null;
            } 
        },
    ];

    const paidPrincipal = (loan.payments || []).filter(p => p.status === 'PAID').reduce((sum, p) => sum + Number(p.principal_amount), 0);
    const paidInterest = (loan.payments || []).filter(p => p.status === 'PAID').reduce((sum, p) => sum + Number(p.interest_amount), 0);
    const remainingPrincipal = Number(loan.base_amount) - paidPrincipal;
    const remainingInterest = Number(loan.interest_amount) - paidInterest;
    const totalToPay = remainingPrincipal + remainingInterest;

    return (
        <AdminLayout pageTitle="Detail Pembiayaan" backUrl="/admin/pembiayaan">
            <Head title={`Pembiayaan - ${loan.loan_number}`} />
            
            <div className="max-w-[1400px] mx-auto flex flex-col gap-6">
                
                {/* Action Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-1 flex items-center gap-2">
                            {loan.loan_number}
                            <StatusBadge status={loan.status} />
                        </h1>
                        <div className="flex items-center gap-3 text-[13px]">
                            <span className="font-medium text-slate-700">{loan.member?.name}</span>
                            <span className="text-slate-300">•</span>
                            <span className="text-slate-500">Sumber: {loan.loan_source}</span>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2 w-full sm:w-auto items-center">
                        {loan.status !== 'REJECTED' && (
                            <a
                                href={`/admin/pembiayaan/${loan.id}/agreement-pdf`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
                            >
                                <Printer className="w-3.5 h-3.5 text-teal-600" />
                                <span>Cetak Akad &amp; Tanda Terima</span>
                            </a>
                        )}
                        {loan.status === 'PENDING' && (
                            <Button variant="primary" size="sm" onClick={handleApprove}>
                                <Check className="w-4 h-4" /> Setujui Pembiayaan
                            </Button>
                        )}
                        {loan.status === 'APPROVED' && (
                            <Button variant="accent" size="sm" onClick={handleDisburse}>
                                <ArrowDownRight className="w-4 h-4" /> Cairkan Dana
                            </Button>
                        )}
                        {['ACTIVE', 'OVERDUE'].includes(loan.status) && (
                            <>
                                <Button variant="secondary" size="sm" onClick={() => setIsEarlyRepaymentModalOpen(true)}>
                                    <Zap className="w-4 h-4 text-amber-500" /> Pelunasan Dipercepat
                                </Button>
                                <Button variant="primary" size="sm" onClick={() => setIsPaymentModalOpen(true)}>
                                    <HandCoins className="w-4 h-4" /> Catat Pembayaran
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {/* Top Profile & Summary Grid */}
                <div className="flex flex-col xl:grid xl:grid-cols-12 gap-6">
                    
                    {/* Ringkasan Pembiayaan (Order 1 Mobile, Col 1-8 Desktop) */}
                    <div className="order-1 xl:col-span-8 flex flex-col gap-6">
                        <Card innerPadding="p-0" className="flex flex-col">
                            <div className="px-6 py-5 border-b border-slate-100 bg-[#FAFAFB]">
                                <h3 className="text-[15px] font-medium text-slate-900 mb-0.5">Ringkasan Pembiayaan</h3>
                                <p className="text-[13px] text-slate-500">Detail kesepakatan pembiayaan.</p>
                            </div>
                            <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-y-6 gap-x-8">
                                <div>
                                    <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Plafon</h4>
                                    <p className="text-[15px] font-medium text-slate-900">Rp {Number(loan.base_amount).toLocaleString('id-ID')}</p>
                                </div>
                                <div>
                                    <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Tenor</h4>
                                    <p className="text-[15px] font-medium text-slate-900">{loan.tenor} Bulan</p>
                                </div>
                                <div>
                                    <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Margin / Tahun</h4>
                                    <p className="text-[15px] font-medium text-slate-900">{loan.interest_rate}%</p>
                                </div>
                                <div>
                                    <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Total Kewajiban</h4>
                                    <p className="text-[15px] font-medium text-slate-900">Rp {Number(loan.total_amount).toLocaleString('id-ID')}</p>
                                </div>
                                <div>
                                    <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Angsuran per Bulan</h4>
                                    <p className="text-[15px] font-medium text-slate-900">Rp {Number(loan.monthly_installment).toLocaleString('id-ID')}</p>
                                </div>
                                <div>
                                    <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Tgl Pencairan</h4>
                                    <p className="text-[15px] font-medium text-slate-900">
                                        {loan.disbursement_date ? new Date(loan.disbursement_date).toLocaleDateString('id-ID') : '-'}
                                    </p>
                                </div>
                                <div className="sm:col-span-3">
                                    <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Tujuan Pembiayaan</h4>
                                    <p className="text-[14px] font-medium text-slate-900">{loan.purpose || '-'}</p>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Sisa Pokok & Danger Zone (Order 2 Mobile, Col 9-12 Desktop) */}
                    <div className="order-2 xl:order-none xl:col-span-4 xl:row-span-2 flex flex-col gap-4">
                        <StatCard 
                            title="Sisa Pokok Pembiayaan" 
                            value={Number(loan.remaining_amount)}
                            prefix="Rp"
                            label="Outstanding" 
                            gradient="amber"
                        />
                        
                        {loan.status === 'PENDING' && (
                            <div className="bg-sky-50 border border-sky-100 rounded-xl p-4 text-sm text-sky-800">
                                <AlertCircle className="w-5 h-5 mb-2 text-sky-500" />
                                <strong>Menunggu Persetujuan.</strong> Periksa kelengkapan data sebelum menyetujui pembiayaan ini.
                            </div>
                        )}

                        {/* Danger Zone: Set-Off / Restrukturisasi */}
                        {['ACTIVE', 'OVERDUE'].includes(loan.status) && loan.member.simpanan_sukarela_cache > 0 && (
                            <Card innerPadding="p-5" className="border-rose-200 bg-rose-50/30 flex flex-col gap-3">
                                <div className="flex items-center gap-2 text-rose-700 font-semibold mb-1">
                                    <AlertCircle className="w-5 h-5" />
                                    Manajemen Risiko
                                </div>
                                <p className="text-[13px] text-slate-600 leading-relaxed">
                                    Gunakan saldo Simpanan Sukarela milik anggota untuk menutupi hutang atau tunggakan secara paksa.
                                </p>
                                <Button 
                                    onClick={() => setIsSetOffModalOpen(true)} 
                                    variant="danger" 
                                    className="w-full justify-center bg-white border border-rose-200 text-rose-600 hover:bg-rose-600 hover:text-white mt-1 transition-all shadow-sm"
                                >
                                    Sita Simpanan Sukarela
                                </Button>
                            </Card>
                        )}
                    </div>
                        
                    {/* Riwayat Pembayaran Angsuran (Order 3 Mobile, Col 1-8 Desktop) */}
                    <div className="order-3 xl:order-none xl:col-span-8 flex flex-col gap-6">
                            <div className="hidden sm:block">
                                <DataTable 
                                    title={
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-slate-400" />
                                            <span>Riwayat Pembayaran Angsuran</span>
                                        </div>
                                    }
                                    columns={paymentColumns}
                                    data={loan.payments || []}
                                    emptyMessage="Belum ada riwayat pembayaran."
                                />
                            </div>
                            <div className="sm:hidden bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden flex flex-col">
                                <div className="px-5 py-4 border-b border-slate-100 bg-white/50 backdrop-blur-sm">
                                    <h3 className="text-[14px] font-bold text-slate-900 flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-slate-400" />
                                        Riwayat Pembayaran
                                    </h3>
                                </div>
                                {(!loan.payments || loan.payments.length === 0) ? (
                                    <div className="p-8 text-center text-[14px] text-slate-500">Belum ada riwayat pembayaran.</div>
                                ) : (
                                    loan.payments.map((p, idx) => (
                                        <div key={p.id} className="flex flex-col p-4 relative group">
                                            {idx !== loan.payments.length - 1 && (
                                                <div className="absolute bottom-0 right-0 left-4 h-[1px] bg-slate-100"></div>
                                            )}
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <span className={`text-[15px] font-semibold font-mono truncate ${p.status === 'VOID' ? 'line-through text-slate-400' : 'text-slate-900'}`}>{p.receipt_number || '-'}</span>
                                                </div>
                                                <span className="text-[12px] text-slate-500 shrink-0">{new Date(p.payment_date).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-[11px] text-slate-400">Pokok: Rp {Number(p.principal_amount).toLocaleString('id-ID')}</span>
                                                    <span className="text-[11px] text-slate-400">Margin: Rp {Number(p.interest_amount).toLocaleString('id-ID')}</span>
                                                </div>
                                                <div className="flex flex-col items-end gap-1">
                                                    <span className={`text-[15px] font-bold ${p.status === 'VOID' ? 'line-through text-slate-400' : 'text-slate-900'}`}>Rp {Number(p.amount).toLocaleString('id-ID')}</span>
                                                    {p.status === 'VOID' && (
                                                        <span className="text-[9px] font-bold text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100">VOID</span>
                                                    )}
                                                </div>
                                            </div>
                                            {p.status === 'PAID' && new Date(p.created_at).toDateString() === new Date().toDateString() && (
                                                <div className="mt-3 pt-3 border-t border-slate-50 flex justify-end">
                                                    <button 
                                                        type="button" 
                                                        onClick={() => setVoidPaymentData({ paymentId: p.id, receipt: p.receipt_number })}
                                                        className="text-[11px] font-medium text-rose-500 flex items-center gap-1 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2 py-1 rounded transition-colors"
                                                    >
                                                        Batalkan Transaksi
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                </div>

            {/* Payment Modal */}
            <PaymentModal 
                isOpen={isPaymentModalOpen} 
                onClose={() => setIsPaymentModalOpen(false)} 
                loan={loan} 
                form={paymentForm} 
                onSubmit={handlePaymentSubmit} 
            />

            {/* Early Repayment Modal */}
            <EarlyRepaymentModal 
                isOpen={isEarlyRepaymentModalOpen} 
                onClose={() => setIsEarlyRepaymentModalOpen(false)} 
                remainingPrincipal={remainingPrincipal} 
                remainingInterest={remainingInterest} 
                totalToPay={totalToPay} 
                onSubmit={handleEarlyRepaymentSubmit} 
            />

            {/* Void Modal */}
            <VoidPaymentModal 
                isOpen={!!voidPaymentData} 
                onClose={() => { setVoidPaymentData(null); voidForm.reset(); }} 
                voidPaymentData={voidPaymentData} 
                form={voidForm} 
                onSubmit={handleVoidSubmit} 
            />

            {/* Set-Off Modal */}
            <SetOffModal 
                isOpen={isSetOffModalOpen} 
                onClose={() => setIsSetOffModalOpen(false)} 
                loan={loan} 
                form={setOffForm} 
                onSubmit={handleSetOffSubmit} 
            />
        </AdminLayout>
    );
}

