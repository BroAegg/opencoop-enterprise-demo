import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';

/**
 * PosVendorWeekStrip
 * 
 * Apple HIG-style horizontal Monday-Friday calendar strip for retail consignment.
 * Cashiers can intuitively review and select daily batches (Senin - Jumat)
 * matching the natural operational day-of-week cadence.
 */
export default function PosVendorWeekStrip({
    activeBatch = null,
    vendorBatches = [],
    onSelectBatch,
    onToggleConsolidated = null,
    isConsolidated = false,
    unpaidCount = 0,
    className = '',
}) {
    // Determine the reference date from activeBatch if available, or today
    const initialDateStr = activeBatch?.received_date || new Date().toISOString().slice(0, 10);

    // Track week offset (0 = reference week, -1 = previous week, +1 = next week)
    const [weekOffset, setWeekOffset] = useState(0);

    // Compute Monday through Friday for the displayed week
    const weekDays = useMemo(() => {
        const base = new Date(initialDateStr + 'T00:00:00');
        base.setDate(base.getDate() + (weekOffset * 7));

        const day = base.getDay(); // 0 is Sun, 1 is Mon...
        const diffToMonday = base.getDate() - (day === 0 ? 6 : day - 1);
        const monday = new Date(base);
        monday.setDate(diffToMonday);

        const todayStr = new Date().toISOString().slice(0, 10);
        const codes = ['SEN', 'SEL', 'RAB', 'KAM', 'JUM', 'SAB'];
        const fullNames = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

        // Adaptively include Saturday if there is a receiving batch on Saturday for this week
        const satDate = new Date(monday);
        satDate.setDate(monday.getDate() + 5);
        const yyyySat = satDate.getFullYear();
        const mmSat = String(satDate.getMonth() + 1).padStart(2, '0');
        const ddSat = String(satDate.getDate()).padStart(2, '0');
        const satDateStr = `${yyyySat}-${mmSat}-${ddSat}`;
        const hasSaturdayBatch = vendorBatches.some((b) => b.received_date === satDateStr);

        const daysLimit = hasSaturdayBatch ? 6 : 5;

        const days = [];
        for (let i = 0; i < daysLimit; i++) {
            const d = new Date(monday);
            d.setDate(monday.getDate() + i);

            const yyyy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            const dd = String(d.getDate()).padStart(2, '0');
            const dateStr = `${yyyy}-${mm}-${dd}`;

            const dayBatches = vendorBatches.filter((b) => b.received_date === dateStr);
            const batch = dayBatches.find(b => b.settlement_status === 'UNPAID') || dayBatches[0] || null;

            days.push({
                index: i,
                code: codes[i],
                fullName: fullNames[i],
                dateNumber: d.getDate(),
                dateStr,
                isToday: dateStr === todayStr,
                batch: batch || null,
                dayBatches,
            });
        }
        return days;
    }, [initialDateStr, weekOffset, vendorBatches]);

    // Format week header label: e.g. "5 – 9 Okt 2026" or "5 – 10 Okt 2026"
    const weekLabel = useMemo(() => {
        if (weekDays.length === 0) return '';
        const first = new Date(weekDays[0].dateStr + 'T00:00:00');
        const last = new Date(weekDays[weekDays.length - 1].dateStr + 'T00:00:00');

        const firstDate = first.getDate();
        const lastDate = last.getDate();
        const monthYear = last.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });

        return `${firstDate} – ${lastDate} ${monthYear}`;
    }, [weekDays]);

    return (
        <div className={`space-y-1.5 ${className}`}>
            {/* Week navigation header */}
            <div className="flex items-center justify-between text-xs px-0.5">
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-700 text-xs">
                        {weekOffset === 0 ? `Minggu Ini (${weekLabel})` : weekLabel}
                    </span>
                    {onToggleConsolidated && unpaidCount > 1 && (
                        <button
                            type="button"
                            onClick={onToggleConsolidated}
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border transition-all cursor-pointer ${
                                isConsolidated
                                    ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                                    : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                            }`}
                            title="Gabungkan seluruh hari yang belum cair dalam satu kali pembayaran"
                        >
                            {isConsolidated ? '✓ Mode Gabungan' : `Gabungkan Semua (${unpaidCount} Hari)`}
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-0.5">
                    <button
                        type="button"
                        onClick={() => setWeekOffset((prev) => prev - 1)}
                        className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                        title="Minggu Sebelumnya"
                    >
                        <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    {weekOffset !== 0 && (
                        <button
                            type="button"
                            onClick={() => setWeekOffset(0)}
                            className="text-[10px] font-bold text-slate-600 hover:text-slate-900 px-1.5 py-0.5 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                            Hari Ini
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() => setWeekOffset((prev) => prev + 1)}
                        className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                        title="Minggu Berikutnya"
                    >
                        <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {/* Day Strip (5 days for Mon-Fri, or 6 days if Saturday batch exists) */}
            <div className={`grid ${weekDays.length === 6 ? 'grid-cols-6' : 'grid-cols-5'} gap-1.5`}>
                {weekDays.map((day) => {
                    const hasBatch = Boolean(day.batch);
                    const isSelected = !isConsolidated && Boolean(activeBatch && day.dateStr === activeBatch.received_date);
                    const isUnpaid = hasBatch && day.dayBatches?.some((b) => b.settlement_status === 'UNPAID');
                    const isSettled = hasBatch && !isUnpaid && day.dayBatches?.every((b) => b.settlement_status === 'SETTLED');

                    let statusTitle = 'Tidak ada titipan';
                    if (isUnpaid) statusTitle = 'Titipan belum dicairkan';
                    else if (isSettled) statusTitle = 'Sudah lunas dicairkan';

                    return (
                        <button
                            key={day.dateStr}
                            type="button"
                            disabled={!hasBatch}
                            onClick={() => hasBatch && onSelectBatch?.(day.batch.receiving_id, day.dateStr)}
                            title={`${day.fullName}, ${day.dateNumber} (${statusTitle})`}
                            className={`py-1.5 px-1 rounded-xl flex flex-col items-center justify-center transition-all select-none min-h-[44px] ${
                                isSelected
                                    ? 'bg-slate-900 text-white shadow-sm ring-1 ring-slate-900 cursor-pointer'
                                    : hasBatch
                                    ? isUnpaid
                                        ? 'bg-amber-50/70 border border-amber-300 text-amber-950 hover:bg-amber-100/70 hover:border-amber-400 cursor-pointer shadow-2xs'
                                        : 'bg-white border border-slate-200/90 text-slate-700 hover:bg-slate-50 hover:border-slate-300 cursor-pointer shadow-2xs'
                                    : 'bg-slate-50/40 border border-slate-100 text-slate-300 opacity-50 cursor-default'
                            }`}
                        >
                            {/* Day Name */}
                            <span
                                className={`text-[9px] font-bold uppercase tracking-wider leading-none block ${
                                    isSelected
                                        ? 'text-slate-300'
                                        : hasBatch
                                        ? isUnpaid
                                            ? 'text-amber-800'
                                            : 'text-slate-500'
                                        : 'text-slate-300'
                                }`}
                            >
                                {day.code}
                            </span>

                            {/* Date Number */}
                            <span
                                className={`text-xs sm:text-[13px] font-bold font-mono my-0.5 leading-tight block ${
                                    isSelected
                                        ? 'text-white'
                                        : hasBatch
                                        ? isUnpaid
                                            ? 'text-amber-950'
                                            : 'text-slate-900'
                                        : 'text-slate-300'
                                }`}
                            >
                                {day.dateNumber}
                            </span>

                            {/* Semantic Status Glyph */}
                            <div className="h-2 flex items-center justify-center">
                                {isUnpaid ? (
                                    <span
                                        className={`w-1.5 h-1.5 rounded-full ${
                                            isSelected ? 'bg-amber-300 ring-2 ring-slate-900' : 'bg-amber-500'
                                        }`}
                                    />
                                ) : isSettled ? (
                                    <Check
                                        className={`w-2.5 h-2.5 ${
                                            isSelected ? 'text-emerald-300' : 'text-emerald-600'
                                        }`}
                                    />
                                ) : (
                                    <span className="w-1.5 h-[1.5px] rounded-full bg-slate-200" />
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

