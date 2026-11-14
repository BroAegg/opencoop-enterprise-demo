'use client';

import React, { useState } from 'react';
import { 
  PieChart, 
  Calculator, 
  Printer, 
  TrendingUp, 
  CheckCircle2, 
  FileText, 
  Clock, 
  Sliders,
  DollarSign
} from 'lucide-react';
import { INITIAL_MEMBERS, COOP_INFO } from '@/lib/dummyData';
import { Member, ShuCalculationResult } from '@/lib/types';

export default function ShuPage() {
  const [totalShuNet, setTotalShuNet] = useState<number>(120000000); // Rp 120 Juta
  const [cadanganPercent, setCadanganPercent] = useState<number>(30); // 30%
  const [jasaModalPercent, setJasaModalPercent] = useState<number>(30); // 30%
  const [jasaUsahaPercent, setJasaUsahaPercent] = useState<number>(25); // 25%
  const [danaSosialPercent, setDanaSosialPercent] = useState<number>(15); // 15%

  const [selectedSlipMember, setSelectedSlipMember] = useState<ShuCalculationResult | null>(null);

  // Allocations
  const alokasiCadangan = (totalShuNet * cadanganPercent) / 100;
  const alokasiJasaModal = (totalShuNet * jasaModalPercent) / 100;
  const alokasiJasaUsaha = (totalShuNet * jasaUsahaPercent) / 100;
  const alokasiDanaSosial = (totalShuNet * danaSosialPercent) / 100;

  // Aggregates
  const totalAllSimpanan = INITIAL_MEMBERS.reduce((acc, m) => acc + m.totalSimpanan, 0);
  const totalAllPurchases = INITIAL_MEMBERS.reduce((acc, m) => acc + m.annualRetailPurchases, 0);

  // Calculate per member
  const calculatedMembers: ShuCalculationResult[] = INITIAL_MEMBERS.map((m) => {
    const simpananWeight = m.totalSimpanan / totalAllSimpanan;
    const transaksiWeight = m.annualRetailPurchases / totalAllPurchases;

    const jasaModalAmount = Math.round(simpananWeight * alokasiJasaModal);
    const jasaUsahaAmount = Math.round(transaksiWeight * alokasiJasaUsaha);
    const totalShuReceived = jasaModalAmount + jasaUsahaAmount;

    return {
      memberId: m.id,
      memberName: m.name,
      memberNumber: m.memberNumber,
      simpananWeight,
      transaksiWeight,
      jasaModalAmount,
      jasaUsahaAmount,
      totalShuReceived,
    };
  }).sort((a, b) => b.totalShuReceived - a.totalShuReceived);

  return (
    <div className="space-y-6">
      {/* Header with Benchmark Metric */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <PieChart className="w-6 h-6 text-purple-600" />
            <span>Kalkulator & Generator Slip Dividen SHU RAT</span>
          </h1>
          <p className="text-xs text-slate-500">
            Sistem kalkulasi pembagian Sisa Hasil Usaha berbasis UU Perkoperasian No. 25/1992 (Jasa Modal & Jasa Usaha).
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-50 text-purple-900 border border-purple-200 text-xs font-semibold">
          <Clock className="w-4 h-4 text-purple-600" />
          <span>Kecepatan Kalkulasi: &lt;15 Detik (Sebelumnya 3 Hari Excel)</span>
        </div>
      </div>

      {/* Top Config Card: Global SHU & Percentage Sliders */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-purple-600" />
            <span>Parameter Alokasi SHU Tahun Buku 2025/2026</span>
          </h3>
          <span className="text-xs font-mono font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded">
            Total 100% Terdistribusi
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* Total SHU Bersih */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <label className="font-semibold text-slate-700">SHU Bersih Koperasi</label>
            <input
              type="number"
              value={totalShuNet}
              onChange={(e) => setTotalShuNet(Number(e.target.value))}
              className="w-full mt-1 p-2 bg-white border border-slate-200 rounded font-mono font-bold text-slate-900 text-right"
            />
            <div className="text-[10px] text-slate-400">Total laba bersih siap dibagi</div>
          </div>

          {/* Dana Cadangan */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <div className="flex justify-between font-semibold text-slate-700">
              <span>Dana Cadangan</span>
              <span className="font-mono text-purple-700">{cadanganPercent}%</span>
            </div>
            <div className="text-sm font-bold font-mono text-slate-900 pt-1">
              Rp {alokasiCadangan.toLocaleString('id-ID')}
            </div>
            <div className="text-[10px] text-slate-400">Penguatan modal koperasi</div>
          </div>

          {/* Jasa Modal / Simpanan */}
          <div className="p-3 bg-purple-50/70 rounded-xl border border-purple-200 space-y-1">
            <div className="flex justify-between font-semibold text-purple-900">
              <span>Jasa Modal (Simpanan)</span>
              <span className="font-mono text-purple-700">{jasaModalPercent}%</span>
            </div>
            <div className="text-sm font-bold font-mono text-purple-900 pt-1">
              Rp {alokasiJasaModal.toLocaleString('id-ID')}
            </div>
            <div className="text-[10px] text-purple-600">Dibagi proporsional simpanan</div>
          </div>

          {/* Jasa Usaha / Transaksi */}
          <div className="p-3 bg-teal-50/70 rounded-xl border border-teal-200 space-y-1">
            <div className="flex justify-between font-semibold text-teal-900">
              <span>Jasa Usaha (Belanja)</span>
              <span className="font-mono text-teal-700">{jasaUsahaPercent}%</span>
            </div>
            <div className="text-sm font-bold font-mono text-teal-900 pt-1">
              Rp {alokasiJasaUsaha.toLocaleString('id-ID')}
            </div>
            <div className="text-[10px] text-teal-600">Dibagi proporsional omset belanja</div>
          </div>
        </div>
      </div>

      {/* Member SHU Distribution Results Table */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <h3 className="font-bold text-sm text-slate-900">
              Distribusi SHU per Anggota ({calculatedMembers.length} Orang)
            </h3>
            <p className="text-xs text-slate-500">
              Otomatis dihitung dari proporsi simpanan & transaksi toko ritel tanpa rekonsiliasi manual
            </p>
          </div>
          <button
            onClick={() => alert('✅ Laporan rekapitulasi SHU siap dicetak untuk Buku Laporan Pertanggungjawaban RAT!')}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Buku RAT</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] font-bold">
              <tr>
                <th className="p-3">Rank</th>
                <th className="p-3">No. & Nama Anggota</th>
                <th className="p-3 text-right">Bobot Simpanan</th>
                <th className="p-3 text-right">Jasa Modal</th>
                <th className="p-3 text-right">Bobot Belanja</th>
                <th className="p-3 text-right">Jasa Usaha</th>
                <th className="p-3 text-right">Total SHU Diterima</th>
                <th className="p-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {calculatedMembers.map((item, idx) => (
                <tr key={item.memberId} className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-slate-400">#{idx + 1}</td>
                  <td className="p-3">
                    <div className="font-bold text-slate-900">{item.memberName}</div>
                    <div className="font-mono text-[10px] text-slate-400">{item.memberNumber}</div>
                  </td>
                  <td className="p-3 text-right font-mono text-slate-600">
                    {(item.simpananWeight * 100).toFixed(2)}%
                  </td>
                  <td className="p-3 text-right font-mono text-purple-700 font-medium">
                    Rp {item.jasaModalAmount.toLocaleString('id-ID')}
                  </td>
                  <td className="p-3 text-right font-mono text-slate-600">
                    {(item.transaksiWeight * 100).toFixed(2)}%
                  </td>
                  <td className="p-3 text-right font-mono text-teal-700 font-medium">
                    Rp {item.jasaUsahaAmount.toLocaleString('id-ID')}
                  </td>
                  <td className="p-3 text-right font-mono font-extrabold text-slate-900 text-sm">
                    Rp {item.totalShuReceived.toLocaleString('id-ID')}
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => setSelectedSlipMember(item)}
                      className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] inline-flex items-center gap-1"
                    >
                      <FileText className="w-3 h-3" /> Slip
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slip SHU Modal */}
      {selectedSlipMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden p-6 space-y-4">
            <div className="text-center border-b pb-3 space-y-0.5">
              <div className="text-xs font-bold uppercase tracking-wider text-purple-900">{COOP_INFO.shortName}</div>
              <h3 className="font-bold text-base text-slate-900">SLIP PEMBAGIAN SISA HASIL USAHA (SHU)</h3>
              <div className="text-[11px] text-slate-500">Tahun Buku 2025/2026 &bull; Keputusan RAT No. 04/RAT/2026</div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Nomor Anggota:</span>
                <span className="font-mono font-bold">{selectedSlipMember.memberNumber}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Nama Lengkap:</span>
                <span className="font-bold">{selectedSlipMember.memberName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Porsi Jasa Modal (Simpanan):</span>
                <span className="font-mono font-semibold text-purple-800">
                  Rp {selectedSlipMember.jasaModalAmount.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Porsi Jasa Usaha (Transaksi):</span>
                <span className="font-mono font-semibold text-teal-800">
                  Rp {selectedSlipMember.jasaUsahaAmount.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex justify-between py-2 text-sm font-extrabold bg-slate-50 px-2 rounded">
                <span className="text-slate-900">TOTAL SHU DITERIMA:</span>
                <span className="font-mono text-purple-900">
                  Rp {selectedSlipMember.totalShuReceived.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            <div className="pt-2 text-[10px] text-slate-400 text-center">
              * Dana langsung ditransfer ke rekening simpanan sukarela anggota / rekening bank terdaftar.
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedSlipMember(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
              >
                Tutup
              </button>
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 text-xs bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg flex items-center gap-1.5 shadow-sm"
              >
                <Printer className="w-3.5 h-3.5" /> Cetak Slip PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
