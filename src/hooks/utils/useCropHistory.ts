import { useEnhancedCropHistory } from './useEnhancedCropHistory';
import type { FabricObject } from '@/lib/types/editor/fabric';

export const useCropHistory = (maxHistorySteps: number = 20) => {
  const {
    saveHistory,
    setInitialState
  } = useEnhancedCropHistory({
    maxHistorySteps,
    autoSave: true,
    saveDelay: 300
  });

  const saveCurrentState = (cropBox: FabricObject | null, image: FabricObject | null) => {
    if (!cropBox || !image) return;
    saveHistory(cropBox, image);
  };

  return {
    saveHistory: saveCurrentState,
    setInitialState
  };
};