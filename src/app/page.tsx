'use client';

import { Skeleton } from 'strata';

import BoardEngine from '@/components/canvas/BoardEngine';
import NeonAuthForm from '@/components/auth/NeonAuthForm';
import { useSession } from '@/lib/auth/client';

export default function Home() {
  const { data: session, isPending } = useSession();

  if (isPending) return <Skeleton className="h-screen w-full" />;

  return <main>{session?.user ? <BoardEngine /> : <NeonAuthForm />}</main>;
}
