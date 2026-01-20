interface LoadingStateProps {
  message?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({ message = "正在加载图片编辑器..." }) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-black/80 text-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-lg">{message}</p>
      </div>
    </div>
  );
};

export default LoadingState;