import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface TermsCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function TermsCheckbox({ checked, onChange }: TermsCheckboxProps) {
  return (
    <div className="flex items-start gap-3">
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={cn(
          "w-5 h-5 rounded-md flex items-center justify-center transition-colors flex-shrink-0",
          checked
            ? "bg-primary text-white"
            : "bg-white border border-neutral-300 hover:bg-neutral-50"
        )}
      >
        {checked && <Check className="w-3 h-3" />}
      </button>
      <span className="text-[13px] text-neutral-500">
        我已阅读并同意{' '}
        <Link href="/terms" className="text-neutral-700 hover:text-neutral-900 transition-colors">
          服务条款
        </Link>
        {' '}和{' '}
        <Link href="/privacy" className="text-neutral-700 hover:text-neutral-900 transition-colors">
          隐私政策
        </Link>
      </span>
    </div>
  );
}
