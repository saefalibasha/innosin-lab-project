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
    
    // Debug logging to understand product structure
    console.log('[AddWorktopButton] Selected products:', products.map(p => ({
      id: p.id,
      name: p.name,
      productId: p.productId,
      product_code: (p as any).product_code,
      category: p.category,
      product_series: (p as any).product_series
    })));
    
    // All selected products must be valid: none wall-mounted, and at least one supports a worktop
    const canAdd = products.every(p => {
      const behavior = getProductBehavior(p);
      console.log('[AddWorktopButton] Product behavior:', {
        productId: p.id,
        name: p.name,
        behavior
      });
      return !behavior.canMountOnWall; // disallow wall-mounted items in selection
    }) && products.some(p => getProductBehavior(p).canSupportWorktop);
    
    console.log('[AddWorktopButton] Can add worktop:', canAdd);
    return canAdd;
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

      console.log('[AddWorktopButton] Cabinet dimensions:', {
        id: cabinet.id,
        name: cabinet.name,
        position: cabinet.position,
        dimensions: cabinet.dimensions,
        originalDimensions: cabinet.originalDimensions
      });

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
    // CRITICAL: Align with 3D coordinate system
    // - width (X-axis) = left-right span
    // - length (Z-axis) = front-back span (depth)
    const worktopWidthPx = (maxX - minX) + (overhangPx * 2);  // Left-right
    const worktopDepthPx = (maxY - minY) + (overhangPx * 2);  // Front-back
    const worktopWidthMm = worktopWidthPx / scale;
    const worktopDepthMm = worktopDepthPx / scale;

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    const worktopData: Partial<PlacedProduct> = {
      id: `worktop-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      productId: 'worktop-custom',
      name: 'Custom Worktop',
      category: 'Worktop',
      position: { x: centerX, y: centerY },
      rotation: 0,
      dimensions: {
        width: worktopWidthPx,    // Left-right (X)
        length: worktopDepthPx,   // Front-back (Z)
        height: 18 * scale,       // 18mm standard thickness (Y)
      },
      originalDimensions: {
        width: worktopWidthMm,    // Left-right in mm
        length: worktopDepthMm,   // Front-back in mm
        height: 18,
      },
      color: '#4A4A4A', // Dark grey worktop
      heightOffset: maxHeight,
      placedOnProductId: cabinets[0].id,
      isWorktop: true,
    };

    console.log('[AddWorktopButton] Created worktop:', {
      dimensions: { widthMm: worktopWidthMm, depthMm: worktopDepthMm },
      position: { x: centerX, y: centerY },
      cabinets: cabinets.length,
      cabinetBounds: { minX, maxX, minY, maxY },
      overhang: OVERHANG_MM
    });

    onAddWorktop(worktopData);
    toast.success(`Worktop added spanning ${cabinets.length} cabinet${cabinets.length > 1 ? 's' : ''}`);
  };

  // Always render the button; disable when not applicable so users can discover it
  const disabledReason = selectedProducts.length === 0
    ? 'Select at least one base/modular cabinet'
    : 'Selection includes a wall-mounted item or no base cabinets';

  return (
    <Button
      onClick={handleAddWorktop}
      size="sm"
      variant="default"
      className="gap-2"
      disabled={!canAddWorktop}
      title={!canAddWorktop ? disabledReason : 'Add a worktop spanning selected cabinets'}
    >
      <Plus className="h-4 w-4" />
      Add Worktop
    </Button>
  );
};
