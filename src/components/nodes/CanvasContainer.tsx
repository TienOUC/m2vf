import { useRef } from 'react';

interface CanvasContainerProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

const CanvasContainer: React.FC<CanvasContainerProps> = ({ canvasRef }) => {
  return (
    <div className="flex items-center justify-center overflow-auto">
      <canvas
        ref={canvasRef}
        className="shadow-2xl rounded-lg"
        style={{
          maxWidth: '100%',
          maxHeight: '100%',
          cursor: 'default',
          display: 'block',
          backgroundColor: '#f5f5f5'
        }}
      />
    </div>
  );
};

export default CanvasContainer;