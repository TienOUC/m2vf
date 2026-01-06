'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import UserAvatar from '@/components/layout/UserAvatar';
import { AutoAwesome, Edit } from '@mui/icons-material';
import { ROUTES } from '@/lib/config/api.config';
import { useUIStore } from '@/lib/stores';

interface NavbarProps {
  user?: {
    name: string;
    email: string;
  } | null;
  onEditProject?: () => void;
}

export default function Navbar({ user, onEditProject }: NavbarProps) {
  const pathname = usePathname();
  const { isSidebarOpen, setIsSidebarOpen } = useUIStore();

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
      <div className="flex items-center space-x-3">
        <AutoAwesome className="h-8 w-8 text-blue-500" />
        <h1 className="text-xl font-bold text-gray-900">M2VF</h1>
        
      </div>

      <div className="flex items-center space-x-4">
        {onEditProject && (
          <button
            onClick={onEditProject}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Edit className="mr-2 h-4 w-4" />
            编辑项目
          </button>
        )}
        {user && <UserAvatar user={user} />}
      </div>
    </header>
  );
}