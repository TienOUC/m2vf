'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import UserAvatar from './UserAvatar';
import { AutoFixHigh } from '@mui/icons-material';
import { ROUTES } from '@/lib/config/api.config';

interface NavbarProps {
  user?: {
    name: string;
    email: string;
  } | null;
  onEditProject?: () => void;
}

export default function Navbar({ user, onEditProject }: NavbarProps) {
  const pathname = usePathname();

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
      <div className="flex items-center space-x-3">
        <AutoFixHigh className="h-8 w-8 text-blue-500" />
        <h1 className="text-xl font-bold text-gray-900">M2VF</h1>
        
      </div>

      <div className="flex items-center space-x-4">

        {user && <UserAvatar user={user} />}
      </div>
    </header>
  );
}
