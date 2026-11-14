import { NextResponse } from 'next/server';

export async function GET() {
  const activeShift = {
    id: 1,
    cashier_name: 'Kasir Toko (Shift 1)',
    opening_cash: 200000,
    opened_at: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    status: 'OPEN',
    movements: [
      {
        id: 1,
        type: 'IN',
        amount: 50000,
        notes: 'Tambahan uang kembalian pecahan kecil',
        created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      },
    ],
  };

  const metrics = {
    total_sales: 4250000,
    cash_sales: 2850000,
    qris_sales: 1400000,
    transaction_count: 48,
    cash_in_drawer: 3100000, // 200k opening + 2.85m cash + 50k in
  };

  return NextResponse.json({
    shift: activeShift,
    metrics,
  });
}
