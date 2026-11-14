import { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import { CheckCircle, Clock, Wallet, TrendingUp } from 'lucide-react';
import { formatRupiah, formatDate } from '@/Utils/format';
import AdminLayout from '@/Layouts/AdminLayout';
import Card from '@/Components/UI/Card';
import StatCard from '@/Components/UI/StatCard';
import { toast } from '@/Components/UI/Toast';
import DisburseModal from './Partials/DisburseModal';
import SlipModal from './Partials/SlipModal';
import DistributionTable from './Partials/DistributionTable';

export default function Show({ session, distributions, flash }) {
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedDist, setSelectedDist] = useState(null);
    const [selectedSlipDist, setSelectedSlipDist] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
        if (flash?.info) toast.info(flash.info);
    }, [flash]);

    const progress = session.disbursement_progress;

    const filtered = distributions.filter((d) => {
        const matchSearch =
            !search ||
            d.member?.name?.toLowerCase().includes(search.toLowerCase()) ||
            d.member?.member_number?.includes(search);
        const matchFilter =
            filterStatus === 'all' ||
            (filterStatus === 'disbursed' && d.is_disbursed) ||
            (filterStatus === 'pending' && !d.is_disbursed);
        return matchSearch && matchFilter;
    });

    const handleDisburse = (method) => {
        setLoading(true);
        router.post(
            `/admin/rat/${session.id}/disburse/${selectedDist.id}`,
            { method },
            {
                onFinish: () => {
                    setLoading(false);
                    setSelectedDist(null);
                },
            }
        );
    };

    const handleReverse = (dist) => {
        if (!confirm(`Batalkan pencairan SHU ${dist.member?.name}?`)) return;
        router.post(`/admin/rat/${session.id}/reverse/${dist.id}`);
    };

    return (
        <AdminLayout backUrl="/admin/rat" pageTitle={`RAT ${session.tahun_buku}`}>
            <Head title={`RAT ${session.tahun_buku} — Pengelolaan SHU`} />

            <DisburseModal
                distribution={selectedDist}
                onClose={() => setSelectedDist(null)}
                onConfirm={handleDisburse}
                loading={loading}
            />

            <SlipModal
                distribution={selectedSlipDist}
                session={session}
                onClose={() => setSelectedSlipDist(null)}
            />

            <div className="space-y-6 max-w-[1400px] mx-auto">
                {/* ── Session Header Card ── */}
                <Card innerPadding="p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h1 className="text-[20px] font-bold text-slate-900 tracking-tight">
                                {session.title ?? `RAT Tahun Buku ${session.tahun_buku}`}
                            </h1>
                            <p className="text-[12px] text-slate-500 mt-1">
                                Tanggal Pelaksanaan: {formatDate(session.tanggal_rat)}
                            </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <span className="inline-flex items-center gap-2 text-[12px] font-medium px-3.5 py-1.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200/60 font-mono">
                                <span className={`w-1.5 h-1.5 rounded-full ${session.status === 'COMPLETED' ? 'bg-emerald-500' : 'bg-primary'}`} />
                                <span>{progress.disbursed}/{progress.total} Cair ({progress.percentage}%)</span>
                            </span>
                        </div>
                    </div>
                </Card>

                {/* ── Stat Cards ── */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <StatCard
                        title="Laba Bersih"
                        value={session.total_net_profit || 0}
                        prefix="Rp"
                        icon={TrendingUp}
                        gradient="indigo"
                        compact={false}
                    />
                    <StatCard
                        title="Dana Cadangan"
                        value={(session.total_net_profit || 0) - (session.total_member_shu ?? session.total_shu ?? 0)}
                        prefix="Rp"
                        icon={Wallet}
                        gradient="amber"
                        compact={false}
                    />
                    <StatCard
                        title="SHU Anggota"
                        value={session.total_member_shu ?? session.total_shu}
                        prefix="Rp"
                        icon={Wallet}
                        gradient="emerald"
                        compact={false}
                    />
                </div>

                {/* ── Disbursement Progress Widget ── */}
                <Card innerPadding="p-6">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-baseline gap-2 mb-4">
                        <div>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Realisasi Pencairan SHU</p>
                            <div className="flex items-baseline gap-2 mt-1">
                                <span className="text-[24px] sm:text-[28px] font-bold text-slate-900 tracking-tight font-mono">
                                    {formatRupiah(progress.disbursed_amount)}
                                </span>
                                <span className="text-[13px] text-slate-400">
                                    / {formatRupiah(progress.total_amount)}
                                </span>
                            </div>
                        </div>
                        <div className="flex sm:flex-col sm:items-end justify-between items-baseline gap-0.5">
                            <span className="text-[24px] sm:text-[28px] font-extrabold text-slate-900 tracking-tight font-mono">
                                {progress.percentage_amount}%
                            </span>
                            <p className="text-[12px] text-slate-500 font-medium">
                                {progress.disbursed} dari {progress.total} anggota cair
                            </p>
                        </div>
                    </div>

                    {/* Apple Linear Progress Bar */}
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/40">
                        <div
                            className="h-full bg-slate-900 rounded-full transition-all duration-700"
                            style={{ width: `${progress.percentage_amount}%` }}
                        />
                    </div>

                    {/* Bottom Metric Legend */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mt-3 text-[12px] text-slate-500">
                        <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-slate-900" />
                            <span>Tercairkan: <strong className="font-semibold text-slate-800 font-mono">{formatRupiah(progress.disbursed_amount)}</strong></span>
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-slate-300" />
                            <span>Sisa Belum Cair: <strong className="font-semibold text-slate-800 font-mono">{formatRupiah(progress.total_amount - progress.disbursed_amount)}</strong> ({progress.total - progress.disbursed} anggota)</span>
                        </span>
                    </div>
                </Card>

                {/* ── Distribution Table ── */}
                <DistributionTable
                    filtered={filtered}
                    search={search}
                    setSearch={setSearch}
                    filterStatus={filterStatus}
                    setFilterStatus={setFilterStatus}
                    onSlipClick={setSelectedSlipDist}
                    onDisburseClick={setSelectedDist}
                    onReverseClick={handleReverse}
                />
            </div>
        </AdminLayout>
    );
}

