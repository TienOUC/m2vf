import { cn } from '@/lib/utils';

interface RegisterMethodToggleProps {
  value: 'email' | 'phone';
  onChange: (method: 'email' | 'phone') => void;
}

export function RegisterMethodToggle({ value, onChange }: RegisterMethodToggleProps) {
  return (
    <div className="flex gap-6 border-b border-neutral-200">
      <button
        type="button"
        className={cn(
          "py-2.5 px-1 text-[14px] font-medium transition-all relative",
          value === 'email'
            ? "text-primary border-b-2 border-primary"
            : "text-neutral-700 hover:text-primary"
        )}
        onClick={() => onChange('email')}
      >
        邮箱注册
      </button>
      <button
        type="button"
        className={cn(
          "py-2.5 px-1 text-[14px] font-medium transition-all relative",
          value === 'phone'
            ? "text-primary border-b-2 border-primary"
            : "text-neutral-700 hover:text-primary"
        )}
        onClick={() => onChange('phone')}
      >
        手机注册
      </button>
    </div>
  );
}
