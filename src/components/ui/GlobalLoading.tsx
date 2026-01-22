'use client';

import { useUIStore } from '@/lib/stores';
import Loading from '@/app/loading';

export default function GlobalLoading() {
  const { isGlobalLoading } = useUIStore();

  if (!isGlobalLoading) {
    return null;
  }

  return <Loading />;
}