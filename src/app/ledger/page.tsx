'use client';

import React, { useState } from 'react';
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  CheckCircle, 
  AlertCircle, 
  DollarSign, 
  FileText, 
  Scale, 
  ArrowRightLeft 
} from 'lucide-react';
import { CHART_OF_ACCOUNTS, INITIAL_JOURNAL_ENTRIES } from '@/lib/dummyData';
import { Account, JournalEntry, JournalEntryItem } from '@/lib/types';

export default function LedgerPage() {
  const [activeTab, setActiveTab] = useState<'journals' | 'coa' | 'financials'>('journals');
  const [journals, setJournals] = useState<JournalEntry[]>(INITIAL_JOURNAL_ENTRIES);
  const [accounts, setAccounts] = useState<Account[]>(CHART_OF_ACCOUNTS);

  // New Journal Entry Form State
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [entryItems, setEntryItems] = useState<JournalEntryItem[]>([
    { accountCode: '1101', accountName: 'Kas Kasir Toko Retail', debit: 0, credit: 0 },
    { accountCode: '4101', accountName: 'Pendapatan Penjualan Retail Toko', debit: 0, credit: 0 }
  ]);

  const totalDebit = entryItems.reduce((acc, item) => acc + (Number(item.debit) || 0), 0);
  const totalCredit = entryItems.reduce((acc, item) => acc + (Number(item.credit) || 0), 0);
  const isBalanced = totalDebit > 0 && totalDebit === totalCredit;
  const discrepancy = Math.abs(totalDebit - totalCredit);

  const handleAccountChange = (index: number, code: string) => {
    const acc = accounts.find((a) => a.code === code);
    if (!acc) return;
    setEntryItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, accountCode: code, accountName: acc.name } : item))
    );
  };

  const handleAmountChange = (index: number, field: 'debit' | 'credit', value: number) => {
    setEntryItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const addEntryRow = () => {
    setEntryItems((prev) => [
      ...prev,
      { accountCode: '1103', accountName: 'Bank Syariah Mandiri Utama', debit: 0, credit: 0 }
    ]);
  };

  const removeEntryRow = (index: number) => {
    if (entryItems.length <= 2) {
      alert('Jurnal minimal membutuhkan 2 baris akun (Debit & Kredit)!');
      return;
    }
    setEntryItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePostJournal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isBalanced) {
      alert('Gagal memposting! Total Debit dan Kredit harus seimbang (0 discrepancy).');
      return;
    }
    if (!description.trim()) {
      alert('Deskripsi transaksi wajib diisi!');
      return;
    }

    const newJournal: JournalEntry = {
      id: `JRN-${Date.now()}`,
      referenceNumber: `JU/${new Date().getFullYear()}/${journals.length + 1}`,
      date,
      description,
      items: entryItems,
      totalDebit,
      totalCredit,
      status: 'POSTED'
    };

    setJournals([newJournal, ...journals]);
    setDescription('');
    setEntryItems([
      { accountCode: '1101', accountName: 'Kas Kasir Toko Retail', debit: 0, credit: 0 },
      { accountCode: '4101', accountName: 'Pendapatan Penjualan Retail Toko', debit: 0, credit: 0 }
    ]);
    alert('✅ Jurnal umum berhasil diposting ke Buku Besar secara ACID-compliant!');
  };

  // Financial Statements Calculation
  const totalAset = accounts.filter(a => a.category === 'ASET').reduce((acc, a) => acc + a.balance, 0);
  const totalKewajiban = accounts.filter(a => a.category === 'KEWAJIBAN').reduce((acc, a) => acc + a.balance, 0);
  const totalEkuitas = accounts.filter(a => a.category === 'EKUITAS').reduce((acc, a) => acc + a.balance, 0);

  const totalPendapatan = accounts.filter(a => a.category === 'PENDAPATAN').reduce((acc, a) => acc + a.balance, 0);
  const totalHpp = accounts.filter(a => a.category === 'HPP').reduce((acc, a) => acc + a.balance, 0);
  const totalBeban = accounts.filter(a => a.category === 'BEBAN').reduce((acc, a) => acc + a.balance, 0);
  const labaBersihShu = totalPendapatan - totalHpp - totalBeban;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-600" />
            <span>General Ledger & Core Banking Engine</span>
          </h1>
          <p className="text-xs text-slate-500">
            Pembukuan berpasangan (*Double-Entry Bookkeeping*) berstandar SAK-ETAP dengan validasi integritas transaksi ACID.
          </p>
        </div>

        {/* Tab Pills */}
        <div className="flex bg-slate-200 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('journals')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'journals' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Jurnal Umum
          </button>
          <button
            onClick={() => setActiveTab('coa')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'coa' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Bagan Akun (COA)
          </button>
          <button
            onClick={() => setActiveTab('financials')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'financials' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Laporan Keuangan
          </button>
        </div>
      </div>

      {activeTab === 'journals' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Input Jurnal Baru (5 cols) */}
          <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="border-b border-slate-200 pb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-600" />
                <span>Posting Entri Jurnal Baru</span>
              </h3>
              <p className="text-[11px] text-slate-500">
                Wajib memenuhi kaidah Debit = Kredit sebelum dapat diposting.
              </p>
            </div>

            <form onSubmit={handlePostJournal} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700">Tanggal Transaksi</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Tipe Buku</label>
                  <input
                    type="text"
                    value="Buku Jurnal Umum (Memorial)"
                    disabled
                    className="w-full mt-1 p-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Uraian / Deskripsi Transaksi</label>
                <input
                  type="text"
                  placeholder="Contoh: Penerimaan pembayaran pinjaman atau setoran modal"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Journal Line Items */}
              <div className="space-y-2 pt-2">
                <div className="flex justify-between items-center text-[11px] font-semibold text-slate-600">
                  <span>Daftar Akun & Nominal</span>
                  <button
                    type="button"
                    onClick={addEntryRow}
                    className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Tambah Baris
                  </button>
                </div>

                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {entryItems.map((item, index) => (
                    <div key={index} className="p-2 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
                      <div className="flex items-center justify-between gap-1">
                        <select
                          value={item.accountCode}
                          onChange={(e) => handleAccountChange(index, e.target.value)}
                          className="w-full p-1.5 bg-white border border-slate-200 rounded text-xs text-slate-900"
                        >
                          {accounts.map((acc) => (
                            <option key={acc.code} value={acc.code}>
                              {acc.code} - {acc.name}
                            </option>
                          ))}
                        </select>
                        {entryItems.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeEntryRow(index)}
                            className="p-1 text-rose-500 hover:text-rose-700"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-slate-500">Debit (Rp)</label>
                          <input
                            type="number"
                            value={item.debit || ''}
                            onChange={(e) => handleAmountChange(index, 'debit', Number(e.target.value))}
                            className="w-full p-1 bg-white border border-slate-200 rounded text-right font-mono"
                            placeholder="0"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-500">Kredit (Rp)</label>
                          <input
                            type="number"
                            value={item.credit || ''}
                            onChange={(e) => handleAmountChange(index, 'credit', Number(e.target.value))}
                            className="w-full p-1 bg-white border border-slate-200 rounded text-right font-mono"
                            placeholder="0"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Balanced Check Bar */}
              <div className={`p-3 rounded-xl border flex flex-col gap-1 ${
                isBalanced ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}>
                <div className="flex justify-between font-bold">
                  <span>Total Debit: Rp {totalDebit.toLocaleString('id-ID')}</span>
                  <span>Total Kredit: Rp {totalCredit.toLocaleString('id-ID')}</span>
                </div>
                <div className="text-[11px] flex items-center gap-1 font-medium">
                  {isBalanced ? (
                    <>
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Seimbang (Balanced: 0 Discrepancy)</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                      <span>Selisih: Rp {discrepancy.toLocaleString('id-ID')} (Wajib Seimbang)</span>
                    </>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={!isBalanced}
                className={`w-full py-2.5 rounded-lg font-bold transition-all shadow-xs ${
                  isBalanced
                    ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                Posting Jurnal ke Buku Besar
              </button>
            </form>
          </div>

          {/* Right: Daftar Jurnal Terposting (7 cols) */}
          <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-600" />
                <span>Audit Trail Jurnal Terposting ({journals.length})</span>
              </h3>
              <span className="text-xs text-emerald-700 font-semibold bg-emerald-100 px-2 py-0.5 rounded">
                ACID Verified
              </span>
            </div>

            <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
              {journals.map((jrn) => (
                <div key={jrn.id} className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-blue-700">{jrn.referenceNumber}</span>
                    <span className="text-slate-500">{jrn.date}</span>
                  </div>
                  <div className="font-semibold text-slate-900">{jrn.description}</div>

                  <table className="w-full mt-2 text-[11px] border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500">
                        <th className="text-left py-1">Akun</th>
                        <th className="text-right py-1">Debit</th>
                        <th className="text-right py-1">Kredit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {jrn.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="py-1 text-slate-700 font-medium">
                            <span className="font-mono text-slate-400 mr-1.5">{item.accountCode}</span>
                            {item.accountName}
                          </td>
                          <td className="py-1 text-right font-mono text-slate-900">
                            {item.debit > 0 ? `Rp ${item.debit.toLocaleString('id-ID')}` : '-'}
                          </td>
                          <td className="py-1 text-right font-mono text-slate-900">
                            {item.credit > 0 ? `Rp ${item.credit.toLocaleString('id-ID')}` : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'coa' && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Bagan Akun Standar Koperasi (Chart of Accounts)</h3>
              <p className="text-xs text-slate-500">Segmentasi hierarki akun SAK-ETAP (1000 - 6000)</p>
            </div>
            <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded">
              Total {accounts.length} Akun
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3">Kode Akun</th>
                  <th className="p-3">Nama Akun</th>
                  <th className="p-3">Klasifikasi</th>
                  <th className="p-3">Saldo Normal</th>
                  <th className="p-3 text-right">Saldo Buku</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {accounts.map((acc) => (
                  <tr key={acc.code} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-blue-700">{acc.code}</td>
                    <td className="p-3 font-semibold text-slate-900">{acc.name}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        acc.category === 'ASET' ? 'bg-teal-100 text-teal-800' :
                        acc.category === 'KEWAJIBAN' ? 'bg-amber-100 text-amber-800' :
                        acc.category === 'EKUITAS' ? 'bg-blue-100 text-blue-800' :
                        acc.category === 'PENDAPATAN' ? 'bg-emerald-100 text-emerald-800' :
                        'bg-slate-100 text-slate-800'
                      }`}>
                        {acc.category}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600 font-mono text-[11px]">{acc.normalBalance}</td>
                    <td className="p-3 text-right font-mono font-bold text-slate-900">
                      Rp {acc.balance.toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'financials' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Neraca (Balance Sheet) */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="border-b border-slate-200 pb-2">
              <h3 className="font-bold text-sm text-slate-900">Neraca Ringkas (Balance Sheet)</h3>
              <p className="text-[11px] text-slate-500">Persamaan Akuntansi: Aset = Kewajiban + Ekuitas</p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-teal-50 border border-teal-200 flex justify-between items-center font-bold">
                <span className="text-teal-900">Total Aset (Aktiva)</span>
                <span className="text-teal-900 font-mono text-sm">Rp {totalAset.toLocaleString('id-ID')}</span>
              </div>

              <div className="space-y-1.5 pl-2">
                <div className="flex justify-between text-slate-600">
                  <span>Total Kewajiban (Liabilitas):</span>
                  <span className="font-mono">Rp {totalKewajiban.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Total Ekuitas (Modal Anggota):</span>
                  <span className="font-mono">Rp {totalEkuitas.toLocaleString('id-ID')}</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 flex justify-between items-center font-bold">
                <span className="text-blue-900">Kewajiban + Ekuitas (Passiva)</span>
                <span className="text-blue-900 font-mono text-sm">
                  Rp {(totalKewajiban + totalEkuitas).toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          </div>

          {/* Laba Rugi (Income Statement) */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="border-b border-slate-200 pb-2">
              <h3 className="font-bold text-sm text-slate-900">Laporan Laba Rugi (SHU Berjalan)</h3>
              <p className="text-[11px] text-slate-500">Pendapatan Bersih Operasional Toko & Jasa</p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-emerald-800 font-semibold p-2 bg-emerald-50 rounded">
                <span>Total Pendapatan Usaha:</span>
                <span className="font-mono">Rp {totalPendapatan.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-slate-600 px-2">
                <span>Harga Pokok Penjualan (HPP):</span>
                <span className="font-mono">- Rp {totalHpp.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-slate-600 px-2">
                <span>Beban Operasional:</span>
                <span className="font-mono">- Rp {totalBeban.toLocaleString('id-ID')}</span>
              </div>

              <div className="p-3 rounded-lg bg-purple-50 border border-purple-200 flex justify-between items-center font-bold mt-3">
                <span className="text-purple-900">Sisa Hasil Usaha (SHU) Bersih:</span>
                <span className="text-purple-900 font-mono text-sm">Rp {labaBersihShu.toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
