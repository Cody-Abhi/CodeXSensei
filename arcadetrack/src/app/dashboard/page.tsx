import { Suspense } from 'react';
import { DashboardView } from '@/components/dashboard/DashboardView';

export default function DashboardPage() {
  return (
    <Suspense fallback={<p className="font-mono">Loading…</p>}>
      <DashboardView />
    </Suspense>
  );
}
