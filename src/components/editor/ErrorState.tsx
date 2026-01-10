interface ErrorStateProps {
  error: string;
  onRetry?: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({ error, onRetry }) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-black/80 text-white">
      <div className="text-center p-8">
        <p className="text-xl mb-4">加载失败</p>
        <p className="text-sm text-gray-300 mb-4">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-md transition-colors"
          >
            刷新页面
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorState;