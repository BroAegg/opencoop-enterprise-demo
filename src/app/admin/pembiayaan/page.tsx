'use client';

import React from 'react';
import LoansIndex from '@/Pages/Admin/Loans/Index';
import { MOCK_LOANS } from '@/lib/mockStore';

export default function LoansPage() {
  const stats = {
    total_outstanding: 42000000,
    total_disbursed: 75000000,
    total_interest: 6800000,
    overdue_amount: 0,
  };

  const statusCounts = {
    ALL: 3,
    ACTIVE: 3,
    PENDING: 0,
    COMPLETED: 12,
    OVERDUE: 0,
  };

  return (
    <LoansIndex
      loans={MOCK_LOANS}
      stats={stats}
      statusCounts={statusCounts}
      filters={{}}
    />
  );
}
