import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    version: 'v1.0.0',
    timestamp: Date.now(),
  });
}
