interface FormErrorMessageProps {
  message: string;
}

export function FormErrorMessage({ message }: FormErrorMessageProps) {
  return (
    <div className="p-4 rounded-xl bg-error-50 border border-error-200">
      <p className="text-sm text-error-700 text-center">
        {message.includes('网络') ||
        message.includes('超时') ||
        message.includes('服务器') ? (
          <>
            <span className="font-medium">系统提示：</span>
            {message}
            <br />
            <span className="text-xs text-error-600 mt-1 block">
              请检查网络连接或联系管理员
            </span>
          </>
        ) : (
          message
        )}
      </p>
    </div>
  );
}
