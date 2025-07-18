// Utility functions for managing product assets and data
// This file handles the generation of product data from the public/products directory structure

import { Product } from '@/types/product';

// Supabase storage URL base
const SUPABASE_STORAGE_URL = 'https://wfdbqfbodppniqzoxnyf.supabase.co/storage/v1/object/public/documents';

// Dynamic asset loading utility that integrates uploaded files with existing products
const loadUploadedAssets = (): { [key: string]: { glb?: string; jpg?: string } } => {
  const uploadedAssets: { [key: string]: { glb?: string; jpg?: string } } = {};
  
  try {
    // Overview images for Mobile Cabinet Series uploaded through the asset manager
    const overviewAssets = {
      'mobile-cabinet-750mm-overview': {
        jpg: `${SUPABASE_STORAGE_URL}/products/mobile-cabinet-750mm-overview/750mm-height-bench-overview.jpg`
      },
      'mobile-cabinet-900mm-overview': {
        jpg: `${SUPABASE_STORAGE_URL}/products/mobile-cabinet-900mm-overview/900mm-height-bench-overview.jpg`
      }
    };
    
    // All uploaded individual product assets from the asset management system
    // These are automatically detected from the Supabase storage bucket
    const uploadedProductAssets = detectUploadedProducts();
    
    return { ...uploadedAssets, ...overviewAssets, ...uploadedProductAssets };
  } catch (error) {
    console.warn('Error loading uploaded assets:', error);
    return {};
  }
};

// Detect products uploaded through the asset management system
const detectUploadedProducts = (): { [key: string]: { glb?: string; jpg?: string } } => {
  // Map uploaded assets from Supabase storage bucket
  const uploadedAssets = {
    // Innosin Lab KS Series - Laboratory Fume Hoods
    'innosin-ks-700': {
      glb: `${SUPABASE_STORAGE_URL}/products/KS700/KS700.glb`,
      jpg: `${SUPABASE_STORAGE_URL}/products/KS700/KS700.jpg`
    },
    'innosin-ks-750': {
      glb: `${SUPABASE_STORAGE_URL}/products/KS750/KS750.glb`,
      jpg: `${SUPABASE_STORAGE_URL}/products/KS750/KS750.jpg`
    },
    'innosin-ks-800': {
      glb: `${SUPABASE_STORAGE_URL}/products/KS800/KS800.glb`,
      jpg: `${SUPABASE_STORAGE_URL}/products/KS800/KS800.jpg`
    },
    'innosin-ks-850': {
      glb: `${SUPABASE_STORAGE_URL}/products/KS850/KS850.glb`,
      jpg: `${SUPABASE_STORAGE_URL}/products/KS850/KS850.jpg`
    },
    'innosin-ks-900': {
      glb: `${SUPABASE_STORAGE_URL}/products/KS900/KS900.glb`,
      jpg: `${SUPABASE_STORAGE_URL}/products/KS900/KS900.jpg`
    },
    'innosin-ks-1000': {
      glb: `${SUPABASE_STORAGE_URL}/products/KS1000/KS1000.glb`,
      jpg: `${SUPABASE_STORAGE_URL}/products/KS1000/KS1000.jpg`
    },
    'innosin-ks-1200': {
      glb: `${SUPABASE_STORAGE_URL}/products/KS1200/KS1200.glb`,
      jpg: `${SUPABASE_STORAGE_URL}/products/KS1200/KS1200.jpg`
    },
    
    // Innosin Lab Mobile Cabinet Series - 750mm Height
    'innosin-mc-pc-755065': {
      glb: `${SUPABASE_STORAGE_URL}/products/MC-PC (755065)/MC-PC (755065).glb`,
      jpg: `${SUPABASE_STORAGE_URL}/products/MC-PC (755065)/MC-PC (755065).jpg`
    },
    'innosin-mc-pc-755080': {
      glb: `${SUPABASE_STORAGE_URL}/products/MC-PC (755080)/MC-PC (755080).glb`,
      jpg: `${SUPABASE_STORAGE_URL}/products/MC-PC (755080)/MC-PC (755080).jpg`
    },
    'innosin-mc-pc-lh-505065': {
      glb: `${SUPABASE_STORAGE_URL}/products/MC-PC-LH (505065)/MC-PC-LH (505065).glb`,
      jpg: `${SUPABASE_STORAGE_URL}/products/MC-PC-LH (505065)/MC-PC-LH (505065).jpg`
    },
    'innosin-mc-pc-lh-505080': {
      glb: `${SUPABASE_STORAGE_URL}/products/MC-PC-LH (505080)/MC-PC-LH (505080).glb`,
      jpg: `${SUPABASE_STORAGE_URL}/products/MC-PC-LH (505080)/MC-PC-LH (505080).jpg`
    },
    'innosin-mc-pc-rh-505065': {
      glb: `${SUPABASE_STORAGE_URL}/products/MC-PC-RH (505065)/MC-PC-RH (505065).glb`,
      jpg: `${SUPABASE_STORAGE_URL}/products/MC-PC-RH (505065)/MC-PC-RH (505065).jpg`
    },
    'innosin-mc-pc-rh-505080': {
      glb: `${SUPABASE_STORAGE_URL}/products/MC-PC-RH (505080)/MC-PC-RH (505080).glb`,
      jpg: `${SUPABASE_STORAGE_URL}/products/MC-PC-RH (505080)/MC-PC-RH (505080).jpg`
    },
    'innosin-mcc-pc-lh-505065': {
      glb: `${SUPABASE_STORAGE_URL}/products/MCC-PC-LH (505065)/MCC-PC-LH (505065).glb`,
      jpg: `${SUPABASE_STORAGE_URL}/products/MCC-PC-LH (505065)/MCC-PC-LH (505065).jpg`
    },
    'innosin-mcc-pc-lh-505080': {
      glb: `${SUPABASE_STORAGE_URL}/products/MCC-PC-LH (505080)/MCC-PC-LH (505080).glb`,
      jpg: `${SUPABASE_STORAGE_URL}/products/MCC-PC-LH (505080)/MCC-PC-LH (505080).jpg`
    },
    'innosin-mcc-pc-rh-505065': {
      glb: `${SUPABASE_STORAGE_URL}/products/MCC-PC-RH (505065)/MCC-PC-RH (505065).glb`,
      jpg: `${SUPABASE_STORAGE_URL}/products/MCC-PC-RH (505065)/MCC-PC-RH (505065).jpg`
    },
    'innosin-mcc-pc-rh-505080': {
      glb: `${SUPABASE_STORAGE_URL}/products/MCC-PC-RH (505080)/MCC-PC-RH (505080).glb`,
      jpg: `${SUPABASE_STORAGE_URL}/products/MCC-PC-RH (505080)/MCC-PC-RH (505080).jpg`
    },
    'innosin-mc-pc-dwr2-905065': {
      glb: `${SUPABASE_STORAGE_URL}/products/innosin-mc-pc-dwr2-905065/MC-PC-DD-DWR2 (905065).glb`,
      jpg: `${SUPABASE_STORAGE_URL}/products/innosin-mc-pc-dwr2-905065/MC-PC-DD-DWR2 (905065).jpg`
    },
    'innosin-mc-pc-dwr2-905080': {
      glb: `${SUPABASE_STORAGE_URL}/products/innosin-mc-pc-dwr2-905080/MC-PC-DD-DWR2 (905080).glb`,
      jpg: `${SUPABASE_STORAGE_URL}/products/innosin-mc-pc-dwr2-905080/MC-PC-DD-DWR2 (905080).jpg`
    },
    'innosin-mc-pc-dwr3-505080': {
      glb: `${SUPABASE_STORAGE_URL}/products/innosin-mc-pc-dwr3-505080/MC-PC-DWR3 (505080).glb`,
      jpg: `${SUPABASE_STORAGE_URL}/products/innosin-mc-pc-dwr3-505080/MC-PC-DWR3 (505080).jpg`
    },
    'innosin-mc-pc-dwr4-505080': {
      glb: `${SUPABASE_STORAGE_URL}/products/innosin-mc-pc-dwr4-505080/MC-PC-DWR4 (505080).glb`,
      jpg: `${SUPABASE_STORAGE_URL}/products/innosin-mc-pc-dwr4-505080/MC-PC-DWR4 (505080).jpg`
    },
    'innosin-mc-pc-dwr6-1-905065': {
      glb: `${SUPABASE_STORAGE_URL}/products/innosin-mc-pc-dwr6-1-905065/MC-PC-DWR6-1 (905065).glb`,
      jpg: `${SUPABASE_STORAGE_URL}/products/innosin-mc-pc-dwr6-1-905065/MC-PC-DWR6-1 (905065).jpg`
    },
    'innosin-mc-pc-dwr6-2-905065': {
      glb: `${SUPABASE_STORAGE_URL}/products/innosin-mc-pc-dwr6-2-905065/MC-PC-DWR6-2 (905065).glb`,
      jpg: `${SUPABASE_STORAGE_URL}/products/innosin-mc-pc-dwr6-2-905065/MC-PC-DWR6-2 (905065).jpg`
    },
    'innosin-mc-pc-dwr6-905080': {
      glb: `${SUPABASE_STORAGE_URL}/products/innosin-mc-pc-dwr6-905080/MC-PC-DWR6 (905080).glb`,
      jpg: `${SUPABASE_STORAGE_URL}/products/innosin-mc-pc-dwr6-905080/MC-PC-DWR6 (905080).jpg`
    },
    'innosin-mc-pc-dwr8-905080': {
      glb: `${SUPABASE_STORAGE_URL}/products/innosin-mc-pc-dwr8-905080/MC-PC-DWR8 (905080).glb`,
      jpg: `${SUPABASE_STORAGE_URL}/products/innosin-mc-pc-dwr8-905080/MC-PC-DWR8 (905080).jpg`
    },
    'innosin-mc-pc-dwr3-1-505065': {
      glb: `${SUPABASE_STORAGE_URL}/products/innosin-mc-pc-dwr3-1-505065/MC-PC-DRW3-1 (505065).glb`,
      jpg: `${SUPABASE_STORAGE_URL}/products/innosin-mc-pc-dwr3-1-505065/MC-PC-DRW3-1 (505065).jpg`
    },
    'innosin-mc-pc-dwr3-2-505065': {
      glb: `${SUPABASE_STORAGE_URL}/products/innosin-mc-pc-dwr3-2-505065/MC-PC-DRW3-2 (505065).glb`,
      jpg: `${SUPABASE_STORAGE_URL}/products/innosin-mc-pc-dwr3-2-505065/MC-PC-DRW3-2 (505065).jpg`
    },
    
    // Other Innosin Lab Products - Open Racks  
    'innosin-or-pc-3838': {
      glb: `${SUPABASE_STORAGE_URL}/products/innosin-or-pc-3838/OR-PC-3838.glb`,
      jpg: `${SUPABASE_STORAGE_URL}/products/innosin-or-pc-3838/OR-PC-3838.jpg`
    },
    'innosin-or-pc-604518': {
      glb: `${SUPABASE_STORAGE_URL}/products/innosin-or-pc-604518/OR-PC-3838 (604518).glb`,
      jpg: `${SUPABASE_STORAGE_URL}/products/innosin-or-pc-604518/OR-PC-3838 (604518).jpg`
    },
    
    // Tall Glass Cabinets
    'innosin-tcg-pc-754018': {
      glb: `${SUPABASE_STORAGE_URL}/products/innosin-tcg-pc-754018/TCG-PC (754018).glb`,
      jpg: `${SUPABASE_STORAGE_URL}/products/innosin-tcg-pc-754018/TCG-PC (754018).jpg`
    },
    
    // Wall Cabinets Glass
    'innosin-wcg-pc-753375': {
      glb: `${SUPABASE_STORAGE_URL}/products/innosin-wcg-pc-753375/WCG-PC (753375).glb`,
      jpg: `${SUPABASE_STORAGE_URL}/products/innosin-wcg-pc-753375/WCG-PC (753375).jpg`
    },
    
    // Mobile Combination Cabinets
    'innosin-mcc-pc-755065': {
      glb: `${SUPABASE_STORAGE_URL}/products/innosin-mcc-pc-755065/MCC-PC (755065).glb`,
      jpg: `${SUPABASE_STORAGE_URL}/products/innosin-mcc-pc-755065/MCC-PC (755065).jpg`
    },
    'innosin-mcc-pc-755080': {
      glb: `${SUPABASE_STORAGE_URL}/products/innosin-mcc-pc-755080/MCC-PC (755080).glb`,
      jpg: `${SUPABASE_STORAGE_URL}/products/innosin-mcc-pc-755080/MCC-PC (755080).jpg`
    }
  };
  
  return uploadedAssets;
};

// Enhanced product loading with asset validation and fallbacks
const enhanceProductWithAssets = (product: Product): Product => {
  const uploadedAssets = loadUploadedAssets();
  
  // Check if there are uploaded assets for this product
  const productAssets = uploadedAssets[product.id];
  if (productAssets) {
    // Use uploaded assets
    const enhancedProduct = {
      ...product,
      modelPath: productAssets.glb || product.modelPath,
      thumbnail: productAssets.jpg || product.thumbnail,
      images: productAssets.jpg ? [productAssets.jpg, ...product.images] : product.images
    };
    
    console.log(`🔄 Enhanced product ${product.id}:`, {
      hasGLB: !!productAssets.glb,
      hasJPG: !!productAssets.jpg,
      glbPath: enhancedProduct.modelPath,
      jpgPath: enhancedProduct.thumbnail
    });
    
    return enhancedProduct;
  }
  
  return product;
};

// Product asset management
export const getProductsSync = (): Product[] => {
  // Generate products based on available assets in public/products directory
  const products: Product[] = [
    {
      id: "bl-hes-bench-001",
      name: "Hand-Held Eye Shower with Two 45-degree Heads, Bench Mounted",
      category: "Broen-Lab",
      dimensions: "1.5m hose length",
      description: "Bench-mounted, hand-held dual eye and body wash unit with precision-formed spray heads for emergency decontamination.",
      fullDescription: "The bench-mounted, hand-held dual eye and body wash unit is meticulously engineered to facilitate simultaneous rinsing of the eyes, face, and upper body in emergency situations. Outfitted with precision-formed, easy-clean spray heads, the system effectively mitigates limescale accumulation, thereby ensuring sustained performance and extended operational lifespan. Integrated dust caps provide a secure seal against particulate ingress, maintaining hygiene and functionality; once activated, the caps remain open to enable continuous, unobstructed rinsing. The assembly is fully compliant with EN15154 and ANSI Z358.1 standards, ensuring optimal spray distribution, user safety, and regulatory reliability.",
      specifications: [
        "EN15154 & ANSI Z358.1 compliant",
        "FLOWFIX technology - 12 L/min",
        "TMV compatible - 22°C output",
        "1.5m stainless steel-braided hose",
        "G1/2\" union nut with swivel joint",
        "Built-in non-return valve",
        "ISO 3864-1 compliant signage",
        "15-minute minimum rinse duration",
        "Easy-clean spray heads",
        "Integrated dust caps"
      ],
      modelPath: "/products/bl-hes-bench-001/model.glb",
      thumbnail: "/products/bl-hes-bench-001/images/front.jpg",
      images: ["/products/bl-hes-bench-001/images/front.jpg"]
    },
    {
      id: "bl-hes-wall-001",
      name: "Hand-Held Eye Shower with Two 45-degree Heads, Wall Mounted",
      category: "Broen-Lab",
      dimensions: "1.5m hose length",
      description: "Wall-mounted, hand-held dual eye and body wash unit with precision-formed spray heads for emergency decontamination.",
      fullDescription: "The wall-mounted, hand-held dual eye and body wash unit provides the same exceptional safety features as the bench-mounted version but with space-saving wall installation. This configuration is ideal for laboratories with limited bench space while maintaining full compliance with safety standards. The unit features the same precision-formed spray heads and integrated dust caps, ensuring reliable performance in emergency situations.",
      specifications: [
        "EN15154 & ANSI Z358.1 compliant",
        "FLOWFIX technology - 12 L/min",
        "TMV compatible - 22°C output",
        "1.5m stainless steel-braided hose",
        "G1/2\" union nut with swivel joint",
        "Built-in non-return valve",
        "ISO 3864-1 compliant signage",
        "15-minute minimum rinse duration",
        "Easy-clean spray heads",
        "Integrated dust caps"
      ],
      modelPath: "/products/bl-hes-wall-001/model.glb",
      thumbnail: "/products/bl-hes-wall-001/images/front.jpg",
      images: ["/products/bl-hes-wall-001/images/front.jpg"]
    },
    {
      id: "bl-es-wall-001",
      name: "Wall-Mounted Eye Shower with Dual Spray Heads",
      category: "Broen-Lab",
      dimensions: "Wall-mounted unit",
      description: "Professional wall-mounted eye shower with dual spray heads for emergency eye irrigation in laboratory environments.",
      fullDescription: "The wall-mounted eye shower provides immediate emergency eye irrigation with dual precision-formed spray heads. Designed for quick activation in emergency situations, this unit delivers consistent water flow and spray pattern to effectively flush contaminants from the eyes. The robust construction and easy-clean design ensure long-term reliability and minimal maintenance requirements.",
      specifications: [
        "EN15154 & ANSI Z358.1 compliant",
        "Dual precision spray heads",
        "Quick-activation mechanism",
        "Consistent flow rate",
        "Easy-clean design",
        "Corrosion-resistant materials"
      ],
      modelPath: "/products/bl-es-wall-001/model.glb",
      thumbnail: "/products/bl-es-wall-001/images/front.jpg",
      images: ["/products/bl-es-wall-001/images/front.jpg"]
    },
    {
      id: "bl-bs-floor-001",
      name: "Floor-Mounted Body Shower for Emergency Decontamination",
      category: "Broen-Lab",
      dimensions: "Floor-mounted unit",
      description: "Professional floor-mounted body shower system for full-body emergency decontamination in laboratory settings.",
      fullDescription: "The floor-mounted body shower provides comprehensive emergency decontamination capabilities for laboratory personnel. This system delivers high-volume water flow for effective removal of chemical contaminants from clothing and skin. The robust floor-mounted design ensures stability during emergency use while providing easy access and operation.",
      specifications: [
        "EN15154 & ANSI Z358.1 compliant",
        "High-volume water delivery",
        "Stable floor-mounted design",
        "Quick-activation pull handle",
        "Corrosion-resistant construction",
        "Easy maintenance access"
      ],
      modelPath: "/products/bl-bs-floor-001/model.glb",
      thumbnail: "/products/bl-bs-floor-001/images/front.jpg",
      images: ["/products/bl-bs-floor-001/images/front.jpg"]
    },
    {
      id: "bl-combo-001",
      name: "Combination Eye Wash and Body Shower Station",
      category: "Broen-Lab",
      dimensions: "Combined unit",
      description: "Comprehensive emergency safety station combining eye wash and body shower capabilities in a single unit.",
      fullDescription: "The combination emergency safety station provides both eye wash and body shower capabilities in a single, space-efficient unit. This comprehensive solution ensures complete emergency response capabilities while minimizing installation requirements. The integrated design allows for simultaneous or independent operation of eye wash and body shower functions.",
      specifications: [
        "EN15154 & ANSI Z358.1 compliant",
        "Dual-function capability",
        "Independent operation modes",
        "Space-efficient design",
        "Quick-activation systems",
        "Comprehensive safety coverage"
      ],
      modelPath: "/products/bl-combo-001/model.glb",
      thumbnail: "/products/bl-combo-001/images/front.jpg",
      images: ["/products/bl-combo-001/images/front.jpg"]
    },
    
    // INNOSIN LAB PRODUCTS - Mobile Cabinets with actual assets
    {
      id: "innosin-mobile-cabinet-750",
      name: "Mobile Cabinet - 750mm Height",
      category: "Innosin Lab",
      dimensions: "750mm H",
      description: "Professional mobile laboratory cabinet with 750mm height, available in multiple configurations including single door, double door, combination, and drawer variants.",
      fullDescription: "The 750mm mobile cabinet series represents a comprehensive solution for laboratory storage needs. These mobile units feature robust construction with high-quality materials and precision engineering. Available in single door, double door, combination, and drawer configurations, with left-hand and right-hand orientations where applicable. Each unit is designed for optimal mobility with professional-grade casters while maintaining stability during use.",
      specifications: [],
      modelPath: `${SUPABASE_STORAGE_URL}/products/MC-PC (755065)/MC-PC (755065).glb`,
      thumbnail: `${SUPABASE_STORAGE_URL}/products/MC-PC (755065)/MC-PC (755065).jpg`,
      images: [`${SUPABASE_STORAGE_URL}/products/MC-PC (755065)/MC-PC (755065).jpg`],
      baseProductId: "innosin-mobile-cabinet-750",
      finishes: [
        {
          type: "powder-coat",
          name: "Powder Coat (PC)",
          price: "Standard"
        },
        {
          type: "stainless-steel",
          name: "Stainless Steel (SS)",
          price: "Premium"
        }
      ],
      variants: [
        {
          id: "innosin-mc-pc-755065",
          size: "650×650×750mm",
          dimensions: "650×650×750mm",
          type: "Double Door",
          orientation: "None" as const,
          modelPath: `${SUPABASE_STORAGE_URL}/products/MC-PC (755065)/MC-PC (755065).glb`,
          thumbnail: `${SUPABASE_STORAGE_URL}/products/MC-PC (755065)/MC-PC (755065).jpg`,
          images: [`${SUPABASE_STORAGE_URL}/products/MC-PC (755065)/MC-PC (755065).jpg`]
        },
        {
          id: "innosin-mc-pc-755080",
          size: "800×500×750mm",
          dimensions: "800×500×750mm",
          type: "Double Door",
          orientation: "None" as const,
          modelPath: `${SUPABASE_STORAGE_URL}/products/MC-PC (755080)/MC-PC (755080).glb`,
          thumbnail: `${SUPABASE_STORAGE_URL}/products/MC-PC (755080)/MC-PC (755080).jpg`,
          images: [`${SUPABASE_STORAGE_URL}/products/MC-PC (755080)/MC-PC (755080).jpg`]
        },
        {
          id: "innosin-mc-pc-lh-505065",
          size: "650×500×750mm",
          dimensions: "650×500×750mm",
          type: "Single Door",
          orientation: "LH" as const,
          modelPath: `${SUPABASE_STORAGE_URL}/products/MC-PC-LH (505065)/MC-PC-LH (505065).glb`,
          thumbnail: `${SUPABASE_STORAGE_URL}/products/MC-PC-LH (505065)/MC-PC-LH (505065).jpg`,
          images: [`${SUPABASE_STORAGE_URL}/products/MC-PC-LH (505065)/MC-PC-LH (505065).jpg`]
        },
        {
          id: "innosin-mc-pc-rh-505065",
          size: "650×500×750mm",
          dimensions: "650×500×750mm",
          type: "Single Door",
          orientation: "RH" as const,
          modelPath: `${SUPABASE_STORAGE_URL}/products/MC-PC-RH (505065)/MC-PC-RH (505065).glb`,
          thumbnail: `${SUPABASE_STORAGE_URL}/products/MC-PC-RH (505065)/MC-PC-RH (505065).jpg`,
          images: [`${SUPABASE_STORAGE_URL}/products/MC-PC-RH (505065)/MC-PC-RH (505065).jpg`]
        },
        {
          id: "innosin-mcc-pc-lh-505065",
          size: "650×500×750mm",
          dimensions: "650×500×750mm",
          type: "Combination",
          orientation: "LH" as const,
          modelPath: `${SUPABASE_STORAGE_URL}/products/MCC-PC-LH (505065)/MCC-PC-LH (505065).glb`,
          thumbnail: `${SUPABASE_STORAGE_URL}/products/MCC-PC-LH (505065)/MCC-PC-LH (505065).jpg`,
          images: [`${SUPABASE_STORAGE_URL}/products/MCC-PC-LH (505065)/MCC-PC-LH (505065).jpg`]
        },
        {
          id: "innosin-mcc-pc-rh-505065",
          size: "650×500×750mm",
          dimensions: "650×500×750mm",
          type: "Combination",
          orientation: "RH" as const,
          modelPath: `${SUPABASE_STORAGE_URL}/products/MCC-PC-RH (505065)/MCC-PC-RH (505065).glb`,
          thumbnail: `${SUPABASE_STORAGE_URL}/products/MCC-PC-RH (505065)/MCC-PC-RH (505065).jpg`,
          images: [`${SUPABASE_STORAGE_URL}/products/MCC-PC-RH (505065)/MCC-PC-RH (505065).jpg`]
        }
      ]
    },
    {
      id: "innosin-mobile-cabinet-900",
      name: "Mobile Cabinet - 900mm Height",
      category: "Innosin Lab",
      dimensions: "900mm H",
      description: "Professional mobile laboratory cabinet with 900mm height, featuring enhanced storage capacity in multiple configurations including drawer variants and combination units.",
      fullDescription: "The 900mm mobile cabinet series offers expanded storage solutions for demanding laboratory environments. These units provide increased capacity while maintaining the same high-quality construction and mobility features. Available in various drawer configurations, combination units, and specialized storage options. Perfect for laboratories requiring additional vertical storage space without compromising on accessibility or mobility.",
      specifications: [],
      modelPath: `${SUPABASE_STORAGE_URL}/products/innosin-mc-pc-dwr6-905080/MC-PC-DWR6 (905080).glb`,
      thumbnail: `${SUPABASE_STORAGE_URL}/products/innosin-mc-pc-dwr6-905080/MC-PC-DWR6 (905080).jpg`,
      images: [`${SUPABASE_STORAGE_URL}/products/innosin-mc-pc-dwr6-905080/MC-PC-DWR6 (905080).jpg`],
      baseProductId: "innosin-mobile-cabinet-900",
      finishes: [
        {
          type: "powder-coat",
          name: "Powder Coat (PC)",
          price: "Standard"
        },
        {
          type: "stainless-steel",
          name: "Stainless Steel (SS)",
          price: "Premium"
        }
      ],
      variants: [
        {
          id: "innosin-mc-pc-dwr6-905065",
          size: "650×900×900mm",
          dimensions: "650×900×900mm",
          type: "6 Drawers",
          orientation: "None" as const,
          modelPath: `${SUPABASE_STORAGE_URL}/products/innosin-mc-pc-dwr6-1-905065/MC-PC-DWR6-1 (905065).glb`,
          thumbnail: `${SUPABASE_STORAGE_URL}/products/innosin-mc-pc-dwr6-1-905065/MC-PC-DWR6-1 (905065).jpg`,
          images: [`${SUPABASE_STORAGE_URL}/products/innosin-mc-pc-dwr6-1-905065/MC-PC-DWR6-1 (905065).jpg`]
        },
        {
          id: "innosin-mc-pc-dwr68-905080",
          size: "800×900×900mm",
          dimensions: "800×900×900mm",
          type: "6-8 Drawers",
          orientation: "None" as const,
          modelPath: `${SUPABASE_STORAGE_URL}/products/innosin-mc-pc-dwr6-905080/MC-PC-DWR6 (905080).glb`,
          thumbnail: `${SUPABASE_STORAGE_URL}/products/innosin-mc-pc-dwr6-905080/MC-PC-DWR6 (905080).jpg`,
          images: [`${SUPABASE_STORAGE_URL}/products/innosin-mc-pc-dwr6-905080/MC-PC-DWR6 (905080).jpg`]
        }
      ]
    },
    {
      id: "innosin-open-rack-series",
      name: "Open Rack Series - Laboratory Storage",
      category: "Innosin Lab",
      dimensions: "Multiple sizes available",
      description: "Versatile open rack storage systems designed for laboratory environments, providing easy access and flexible organization solutions.",
      fullDescription: "The Open Rack Series delivers maximum accessibility and flexibility for laboratory storage needs. These open-design units facilitate quick access to stored items while maintaining professional appearance and structural integrity. Available in multiple configurations to accommodate various laboratory layouts and storage requirements. The open design promotes visibility and easy inventory management.",
      specifications: [],
      modelPath: `${SUPABASE_STORAGE_URL}/products/innosin-or-pc-604518/OR-PC-3838 (604518).glb`,
      thumbnail: `${SUPABASE_STORAGE_URL}/products/innosin-or-pc-604518/OR-PC-3838 (604518).jpg`,
      images: [`${SUPABASE_STORAGE_URL}/products/innosin-or-pc-604518/OR-PC-3838 (604518).jpg`],
      baseProductId: "innosin-open-rack-series",
      finishes: [
        {
          type: "powder-coat",
          name: "Powder Coat (PC)",
          price: "Standard"
        }
      ],
      variants: [
        {
          id: "innosin-or-pc-604518",
          size: "380×380mm",
          dimensions: "380×380mm",
          type: "Open Rack",
          orientation: "None" as const,
          modelPath: `${SUPABASE_STORAGE_URL}/products/innosin-or-pc-604518/OR-PC-3838 (604518).glb`,
          thumbnail: `${SUPABASE_STORAGE_URL}/products/innosin-or-pc-604518/OR-PC-3838 (604518).jpg`,
          images: [`${SUPABASE_STORAGE_URL}/products/innosin-or-pc-604518/OR-PC-3838 (604518).jpg`]
        }
      ]
    },
    {
      id: "innosin-tall-glass-cabinets",
      name: "Tall Glass Cabinets - Display & Storage",
      category: "Innosin Lab",
      dimensions: "Full height options",
      description: "Professional tall glass cabinet systems for laboratory display and storage, featuring transparent access and secure construction.",
      fullDescription: "The Tall Glass Cabinet series provides elegant display and storage solutions for laboratory environments. These full-height units feature transparent glass panels that allow for easy visibility of contents while maintaining secure storage. Perfect for displaying laboratory equipment, specimens, or frequently accessed materials. The robust construction ensures long-term reliability in demanding laboratory conditions.",
      specifications: [],
      modelPath: `${SUPABASE_STORAGE_URL}/products/innosin-tcg-pc-754018/TCG-PC (754018).glb`,
      thumbnail: `${SUPABASE_STORAGE_URL}/products/innosin-tcg-pc-754018/TCG-PC (754018).jpg`,
      images: [`${SUPABASE_STORAGE_URL}/products/innosin-tcg-pc-754018/TCG-PC (754018).jpg`],
      baseProductId: "innosin-tall-glass-cabinets",
      variants: [
        {
          id: "innosin-tcg-pc-754018",
          size: "400×1800mm",
          dimensions: "400×1800mm",
          type: "Glass Cabinet",
          orientation: "None" as const,
          modelPath: `${SUPABASE_STORAGE_URL}/products/innosin-tcg-pc-754018/TCG-PC (754018).glb`,
          thumbnail: `${SUPABASE_STORAGE_URL}/products/innosin-tcg-pc-754018/TCG-PC (754018).jpg`,
          images: [`${SUPABASE_STORAGE_URL}/products/innosin-tcg-pc-754018/TCG-PC (754018).jpg`]
        }
      ]
    },
    {
      id: "innosin-wall-cabinets",
      name: "Wall Cabinets - Space-Efficient Storage",
      category: "Innosin Lab",
      dimensions: "Wall-mounted configurations",
      description: "Space-efficient wall-mounted cabinet systems for laboratories, maximizing storage while preserving floor space.",
      fullDescription: "The Wall Cabinet series maximizes laboratory storage capacity while preserving valuable floor space. These wall-mounted units are designed for secure installation and optimal load distribution. Available in various sizes and configurations to accommodate different laboratory layouts. The space-efficient design allows for optimal workflow while providing essential storage solutions overhead.",
      specifications: [],
      modelPath: `${SUPABASE_STORAGE_URL}/products/innosin-wcg-pc-753375/WCG-PC (753375).glb`,
      thumbnail: `${SUPABASE_STORAGE_URL}/products/innosin-wcg-pc-753375/WCG-PC (753375).jpg`,
      images: [`${SUPABASE_STORAGE_URL}/products/innosin-wcg-pc-753375/WCG-PC (753375).jpg`],
      baseProductId: "innosin-wall-cabinets",
      variants: [
        {
          id: "innosin-wcg-pc-753375",
          size: "750×375mm",
          dimensions: "750×375mm",
          type: "Wall Cabinet",
          orientation: "None" as const,
          modelPath: `${SUPABASE_STORAGE_URL}/products/innosin-wcg-pc-753375/WCG-PC (753375).glb`,
          thumbnail: `${SUPABASE_STORAGE_URL}/products/innosin-wcg-pc-753375/WCG-PC (753375).jpg`,
          images: [`${SUPABASE_STORAGE_URL}/products/innosin-wcg-pc-753375/WCG-PC (753375).jpg`]
        }
      ]
    },
    // KS Series - Laboratory Fume Hoods with actual assets
    {
      id: "innosin-ks-700",
      name: "KS Laboratory Fume Hood - 700mm",
      category: "Innosin Lab",
      dimensions: "700mm width",
      description: "Professional laboratory fume hood with 700mm width, designed for safe handling of chemical processes and laboratory procedures.",
      fullDescription: "The KS-700 laboratory fume hood represents the pinnacle of laboratory safety engineering. Designed for optimal chemical fume extraction and operator protection, this unit features advanced airflow management systems and robust construction. The 700mm width makes it ideal for individual workstations while providing comprehensive protection for laboratory personnel during chemical handling and analytical procedures.",
      specifications: [],
      modelPath: `${SUPABASE_STORAGE_URL}/products/KS700/KS700.glb`,
      thumbnail: `${SUPABASE_STORAGE_URL}/products/KS700/KS700.jpg`,
      images: [`${SUPABASE_STORAGE_URL}/products/KS700/KS700.jpg`]
    },
    {
      id: "innosin-ks-750",
      name: "KS Laboratory Fume Hood - 750mm",
      category: "Innosin Lab",
      dimensions: "750mm width",
      description: "Professional laboratory fume hood with 750mm width, providing enhanced workspace for complex laboratory procedures and chemical handling.",
      fullDescription: "The KS-750 laboratory fume hood offers expanded workspace capabilities while maintaining the highest safety standards. This model provides additional working space compared to the 700mm variant, making it suitable for more complex laboratory procedures and equipment setups. Features the same advanced safety systems and airflow management with enhanced capacity for demanding laboratory applications.",
      specifications: [],
      modelPath: `${SUPABASE_STORAGE_URL}/products/KS750/KS750.glb`,
      thumbnail: `${SUPABASE_STORAGE_URL}/products/KS750/KS750.jpg`,
      images: [`${SUPABASE_STORAGE_URL}/products/KS750/KS750.jpg`]
    },
    {
      id: "innosin-ks-800",
      name: "KS Laboratory Fume Hood - 800mm",
      category: "Innosin Lab",
      dimensions: "800mm width",
      description: "Professional laboratory fume hood with 800mm width, designed for standard laboratory workstations with optimal safety and functionality.",
      fullDescription: "The KS-800 laboratory fume hood represents the ideal balance between workspace and safety for standard laboratory applications. With 800mm of working width, this model accommodates most standard laboratory equipment and procedures while maintaining optimal airflow characteristics. This size is the most popular choice for general laboratory installations, providing excellent versatility and performance.",
      specifications: [],
      modelPath: `${SUPABASE_STORAGE_URL}/products/KS800/KS800.glb`,
      thumbnail: `${SUPABASE_STORAGE_URL}/products/KS800/KS800.jpg`,
      images: [`${SUPABASE_STORAGE_URL}/products/KS800/KS800.jpg`]
    },
    {
      id: "innosin-ks-850",
      name: "KS Laboratory Fume Hood - 850mm",
      category: "Innosin Lab",
      dimensions: "850mm width",
      description: "Professional laboratory fume hood with 850mm width, offering expanded workspace for complex laboratory operations and equipment setups.",
      fullDescription: "The KS-850 laboratory fume hood provides enhanced workspace capacity for laboratories requiring additional working area. This model bridges the gap between standard and large-scale laboratory operations, offering optimal space utilization while maintaining superior safety performance. Ideal for laboratories with diverse equipment requirements and complex analytical procedures.",
      specifications: [],
      modelPath: `${SUPABASE_STORAGE_URL}/products/KS850/KS850.glb`,
      thumbnail: `${SUPABASE_STORAGE_URL}/products/KS850/KS850.jpg`,
      images: [`${SUPABASE_STORAGE_URL}/products/KS850/KS850.jpg`]
    },
    {
      id: "innosin-ks-900",
      name: "KS Laboratory Fume Hood - 900mm",
      category: "Innosin Lab",
      dimensions: "900mm width",
      description: "Professional laboratory fume hood with 900mm width, designed for high-capacity laboratory operations requiring maximum workspace and safety.",
      fullDescription: "The KS-900 laboratory fume hood delivers maximum workspace capacity for demanding laboratory environments. This model provides extensive working area while maintaining the highest safety standards and optimal airflow performance. Perfect for laboratories conducting complex research, multiple simultaneous procedures, or requiring accommodation of large equipment setups.",
      specifications: [],
      modelPath: `${SUPABASE_STORAGE_URL}/products/KS900/KS900.glb`,
      thumbnail: `${SUPABASE_STORAGE_URL}/products/KS900/KS900.jpg`,
      images: [`${SUPABASE_STORAGE_URL}/products/KS900/KS900.jpg`]
    },
    {
      id: "innosin-ks-1000",
      name: "KS Laboratory Fume Hood - 1000mm",
      category: "Innosin Lab",
      dimensions: "1000mm width",
      description: "Professional laboratory fume hood with 1000mm width, providing extensive workspace for large-scale laboratory operations and research applications.",
      fullDescription: "The KS-1000 laboratory fume hood represents the premium solution for large-scale laboratory operations. With 1000mm of working width, this model accommodates the most demanding laboratory requirements including large equipment installations, multiple operator access, and complex research procedures. Features advanced airflow management systems designed to handle high-volume operations while maintaining optimal safety performance.",
      specifications: [],
      modelPath: `${SUPABASE_STORAGE_URL}/products/KS1000/KS1000.glb`,
      thumbnail: `${SUPABASE_STORAGE_URL}/products/KS1000/KS1000.jpg`,
      images: [`${SUPABASE_STORAGE_URL}/products/KS1000/KS1000.jpg`]
    },
    {
      id: "innosin-ks-1200",
      name: "KS Laboratory Fume Hood - 1200mm",
      category: "Innosin Lab",
      dimensions: "1200mm width",
      description: "Professional laboratory fume hood with 1200mm width, the ultimate solution for maximum workspace and multi-operator laboratory environments.",
      fullDescription: "The KS-1200 laboratory fume hood represents the ultimate in laboratory safety and workspace capacity. With 1200mm of working width, this model is designed for the most demanding laboratory environments including multi-operator workstations, large-scale research facilities, and industrial laboratory applications. Features the most advanced airflow management and safety systems to ensure optimal performance in high-capacity operations.",
      specifications: [],
      modelPath: `${SUPABASE_STORAGE_URL}/products/KS1200/KS1200.glb`,
      thumbnail: `${SUPABASE_STORAGE_URL}/products/KS1200/KS1200.jpg`,
      images: [`${SUPABASE_STORAGE_URL}/products/KS1200/KS1200.jpg`]
    }
  ];

  // Apply asset enhancement to all products
  return products.map(product => enhanceProductWithAssets(product));
};

// Categories generation
export const getCategories = (): string[] => {
  const products = getProductsSync();
  const uniqueCategories = [...new Set(products.map(product => product.category))];
  return uniqueCategories.sort();
};
