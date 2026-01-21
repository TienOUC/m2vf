'use client';

import UserAvatar from '@/components/layout/UserAvatar';
import { Sparkles, Pencil } from 'lucide-react';

interface NavbarProps {
  user?: {
    name: string;
    email: string;
  } | null;
  onEditProject?: () => void;
}

export default function Navbar({ user, onEditProject }: NavbarProps) {

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
      <div className="flex items-center space-x-3">
        <Sparkles className="h-8 w-8 text-blue-500" />
        <h1 className="text-xl font-bold text-gray-900">M2VF</h1>
        
      </div>

      <div className="flex items-center space-x-4">
        {onEditProject && (
          <button
            onClick={onEditProject}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Pencil className="mr-2 h-4 w-4" />
            编辑项目
          </button>
        )}
        {user && <UserAvatar user={user} menuPosition="bottom" />}
      </div>
    </header>
  );
}