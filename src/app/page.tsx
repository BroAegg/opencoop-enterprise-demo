'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Building2, 
  ShoppingCart, 
  BookOpen, 
  PiggyBank, 
  PieChart, 
  TrendingUp, 
  Users, 
  Layers, 
  CheckCircle, 
  ArrowUpRight,
  Database,
  Cpu,
  Printer
} from 'lucide-react';
import { COOP_INFO, INITIAL_MEMBERS, CHART_OF_ACCOUNTS, INITIAL_PRODUCTS } from '@/lib/dummyData';

export default function DashboardPage() {
  const totalSimpananAll = INITIAL_MEMBERS.reduce((acc, m) => acc + m.totalSimpanan, 0);
  const totalRetailSales = INITIAL_PRODUCTS.reduce((acc, p) => acc + (p.sellPrice * 12), 0);

  return (
    <div className="space-y-8">
      {/* Top Welcome & KPI Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold border border-teal-500/30">
            <CheckCircle className="w-3.5 h-3.5 text-teal-400" />
            <span>Produksi Stabil &bull; 0 Downtime &bull; 100% Data Sanitized</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {COOP_INFO.shortName} Executive Dashboard
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed">
            Sistem ERP dan Point of Sale (POS) otonom untuk koperasi terpadu. Dilengkapi modul buku besar otomatis (*General Ledger*), kasir tablet *offline-first* dengan IndexedDB, simulasi pembiayaan potong gaji, serta kalkulasi bagi hasil SHU RAT otomatis.
          </p>
        </div>

        {/* Background Accent Graphics */}
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-10 translate-y-10">
          <Building2 className="w-80 h-80" />
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs hover:border-teal-500/50 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Aset Koperasi</span>
            <Building2 className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-xl font-bold text-slate-900">Rp 178.600.000</div>
          <div className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>Terverifikasi Buku Besar (ACID)</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs hover:border-teal-500/50 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Dana Simpanan</span>
            <PiggyBank className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-slate-900">
            Rp {totalSimpananAll.toLocaleString('id-ID')}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Pokok, Wajib & Sukarela (10 Anggota)
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs hover:border-teal-500/50 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Omset Retail Bulanan</span>
            <ShoppingCart className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl font-bold text-slate-900">Rp 125.400.000</div>
          <div className="text-xs text-emerald-600 font-medium mt-1">
            1.200+ Transaksi Kasir Sukses
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs hover:border-teal-500/50 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Sisa Hasil Usaha (SHU)</span>
            <PieChart className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-xl font-bold text-slate-900">Rp 33.500.000</div>
          <div className="text-xs text-slate-500 mt-1">
            Siap dialokasikan pada RAT 2026
          </div>
        </div>
      </div>

      {/* Flagship Modules & Architectural Highlights */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-teal-600" />
            <span>Pilar Modul Enterprise & Live Interactive Demos</span>
          </h2>
          <span className="text-xs text-slate-500">Klik kartu untuk menguji langsung fitur</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Module 1: Offline-First POS */}
          <Link 
            href="/pos"
            className="group bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-teal-500 transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 group-hover:text-teal-600 transition-colors flex items-center gap-1.5">
                  Point of Sale Kasir (Offline-First IndexedDB)
                  <ArrowUpRight className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Terminal kasir retail berbasis browser IndexedDB. Tetap bisa memproses transaksi dan memotong stok saat internet kampus mati, lalu melakukan background sync otomatis dengan struk thermal ESC/POS 58mm.
                </p>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1 text-teal-700 font-semibold">
                <Database className="w-3.5 h-3.5" /> Browser-Native IndexedDB
              </span>
              <span className="flex items-center gap-1 text-slate-600">
                <Printer className="w-3.5 h-3.5" /> Struk Thermal Bluetooth
              </span>
            </div>
          </Link>

          {/* Module 2: General Ledger */}
          <Link 
            href="/ledger"
            className="group bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-blue-500 transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 group-hover:text-blue-600 transition-colors flex items-center gap-1.5">
                  General Ledger & Akuntansi Otomatis (Double-Entry)
                  <ArrowUpRight className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Mesin pembukuan berstandar SAK-ETAP. Menjamin integritas transaksi dengan validasi Debit = Kredit, audit trail otomatis jurnal kasir, serta laporan instan Neraca dan Laba Rugi.
                </p>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1 text-blue-700 font-semibold">
                <CheckCircle className="w-3.5 h-3.5" /> Balanced Entry Enforced
              </span>
              <span className="text-slate-600">
                Chart of Accounts (COA) 20+ Akun
              </span>
            </div>
          </Link>

          {/* Module 3: Simpan Pinjam & Payroll */}
          <Link 
            href="/simpan-pinjam"
            className="group bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-emerald-500 transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                <PiggyBank className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 group-hover:text-emerald-600 transition-colors flex items-center gap-1.5">
                  Simpan Pinjam & Potong Gaji (Payroll)
                  <ArrowUpRight className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Pengelolaan saldo 3 jenis simpanan (Pokok, Wajib, Sukarela) anggota serta simulator pembiayaan anuitas/flat lengkap dengan jadwal pemotongan gaji bulanan otomatis.
                </p>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                <Users className="w-3.5 h-3.5" /> 10 Profil Anggota Aktif
              </span>
              <span className="text-slate-600">
                Simulasi Amortisasi Pinjaman
              </span>
            </div>
          </Link>

          {/* Module 4: SHU RAT Calculator */}
          <Link 
            href="/shu"
            className="group bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-purple-500 transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                <PieChart className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 group-hover:text-purple-600 transition-colors flex items-center gap-1.5">
                  Kalkulator Dividen SHU RAT Otomatis
                  <ArrowUpRight className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Formula kalkulasi bagi hasil SHU tahunan berbasis UU Perkoperasian No. 25/1992. Menghitung otomatis porsi Jasa Modal (Simpanan) dan Jasa Usaha (Belanja) per anggota dalam &lt;15 detik.
                </p>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1 text-purple-700 font-semibold">
                <Cpu className="w-3.5 h-3.5" /> Pangkas 3 Hari ke 15 Detik
              </span>
              <span className="text-slate-600">
                Cetak Slip SHU Anggota
              </span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
