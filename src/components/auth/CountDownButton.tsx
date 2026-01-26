import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface CountDownButtonProps {
  isLoading?: boolean;
  disabled?: boolean;
  onClick: () => void;
  duration?: number;
  initialText?: string;
  countDownText?: (seconds: number) => string;
  className?: string;
}

export function CountDownButton({
  isLoading = false,
  disabled = false,
  onClick,
  duration = 60,
  initialText = '获取验证码',
  countDownText = (seconds) => `${seconds}秒后重新获取`,
  className = ''
}: CountDownButtonProps) {
  const [countDown, setCountDown] = useState(0);
  const [isCounting, setIsCounting] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    
    if (isCounting && countDown > 0) {
      timer = setTimeout(() => {
        setCountDown(countDown - 1);
      }, 1000);
    } else if (countDown === 0 && isCounting) {
      setIsCounting(false);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isCounting, countDown]);

  const handleClick = () => {
    if (isCounting || isLoading || disabled) return;
    
    setCountDown(duration);
    setIsCounting(true);
    onClick();
  };

  const isButtonDisabled = isCounting || isLoading || disabled;
  
  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isButtonDisabled}
      className={cn(
        "py-3.5 px-4 rounded-xl text-[14px] font-medium transition-colors",
        "bg-primary text-white hover:bg-primary/90 focus:outline-none",
        isButtonDisabled && "opacity-70 cursor-not-allowed",
        className
      )}
    >
      {isLoading ? '发送中...' : (isCounting ? countDownText(countDown) : initialText)}
    </button>
  );
}
