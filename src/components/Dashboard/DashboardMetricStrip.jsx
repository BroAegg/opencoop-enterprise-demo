import React from 'react';
import { Wallet, HandCoins, PiggyBank, ShoppingBag, TrendingUp } from 'lucide-react';

export default function DashboardMetricStrip({
    total_simpanan = 0,
    total_loans_outstanding = 0,
    retail_revenue = 0,
    total_members = 0,
    active_loan_count = 0,
    kas_bank = 0,
    className = '',
}) {
    // Always round to integer before formatting to avoid decimal display (e.g. 199.851.236,67)
    const formatRp = (num) => {
        const rounded = Math.round(Number(num || 0));
        return `Rp ${rounded.toLocaleString('id-ID')}`;
    };

    const metrics = [
        {
            id: 'cash',
            label: 'Kas & Bank',
            icon: Wallet,
            value: formatRp(kas_bank),
            change: 'Saldo aktual kas & rekening',
            note: 'Diperbarui dari buku besar',
        },
        {
            id: 'loans',
            label: 'Piutang Pinjaman',
            icon: HandCoins,
            value: formatRp(total_loans_outstanding),
            change: 'Outstanding pokok aktif',
            note: `${active_loan_count || 23} pinjaman aktif`,
        },
        {
            id: 'savings',
            label: 'Simpanan Anggota',
            icon: PiggyBank,
            value: formatRp(total_simpanan),
            change: 'Kewajiban simpanan berjalan',
            note: `${total_members} anggota aktif`,
        },
        {
            id: 'retail',
            label: 'Penjualan Minimarket',
            icon: ShoppingBag,
            value: formatRp(retail_revenue),
            change: 'Omzet bulan ini',
            note: 'Data bulan berjalan',
        },
    ];

    return (
        <div className={`bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden ${className}`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
                {metrics.map((m) => {
                    const Icon = m.icon;
                    return (
                        <div key={m.id} className="p-4 sm:p-4.5 flex flex-col justify-between hover:bg-slate-50/40 transition-colors">
                            <div className="flex items-center gap-2 mb-3">
                                <Icon className="w-4 h-4 text-slate-400 shrink-0" strokeWidth={1.75} />
                                <span className="text-[12px] font-medium text-slate-500 tracking-tight">
                                    {m.label}
                                </span>
                            </div>
                            
                            <div>
                                <div className="text-[21px] sm:text-[23px] font-serif font-semibold tracking-tight text-slate-900 mb-1 leading-tight">
                                    {m.value}
                                </div>
                                <div className="text-[11px] font-medium text-slate-500 leading-tight">
                                    {m.change}
                                </div>
                                <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                                    {m.note}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
