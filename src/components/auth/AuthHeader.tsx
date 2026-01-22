import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export function AuthHeader() {
  return (
    <div className="flex items-center p-6">
      <Link 
        href="/"
        className="flex items-center gap-2 text-[14px] text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        返回首页
      </Link>
    </div>
  );
}
