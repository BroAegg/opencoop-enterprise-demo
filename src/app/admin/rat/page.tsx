'use client';

import React from 'react';
import RatIndex from '@/Pages/Admin/RAT/Index';
import { MOCK_RAT_SESSIONS, MOCK_MEMBERS } from '@/lib/mockStore';

export default function RatPage() {
  return <RatIndex sessions={MOCK_RAT_SESSIONS} members={MOCK_MEMBERS} />;
}
