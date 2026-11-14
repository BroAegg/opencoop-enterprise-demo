import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import DataTable from '@/Components/UI/DataTable';
import Button from '@/Components/UI/Button';
import StatusBadge from '@/Components/UI/StatusBadge';
import Modal from '@/Components/UI/Modal';
import { CalendarRange, Plus, Zap, AlertCircle } from 'lucide-react';

export default function Index({ sessions = [], members = [] }) {
    const [isDistributeModalOpen, setIsDistributeModalOpen] = useState(false);
    const distributeForm = useForm({
        member_id: '',
        amount: '',
    });

    const handleDistributeSubmit = (e) => {
        e.preventDefault();
        distributeForm.post('/admin/rat/distribute', {
            onSuccess: () => {
                setIsDistributeModalOpen(false);
                distributeForm.reset();
            }
        });
    };
    
    const columns = [
        {
            header: 'Tahun Buku',
            accessor: 'tahun_buku',
            cell: row => <span className="font-bold text-slate-900">{row.tahun_buku}</span>
        },
        {
            header: 'Tanggal RAT',
            accessor: 'tanggal_rat',
            cell: row => <span>{row.tanggal_rat ? new Date(row.tanggal_rat).toLocaleDateString('id-ID') : '-'}</span>
        },
        {
            header: 'Total SHU (Rp)',
            accessor: 'total_member_shu',
            cell: row => <span className="font-semibold text-emerald-600">{Number(row.total_member_shu ?? row.total_shu).toLocaleString('id-ID')}</span>
        },
        {
            header: 'Progress Pencairan',
            accessor: 'disbursement_progress',
            cell: row => {
                const p = row.disbursement_progress;
                if (!p || p.total === 0) return <span className="text-slate-400 text-xs">-</span>;
                return (
                    <div className="min-w-[120px]">
                        <div className="flex justify-between text-[11px] mb-1">
                            <span className="text-slate-600">{p.disbursed}/{p.total} anggota</span>
                            <span className="font-bold text-slate-700">{p.percentage}%</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full" style={{ width: `${p.percentage}%` }} />
                        </div>
                    </div>
                );
            }
        },
        { header: 'Status', accessor: 'status', cell: row => <StatusBadge status={row.status} /> },
        {
            header: 'Aksi',
            accessor: 'id',
            cell: row => (
                <div className="flex items-center gap-2">
                    <Link href={`/admin/rat/${row.id}`}>
                        <Button size="sm" variant="primary" className="bg-indigo-600 hover:bg-indigo-700">Kelola</Button>
                    </Link>
                    <Link href={`/admin/rat/book?id=${row.id}`}>
                        <Button size="sm" variant="secondary">Buku RAT</Button>
                    </Link>
                </div>
            )
        },
    ];

    return (
        <AdminLayout pageTitle="Rapat Anggota Tahunan (RAT)">
            <Head title="Manajemen RAT" />
            
            <div className="flex flex-col gap-6 max-w-[1400px] mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-2">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-1 flex items-center gap-2">
                            <CalendarRange className="w-6 h-6 text-primary" />
                            Daftar Sesi RAT
                        </h1>
                        <p className="text-[13px] text-slate-500 font-medium">
                            Kelola jadwal Rapat Anggota Tahunan dan riwayat pembagian SHU.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="primary" onClick={() => setIsDistributeModalOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-all">
                            <Zap className="w-4 h-4" /> Distribusi Cepat (SHU)
                        </Button>
                        <Link href="/admin/rat/wizard">
                            <Button variant="secondary" className="shadow-sm">
                                <Plus className="w-4 h-4" /> Tambah Sesi RAT
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col justify-between relative overflow-hidden group">
                        <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
                            <CalendarRange className="w-32 h-32 text-slate-900" />
                        </div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 relative z-10">Total Sesi RAT</p>
                        <h3 className="text-2xl font-black text-slate-900 relative z-10">{sessions.length} <span className="text-sm font-medium text-slate-500">Tahun Buku</span></h3>
                    </div>
                    
                    <div className="bg-white rounded-2xl border border-emerald-100 p-5 shadow-[0_2px_10px_rgba(16,185,129,0.05)] flex flex-col justify-between relative overflow-hidden group lg:col-span-2">
                        <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                            <Zap className="w-32 h-32 text-emerald-600" />
                        </div>
                        <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2 relative z-10">Total SHU Didistribusikan</p>
                        <h3 className="text-2xl font-black text-emerald-700 relative z-10">Rp {sessions.reduce((sum, s) => sum + Number(s.total_member_shu || s.total_shu || 0), 0).toLocaleString('id-ID')}</h3>
                    </div>
                </div>

                <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
                    <div className="px-6 py-5 border-b border-slate-100 bg-[#FAFAFB]">
                        <h3 className="text-[15px] font-bold text-slate-800">Riwayat Sesi RAT</h3>
                    </div>
                    <DataTable 
                        columns={columns}
                        data={sessions}
                        emptyMessage="Belum ada data RAT tahunan."
                    />
                </div>
            </div>

            {/* Modal Distribusi SHU */}
            <Modal isOpen={isDistributeModalOpen} onClose={() => setIsDistributeModalOpen(false)} title="Distribusi SHU Cepat (Suntik Simpanan)">
                <form onSubmit={handleDistributeSubmit} className="flex flex-col gap-5 p-6">
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-sm text-emerald-900">
                        <div className="flex items-start gap-2">
                            <AlertCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                            <p>
                                <strong>Anti-Recehan!</strong> Gunakan fitur ini untuk membagikan nominal SHU yang tidak bulat secara langsung ke saldo <strong>Simpanan Sukarela</strong> milik Anggota.
                            </p>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="member_id" className="block text-sm font-semibold text-slate-700 mb-1">
                            Pilih Anggota <span className="text-rose-500">*</span>
                        </label>
                        <select
                            id="member_id"
                            value={distributeForm.data.member_id}
                            onChange={e => distributeForm.setData('member_id', e.target.value)}
                            className="block w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-3 pr-10 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                            required
                        >
                            <option value="">-- Pilih Anggota --</option>
                            {members.map(member => (
                                <option key={member.id} value={member.id}>{member.member_number} - {member.name}</option>
                            ))}
                        </select>
                        {distributeForm.errors.member_id && <p className="mt-1 text-xs text-rose-500 font-medium">{distributeForm.errors.member_id}</p>}
                    </div>

                    <div>
                        <label htmlFor="amount" className="block text-sm font-semibold text-slate-700 mb-1">
                            Nominal SHU <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <span className="text-slate-500 sm:text-sm font-medium">Rp</span>
                            </div>
                            <input
                                type="number"
                                id="amount"
                                value={distributeForm.data.amount}
                                onChange={e => distributeForm.setData('amount', e.target.value)}
                                className={`block w-full rounded-lg border pl-9 pr-12 py-2.5 text-sm outline-none transition-all focus:ring-2 ${
                                    distributeForm.errors.amount ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100' : 'border-slate-200 focus:border-primary focus:ring-primary/10'
                                }`}
                                placeholder="134525"
                                required
                                min="1"
                            />
                        </div>
                        {distributeForm.errors.amount && <p className="mt-1 text-xs text-rose-500 font-medium">{distributeForm.errors.amount}</p>}
                    </div>

                    <div className="flex justify-end gap-3 mt-4">
                        <Button variant="secondary" size="md" type="button" onClick={() => setIsDistributeModalOpen(false)}>
                            Batal
                        </Button>
                        <Button variant="primary" size="md" type="submit" disabled={distributeForm.processing} className="bg-emerald-600 hover:bg-emerald-700">
                            <Zap className="w-4 h-4 mr-2" />
                            Suntik ke Simpanan
                        </Button>
                    </div>
                </form>
            </Modal>
        </AdminLayout>
    );
}

