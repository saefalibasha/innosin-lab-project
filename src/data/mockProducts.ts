import { Product } from '@/types/product';

// Mock product data for when Supabase is unavailable
// This represents the expected structure after database fixes are applied

export const mockProductSeries = [
  {
    id: 'knee-space-series',
    name: 'Knee Space Series',
    category: 'Innosin Lab',
    dimensions: '700-1200×750×850 mm',
    modelPath: '/assets/series/knee-space/model.glb',
    thumbnail: '/assets/series/knee-space/thumbnail.jpg',
    overviewImage: '/assets/series/knee-space/overview.jpg',
    seriesOverviewImage: '/assets/series/knee-space/overview.jpg',
    images: [
      '/assets/series/knee-space/overview.jpg',
      '/assets/series/knee-space/detail-1.jpg',
      '/assets/series/knee-space/detail-2.jpg'
    ],
    description: 'Professional laboratory bench system with modular design',
    fullDescription: 'The Knee Space series offers a comprehensive range of laboratory benches designed for modern research facilities. Each product in this series maintains consistent quality standards and design principles while offering various configurations to meet specific laboratory requirements.',
    specifications: [
      'Modular Design',
      'Chemical Resistant',
      'Adjustable Height',
      'Integrated Service Fixtures'
    ],
    finishes: [
      {
        type: 'powder-coat' as const,
        name: 'Powder Coat',
        modelPath: '/assets/series/knee-space/model-pc.glb',
        thumbnail: '/assets/series/knee-space/thumbnail-pc.jpg'
      },
      {
        type: 'stainless-steel' as const,
        name: 'Stainless Steel',
        modelPath: '/assets/series/knee-space/model-ss.glb',
        thumbnail: '/assets/series/knee-space/thumbnail-ss.jpg'
      }
    ],
    variants: [
      {
        id: 'ks700-pc',
        size: '700mm',
        dimensions: '700×750×850 mm',
        type: 'standard',
        orientation: 'None' as const,
        modelPath: '/assets/products/KS700-PC/model.glb',
        thumbnail: '/assets/products/KS700-PC/thumbnail.jpg',
        images: ['/assets/products/KS700-PC/detail-1.jpg']
      },
      {
        id: 'ks750-pc',
        size: '750mm',
        dimensions: '750×750×850 mm',
        type: 'standard',
        orientation: 'None' as const,
        modelPath: '/assets/products/KS750-PC/model.glb',
        thumbnail: '/assets/products/KS750-PC/thumbnail.jpg',
        images: ['/assets/products/KS750-PC/detail-1.jpg']
      },
      {
        id: 'ks800-pc',
        size: '800mm',
        dimensions: '800×750×850 mm',
        type: 'standard',
        orientation: 'None' as const,
        modelPath: '/assets/products/KS800-PC/model.glb',
        thumbnail: '/assets/products/KS800-PC/thumbnail.jpg',
        images: ['/assets/products/KS800-PC/detail-1.jpg']
      },
      {
        id: 'ks900-pc',
        size: '900mm',
        dimensions: '900×750×850 mm',
        type: 'standard',
        orientation: 'None' as const,
        modelPath: '/assets/products/KS900-PC/model.glb',
        thumbnail: '/assets/products/KS900-PC/thumbnail.jpg',
        images: ['/assets/products/KS900-PC/detail-1.jpg']
      },
      {
        id: 'ks1000-pc',
        size: '1000mm',
        dimensions: '1000×750×850 mm',
        type: 'standard',
        orientation: 'None' as const,
        modelPath: '/assets/products/KS1000-PC/model.glb',
        thumbnail: '/assets/products/KS1000-PC/thumbnail.jpg',
        images: ['/assets/products/KS1000-PC/detail-1.jpg']
      },
      {
        id: 'ks1200-pc',
        size: '1200mm',
        dimensions: '1200×750×850 mm',
        type: 'standard',
        orientation: 'None' as const,
        modelPath: '/assets/products/KS1200-PC/model.glb',
        thumbnail: '/assets/products/KS1200-PC/thumbnail.jpg',
        images: ['/assets/products/KS1200-PC/detail-1.jpg']
      }
    ]
  },
  {
    id: 'mobile-cabinet-750-series',
    name: 'Mobile Cabinet 750mm Series',
    category: 'Innosin Lab',
    dimensions: '500-900×500×650 mm',
    modelPath: '/assets/series/mobile-cabinet-750/model.glb',
    thumbnail: '/assets/series/mobile-cabinet-750/thumbnail.jpg',
    overviewImage: '/assets/series/mobile-cabinet-750/overview.jpg',
    seriesOverviewImage: '/assets/series/mobile-cabinet-750/overview.jpg',
    images: [
      '/assets/series/mobile-cabinet-750/overview.jpg',
      '/assets/series/mobile-cabinet-750/detail-1.jpg'
    ],
    description: 'Mobile storage solutions for 750mm bench height',
    fullDescription: 'The Mobile Cabinet 750mm series provides flexible storage solutions designed specifically for 750mm bench height configurations. These mobile units feature locking casters and various storage configurations to meet diverse laboratory needs.',
    specifications: [
      'Mobile Design',
      'Locking Casters',
      'Chemical Resistant',
      '750mm Bench Compatible'
    ],
    finishes: [
      {
        type: 'powder-coat' as const,
        name: 'Powder Coat',
        modelPath: '/assets/series/mobile-cabinet-750/model-pc.glb',
        thumbnail: '/assets/series/mobile-cabinet-750/thumbnail-pc.jpg'
      },
      {
        type: 'stainless-steel' as const,
        name: 'Stainless Steel',
        modelPath: '/assets/series/mobile-cabinet-750/model-ss.glb',
        thumbnail: '/assets/series/mobile-cabinet-750/thumbnail-ss.jpg'
      }
    ],
    variants: [
      {
        id: 'mc750-comb-lh-pc',
        size: 'Combination LH',
        dimensions: '500×500×650 mm',
        type: 'combination',
        orientation: 'LH' as const,
        modelPath: '/assets/products/MC750-COMB-LH-PC/model.glb',
        thumbnail: '/assets/products/MC750-COMB-LH-PC/thumbnail.jpg',
        images: ['/assets/products/MC750-COMB-LH-PC/detail-1.jpg']
      },
      {
        id: 'mc750-comb-rh-pc',
        size: 'Combination RH',
        dimensions: '500×500×650 mm',
        type: 'combination',
        orientation: 'RH' as const,
        modelPath: '/assets/products/MC750-COMB-RH-PC/model.glb',
        thumbnail: '/assets/products/MC750-COMB-RH-PC/thumbnail.jpg',
        images: ['/assets/products/MC750-COMB-RH-PC/detail-1.jpg']
      },
      {
        id: 'mc750-dd-pc',
        size: 'Double Door',
        dimensions: '750×500×650 mm',
        type: 'double-door',
        orientation: 'None' as const,
        modelPath: '/assets/products/MC750-DD-PC/model.glb',
        thumbnail: '/assets/products/MC750-DD-PC/thumbnail.jpg',
        images: ['/assets/products/MC750-DD-PC/detail-1.jpg']
      },
      {
        id: 'mc750-3dwr-pc',
        size: '3 Drawers',
        dimensions: '500×500×650 mm',
        type: 'drawer',
        orientation: 'None' as const,
        modelPath: '/assets/products/MC750-3DWR-PC/model.glb',
        thumbnail: '/assets/products/MC750-3DWR-PC/thumbnail.jpg',
        images: ['/assets/products/MC750-3DWR-PC/detail-1.jpg']
      }
    ]
  },
  {
    id: 'wall-cabinet-series',
    name: 'Wall Cabinet Series',
    category: 'Innosin Lab',
    dimensions: '450-750×330×750 mm',
    modelPath: '/assets/series/wall-cabinet/model.glb',
    thumbnail: '/assets/series/wall-cabinet/thumbnail.jpg',
    overviewImage: '/assets/series/wall-cabinet/overview.jpg',
    seriesOverviewImage: '/assets/series/wall-cabinet/overview.jpg',
    images: [
      '/assets/series/wall-cabinet/overview.jpg',
      '/assets/series/wall-cabinet/detail-1.jpg'
    ],
    description: 'Space-efficient wall-mounted storage solutions',
    fullDescription: 'The Wall Cabinet series maximizes laboratory space efficiency with wall-mounted storage solutions. Available in both glass and solid door configurations, these cabinets provide secure storage while maintaining easy access to laboratory supplies.',
    specifications: [
      'Wall Mounted',
      'Space Efficient',
      'Multiple Door Options',
      'Chemical Resistant'
    ],
    finishes: [
      {
        type: 'powder-coat' as const,
        name: 'Powder Coat',
        modelPath: '/assets/series/wall-cabinet/model-pc.glb',
        thumbnail: '/assets/series/wall-cabinet/thumbnail-pc.jpg'
      }
    ],
    variants: [
      {
        id: 'wc-glass-dd-750-pc',
        size: 'Glass Double Door 750mm',
        dimensions: '750×330×750 mm',
        type: 'glass-door',
        orientation: 'None' as const,
        modelPath: '/assets/products/WC-GLASS-DD-750-PC/model.glb',
        thumbnail: '/assets/products/WC-GLASS-DD-750-PC/thumbnail.jpg',
        images: ['/assets/products/WC-GLASS-DD-750-PC/detail-1.jpg']
      },
      {
        id: 'wc-glass-sd-450-lh-pc',
        size: 'Glass Single Door 450mm LH',
        dimensions: '450×330×750 mm',
        type: 'glass-door',
        orientation: 'LH' as const,
        modelPath: '/assets/products/WC-GLASS-SD-450-LH-PC/model.glb',
        thumbnail: '/assets/products/WC-GLASS-SD-450-LH-PC/thumbnail.jpg',
        images: ['/assets/products/WC-GLASS-SD-450-LH-PC/detail-1.jpg']
      },
      {
        id: 'wc-solid-dd-750-pc',
        size: 'Solid Double Door 750mm',
        dimensions: '750×330×750 mm',
        type: 'solid-door',
        orientation: 'None' as const,
        modelPath: '/assets/products/WC-SOLID-DD-750-PC/model.glb',
        thumbnail: '/assets/products/WC-SOLID-DD-750-PC/thumbnail.jpg',
        images: ['/assets/products/WC-SOLID-DD-750-PC/detail-1.jpg']
      }
    ]
  }
];

export const mockCategories = ['Innosin Lab'];

// Mock data for admin series management
export const mockAdminSeries = mockProductSeries.map(series => ({
  name: series.name.replace(' Series', ''),
  products: [
    // Series parent
    {
      id: series.id,
      name: series.name,
      product_code: series.id.toUpperCase(),
      category: series.category,
      product_series: series.name.replace(' Series', ''),
      finish_type: 'PC',
      is_active: true,
      thumbnail_path: series.thumbnail,
      model_path: series.modelPath,
      dimensions: series.dimensions,
      description: series.description,
      full_description: series.fullDescription,
      orientation: 'None',
      door_type: null,
      drawer_count: null,
      specifications: series.specifications,
      keywords: ['laboratory', 'furniture', series.name.toLowerCase()],
      company_tags: ['Innosin Lab'],
      additional_images: series.images,
      overview_image_path: series.overviewImage,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    // Variants
    ...series.variants.map((variant, index) => ({
      id: variant.id,
      name: `${series.name.replace(' Series', '')} ${variant.size}`,
      product_code: variant.id.toUpperCase(),
      category: series.category,
      product_series: series.name.replace(' Series', ''),
      finish_type: 'PC',
      is_active: true,
      thumbnail_path: variant.thumbnail,
      model_path: variant.modelPath,
      dimensions: variant.dimensions,
      description: `${series.description} - ${variant.size}`,
      full_description: series.fullDescription,
      orientation: variant.orientation,
      door_type: variant.type.includes('door') ? variant.type : null,
      drawer_count: variant.type === 'drawer' ? 3 : null,
      specifications: series.specifications,
      keywords: ['laboratory', 'furniture', series.name.toLowerCase(), variant.size.toLowerCase()],
      company_tags: ['Innosin Lab'],
      additional_images: variant.images,
      overview_image_path: variant.thumbnail,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }))
  ],
  totalProducts: series.variants.length + 1,
  activeProducts: series.variants.length + 1,
  completionRate: 100,
  hasAssets: series.variants.length + 1
}));

export default {
  mockProductSeries,
  mockCategories,
  mockAdminSeries
};