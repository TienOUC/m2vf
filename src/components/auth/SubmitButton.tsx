import { cn } from '@/lib/utils';

interface SubmitButtonProps {
  children: React.ReactNode;
  type?: 'submit' | 'button';
  disabled?: boolean;
  isLoading?: boolean;
}

export function SubmitButton({ 
  children, 
  type = 'submit', 
  disabled = false,
  isLoading = false
}: SubmitButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={cn(
        "w-full py-3.5 rounded-xl text-[14px] font-medium transition-all flex items-center justify-center gap-2",
        (disabled || isLoading)
          ? "bg-neutral-400 text-white cursor-not-allowed"
          : "bg-primary text-white hover:bg-primary/90"
      )}
    >
      {isLoading ? (
        <>
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          {children}
        </>
      ) : (
        children
      )}
    </button>
  );
}
