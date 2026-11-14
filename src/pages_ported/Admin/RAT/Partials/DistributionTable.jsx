import React from 'react';
import { Users, Clock, CheckCircle, RotateCcw, Banknote, ReceiptText } from 'lucide-react';
import Card from '@/Components/UI/Card';
import SearchInput from '@/Components/UI/SearchInput';
import StatusBadge from '@/Components/UI/StatusBadge';
import { formatRupiah } from '@/Utils/format';
import { METHOD_LABELS, METHOD_COLORS } from './constants';

export default function DistributionTable({
    filtered,
    search,
    setSearch,
    filterStatus,
    setFilterStatus,
    onSlipClick,
    onReverseClick,
    onDisburseClick
}) {
    return (
        <Card innerPadding="p-0">
            {/* Table Toolbar */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-400" strokeWidth={1.5} />
                    <span className="text-[14px] font-semibold text-slate-800">
                        Daftar Anggota
                    </span>
                    <span className="text-[11px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full font-bold">
                        {filtered.length}
                    </span>
                </div>
                <div className="flex gap-2 flex-wrap w-full sm:w-auto">
                    <SearchInput
                        size="sm"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onClear={() => setSearch('')}
                        placeholder="Cari nama / no. anggota..."
                        className="w-full sm:w-56"
                    />
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-3 py-2 text-[12px] rounded-xl border border-slate-200 bg-slate-50 text-slate-700 outline-none focus:ring-1 focus:ring-primary/30 cursor-pointer"
                    >
                        <option value="all">Semua Status</option>
                        <option value="pending">Belum Cair</option>
                        <option value="disbursed">Sudah Cair</option>
                    </select>
                </div>
            </div>

            {/* ── Desktop Table ── */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-slate-100">
                            {['No', 'Anggota', 'Simpanan (Snapshot)', 'Jasa Simpanan', 'Jasa Usaha', 'Total SHU', 'Status', 'Aksi'].map((h) => (
                                <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((dist, idx) => (
                            <tr
                                key={dist.id}
                                className={`border-b border-slate-50 hover:bg-slate-50/80 transition-colors ${
                                    dist.is_disbursed ? 'opacity-70' : ''
                                }`}
                            >
                                <td className="px-4 py-3.5 text-[12px] text-slate-400 font-medium">{idx + 1}</td>
                                <td className="px-4 py-3.5">
                                    <p className="text-[13px] font-semibold text-slate-900 leading-tight">{dist.member?.name}</p>
                                    <p className="text-[11px] text-slate-400 mt-0.5">{dist.member?.member_number} · {dist.member?.unit_kerja}</p>
                                </td>
                                <td className="px-4 py-3.5 text-[12px] text-slate-600 font-mono">
                                    {formatRupiah(dist.total_simpanan_amount)}
                                </td>
                                <td className="px-4 py-3.5 text-[12px] text-slate-600 font-mono">
                                    {formatRupiah(dist.jasa_simpanan_amount)}
                                </td>
                                <td className="px-4 py-3.5 text-[12px] text-slate-600 font-mono">
                                    {formatRupiah(dist.jasa_usaha_amount)}
                                </td>
                                <td className="px-4 py-3.5">
                                    <span className="text-[13px] font-bold text-slate-900 font-mono">
                                        {formatRupiah(dist.shu_amount)}
                                    </span>
                                </td>
                                <td className="px-4 py-3.5">
                                    {dist.is_disbursed ? (
                                        <div className="flex flex-col gap-0.5">
                                            <div className="inline-flex items-center gap-1.5 text-[12px] font-medium text-slate-600">
                                                <CheckCircle className="w-3.5 h-3.5 text-slate-400" />
                                                <span>Cair</span>
                                            </div>
                                            {dist.disbursement_method && (
                                                <span className="text-[11px] text-slate-400">
                                                    {METHOD_LABELS[dist.disbursement_method] ?? dist.disbursement_method}
                                                </span>
                                            )}
                                        </div>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-700 bg-amber-50/80 border border-amber-200/50 px-2.5 py-1 rounded-full whitespace-nowrap">
                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                            <span>Belum Cair</span>
                                        </span>
                                    )}
                                </td>
                                <td className="px-4 py-3.5">
                                    {dist.is_disbursed ? (
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => onSlipClick(dist)}
                                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[12px] font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                                                title="Lihat Slip Bukti Pencairan"
                                            >
                                                <ReceiptText className="w-3.5 h-3.5 text-slate-400" />
                                                <span>Slip</span>
                                            </button>
                                            <button
                                                onClick={() => onReverseClick(dist)}
                                                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                                title="Batalkan Pencairan"
                                            >
                                                <RotateCcw className="w-3 h-3" />
                                                <span>Batal</span>
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => onSlipClick(dist)}
                                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[12px] font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                                                title="Lihat Slip"
                                            >
                                                <ReceiptText className="w-3.5 h-3.5 text-slate-400" />
                                                <span>Slip</span>
                                            </button>
                                            <button
                                                onClick={() => onDisburseClick(dist)}
                                                className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-[12px] font-semibold shadow-xs active:scale-[0.98] transition-all flex items-center gap-1.5"
                                            >
                                                <Banknote className="w-3.5 h-3.5" />
                                                <span>Cairkan</span>
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* ── Mobile: Ergonomic Apple Wallet-style List ── */}
            <div className="md:hidden divide-y divide-slate-100">
                {filtered.map((dist) => (
                    <div
                        key={dist.id}
                        className={`p-4 transition-colors ${dist.is_disbursed ? 'bg-slate-50/40 opacity-75' : 'bg-white'}`}
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200/60 flex items-center justify-center shrink-0">
                                    <span className="text-slate-600 font-bold text-sm">
                                        {dist.member?.name?.charAt(0) ?? '?'}
                                    </span>
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[14px] font-semibold text-slate-900 leading-tight truncate">
                                        {dist.member?.name}
                                    </p>
                                    <p className="text-[11px] text-slate-400 mt-0.5">
                                        {dist.member?.member_number} · {dist.member?.unit_kerja || '-'}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right shrink-0">
                                <span className="text-[15px] font-bold text-slate-900 font-mono">
                                    {formatRupiah(dist.shu_amount)}
                                </span>
                                <div className="mt-0.5">
                                    {dist.is_disbursed ? (
                                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500">
                                            <CheckCircle className="w-3 h-3 text-slate-400" />
                                            <span>Cair · {METHOD_LABELS[dist.disbursement_method] ?? ''}</span>
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600">
                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                            <span>Belum Cair</span>
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Mobile Touch Actions Bar */}
                        <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-slate-100/80">
                            <button
                                onClick={() => onSlipClick(dist)}
                                className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200/70 text-slate-600 flex items-center justify-center transition-colors active:scale-95"
                                title="Lihat Slip"
                            >
                                <ReceiptText className="w-4 h-4" />
                            </button>

                            {dist.is_disbursed ? (
                                <button
                                    onClick={() => onReverseClick(dist)}
                                    className="min-h-[38px] px-3 rounded-xl border border-slate-200 hover:border-rose-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 text-[12px] font-medium transition-colors flex items-center gap-1 active:scale-95"
                                >
                                    <RotateCcw className="w-3 h-3" />
                                    <span>Batal</span>
                                </button>
                            ) : (
                                <button
                                    onClick={() => onDisburseClick(dist)}
                                    className="min-h-[38px] px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-[12px] font-bold transition-all shadow-xs flex items-center gap-1.5 active:scale-95"
                                >
                                    <Banknote className="w-3.5 h-3.5" />
                                    <span>Cairkan</span>
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {filtered.length === 0 && (
                <div className="py-16 text-center">
                    <Users className="w-8 h-8 text-slate-200 mx-auto mb-3" />
                    <p className="text-[13px] text-slate-400 font-medium">Tidak ada data yang sesuai filter.</p>
                </div>
            )}
        </Card>
    );
}

