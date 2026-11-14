import React from 'react';
import { Send, ArrowRight, CheckCircle, AlertTriangle, ShieldCheck, HelpCircle } from 'lucide-react';
import Button from '@/Components/UI/Button';

export default function LoanSimulationCard({
    data,
    selectedTakeoverLoan,
    isTakeover,
    processing,
    canSubmit = true,
}) {
    const baseAmount = Number(data.base_amount) || 0;
    const tenor = Math.max(1, Number(data.tenor) || 1);
    const interestRate = Number(data.interest_rate) || 0;

    const isBmt = data.source === 'BMT_ITQAN';
    const interestAmount = Math.round(baseAmount * (interestRate / 100));
    const totalAmount = baseAmount + interestAmount;
    const principalMonthly = tenor > 0 ? Math.round(baseAmount / tenor) : 0;
    const marginMonthly = tenor > 0 ? Math.round(interestAmount / tenor) : 0;
    const monthlyInstallment = principalMonthly + marginMonthly;

    const monthlyAdmin = !isBmt ? Number(data.admin_fee || 0) : 0;
    const simwaDeduction = isBmt ? 30000 : 0;
    const totalMonthlyPayroll = monthlyInstallment + (isBmt ? simwaDeduction : monthlyAdmin);

    const takeoverAmount = isTakeover && selectedTakeoverLoan ? Number(selectedTakeoverLoan.remaining_amount || 0) : 0;
    const netDisburse = baseAmount - takeoverAmount;
    const isNetDeficit = baseAmount > 0 && netDisburse <= 0;

    return (
        <div className="flex flex-col gap-4">
            {/* Primary Apple-Pass Simulator Card */}
            <div className="bg-slate-900 text-white rounded-3xl p-5 sm:p-6 border border-slate-800 shadow-xl relative overflow-hidden">
                {/* Background Specular Highlight */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 space-y-5">
                    {/* Hero: Monthly Installment */}
                    <div>
                        <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-teal-400 mb-1.5">
                            <span>Total Potongan Payroll / Bulan</span>
                            <span className="font-mono text-slate-400">{tenor} Bulan</span>
                        </div>
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight text-white tabular-nums">
                                Rp {totalMonthlyPayroll.toLocaleString('id-ID')}
                            </span>
                            <span className="text-xs text-slate-400 font-medium">/ bulan</span>
                        </div>
                    </div>

                    {/* Breakdown 1: Rincian Potongan Payroll */}
                    <div className="bg-slate-800/70 border border-slate-700/60 rounded-2xl p-3.5 space-y-2 text-xs">
                        <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider pb-1 border-b border-slate-700">
                            Komponen Potongan Gaji (Payroll)
                        </div>
                        <div className="flex justify-between text-slate-300">
                            <span>Angsuran Pokok / Bln</span>
                            <span className="font-mono text-white">
                                Rp {principalMonthly.toLocaleString('id-ID')}
                            </span>
                        </div>
                        {isBmt && (
                            <div className="flex justify-between text-slate-300">
                                <span>Margin BMT ({interestRate}%)</span>
                                <span className="font-mono text-teal-300">
                                    Rp {marginMonthly.toLocaleString('id-ID')}
                                </span>
                            </div>
                        )}
                        {monthlyAdmin > 0 && !isBmt && (
                            <div className="flex justify-between text-slate-300">
                                <span>Biaya Admin Koperasi</span>
                                <span className="font-mono text-amber-300">
                                    + Rp {monthlyAdmin.toLocaleString('id-ID')}
                                </span>
                            </div>
                        )}
                        {simwaDeduction > 0 && isBmt && (
                            <div className="flex justify-between text-slate-300">
                                <span>Simwa Kemitraan BMT</span>
                                <span className="font-mono text-teal-300">
                                    + Rp {simwaDeduction.toLocaleString('id-ID')}
                                </span>
                            </div>
                        )}
                        <div className="flex justify-between text-slate-300 pt-2 border-t border-slate-700 font-semibold">
                            <span>Total Tagihan Payroll / Bln:</span>
                            <span className="font-mono text-white">
                                Rp {totalMonthlyPayroll.toLocaleString('id-ID')}
                            </span>
                        </div>
                    </div>

                    {/* Breakdown 2: Estimasi Pencairan Dana (Cair Utuh) */}
                    <div className="bg-slate-800/70 border border-slate-700/60 rounded-2xl p-3.5 space-y-2 text-xs">
                        <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider pb-1 border-b border-slate-700">
                            Dana Cair ke Anggota (Hari Ini)
                        </div>
                        <div className="flex justify-between text-slate-300">
                            <span>Plafon Pinjaman</span>
                            <span className="font-mono text-white">
                                + Rp {baseAmount.toLocaleString('id-ID')}
                            </span>
                        </div>
                        {takeoverAmount > 0 && (
                            <div className="flex justify-between text-slate-300">
                                <span>Pelunasan Pinjaman Lama</span>
                                <span className="font-mono text-rose-300">
                                    - Rp {takeoverAmount.toLocaleString('id-ID')}
                                </span>
                            </div>
                        )}
                        <div className="flex justify-between items-center pt-2.5 border-t border-slate-700">
                            <span className="font-bold text-white text-xs">Dana Cair Bersih:</span>
                            <span
                                className={`text-base font-extrabold font-mono tracking-tight ${
                                    isNetDeficit ? 'text-rose-400' : 'text-emerald-400'
                                }`}
                            >
                                Rp {netDisburse.toLocaleString('id-ID')}
                            </span>
                        </div>
                        {!isBmt && (
                            <p className="text-[10px] text-slate-400 pt-1 leading-relaxed">
                                *Biaya admin Rp {monthlyAdmin.toLocaleString('id-ID')}/bln dipotong via payroll setiap bulan (tidak dipotong di muka).
                            </p>
                        )}
                    </div>

                    {/* Deficit Alert if any */}
                    {isNetDeficit && (
                        <div className="p-3 bg-rose-500/20 border border-rose-500/40 rounded-2xl text-xs text-rose-200 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-rose-300 shrink-0" />
                            <span>Plafon baru tidak mencukupi untuk menutup potongan kewajiban lama!</span>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="pt-2 flex flex-col gap-2.5">
                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            className="w-full justify-center shadow-lg font-bold"
                            disabled={processing || !canSubmit || isNetDeficit || baseAmount <= 0}
                        >
                            <Send className="w-4 h-4 mr-1.5" />
                            {processing ? 'Memproses Pengajuan...' : 'Ajukan Pembiayaan'}
                        </Button>

                        <Button
                            type="button"
                            variant="secondary"
                            size="md"
                            href="/admin/pembiayaan"
                            className="w-full justify-center text-slate-300 hover:text-white bg-slate-800 border-slate-700"
                        >
                            Batal
                        </Button>
                    </div>

                    <div className="pt-2 text-[11px] text-slate-400 leading-relaxed text-center flex items-center justify-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                        <span>Status awal pengajuan: <strong>PENDING</strong> (menunggu persetujuan pengurus).</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

