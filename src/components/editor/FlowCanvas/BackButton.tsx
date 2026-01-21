'use client';

import { CornerUpLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface BackButtonProps {
  className?: string;
}

const BackButton: React.FC<BackButtonProps> = ({ className = '' }) => {
  const router = useRouter();

  return (
    <div 
      className={className}
      style={{
        position: 'absolute',
        top: '15px',
        left: '15px',
        zIndex: 1000,
        background: 'rgba(255, 255, 255, 0.9)',
        borderRadius: '50%',
        padding: '8px',
        cursor: 'pointer',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.2s ease'
      }}
      onClick={() => router.back()}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.1)';
        e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
      }}
    >
      <CornerUpLeft size={20} color="#333" />
    </div>
  );
};

export default BackButton;