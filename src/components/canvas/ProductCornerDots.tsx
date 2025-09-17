import React from 'react';
import { PlacedProduct, Point } from '@/types/floorPlanTypes';

interface ProductCornerDotsProps {
  product: PlacedProduct;
  isSelected: boolean;
  scale: number;
}

const ProductCornerDots: React.FC<ProductCornerDotsProps> = ({
  product,
  isSelected,
  scale
}) => {
  if (!isSelected) return null;

  const getProductCorners = (p: PlacedProduct): Point[] => {
    const L = p.dimensions.length ?? 40;
    const W = p.dimensions.width ?? 30;
    const hx = L / 2;
    const hy = W / 2;
    
    const corners = [
      { x: -hx, y: -hy }, // top-left
      { x: hx, y: -hy },  // top-right
      { x: hx, y: hy },   // bottom-right
      { x: -hx, y: hy }   // bottom-left
    ];

    const rotation = p.rotation || 0;
    return corners.map(corner => {
      const rotated = {
        x: corner.x * Math.cos(rotation) - corner.y * Math.sin(rotation),
        y: corner.x * Math.sin(rotation) + corner.y * Math.cos(rotation)
      };
      return {
        x: p.position.x + rotated.x,
        y: p.position.y + rotated.y
      };
    });
  };

  const corners = getProductCorners(product);

  return (
    <>
      {corners.map((corner, index) => (
        <circle
          key={index}
          cx={corner.x}
          cy={corner.y}
          r={4}
          fill="#2563eb"
          stroke="#ffffff"
          strokeWidth={2}
          className="cursor-pointer"
        />
      ))}
    </>
  );
};

export default ProductCornerDots;