import React from 'react';
import { ArrowLeftRight, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import TactileCard from '@/Components/UI/TactileCard';
import TactileSwitch from '@/Components/UI/TactileSwitch';
import FormSelect from '@/Components/UI/FormSelect';

export default function LoanTakeoverCard({
    memberActiveLoans = [],
    isTakeover,
    setIsTakeover,
    takeoverLoanId,
    setTakeoverLoanId,
    baseAmount = 0,
    error,
}) {
    if (memberActiveLoans.length === 0) return null;

    const takeoverOptions = memberActiveLoans.map((l) => ({
        value: String(l.id),
        label: `${l.loan_number || 'Pinjaman'} — Sisa: Rp ${Number(l.remaining_amount || 0).toLocaleString('id-ID')}`,
    }));

    const selectedLoan = memberActiveLoans.find((l) => String(l.id) === String(takeoverLoanId)) || null;
    const remainingToPay = selectedLoan ? Number(selectedLoan.remaining_amount || 0) : 0;
    const netBeforeAdmin = Number(baseAmount || 0) - remainingToPay;

    return (
        <TactileCard variant="white" rounded="3xl" className="p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                    <h3 className="font-bold text-slate-900 text-sm tracking-tight flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                        3. Top-Up &amp; Pelunasan Pembiayaan Lama
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                        Fasilitas penyelesaian pinjaman berjalan dengan pencairan dana bersih.
                    </p>
                </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <TactileSwitch
                    id="isTakeover"
                    label="Aktifkan Top-Up / Take Over Otomatis"
                    description="Potong sisa hutang pinjaman lama dari plafon baru saat pencairan disetujui."
                    color="teal"
                    size="md"
                    checked={isTakeover}
                    onChange={(checked) => {
                        setIsTakeover(checked);
                        if (!checked) {
                            setTakeoverLoanId('');
                        } else if (memberActiveLoans.length === 1) {
                            setTakeoverLoanId(String(memberActiveLoans[0].id));
                        }
                    }}
                />
            </div>

            {isTakeover && (
                <div className="space-y-4 pt-1 animate-in fade-in slide-in-from-top-2 duration-200">
                    <FormSelect
                        label="Pilih Pembiayaan yang Akan Dilunasi"
                        id="takeover_loan_id"
                        value={takeoverLoanId}
                        onChange={(e) => setTakeoverLoanId(e.target.value)}
                        error={error}
                        options={takeoverOptions}
                        placeholder="Pilih pembiayaan aktif..."
                    />

                    {selectedLoan && (
                        <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3">
                            <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
                                <span>No. Akad: {selectedLoan.loan_number || '-'}</span>
                                <span className="text-amber-400 font-semibold flex items-center gap-1">
                                    <ShieldCheck className="w-3.5 h-3.5" />
                                    Auto-Settlement
                                </span>
                            </div>

                            <div className="space-y-1.5 text-xs">
                                <div className="flex justify-between text-slate-300">
                                    <span>Plafon Pinjaman Baru:</span>
                                    <span className="font-mono font-medium text-white">
                                        Rp {Number(baseAmount || 0).toLocaleString('id-ID')}
                                    </span>
                                </div>
                                <div className="flex justify-between text-slate-300">
                                    <span>Pelunasan Sisa Hutang:</span>
                                    <span className="font-mono font-bold text-rose-400">
                                        - Rp {remainingToPay.toLocaleString('id-ID')}
                                    </span>
                                </div>
                                <div className="flex justify-between text-slate-300 pt-2 border-t border-slate-800 font-semibold">
                                    <span>Sisa Plafon Sebelum Potongan Admin:</span>
                                    <span
                                        className={`font-mono ${
                                            netBeforeAdmin <= 0 ? 'text-rose-400' : 'text-emerald-400'
                                        }`}
                                    >
                                        Rp {netBeforeAdmin.toLocaleString('id-ID')}
                                    </span>
                                </div>
                            </div>

                            {netBeforeAdmin <= 0 && (
                                <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-200 flex items-center gap-2 text-xs">
                                    <AlertTriangle className="w-4 h-4 text-rose-300 shrink-0" />
                                    <span>Plafon baru harus lebih besar dari sisa kewajiban lama!</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </TactileCard>
    );
}

