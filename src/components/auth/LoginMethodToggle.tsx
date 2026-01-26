import { cn } from '@/lib/utils';

interface LoginMethodToggleProps {
  value: 'password' | 'emailCode' | 'phoneCode';
  onChange: (method: 'password' | 'emailCode' | 'phoneCode') => void;
}

export function LoginMethodToggle({ value, onChange }: LoginMethodToggleProps) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <button
        type="button"
        className={cn(
          "py-2.5 px-4 rounded-xl text-[14px] font-medium transition-colors",
          value === 'password'
            ? "bg-primary text-white"
            : "bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50"
        )}
        onClick={() => onChange('password')}
      >
        密码登录
      </button>
      <button
        type="button"
        className={cn(
          "py-2.5 px-4 rounded-xl text-[14px] font-medium transition-colors",
          value === 'emailCode'
            ? "bg-primary text-white"
            : "bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50"
        )}
        onClick={() => onChange('emailCode')}
      >
        邮箱验证码
      </button>
      <button
        type="button"
        className={cn(
          "py-2.5 px-4 rounded-xl text-[14px] font-medium transition-colors",
          value === 'phoneCode'
            ? "bg-primary text-white"
            : "bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50"
        )}
        onClick={() => onChange('phoneCode')}
      >
        手机验证码
      </button>
    </div>
  );
}
