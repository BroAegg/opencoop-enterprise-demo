'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Building2, 
  ShoppingCart, 
  BookOpen, 
  PiggyBank, 
  PieChart, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  ShieldCheck, 
  UserCheck 
} from 'lucide-react';
import { getOutboxCount, getPendingTransactions, markTransactionsSynced } from '@/lib/indexedDb';

export default function Navbar() {
  const pathname = usePathname();
  const [isSimulatedOffline, setIsSimulatedOffline] = useState(false);
  const [outboxCount, setOutboxCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [currentRole, setCurrentRole] = useState<'admin' | 'kasir' | 'pengawas'>('admin');

  useEffect(() => {
    // Check outbox count every 3 seconds
    const interval = setInterval(async () => {
      const count = await getOutboxCount();
      setOutboxCount(count);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleSyncNow = async () => {
    if (isSimulatedOffline) {
      alert('Koneksi sedang dalam mode SIMULASI OFFLINE. Aktifkan koneksi online terlebih dahulu untuk sinkronisasi.');
      return;
    }
    setIsSyncing(true);
    try {
      const pending = await getPendingTransactions();
      if (pending.length === 0) {
        alert('Tidak ada antrean transaksi offline di IndexedDB.');
        setIsSyncing(false);
        return;
      }

      const res = await fetch('/api/pos/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactions: pending })
      });

      if (res.ok) {
        const data = await res.json();
        await markTransactionsSynced(pending.map(p => p.client_uuid));
        setOutboxCount(0);
        alert(`✅ Berhasil menyinkronkan ${data.synced_count} transaksi offline ke General Ledger server!`);
      }
    } catch (err) {
      console.error('Sync failed:', err);
      alert('Gagal menyinkronkan ke server.');
    } finally {
      setIsSyncing(false);
    }
  };

  const navLinks = [
    { href: '/', label: 'Executive Dashboard', icon: Building2 },
    { href: '/pos', label: 'POS Kasir (Offline-First)', icon: ShoppingCart },
    { href: '/ledger', label: 'General Ledger', icon: BookOpen },
    { href: '/simpan-pinjam', label: 'Simpan Pinjam', icon: PiggyBank },
    { href: '/shu', label: 'SHU RAT', icon: PieChart },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      {/* Top Banner: Enterprise Demo Status & Simulation Controls */}
      <div className="bg-slate-950 px-4 py-1.5 text-xs border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-slate-300">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">
            LIVE SANDBOX DEMO
          </span>
          <span className="hidden sm:inline text-slate-400">
            OpenCoop Enterprise ERP & Offline POS Engine (Sanitized Boilerplate)
          </span>
        </div>

        {/* Network State & Role Switcher */}
        <div className="flex items-center gap-3">
          {/* Offline/Online Simulation Switch */}
          <button
            onClick={() => {
              const nextState = !isSimulatedOffline;
              setIsSimulatedOffline(nextState);
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('network-status-change', { detail: { isOffline: nextState } }));
              }
            }}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded font-medium text-[11px] transition-colors ${
              isSimulatedOffline 
                ? 'bg-rose-900/80 text-rose-200 border border-rose-700 animate-pulse' 
                : 'bg-emerald-900/60 text-emerald-300 border border-emerald-700'
            }`}
            title="Klik untuk menguji mode offline-first kasir"
          >
            {isSimulatedOffline ? (
              <>
                <WifiOff className="w-3.5 h-3.5 text-rose-400" />
                <span>Simulasi Offline Aktif</span>
              </>
            ) : (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                <span>Online (Jaringan Normal)</span>
              </>
            )}
          </button>

          {/* Outbox Badge & Sync */}
          {outboxCount > 0 && (
            <button
              onClick={handleSyncNow}
              disabled={isSyncing}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-500 text-slate-950 font-bold text-[11px] hover:bg-amber-400 transition-colors"
            >
              <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{outboxCount} Outbox Pending</span>
            </button>
          )}

          {/* Role Pill */}
          <div className="flex items-center gap-1 bg-slate-800 rounded px-1.5 py-0.5 border border-slate-700">
            <span className="text-slate-400 text-[10px]">Role:</span>
            <select
              value={currentRole}
              onChange={(e) => setCurrentRole(e.target.value as any)}
              className="bg-transparent text-slate-200 text-xs font-semibold focus:outline-none cursor-pointer"
            >
              <option value="admin" className="bg-slate-900">Admin</option>
              <option value="kasir" className="bg-slate-900">Kasir</option>
              <option value="pengawas" className="bg-slate-900">Pengawas</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-teal-500 text-slate-950 flex items-center justify-center font-black text-base shadow-sm group-hover:scale-105 transition-transform">
            N
          </div>
          <div>
            <div className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
              NusaCoop <span className="text-teal-400 font-mono text-xs font-normal">v2.4-lite</span>
            </div>
            <div className="text-[10px] text-slate-400 tracking-wider uppercase font-semibold">
              Enterprise Cooperative ERP
            </div>
          </div>
        </Link>

        {/* Navigation Items */}
        <nav className="flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4 opacity-80" />
                <span className="hidden md:inline">{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
