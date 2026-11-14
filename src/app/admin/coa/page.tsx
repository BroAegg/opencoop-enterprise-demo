'use client';

import React from 'react';
import CoaIndex from '@/Pages/Admin/COA/Index';
import { MOCK_ACCOUNTS } from '@/lib/mockStore';

export default function CoaPage() {
  return <CoaIndex accounts={MOCK_ACCOUNTS} filters={{}} />;
}
