import { NextRequest, NextResponse } from 'next/server';
import { MOCK_MEMBERS } from '@/lib/mockStore';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get('q') || '').toLowerCase().trim();

  if (!q) {
    return NextResponse.json(MOCK_MEMBERS);
  }

  const filtered = MOCK_MEMBERS.filter(
    (m) =>
      m.name.toLowerCase().includes(q) ||
      m.member_number.toLowerCase().includes(q) ||
      m.department.toLowerCase().includes(q)
  );

  return NextResponse.json(filtered);
}
