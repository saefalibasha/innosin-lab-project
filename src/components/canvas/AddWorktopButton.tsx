import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { PlacedProduct } from '@/types/floorPlanTypes';
import { getProductBehavior } from '@/utils/productBehaviors';
import { toast } from 'sonner';

interface AddWorktopButtonProps {
  selectedProducts: string[];
  allProducts: PlacedProduct[];
  onAddWorktop: (worktopData: Partial<PlacedProduct>) => void;
  scale: number;
}

export const AddWorktopButton: React.FC<AddWorktopButtonProps> = ({
  selectedProducts,
  allProducts,
  onAddWorktop,
  scale,
}) => {
  // Check if selected products can support a worktop
  const canAddWorktop = React.useMemo(() => {
    if (selectedProducts.length === 0) return false;
    
    const products = selectedProducts
      .map(id => allProducts.find(p => p.id === id))
      .filter((p): p is PlacedProduct => p !== undefined);
    
    // All selected products must be able to support worktops
    return products.every(p => {
      const behavior = getProductBehavior(p);
      return behavior.canSupportWorktop && !behavior.canMountOnWall;
    });
  }, [selectedProducts, allProducts]);

  const handleAddWorktop = () => {
    const cabinets = selectedProducts
      .map(id => allProducts.find(p => p.id === id))
      .filter((p): p is PlacedProduct => p !== undefined);

    if (cabinets.length === 0) {
      toast.error('No cabinets selected');
      return;
    }

    // Calculate bounding box of all selected cabinets
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    let maxHeight = 0;

    cabinets.forEach(cabinet => {
      const widthPx = cabinet.dimensions.width || 0;
      const depthPx = cabinet.dimensions.length || 0;
      const heightMm = cabinet.originalDimensions?.height || 850;

      const left = cabinet.position.x - widthPx / 2;
      const right = cabinet.position.x + widthPx / 2;
      const front = cabinet.position.y - depthPx / 2;
      const back = cabinet.position.y + depthPx / 2;

      minX = Math.min(minX, left);
      maxX = Math.max(maxX, right);
      minY = Math.min(minY, front);
      maxY = Math.max(maxY, back);
      maxHeight = Math.max(maxHeight, heightMm);
    });

    const OVERHANG_MM = 25;
    const overhangPx = OVERHANG_MM * scale;

    // Calculate worktop dimensions and position
    const worktopWidthPx = (maxX - minX) + (overhangPx * 2);
    const worktopDepthPx = (maxY - minY) + (overhangPx * 2);
    const worktopWidthMm = worktopWidthPx / scale;
    const worktopDepthMm = worktopDepthPx / scale;

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    const worktopData: Partial<PlacedProduct> = {
      id: `worktop-${Date.now()}`,
      productId: 'worktop-custom',
      name: 'Custom Worktop',
      category: 'Worktop',
      position: { x: centerX, y: centerY },
      rotation: 0,
      dimensions: {
        width: worktopWidthPx,
        length: worktopDepthPx,
        height: 18 * scale, // 18mm standard thickness
      },
      originalDimensions: {
        width: worktopWidthMm,
        length: worktopDepthMm,
        height: 18,
      },
      color: '#8B4513',
      heightOffset: maxHeight,
      placedOnProductId: cabinets[0].id,
      isWorktop: true,
    };

    onAddWorktop(worktopData);
    toast.success(`Worktop added spanning ${cabinets.length} cabinet${cabinets.length > 1 ? 's' : ''}`);
  };

  if (!canAddWorktop) return null;

  return (
    <Button
      onClick={handleAddWorktop}
      size="sm"
      variant="default"
      className="gap-2"
    >
      <Plus className="h-4 w-4" />
      Add Worktop
    </Button>
  );
};
