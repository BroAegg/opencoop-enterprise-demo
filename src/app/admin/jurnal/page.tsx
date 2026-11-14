'use client';

import React from 'react';
import JurnalIndex from '@/Pages/Admin/Jurnal/Index';
import { MOCK_JOURNALS, MOCK_ACCOUNTS } from '@/lib/mockStore';

export default function JurnalPage() {
  return (
    <JurnalIndex
      journals={{ data: MOCK_JOURNALS }}
      accounts={MOCK_ACCOUNTS}
      filters={{}}
    />
  );
}
