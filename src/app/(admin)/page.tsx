import { Suspense } from 'react';
import DashboardClient from './DashboardClient';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export const metadata = {
  title: 'Dashboard | 4Hacks Admin',
  description: 'Platform overview and analytics dashboard',
};

export default function DashboardPage() {
  return (
    <Suspense fallback={<LoadingSpinner text="Loading dashboard..." />}>
      <DashboardClient />
    </Suspense>
  );
}
