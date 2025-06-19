
import { Product } from '@/types/product';

// Product configuration - easy to maintain without touching React code
export const productConfigs: Omit<Product, 'modelPath' | 'thumbnail' | 'images'>[] = [
  {
    id: 'fh-001',
    name: 'Chemical Fume Hood - Standard',
    category: 'Broen-Lab',
    dimensions: '1500 × 750 × 2400mm',
    description: 'Standard chemical fume hood with variable air volume control and energy-efficient design.',
    fullDescription: 'Our Standard Chemical Fume Hood represents the pinnacle of laboratory safety engineering. This state-of-the-art unit features Variable Air Volume (VAV) control technology that automatically adjusts airflow based on sash position, ensuring optimal containment while minimizing energy consumption. The hood is constructed with corrosion-resistant materials and includes a streamlined airfoil design for superior aerodynamic performance. Safety features include an emergency bypass system, low-flow alarm, and face velocity monitoring. The work surface is made from high-grade epoxy resin that resists chemical attack from most laboratory reagents. Integrated LED lighting provides excellent visibility, while the ergonomic sash design ensures comfortable operation. This fume hood meets or exceeds ASHRAE 110 standards and is suitable for general chemistry applications.',
    specifications: ['VAV Control', 'Energy Efficient', 'ASHRAE 110 Compliant']
  },
  {
    id: 'lb-001',
    name: 'Epoxy Resin Lab Bench',
    category: 'Hamilton Laboratory Solutions',
    dimensions: '3000 × 750 × 850mm',
    description: 'Chemical-resistant epoxy resin lab bench with integrated utilities.',
    fullDescription: 'The Epoxy Resin Lab Bench is engineered for demanding laboratory environments where chemical resistance and durability are paramount. The work surface features a 25mm thick epoxy resin top that provides exceptional resistance to acids, bases, and organic solvents. The modular design allows for easy reconfiguration and future expansion. Integrated utility systems include electrical outlets, data connections, and plumbing fixtures strategically positioned for maximum convenience and safety. The steel frame construction ensures stability and longevity, while adjustable leveling feet accommodate uneven floors. Optional accessories include reagent shelves, drawers, and specialized fixtures for specific applications. The bench surface is seamlessly joined and polished to prevent contamination buildup and facilitate easy cleaning.',
    specifications: ['Chemical Resistant', 'Integrated Utilities', 'Modular Design']
  },
  {
    id: 'ew-001',
    name: 'Emergency Eye Wash Station',
    category: 'Oriental Giken Inc.',
    dimensions: '600 × 400 × 1200mm',
    description: 'ANSI Z358.1 compliant emergency eye wash station with stainless steel construction.',
    fullDescription: 'This Emergency Eye Wash Station is designed to provide immediate decontamination in case of eye exposure to hazardous chemicals. Fully compliant with ANSI Z358.1 standards, the unit delivers a controlled flow of tepid water to both eyes simultaneously. The stainless steel construction ensures corrosion resistance and easy maintenance. The hands-free operation is activated by a large, easily accessible paddle that can be operated with minimal force, even when wearing gloves. The unit includes dust covers to protect the spray heads when not in use, and the flow rate is calibrated to provide gentle yet effective irrigation. Installation is straightforward with standard plumbing connections, and the unit includes a drain pan to collect overflow water. Regular testing mechanisms ensure the system remains operational when needed.',
    specifications: ['ANSI Z358.1', 'Stainless Steel', 'Hands-Free Operation']
  },
  {
    id: 'ss-001',
    name: 'Emergency Safety Shower',
    category: 'Oriental Giken Inc.',
    dimensions: '900 × 900 × 2300mm',
    description: 'Emergency safety shower with thermostatic mixing valve and freeze protection.',
    fullDescription: 'The Emergency Safety Shower provides comprehensive body decontamination capabilities for laboratory personnel exposed to hazardous chemicals. The system features a thermostatic mixing valve that maintains water temperature within the safe range of 60-100°F (16-38°C) to prevent thermal shock during emergency situations. The large-diameter shower head delivers uniform water distribution across the entire body. Freeze protection systems ensure operation in cold environments, while the corrosion-resistant construction guarantees long-term reliability. The activation system requires minimal force and remains operational even under emergency stress conditions. The unit includes highly visible signage and can be equipped with alarm systems to alert nearby personnel when activated. Installation includes both ceiling-mounted and wall-mounted options to suit different laboratory configurations.',
    specifications: ['Thermostatic Valve', 'Freeze Protection', 'Easy Maintenance']
  },
  {
    id: 'sc-001',
    name: 'Chemical Storage Cabinet',
    category: 'Innosin Lab',
    dimensions: '1200 × 600 × 1800mm',
    description: 'Fire-resistant chemical storage cabinet with ventilation system.',
    fullDescription: 'Our Chemical Storage Cabinet provides secure, organized storage for laboratory chemicals with enhanced safety features. The cabinet construction includes fire-resistant materials and self-closing doors that activate in case of fire to contain hazardous materials. The internal ventilation system maintains negative pressure to prevent vapor buildup and includes connections for external exhaust systems. Adjustable shelving accommodates containers of various sizes, while spill containment features prevent cross-contamination. The locking mechanism ensures controlled access to stored chemicals, and the cabinet includes comprehensive labeling systems for easy identification and inventory management. Secondary containment features protect against spills, while the corrosion-resistant interior finish withstands exposure to chemical vapors. The unit meets OSHA requirements for hazardous material storage.',
    specifications: ['Fire Resistant', 'Ventilated', 'Multiple Shelves']
  },
  {
    id: 'fh-002',
    name: 'Perchloric Acid Fume Hood',
    category: 'Broen-Lab',
    dimensions: '1800 × 750 × 2400mm',
    description: 'Specialized fume hood for perchloric acid applications with wash-down system.',
    fullDescription: 'The Perchloric Acid Fume Hood is specifically engineered for applications involving perchloric acid and other highly reactive chemicals. This specialized unit features a comprehensive wash-down system that can be activated to rinse the entire interior, preventing the accumulation of potentially explosive residues. All internal surfaces are constructed from materials that resist corrosion from perchloric acid, including specialized gaskets and seals. The exhaust system includes a dedicated ductwork design to prevent contamination of other laboratory areas. Temperature monitoring systems alert users to potentially dangerous conditions, while the enhanced airflow design ensures complete containment of hazardous vapors. The unit includes explosion-resistant construction elements and meets stringent safety standards for perchloric acid work. Regular maintenance protocols are simplified through accessible components and clear operational guidelines.',
    specifications: ['Wash-down System', 'Specialized Design', 'Corrosion Resistant']
  }
];

// Check if asset exists (simplified for now, in production you'd use proper asset detection)
const checkAssetExists = async (path: string): Promise<boolean> => {
  try {
    const response = await fetch(path, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
};

// Generate full product data with asset paths
export const generateProducts = async (): Promise<Product[]> => {
  const products: Product[] = [];
  
  for (const config of productConfigs) {
    const basePath = `/products/${config.id}`;
    
    // Try to find GLB model
    const modelPath = `${basePath}/model.glb`;
    
    // Try to find thumbnail
    const possibleThumbnails = [
      `${basePath}/thumbnail.jpg`,
      `${basePath}/thumbnail.png`,
      `${basePath}/thumbnail.webp`,
      '/placeholder.svg' // fallback
    ];
    
    let thumbnail = '/placeholder.svg';
    for (const thumbPath of possibleThumbnails) {
      if (await checkAssetExists(thumbPath)) {
        thumbnail = thumbPath;
        break;
      }
    }
    
    // Try to find additional images
    const possibleImages = [
      `${basePath}/images/front.jpg`,
      `${basePath}/images/side.jpg`,
      `${basePath}/images/detail.jpg`,
      `${basePath}/images/front.png`,
      `${basePath}/images/side.png`,
      `${basePath}/images/detail.png`
    ];
    
    const images: string[] = [];
    for (const imgPath of possibleImages) {
      if (await checkAssetExists(imgPath)) {
        images.push(imgPath);
      }
    }
    
    products.push({
      ...config,
      modelPath,
      thumbnail,
      images
    });
  }
  
  return products;
};

// Synchronous version for immediate use (uses fallbacks)
export const getProductsSync = (): Product[] => {
  return productConfigs.map(config => ({
    ...config,
    modelPath: `/products/${config.id}/model.glb`,
    thumbnail: `/products/${config.id}/thumbnail.jpg`,
    images: [
      `/products/${config.id}/images/front.jpg`,
      `/products/${config.id}/images/side.jpg`,
      `/products/${config.id}/images/detail.jpg`
    ]
  }));
};

// Generate unique categories from products
export const getCategories = (): string[] => {
  const uniqueCategories = [...new Set(productConfigs.map(product => product.category))];
  return ['all', ...uniqueCategories];
};
