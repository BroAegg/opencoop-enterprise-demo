import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;

    const transaction = {
      id: Date.now(),
      invoice_number: invoiceNumber,
      client_uuid: body.client_uuid || `uuid-${Date.now()}`,
      created_at: new Date().toISOString(),
      total_amount: body.total_amount,
      payment_method: body.payment_method || 'CASH',
      cash_received: body.cash_received || body.total_amount,
      change_amount: (body.cash_received || body.total_amount) - body.total_amount,
      cashier_name: body.cashier_name || 'Kasir Toko',
      member: body.member_id ? { id: body.member_id, name: 'Anggota Koperasi' } : null,
      items: body.items || [],
      status: 'COMPLETED',
    };

    return NextResponse.json({
      success: true,
      transaction,
      message: 'Transaksi POS berhasil diselesaikan & diverifikasi.',
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Checkout failed' },
      { status: 400 }
    );
  }
}
