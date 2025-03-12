import DashboardComponent from '@/features/(Dashboard)/components/DashboardComponent';
import DashboardSkeleton from '@/features/(Dashboard)/components/skeleton/DashboardSkeleton';
import WelcomeComponent from '@/features/(Dashboard)/components/welcome-component';
import { getRole } from '@/lib/utils/getRole';
import { Suspense } from 'react';

export default async function Home() {
  const role = await getRole();
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      {!role && <DashboardSkeleton />}
      {role === 'Invitado' && typeof role === 'string' ? <WelcomeComponent /> : <DashboardComponent />}
    </Suspense>
  );
}
