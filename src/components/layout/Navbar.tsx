'use client';

import UserAvatar from './UserAvatar';
import { AutoFixHigh } from '@mui/icons-material';

interface NavbarProps {
  user?: {
    name: string;
    email: string;
  } | null;
}

export default function Navbar({ user }: NavbarProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
      <div className="flex items-center space-x-3">
        <AutoFixHigh className="h-8 w-8 text-blue-500" />
        <h1 className="text-xl font-bold text-gray-900">M2V-Flow</h1>
      </div>

      {user && <UserAvatar user={user} />}
    </header>
  );
}
