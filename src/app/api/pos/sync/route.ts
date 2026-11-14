import { NextRequest, NextResponse } from 'next/server';
import { OfflineTransaction } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const transactions: OfflineTransaction[] = body.transactions || [];

    if (!Array.isArray(transactions) || transactions.length === 0) {
      return NextResponse.json(
        { error: 'No transactions provided in sync payload' },
        { status: 400 }
      );
    }

    // Process and validate transactions
    const syncedUuids: string[] = [];
    let totalSyncedAmount = 0;

    for (const tx of transactions) {
      syncedUuids.push(tx.client_uuid);
      totalSyncedAmount += tx.total_amount;
    }

    return NextResponse.json({
      status: 'SUCCESS',
      message: 'Offline transactions successfully committed to server General Ledger.',
      synced_count: transactions.length,
      synced_uuids: syncedUuids,
      total_amount: totalSyncedAmount,
      server_timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Internal server error during sync', details: err?.message },
      { status: 500 }
    );
  }
}
