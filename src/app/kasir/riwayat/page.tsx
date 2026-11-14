'use client';

import React from 'react';
import Riwayat from '@/Pages/Kasir/Riwayat';

const MOCK_HISTORY_TRANSACTIONS = [
  {
    id: 1048,
    invoice_number: 'INV-20261115-048',
    total_amount: 142500,
    payment_method: 'CASH',
    cash_received: 150000,
    change_amount: 7500,
    cashier_name: 'Kasir Toko (Shift 1)',
    created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    items: [
      { id: 1, product_name: 'Beras Premium Ramos 5kg', qty: 1, price: 75000, subtotal: 75000 },
      { id: 2, product_name: 'Minyak Goreng Sawit 2L', qty: 1, price: 34500, subtotal: 34500 },
      { id: 4, product_name: 'Keripik Tempe Renyah Oven 150g', qty: 2, price: 16000, subtotal: 32000 },
    ],
    status: 'COMPLETED',
  },
  {
    id: 1047,
    invoice_number: 'INV-20261115-047',
    total_amount: 50000,
    payment_method: 'QRIS',
    cash_received: 50000,
    change_amount: 0,
    cashier_name: 'Kasir Toko (Shift 1)',
    created_at: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
    items: [
      { id: 6, product_name: 'Kopi Arabika Gayo Blend 250g', qty: 1, price: 50000, subtotal: 50000 },
    ],
    status: 'COMPLETED',
  },
  {
    id: 1046,
    invoice_number: 'INV-20261115-046',
    total_amount: 68500,
    payment_method: 'CASH',
    cash_received: 100000,
    change_amount: 31500,
    cashier_name: 'Kasir Toko (Shift 1)',
    created_at: new Date(Date.now() - 1000 * 60 * 85).toISOString(),
    items: [
      { id: 3, product_name: 'Gula Pasir Kristal Putih 1kg', qty: 1, price: 17500, subtotal: 17500 },
      { id: 9, product_name: 'Kertas HVS A4 75gsm 1 Rim', qty: 1, price: 52000, subtotal: 52000 },
    ],
    status: 'COMPLETED',
  },
];

export default function RiwayatPage() {
  return (
    <Riwayat
      transactions={MOCK_HISTORY_TRANSACTIONS}
      stockAdjustments={[]}
      activeShift={{ id: 1 }}
      currentScope="shift"
    />
  );
}
