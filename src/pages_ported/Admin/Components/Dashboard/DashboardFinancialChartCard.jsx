import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import PillTabs from '@/Components/UI/PillTabs';
import ChartTooltip from '@/Components/UI/ChartTooltip';

export default function DashboardFinancialChartCard({
    trend_data = [],
    className = '',
}) {
    // Default to '6m' (Semesteran) - honest match to the primary executive horizon
    const [range, setRange] = useState('6m');

    // Natural decision horizons for Indonesian Cooperatives (UU Perkoperasian)
    const rangeTabs = [
        { id: '30d', label: '30 Hari' },
        { id: '3m', label: '3 Bulan' },
        { id: '6m', label: '6 Bulan' },
        { id: '1y', label: '1 Tahun' },
    ];

    // Format Y Axis (Millions / Billions) with Apple HIG clarity
    const formatYAxis = (val) => {
        if (!val || val === 0) return '0';
        const abs = Math.abs(val);
        const sign = val < 0 ? '-' : '';
        if (abs >= 1_000_000_000) {
            const num = abs / 1_000_000_000;
            return `${sign}${num % 1 === 0 ? num.toFixed(0) : num.toFixed(1)} M`;
        }
        if (abs >= 1_000_000) {
            const num = abs / 1_000_000;
            return `${sign}${num % 1 === 0 ? num.toFixed(0) : num.toFixed(1)} jt`;
        }
        if (abs >= 1_000) {
            return `${sign}${(abs / 1_000).toFixed(0)} rb`;
        }
        return `${sign}${abs}`;
    };

    // Synthesize / map data according to range using in-memory fluid slicing
    const displayData = React.useMemo(() => {
        const fallbackData = [
            { name: 'Okt', full_month: 'Oktober 2025', kas: 140000000, piutang: 380000000, simpanan: 205000000 },
            { name: 'Nov', full_month: 'November 2025', kas: 145000000, piutang: 395000000, simpanan: 210000000 },
            { name: 'Des', full_month: 'Desember 2025', kas: 158000000, piutang: 410000000, simpanan: 215000000 },
            { name: 'Jan', full_month: 'Januari 2026', kas: 162000000, piutang: 415000000, simpanan: 218000000 },
            { name: 'Feb', full_month: 'Februari 2026', kas: 159000000, piutang: 420000000, simpanan: 220000000 },
            { name: 'Mar', full_month: 'Maret 2026', kas: 164000000, piutang: 425000000, simpanan: 222000000 },
            { name: 'Apr', full_month: 'April 2026', kas: 166011000, piutang: 427000000, simpanan: 220620000 },
            { name: 'Mei', full_month: 'Mei 2026', kas: 165958000, piutang: 511000000, simpanan: 227520000 },
            { name: 'Jun', full_month: 'Juni 2026', kas: 211171000, piutang: 523000000, simpanan: 235290000 },
            { name: 'Jul', full_month: 'Juli 2026', kas: 100134000, piutang: 543000000, simpanan: 242390000 },
            { name: 'Agt', full_month: 'Agustus 2026', kas: 93612000, piutang: 573000000, simpanan: 248490000 },
            { name: 'Sep', full_month: 'September 2026', kas: 67472000, piutang: 573250000, simpanan: 237890000 },
        ];

        const raw = (!trend_data || trend_data.length === 0) ? fallbackData : trend_data;

        // Fluid in-memory slicing matching the selected horizon
        let targetSlice = raw;
        if (range === '30d') {
            // 30 days: comparison between last closed period and current active month
            targetSlice = raw.slice(-2);
        } else if (range === '3m') {
            // Triwulan (3 months quarterly review)
            targetSlice = raw.slice(-3);
        } else if (range === '6m') {
            // Semesteran (6 months middle-year reporting - default)
            targetSlice = raw.slice(-6);
        } else if (range === '1y') {
            // Tahunan (12 months full trajectory)
            targetSlice = raw.slice(-12);
        }

        // Map trend_data into chart shape using true balance sheet positions
        return targetSlice.map((item, idx) => ({
            name: item.name || `Bln ${idx + 1}`,
            full_month: item.full_month || `Bulan ${item.name || idx + 1}`,
            kas: Math.max(0, Number(item.kas ?? item.inflow ?? 0)),
            piutang: Math.max(0, Number(item.pembiayaan ?? 0)),
            simpanan: Math.max(0, Number(item.simpanan ?? 0)),
        }));
    }, [trend_data, range]);

    return (
        <div className={`bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 flex flex-col justify-between ${className}`}>
            {/* Header: Title + Range Pills */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
                <h3 className="text-[15px] font-bold text-slate-900 tracking-tight">
                    Pergerakan Portofolio Keuangan Koperasi
                </h3>

                <div className="shrink-0">
                    <PillTabs
                        tabs={rangeTabs}
                        activeTab={range}
                        onChange={setRange}
                        variant="segmented"
                        size="sm"
                    />
                </div>
            </div>

            {/* Legend: Apple HIG Categorical Tri-Pillars */}
            <div className="flex items-center gap-5 flex-wrap text-[11px] font-medium text-slate-600 mt-4 mb-2">
                <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                    Piutang Pinjaman
                </span>
                <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#1F6376]"></span>
                    Simpanan Anggota
                </span>
                <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    Kas &amp; Bank
                </span>
            </div>

            {/* Chart */}
            <div className="w-full h-[220px] mt-2">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={displayData}
                        margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                    >
                        <defs>
                            {/* Apple System Blue for Loan Receivables */}
                            <linearGradient id="colorPiutang" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.08} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                            {/* Manasuka Deep Teal for Member Savings */}
                            <linearGradient id="colorSimpanan" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#1F6376" stopOpacity={0.08} />
                                <stop offset="95%" stopColor="#1F6376" stopOpacity={0} />
                            </linearGradient>
                            {/* Apple Mint / Emerald for Cash */}
                            <linearGradient id="colorKas" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.08} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 10, fill: '#94a3b8' }} 
                            dy={8} 
                        />
                        <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 10, fill: '#94a3b8', fontFamily: 'SF Mono, JetBrains Mono, monospace' }}
                            tickFormatter={formatYAxis}
                            tickCount={5}
                            domain={[0, 'auto']}
                            width={56}
                        />
                        <Tooltip 
                            content={
                                <ChartTooltip 
                                    order={['piutang', 'simpanan', 'kas']} 
                                    subLabel="Posisi Neraca"
                                    titleFormatter={(label, payload) => payload[0]?.payload?.full_month || `Bulan ${label}`}
                                />
                            } 
                        />
                        <Area 
                            type="monotone" 
                            dataKey="piutang" 
                            name="Piutang Pinjaman"
                            stroke="#3b82f6" 
                            strokeWidth={2}
                            fillOpacity={1} 
                            fill="url(#colorPiutang)" 
                        />
                        <Area 
                            type="monotone" 
                            dataKey="simpanan" 
                            name="Simpanan Anggota"
                            stroke="#1F6376" 
                            strokeWidth={2}
                            fillOpacity={1} 
                            fill="url(#colorSimpanan)" 
                        />
                        <Area 
                            type="monotone" 
                            dataKey="kas" 
                            name="Kas & Bank"
                            stroke="#10b981" 
                            strokeWidth={2}
                            fillOpacity={1} 
                            fill="url(#colorKas)" 
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

