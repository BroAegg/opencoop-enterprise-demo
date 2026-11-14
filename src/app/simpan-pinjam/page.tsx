'use client';

import React, { useState } from 'react';
import { 
  PiggyBank, 
  Calculator, 
  Users, 
  CreditCard, 
  DollarSign, 
  FileSpreadsheet, 
  Calendar,
  CheckCircle2
} from 'lucide-react';
import { INITIAL_MEMBERS } from '@/lib/dummyData';
import { Member, LoanSimulation } from '@/lib/types';

export default function SimpanPinjamPage() {
  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);
  const [selectedMember, setSelectedMember] = useState<Member>(INITIAL_MEMBERS[0]);

  // Loan Simulation Form
  const [loanAmount, setLoanAmount] = useState<number>(10000000);
  const [marginAnnual, setMarginAnnual] = useState<number>(12); // 12% per annum
  const [tenorMonths, setTenorMonths] = useState<number>(12);

  // Amortization calculation
  const monthlyPrincipal = Math.round(loanAmount / tenorMonths);
  const monthlyMargin = Math.round((loanAmount * (marginAnnual / 100)) / 12);
  const totalMonthly = monthlyPrincipal + monthlyMargin;
  const totalPayback = totalMonthly * tenorMonths;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <PiggyBank className="w-6 h-6 text-emerald-600" />
          <span>Simpan Pinjam & Pemotongan Gaji Otomatis (Payroll)</span>
        </h1>
        <p className="text-xs text-slate-500">
          Pengelolaan buku simpanan anggota dan modul amortisasi pembiayaan dengan skema potong gaji otomatis.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Member Savings Directory (7 cols) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Buku Simpanan Anggota ({members.length})</h3>
              <p className="text-[11px] text-slate-500">Rekapitulasi Simpanan Pokok, Wajib, dan Sukarela</p>
            </div>
            <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded font-semibold">
              Aktif & Terdaftar
            </span>
          </div>

          <div className="overflow-x-auto max-h-[480px]">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] font-bold">
                <tr>
                  <th className="p-2.5">No. Anggota</th>
                  <th className="p-2.5">Nama & Unit Kerja</th>
                  <th className="p-2.5 text-right">Simp. Pokok</th>
                  <th className="p-2.5 text-right">Simp. Wajib</th>
                  <th className="p-2.5 text-right">Simp. Sukarela</th>
                  <th className="p-2.5 text-right">Total Simpanan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {members.map((m) => (
                  <tr 
                    key={m.id}
                    onClick={() => setSelectedMember(m)}
                    className={`cursor-pointer transition-colors ${
                      selectedMember.id === m.id ? 'bg-emerald-50/70 font-semibold' : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="p-2.5 font-mono text-emerald-800">{m.memberNumber}</td>
                    <td className="p-2.5">
                      <div className="text-slate-900">{m.name}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{m.department}</div>
                    </td>
                    <td className="p-2.5 text-right font-mono text-slate-600">
                      Rp {m.simpananPokok.toLocaleString('id-ID')}
                    </td>
                    <td className="p-2.5 text-right font-mono text-slate-600">
                      Rp {m.simpananWajib.toLocaleString('id-ID')}
                    </td>
                    <td className="p-2.5 text-right font-mono text-slate-600">
                      Rp {m.simpananSukarela.toLocaleString('id-ID')}
                    </td>
                    <td className="p-2.5 text-right font-mono font-bold text-slate-900">
                      Rp {m.totalSimpanan.toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Loan Amortizer & Payroll Deduction Simulator (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Member Card */}
          <div className="bg-slate-900 text-white p-5 rounded-xl border border-slate-800 shadow-md space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono">{selectedMember.memberNumber}</span>
              <span>Bergabung: {selectedMember.joinDate}</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-white">{selectedMember.name}</h3>
              <p className="text-xs text-teal-400 font-medium">{selectedMember.department}</p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 text-[10px]">Total Simpanan:</span>
                <div className="font-bold font-mono text-white">
                  Rp {selectedMember.totalSimpanan.toLocaleString('id-ID')}
                </div>
              </div>
              <div>
                <span className="text-slate-400 text-[10px]">Sisa Pinjaman Berjalan:</span>
                <div className="font-bold font-mono text-amber-400">
                  Rp {selectedMember.activeLoanBalance.toLocaleString('id-ID')}
                </div>
              </div>
            </div>
          </div>

          {/* Simulator Form */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="border-b border-slate-200 pb-2 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <Calculator className="w-4 h-4 text-emerald-600" />
                <span>Simulator Pembiayaan & Potong Gaji</span>
              </h3>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-semibold">
                Anuitas / Flat
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700">Plafon Pinjaman Diajukan</label>
                <div className="grid grid-cols-3 gap-1.5 mt-1">
                  {[5000000, 10000000, 20000000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setLoanAmount(amt)}
                      className={`py-1 rounded font-mono font-semibold border ${
                        loanAmount === amt ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-700'
                      }`}
                    >
                      {amt / 1000000} Juta
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(Number(e.target.value))}
                  className="w-full mt-1.5 p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono text-right font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700">Margin Koperasi (% p.a)</label>
                  <input
                    type="number"
                    value={marginAnnual}
                    onChange={(e) => setMarginAnnual(Number(e.target.value))}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono text-right"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Tenor (Bulan)</label>
                  <select
                    value={tenorMonths}
                    onChange={(e) => setTenorMonths(Number(e.target.value))}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-semibold"
                  >
                    <option value={6}>6 Bulan</option>
                    <option value={12}>12 Bulan (1 Tahun)</option>
                    <option value={24}>24 Bulan (2 Tahun)</option>
                    <option value={36}>36 Bulan (3 Tahun)</option>
                  </select>
                </div>
              </div>

              {/* Monthly Breakdown Results */}
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1.5 mt-2">
                <div className="flex justify-between text-slate-600">
                  <span>Pokok Cicilan per Bulan:</span>
                  <span className="font-mono">Rp {monthlyPrincipal.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Jasa/Margin Koperasi per Bulan:</span>
                  <span className="font-mono">Rp {monthlyMargin.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-emerald-900 pt-1.5 border-t border-emerald-200">
                  <span>Total Potong Gaji per Bulan:</span>
                  <span className="font-mono">Rp {totalMonthly.toLocaleString('id-ID')}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => alert(`✅ Simulasi pembiayaan sebesar Rp ${loanAmount.toLocaleString('id-ID')} untuk ${selectedMember.name} telah dicatat dalam draf pengajuan!`)}
                className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold tracking-wide transition-colors shadow-xs"
              >
                Setujui & Tambahkan ke Jadwal Potong Gaji
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
