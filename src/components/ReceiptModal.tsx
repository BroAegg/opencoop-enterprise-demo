'use client';

import React from 'react';
import { X, Printer, CheckCircle2 } from 'lucide-react';
import { OfflineTransaction } from '@/lib/types';
import { COOP_INFO } from '@/lib/dummyData';

interface ReceiptModalProps {
  transaction: OfflineTransaction | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ReceiptModal({ transaction, isOpen, onClose }: ReceiptModalProps) {
  if (!isOpen || !transaction) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider">
              {transaction.status === 'PENDING_SYNC' ? 'Struk Transaksi (Offline Queue)' : 'Struk Transaksi Selesai'}
            </span>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Thermal Receipt Paper (58mm / 80mm ESC/POS Simulator) */}
        <div className="p-6 overflow-y-auto bg-slate-50 flex justify-center">
          <div className="thermal-receipt w-full max-w-[280px] p-4 text-[11px] leading-tight select-none">
            {/* Header Koperasi */}
            <div className="text-center pb-2 border-b border-dashed border-slate-400 mb-2">
              <div className="font-bold text-xs uppercase tracking-wide">{COOP_INFO.shortName}</div>
              <div className="text-[9px] text-slate-600">{COOP_INFO.name}</div>
              <div className="text-[9px] text-slate-500 mt-0.5">{COOP_INFO.address}</div>
              <div className="text-[9px] text-slate-500">Telp: {COOP_INFO.phone}</div>
            </div>

            {/* Transaction Meta */}
            <div className="pb-2 border-b border-dashed border-slate-400 mb-2 space-y-0.5 text-[10px]">
              <div className="flex justify-between">
                <span>No. Inv:</span>
                <span className="font-bold">{transaction.invoice_number}</span>
              </div>
              <div className="flex justify-between">
                <span>Tanggal:</span>
                <span>{new Date(transaction.created_at).toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between">
                <span>Kasir:</span>
                <span>{transaction.cashier_name}</span>
              </div>
              <div className="flex justify-between">
                <span>Metode:</span>
                <span className="font-semibold">{transaction.payment_method}</span>
              </div>
              {transaction.member_name && (
                <div className="flex justify-between text-teal-700 font-semibold">
                  <span>Anggota:</span>
                  <span>{transaction.member_name}</span>
                </div>
              )}
              {transaction.status === 'PENDING_SYNC' && (
                <div className="mt-1 px-1.5 py-0.5 bg-amber-100 text-amber-800 text-[9px] font-bold rounded text-center">
                  * TERSIMPAN SECARA LOKAL (INDEXEDDB) *
                </div>
              )}
            </div>

            {/* Items */}
            <div className="pb-2 border-b border-dashed border-slate-400 mb-2 space-y-1.5">
              {transaction.items.map((item, idx) => (
                <div key={idx} className="space-y-0.5">
                  <div className="font-semibold truncate">{item.product_name}</div>
                  <div className="flex justify-between text-slate-600">
                    <span>{item.quantity} x Rp {item.sell_price.toLocaleString('id-ID')}</span>
                    <span className="font-bold text-slate-900">Rp {item.subtotal.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="space-y-1 text-[11px] pb-2 border-b border-dashed border-slate-400 mb-2">
              <div className="flex justify-between text-xs font-bold">
                <span>TOTAL:</span>
                <span>Rp {transaction.total_amount.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Tunai / Bayar:</span>
                <span>Rp {transaction.cash_tendered.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Kembali:</span>
                <span>Rp {transaction.change_due.toLocaleString('id-ID')}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center text-[9px] text-slate-500 pt-1 space-y-1">
              <div>UUID: {transaction.client_uuid.substring(0, 18)}...</div>
              <div>Terima kasih atas kunjungan Anda</div>
              <div className="font-bold text-slate-700">Simulasi Bluetooth SPP 58mm Thermal ESC/POS</div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-3 bg-white border-t border-slate-200 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 font-medium rounded-lg"
          >
            Tutup
          </button>
          <button
            onClick={handlePrint}
            className="px-3 py-1.5 text-xs bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg inline-flex items-center gap-1.5 shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Thermal (Print)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
