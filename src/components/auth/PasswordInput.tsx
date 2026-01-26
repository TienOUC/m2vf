import { useState } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';

interface PasswordInputProps {
  id: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  touched?: boolean;
}

export function PasswordInput({ 
  id, 
  name, 
  value, 
  onChange, 
  onBlur, 
  placeholder = '请输入密码', 
  required = true,
  error,
  touched
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div>
      <label className="block text-[13px] font-medium mb-2 text-gray-700">
        密码
      </label>
      <div className="relative">
        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <input
          id={id}
          name={name}
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          required={required}
          className="w-full rounded-xl pl-11 pr-12 py-3.5 text-[14px] bg-white border border-neutral-200 text-gray-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-300 transition-colors"
          placeholder={placeholder}
          value={value}
          onBlur={onBlur}
          onChange={onChange}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
        >
          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {touched && error && (
        <p className="mt-1 text-sm text-error-700">{error}</p>
      )}
    </div>
  );
}
