import React, { useEffect, useState } from 'react';

interface MessageProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number; // 持续时间，单位毫秒，默认1000ms
  onClose: () => void;
}

const Message: React.FC<MessageProps> = ({ 
  message, 
  type = 'info', 
  duration = 1000, 
  onClose 
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // 动画效果：组件挂载后显示
    setVisible(true);
    
    const timer = setTimeout(() => {
      setVisible(false);
      // 在动画结束后调用onClose
      setTimeout(() => {
        onClose();
      }, 300); // 与CSS过渡时间保持一致
    }, duration);

    return () => {
      clearTimeout(timer);
    };
  }, [duration, onClose]);

  const getMessageStyle = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500 text-white';
      case 'error':
        return 'bg-red-500 text-white';
      case 'warning':
        return 'bg-yellow-500 text-white';
      case 'info':
      default:
        return 'bg-blue-500 text-white';
    }
  };

  return (
    <div 
      className={`
        fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-4 py-3 rounded-lg shadow-lg
        transition-opacity duration-300 ease-in-out max-w-[80%] w-auto
        ${visible ? 'opacity-100' : 'opacity-0'}
        ${getMessageStyle()}
      `}
    >
      <div className="flex items-center">
        <span className="mr-2">
          {type === 'success' && (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
          {type === 'error' && (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          {type === 'warning' && (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          )}
          {type === 'info' && (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </span>
        <span className="text-sm">{message}</span>
      </div>
    </div>
  );
};

export default Message;