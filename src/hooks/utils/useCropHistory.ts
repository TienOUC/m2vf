import { useEnhancedCropHistory } from './useEnhancedCropHistory';
import type { CropHistoryRecord, FabricObject, FabricCanvas } from '@/lib/types/editor/fabric';

export const useCropHistory = (maxHistorySteps: number = 20) => {
  const {
    saveHistory,
    undo,
    redo,
    canUndo,
    canRedo,
    applyHistoryRecord,
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

  const restoreFromHistory = (record: CropHistoryRecord, cropBox: FabricObject | null, image: FabricObject | null, canvas: FabricCanvas | null) => {
    if (!cropBox || !image || !canvas) return;
    applyHistoryRecord(record, cropBox, image, canvas);
  };

  return {
    saveHistory: saveCurrentState,
    undoHistory: undo,
    redoHistory: redo,
    canUndo,
    canRedo,
    restoreFromHistory,
    setInitialState
  };
};