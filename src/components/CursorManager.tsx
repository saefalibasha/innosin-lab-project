
import { useEffect } from 'react';

interface CursorManagerProps {
  currentTool: string;
  isDrawing?: boolean;
  canvasElement?: HTMLElement | null;
}

const CursorManager: React.FC<CursorManagerProps> = ({ 
  currentTool, 
  isDrawing = false, 
  canvasElement 
}) => {
  useEffect(() => {
    const element = canvasElement || document.body;
    
    let cursor = 'default';
    
    switch (currentTool) {
      case 'wall':
      case 'interior-wall':
      case 'door':
        cursor = isDrawing ? 'crosshair' : 'crosshair';
        break;
      case 'select':
        cursor = 'pointer';
        break;
      case 'rotate':
        cursor = 'grab';
        break;
      case 'eraser':
        cursor = 'not-allowed';
        break;
      case 'pan':
        cursor = isDrawing ? 'grabbing' : 'grab';
        break;
      default:
        cursor = 'default';
    }
    
    element.style.cursor = cursor;
    
    return () => {
      element.style.cursor = 'default';
    };
  }, [currentTool, isDrawing, canvasElement]);

  return null;
};

export default CursorManager;
