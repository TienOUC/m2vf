import { cn } from '@/lib/utils';

interface LoginMethodToggleProps {
  value: 'password' | 'phoneCode';
  onChange: (method: 'password' | 'phoneCode') => void;
}

export function LoginMethodToggle({ value, onChange }: LoginMethodToggleProps) {
  return (
    <div className="flex gap-6 border-b border-neutral-200">
      <button
        type="button"
        className={cn(
          "py-2.5 px-1 text-[14px] font-medium transition-all relative",
          value === 'password'
            ? "text-primary border-b-2 border-primary"
            : "text-neutral-700 hover:text-primary"
        )}
        onClick={() => onChange('password')}
      >
        账号登录
      </button>
      <button
        type="button"
        className={cn(
          "py-2.5 px-1 text-[14px] font-medium transition-all relative",
          value === 'phoneCode'
            ? "text-primary border-b-2 border-primary"
            : "text-neutral-700 hover:text-primary"
        )}
        onClick={() => onChange('phoneCode')}
      >
        手机号登录
      </button>
    </div>
  );
}
