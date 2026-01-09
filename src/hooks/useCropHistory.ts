import { useHistory } from '@/hooks/useHistory';
import type { CropHistoryRecord, FabricObject, FabricCanvas } from '@/types/editor/fabric';

export const useCropHistory = (maxHistorySteps: number = 5) => {
  const { save, undo, redo, canUndo, canRedo } = useHistory<CropHistoryRecord>(maxHistorySteps);

  const saveCurrentState = (cropBox: FabricObject | null, image: FabricObject | null) => {
    if (!cropBox || !image) return;

    const record: CropHistoryRecord = {
      cropBox: {
        left: cropBox.left || 0,
        top: cropBox.top || 0,
        width: cropBox.width || 0,
        height: cropBox.height || 0
      },
      scaleX: image.scaleX || 1,
      scaleY: image.scaleY || 1
    };

    save(record);
  };

  const restoreFromHistory = (record: CropHistoryRecord, cropBox: FabricObject | null, image: FabricObject | null, canvas: FabricCanvas | null) => {
    if (!cropBox || !image || !canvas) return;

    cropBox.set({
      left: record.cropBox.left,
      top: record.cropBox.top,
      width: record.cropBox.width,
      height: record.cropBox.height
    });

    image.set({
      scaleX: record.scaleX,
      scaleY: record.scaleY
    });

    canvas.renderAll();
  };

  return {
    saveHistory: saveCurrentState,
    undoHistory: undo,
    redoHistory: redo,
    canUndo,
    canRedo,
    restoreFromHistory
  };
};