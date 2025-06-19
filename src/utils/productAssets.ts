
import { Product } from '@/types/product';

// Product configuration - easy to maintain without touching React code
export const productConfigs: Omit<Product, 'modelPath' | 'thumbnail' | 'images'>[] = [
  {
    id: 'bl-hes-bench-001',
    name: 'Hand-Held Eye Shower with Two 45-degree Heads, Bench Mounted',
    category: 'Broen Lab',
    dimensions: '1.5m hose length',
    description: 'Bench-mounted, hand-held dual eye and body wash unit with precision-formed spray heads for emergency decontamination.',
    fullDescription: 'The bench-mounted, hand-held dual eye and body wash unit is meticulously engineered to facilitate simultaneous rinsing of the eyes, face, and upper body in emergency situations. Outfitted with precision-formed, easy-clean spray heads, the system effectively mitigates limescale accumulation, thereby ensuring sustained performance and extended operational lifespan. Integrated dust caps provide a secure seal against particulate ingress, maintaining hygiene and functionality; once activated, the caps remain open to enable continuous, unobstructed rinsing. The assembly is fully compliant with EN15154 and ANSI Z358.1 standards, ensuring optimal spray distribution, user safety, and regulatory reliability.',
    specifications: [
      'EN15154 & ANSI Z358.1 compliant',
      'FLOWFIX technology - 12 L/min',
      'TMV compatible - 22°C output',
      '1.5m stainless steel-braided hose',
      'G1/2" union nut with swivel joint',
      'Built-in non-return valve',
      'ISO 3864-1 compliant signage',
      '15-minute minimum rinse duration',
      'Easy-clean spray heads',
      'Integrated dust caps'
    ]
  },
  {
    id: 'bl-hes-wall-002',
    name: 'Hand-Held Eye Shower with Two 45-degree Heads, Wall Mounted',
    category: 'Broen Lab',
    dimensions: '1.5m hose length',
    description: 'Wall-mounted, hand-held dual eye and body wash unit for emergency decontamination with advanced easy-clean spray heads.',
    fullDescription: 'The wall-mounted, hand-held dual eye and body wash unit is specifically engineered to deliver simultaneous decontamination of the eyes, face, and upper body in emergency scenarios. Featuring advanced easy-clean spray heads, the unit minimizes limescale accumulation, thereby ensuring optimal hydraulic performance and extended system longevity. Dust ingress is prevented through integrated, tightly sealing dust caps, which automatically remain open during operation to enable uninterrupted rinsing. The unit is fully compliant with EN15154 and ANSI Z358.1 standards, guaranteeing an optimal spray pattern, operational safety, and regulatory conformity.',
    specifications: [
      'EN15154 & ANSI Z358.1 compliant',
      'FLOWFIX technology - 12 L/min',
      'TMV compatible - 22°C output',
      '1.5m stainless steel-braided hose',
      'G1/2" union nut with swivel joint',
      'Non-return valve included',
      'ISO 3864-1 compliant signage',
      '15-minute continuous operation',
      'Wall-mounted design',
      'Trigger-operated spray head'
    ]
  },
  {
    id: 'bl-ebs-recessed-003',
    name: 'Eye and Body Shower, Wall-Recessed and Stainless Steel',
    category: 'Broen Lab',
    dimensions: 'Wall-recessed installation',
    description: 'Space-efficient recessed emergency shower system with integrated containment basin and stainless steel construction.',
    fullDescription: 'The recessed emergency shower system is purpose-built for simultaneous decontamination of the eyes, face, and body, offering a space-efficient solution by integrating seamlessly into wall structures. Activation is initiated by opening the cabinet door, which also functions as a containment basin for water during operation, enhancing safety and hygiene in the surrounding area. The unit incorporates an integrated 1" hand-operated activation valve for the body shower, with multiple configurable outlet options available to meet diverse application requirements.',
    specifications: [
      'EN15154 & ANSI Z358.1 compliant',
      'Stainless Steel (316L) construction',
      'BROEN-LAB Polycoat option',
      'FLOWFIX technology - 12 L/min',
      'TMV compatible - 22°C output',
      'Integrated containment basin',
      '1" hand-operated valve',
      'Easy-clean spray heads',
      'ISO 3864-1 compliant signage',
      'Wall-recessed design'
    ]
  },
  {
    id: 'bl-fcs-bowl-004',
    name: 'Freestanding Combination Shower with Bowl',
    category: 'Broen Lab',
    dimensions: 'Freestanding with floor flange',
    description: 'Comprehensive freestanding emergency shower with integrated collection bowl and self-draining mechanism.',
    fullDescription: 'The freestanding combination emergency shower is engineered for simultaneous decontamination of the eyes, face, and entire body, delivering comprehensive protection in critical situations. Constructed from high-grade brass and coated with chemical-resistant BROEN-LAB Polycoat, the unit is optimized for demanding environments such as laboratories, cleanrooms, and industrial facilities. A heavy-duty floor flange ensures secure and stable installation, while the corrosion-resistant, easy-clean shower head is designed to minimize limescale accumulation.',
    specifications: [
      'EN15154 & ANSI Z358.1 compliant',
      'Brass construction with Polycoat',
      'FLOWFIX eye wash - 12 L/min',
      'Body shower - 60 L/min',
      'TMV compatible - 22°C output',
      'Self-draining mechanism',
      'Non-return valve included',
      'Integrated collection bowl',
      'Heavy-duty floor flange',
      'ISO 3864-1 compliant signage'
    ]
  },
  {
    id: 'bl-fcs-handheld-005',
    name: 'Freestanding Combination Shower with Hand-Held Eye Shower',
    category: 'Broen Lab',
    dimensions: 'Freestanding with 1.5m hose',
    description: 'Freestanding safety shower with hand-held dual eye wash and high-capacity body shower for comprehensive protection.',
    fullDescription: 'The freestanding combination safety shower is engineered to provide simultaneous rinsing of the eyes, face, and body, delivering comprehensive protection in emergency situations. Constructed from high-durability brass and coated with chemical-resistant BROEN-LAB Polycoat, the unit is specifically designed for demanding environments such as laboratories, industrial facilities, and cleanroom applications. The integrated hand-held dual eye wash is equipped with precision-engineered spray heads that resist limescale accumulation.',
    specifications: [
      'EN15154 & ANSI Z358.1 compliant',
      'Brass construction with Polycoat',
      'FLOWFIX eye wash - 12 L/min',
      'Body shower - 60 L/min',
      'TMV compatible - 22°C output',
      '1.5m stainless steel-braided hose',
      'G1/2" union nut with swivel',
      'Reinforced floor flange',
      'Single-action activation',
      'ISO 3864-1 compliant signage'
    ]
  },
  {
    id: 'bl-bs-wall-006',
    name: 'Body Shower for Exposed Pipework, Wall-Mounted',
    category: 'Broen Lab',
    dimensions: 'Wall-mounted installation',
    description: 'Wall-mounted body safety shower designed for full-body rinsing with self-draining mechanism and Legionella protection.',
    fullDescription: 'The wall-mounted body safety shower is specifically designed to provide full-body rinsing, including emergency scenarios where the injured individual may be in a supine (lying down) position. Constructed from high-strength brass and coated with chemical-resistant BROEN-LAB Polycoat, the unit is engineered for reliable performance across a wide range of environments. The system includes a built-in self-draining mechanism paired with a non-return valve to prevent water stagnation—significantly reducing the risk of Legionella growth.',
    specifications: [
      'EN15154 & ANSI Z358.1 compliant',
      'Brass construction with Polycoat',
      'Flow rate - 60 L/min',
      'TMV compatible - 22°C output',
      'Self-draining mechanism',
      'Non-return valve included',
      'Easy-clean shower head',
      'Single-motion activation',
      'ISO 3864-1 compliant signage',
      'Supine position capability'
    ]
  },
  {
    id: 'bl-bmf-metal-007',
    name: 'Bench Mounted Fittings With Swivel Spout (Metal Knob)',
    category: 'Broen Lab',
    dimensions: 'Bench-mounted compact design',
    description: 'High-performance laboratory fitting with BALLFIX® ball valve, swivel spout, and ergonomic metal knob control.',
    fullDescription: 'The BROEN-LAB UNI-FLEX™ Bench Mounted Fitting with Swivel Spout is a high-performance, versatile fitting designed for precise water control in laboratory environments. Delivered with an integrated BALLFIX® ball valve, this fitting ensures reliability and ease of use with its ergonomic metal knob handle. The full swivel spout allows for flexible operation, while the removable metal hose nozzle supports a range of applications. Featuring a durable ceramic headwork with a 180° opening and closing function, the fitting provides smooth, long-lasting operation under demanding conditions.',
    specifications: [
      'BALLFIX® ball valve',
      'Ceramic headwork - 180° operation',
      'Max pressure - 10 bar (147 psi)',
      'Temperature range - 0–90°C',
      'Brass, POM, PTFE construction',
      'EPDM sealing',
      '96% Al₂O₃ ceramics',
      'POLYCOAT powder coating',
      'EN13792 compliant',
      'Removable metal hose nozzle'
    ]
  },
  {
    id: 'bl-bmf-lever-008',
    name: 'Bench Mounted Fittings With Swivel Spout (Wrist Action Lever)',
    category: 'Broen Lab',
    dimensions: 'Bench-mounted compact design',
    description: 'Versatile laboratory fitting with BALLFIX® ball valve, swivel spout, and ergonomic wrist action lever control.',
    fullDescription: 'The BROEN-LAB UNI-FLEX™ Bench Mounted Fitting with Swivel Spout is a high-performance, versatile fitting designed for precise water control in laboratory environments. Delivered with an integrated BALLFIX® ball valve, this fitting ensures reliability and ease of use with its ergonomic wrist action lever handle. Featuring a durable ceramic headwork with a 180° opening and closing function via the wrist action lever (90° lever turn), the fitting provides smooth, long-lasting operation under demanding conditions.',
    specifications: [
      'BALLFIX® ball valve',
      'Wrist action lever - 90° turn',
      'Ceramic headwork - 180° operation',
      'Max pressure - 10 bar (147 psi)',
      'Temperature range - 0–90°C',
      'Brass, POM, PTFE construction',
      'POLYCOAT powder coating',
      'Optional aerator available',
      'Flow restrictor option - 5 L/min',
      'EN13792 compliant'
    ]
  },
  {
    id: 'bl-bmf-column-009',
    name: 'Bench Mounted Fitting On A Column',
    category: 'Broen Lab',
    dimensions: 'Column-mounted design',
    description: 'Robust column-mounted laboratory fitting with polypropylene handle and ceramic wrist action lever for precise control.',
    fullDescription: 'The Bench Mounted Fitting on a Column is a versatile and robust solution for safe and efficient water delivery in laboratory environments. Designed for both precision and durability, this fitting features an easy-to-operate polypropylene handle with clear media indication in accordance with EN13792. The unit comes equipped with a fixed polypropylene hose nozzle, which can be conveniently unscrewed by hand (thread: male M19x1). The rubber headwork combined with an ergonomic ceramic wrist action lever offers smooth and reliable flow control.',
    specifications: [
      'Polypropylene handle',
      'EN13792 media indication',
      'Ceramic wrist action lever',
      'M19x1 threaded nozzle',
      'Max pressure - 10 bar (147 psi)',
      'Temperature range - 0–65°C',
      'Full swivel operation - 2 x 360°',
      '90° wrist action movement',
      'Brass construction',
      'EPDM sealing'
    ]
  },
  {
    id: 'bl-bmm-two-010',
    name: 'Bench Mounted Two Handle One Hole Mixer with Swivel Spout',
    category: 'Broen Lab',
    dimensions: 'Single-hole bench mounting',
    description: 'Dual-handle laboratory mixer with full swivel spout and clear media indication for hot and cold water control.',
    fullDescription: 'The Bench Mounted Two-Handle One-Hole Mixer with Swivel Spout is a highly adaptable and durable fitting designed to meet the demands of modern laboratory environments. Featuring dual polypropylene handles with clear media indication in accordance with EN13792, this mixer provides intuitive control over both hot and cold water supplies. Equipped with a full swivel spout, the mixer offers exceptional flexibility and reach, making it ideal for various laboratory tasks.',
    specifications: [
      'Dual polypropylene handles',
      'EN13792 media indication',
      'Full swivel spout',
      'Rubber headwork',
      'Ceramic wrist action lever',
      'Max pressure - 10 bar (147 psi)',
      'Temperature range - 0–65°C',
      '2 x 360° rotation',
      '90° wrist action movement',
      'M19x1 removable nozzle'
    ]
  },
  {
    id: 'bl-bmm-single-011',
    name: 'Bench Mounted One-Handle Mixer',
    category: 'Broen Lab',
    dimensions: 'Single-hole bench mounting',
    description: 'Precision single-handle laboratory mixer with ceramic cartridge and POLYCOAT metal handle for temperature and flow control.',
    fullDescription: 'The Bench Mounted One-Handle Mixer is a versatile and durable laboratory fitting, designed to provide precise control over both water temperature and flow in laboratory and research environments. Featuring a robust metal handle finished with BROEN-LAB POLYCOAT powder coating, the mixer ensures excellent chemical resistance and a long service life under demanding use. At the core of the mixer is a high-quality ceramic cartridge, allowing for precise and effortless temperature and flow regulation.',
    specifications: [
      'Metal handle with POLYCOAT',
      'High-quality ceramic cartridge',
      'Opening/closing angle - 25°',
      'Mixing range - ±45°',
      'Max pressure - 10 bar (147 psi)',
      'Temperature range - 0–90°C',
      'Brass, POM, PTFE construction',
      'EPDM sealing',
      'Integrated aerator',
      'Swivel spout design'
    ]
  }
];

// Mapping of product IDs to their actual GLB file names
const glbFileMapping: Record<string, string> = {
  'bl-hes-bench-001': 'model.glb', // This one exists as model.glb
  'bl-hes-wall-002': 'model.glb', // Check if this exists, fallback if not
  'bl-ebs-recessed-003': 'model.glb', // This one exists as model.glb
  'bl-fcs-bowl-004': 'model.glb',
  'bl-fcs-handheld-005': 'model.glb',
  'bl-bs-wall-006': 'model.glb',
  'bl-bmf-metal-007': 'model.glb',
  'bl-bmf-lever-008': 'model.glb',
  'bl-bmf-column-009': 'model.glb',
  'bl-bmm-two-010': 'model.glb',
  'bl-bmm-single-011': 'model.glb'
};

// Check if asset exists (simplified for now, in production you'd use proper asset detection)
const checkAssetExists = async (path: string): Promise<boolean> => {
  try {
    const response = await fetch(path, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
};

// Find the actual GLB file for a product
const findGLBFile = async (productId: string): Promise<string | null> => {
  const basePath = `/products/${productId}`;
  
  // Try the mapped filename first
  const mappedFile = glbFileMapping[productId];
  if (mappedFile) {
    const mappedPath = `${basePath}/${mappedFile}`;
    if (await checkAssetExists(mappedPath)) {
      return mappedPath;
    }
  }
  
  // Try common GLB filenames
  const possibleGLBNames = [
    'model.glb',
    `${productId}.glb`,
    'product.glb',
    'mesh.glb'
  ];
  
  for (const filename of possibleGLBNames) {
    const glbPath = `${basePath}/${filename}`;
    if (await checkAssetExists(glbPath)) {
      console.log(`Found GLB file for ${productId}: ${glbPath}`);
      return glbPath;
    }
  }
  
  console.log(`No GLB file found for ${productId}`);
  return null;
};

// Generate full product data with asset paths
export const generateProducts = async (): Promise<Product[]> => {
  const products: Product[] = [];
  
  for (const config of productConfigs) {
    // Find the actual GLB file
    const modelPath = await findGLBFile(config.id) || `/products/${config.id}/model.glb`;
    
    // Try to find thumbnail
    const basePath = `/products/${config.id}`;
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
  const products = productConfigs.map(config => {
    // Use the mapping to get the correct GLB file path
    const glbFileName = glbFileMapping[config.id] || 'model.glb';
    const modelPath = `/products/${config.id}/${glbFileName}`;
    
    const product = {
      ...config,
      modelPath,
      thumbnail: `/products/${config.id}/thumbnail.webp`,
      images: [
        `/products/${config.id}/images/front.jpg`,
        `/products/${config.id}/images/side.jpg`,
        `/products/${config.id}/images/detail.jpg`
      ]
    };
    
    console.log(`Product ${config.id}:`, {
      modelPath: product.modelPath,
      thumbnail: product.thumbnail,
      images: product.images
    });
    
    return product;
  });
  
  console.log('Generated products:', products);
  return products;
};

// Generate unique categories from products
export const getCategories = (): string[] => {
  const uniqueCategories = [...new Set(productConfigs.map(product => product.category))];
  return ['all', ...uniqueCategories];
};
