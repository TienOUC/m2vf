'use client';

import Link from 'next/link';
import { SunLogo } from './SunLogo';

export const Logo = () => {
  return (
    <Link href="/" className="flex items-center gap-3">
      <SunLogo />
      <span className="text-[14px] font-medium tracking-[0.2em] uppercase text-neutral-500 dark:text-white/40">
        Reelay
      </span>
    </Link>
  );
};
