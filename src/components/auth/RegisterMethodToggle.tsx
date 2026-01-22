import { cn } from '@/lib/utils';

interface RegisterMethodToggleProps {
  value: 'email' | 'phone';
  onChange: (method: 'email' | 'phone') => void;
}

export function RegisterMethodToggle({ value, onChange }: RegisterMethodToggleProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <button
        type="button"
        className={cn(
          "py-2.5 px-4 rounded-xl text-[14px] font-medium transition-colors",
          value === 'email'
            ? "bg-primary text-white"
            : "bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50"
        )}
        onClick={() => onChange('email')}
      >
        邮箱注册
      </button>
      <button
        type="button"
        className={cn(
          "py-2.5 px-4 rounded-xl text-[14px] font-medium transition-colors",
          value === 'phone'
            ? "bg-primary text-white"
            : "bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50"
        )}
        onClick={() => onChange('phone')}
      >
        手机注册
      </button>
    </div>
  );
}
