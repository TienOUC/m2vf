import { useEffect, useRef, useState } from 'react';
import type { Fabric, EditorState } from '@/types/fabric-image-editor';

export const useFabricCanvas = () => {
  const fabricRef = useRef<Fabric | null>(null);
  const [fabricLoaded, setFabricLoaded] = useState(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);

  // 加载 fabric.js
  useEffect(() => {
    const loadFabric = async () => {
      try {
        if (typeof window !== 'undefined' && !fabricRef.current) {
          const fabricModule = await import('fabric');
          fabricRef.current = fabricModule.default || fabricModule;
          setFabricLoaded(true);
        }
      } catch (error) {
        console.error('Failed to load fabric.js:', error);
        setLoadingError('Failed to load fabric.js. Please refresh the page.');
      }
    };

    loadFabric();

    return () => {
      setFabricLoaded(false);
      fabricRef.current = null;
    };
  }, []);

  const getEditorState = (): EditorState => ({
    fabricLoaded,
    loadingError
  });

  return {
    fabricRef,
    fabricLoaded,
    loadingError,
    getEditorState
  };
};