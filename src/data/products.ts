
import { PlacedProduct } from '@/types/floorPlanTypes';

export interface Product {
  id: string;
  name: string;
  category: string;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  color?: string;
  modelPath?: string;
  thumbnail?: string;
  description?: string;
  price?: number;
}

export const initialProducts: Product[] = [
  {
    id: 'mc-pc-755065',
    name: 'Mobile Cabinet MC-PC (755065)',
    category: 'Mobile Cabinets',
    dimensions: {
      length: 750,
      width: 500,
      height: 650
    },
    color: 'hsl(var(--muted))',
    modelPath: '/products/innosin-mc-pc-755065/MC-PC (755065).glb',
    thumbnail: '/products/innosin-mc-pc-755065/MC-PC (755065).jpg',
    description: 'Mobile laboratory cabinet with single door storage designed for 750mm height benches.',
    price: 1250
  },
  {
    id: 'mc-pc-755080',
    name: 'Mobile Cabinet MC-PC (755080)',
    category: 'Mobile Cabinets',
    dimensions: {
      length: 750,
      width: 500,
      height: 800
    },
    color: 'hsl(var(--muted))',
    modelPath: '/products/innosin-mc-pc-755080/MC-PC (755080).glb',
    thumbnail: '/products/innosin-mc-pc-755080/MC-PC (755080).jpg',
    description: 'Mobile laboratory cabinet with single door storage designed for 900mm height benches.',
    price: 1350
  },
  {
    id: 'wcg-pc-753375',
    name: 'Wall Cabinet WCG-PC (753375)',
    category: 'Wall Cabinets',
    dimensions: {
      length: 750,
      width: 330,
      height: 750
    },
    color: 'hsl(var(--muted))',
    modelPath: '/products/innosin-wcg-pc-753375/WCG-PC (753375).glb',
    thumbnail: '/products/innosin-wcg-pc-753375/WCG-PC (753375).jpg',
    description: 'Wall-mounted storage cabinet with glass door providing space-efficient storage.',
    price: 850
  },
  {
    id: 'tcg-pc-754018',
    name: 'Tall Cabinet TCG-PC (754018)',
    category: 'Tall Cabinets',
    dimensions: {
      length: 750,
      width: 400,
      height: 1800
    },
    color: 'hsl(var(--muted))',
    modelPath: '/products/innosin-tcg-pc-754018/TCG-PC (754018).glb',
    thumbnail: '/products/innosin-tcg-pc-754018/TCG-PC (754018).jpg',
    description: 'Tall storage cabinet with glass door providing secure storage with excellent visibility.',
    price: 1850
  },
  {
    id: 'or-pc-604518',
    name: 'Open Rack OR-PC (604518)',
    category: 'Open Racks',
    dimensions: {
      length: 380,
      width: 380,
      height: 1800
    },
    color: 'hsl(var(--muted))',
    modelPath: '/products/innosin-or-pc-604518/OR-PC-3838 (604518).glb',
    thumbnail: '/products/innosin-or-pc-604518/OR-PC-3838 (604518).jpg',
    description: 'Open rack storage system providing flexible and accessible storage solutions.',
    price: 750
  }
];

// Export as 'products' for backward compatibility
export const products = initialProducts;
