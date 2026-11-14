'use client';

import React from 'react';
import Dashboard from '@/Pages/Admin/Dashboard';
import { MOCK_DASHBOARD_DATA } from '@/lib/mockStore';

export default function Page() {
  return <Dashboard dashboard_data={MOCK_DASHBOARD_DATA} />;
}
