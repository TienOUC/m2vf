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
}

export default function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
      <div className="flex items-center space-x-3">
        <AutoFixHigh className="h-8 w-8 text-blue-500" />
        <h1 className="text-xl font-bold text-gray-900">M2VFlow</h1>
        
        {/* 导航链接 */}
        <nav className="ml-8">
          <ul className="flex space-x-6">
            <li>
              <Link 
                href={ROUTES.PROJECTS}
                className={`font-medium transition-colors ${pathname === ROUTES.PROJECTS ? 'text-blue-600' : 'text-gray-600 hover:text-blue-500'}`}
              >
                项目管理
              </Link>
            </li>
            <li>
              <Link 
                href={ROUTES.EDIT}
                className={`font-medium transition-colors ${pathname === ROUTES.EDIT ? 'text-blue-600' : 'text-gray-600 hover:text-blue-500'}`}
              >
                编辑器
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      {user && <UserAvatar user={user} />}
    </header>
  );
}
