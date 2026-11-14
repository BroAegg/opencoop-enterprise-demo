'use client';

import React from 'react';
import SimpananIndex from '@/Pages/Admin/Simpanan/Index';
import { MOCK_MEMBERS } from '@/lib/mockStore';

export default function SimpananPage() {
  return <SimpananIndex members={MOCK_MEMBERS} />;
}
