import { NextResponse } from 'next/server';
import { MOCK_PRODUCTS } from '@/lib/mockStore';

export async function GET() {
  return NextResponse.json({
    products: MOCK_PRODUCTS,
    version: 'v1.0.0',
    count: MOCK_PRODUCTS.length,
    synced_at: new Date().toISOString(),
  });
}
