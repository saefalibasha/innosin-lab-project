// Utility functions for managing product assets and data
// This file handles the generation of product data from the public/products directory structure

import { Product } from '@/types/product';

// Dynamic asset loading utility that integrates uploaded files with existing products
const loadUploadedAssets = (): { [key: string]: { glb?: string; jpg?: string } } => {
  const uploadedAssets: { [key: string]: { glb?: string; jpg?: string } } = {};
  
  try {
    // Overview images for Mobile Cabinet Series uploaded through the asset manager
    const overviewAssets = {
      'mobile-cabinet-750mm-overview': {
        jpg: '/products/mobile-cabinet-750mm-overview/750mm-height-bench-overview.jpg'
      },
      'mobile-cabinet-900mm-overview': {
        jpg: '/products/mobile-cabinet-900mm-overview/900mm-height-bench-overview.jpg'
      }
    };
    
    // All uploaded individual product assets from the asset management system
    // These are automatically detected from the public/products directory structure
    const uploadedProductAssets = detectUploadedProducts();
    
    return { ...uploadedAssets, ...overviewAssets, ...uploadedProductAssets };
  } catch (error) {
    console.warn('Error loading uploaded assets:', error);
    return {};
  }
};

// Detect products uploaded through the asset management system
const detectUploadedProducts = (): { [key: string]: { glb?: string; jpg?: string } } => {
  // Map uploaded assets from public/products directory structure
  const uploadedAssets = {
    // Innosin Lab Mobile Cabinet Series - 750mm Height
    'innosin-mc-pc-755065': {
      glb: '/products/innosin-mc-pc-755065/MC-PC (755065).glb',
      jpg: '/products/innosin-mc-pc-755065/MC-PC (755065).jpg'
    },
    'innosin-mc-pc-755080': {
      glb: '/products/innosin-mc-pc-755080/MC-PC (755080).glb',
      jpg: '/products/innosin-mc-pc-755080/MC-PC (755080).jpg'
    },
    'innosin-mc-pc-lh-505065': {
      glb: '/products/innosin-mc-pc-lh-505065/MC-PC-LH (505065).glb',
      jpg: '/products/innosin-mc-pc-lh-505065/MC-PC-LH (505065).jpg'
    },
    'innosin-mc-pc-lh-505080': {
      glb: '/products/innosin-mc-pc-lh-505080/MC-PC-LH (505080).glb',
      jpg: '/products/innosin-mc-pc-lh-505080/MC-PC-LH (505080).jpg'
    },
    'innosin-mc-pc-rh-505065': {
      glb: '/products/innosin-mc-pc-rh-505065/MC-PC-RH (505065).glb',
      jpg: '/products/innosin-mc-pc-rh-505065/MC-PC-RH (505065).jpg'
    },
    'innosin-mc-pc-rh-505080': {
      glb: '/products/innosin-mc-pc-rh-505080/MC-PC-RH (505080).glb',
      jpg: '/products/innosin-mc-pc-rh-505080/MC-PC-RH (505080).jpg'
    },
    'innosin-mcc-pc-lh-505065': {
      glb: '/products/innosin-mcc-pc-lh-505065/MCC-PC-LH (505065).glb',
      jpg: '/products/innosin-mcc-pc-rh-505065/placeholder.jpg'
    },
    'innosin-mcc-pc-lh-505080': {
      glb: '/products/innosin-mcc-pc-lh-505080/MCC-PC-LH (505080).glb',
      jpg: '/products/innosin-mcc-pc-lh-505080/placeholder.jpg'
    },
    'innosin-mcc-pc-rh-505065': {
      glb: '/products/innosin-mcc-pc-rh-505065/MCC-PC-RH (505065).glb',
      jpg: '/products/innosin-mcc-pc-rh-505065/placeholder.jpg'
    },
    'innosin-mcc-pc-rh-505080': {
      glb: '/products/innosin-mcc-pc-rh-505080/MCC-PC-RH (505080).glb',
      jpg: '/products/innosin-mcc-pc-rh-505080/placeholder.jpg'
    },
    'innosin-mc-pc-dwr3-505080': {
      glb: '/products/innosin-mc-pc-dwr3-505080/MC-PC-DWR3 (505080).glb',
      jpg: '/products/innosin-mc-pc-dwr3-505080/placeholder.jpg'
    },
    'innosin-mc-pc-dwr4-505080': {
      glb: '/products/innosin-mc-pc-dwr4-505080/MC-PC-DWR4 (505080).glb',
      jpg: '/products/innosin-mc-pc-dwr4-505080/placeholder.jpg'
    },
    'innosin-mc-pc-dwr6-905080': {
      glb: '/products/innosin-mc-pc-dwr6-905080/MC-PC-DWR6 (905080).glb',
      jpg: '/products/innosin-mc-pc-dwr6-905080/placeholder.jpg'
    },
    // Other Innosin Lab Products
    'innosin-or-pc-3838': {
      glb: '/products/innosin-or-pc-3838/OR-PC-3838.glb',
      jpg: '/products/innosin-or-pc-3838/OR-PC-3838.jpg'
    },
    'innosin-or-pc-604518': {
      glb: '/products/innosin-or-pc-604518/OR-PC-3838 (604518).glb',
      jpg: '/products/innosin-or-pc-604518/OR-PC-3838 (604518).jpg'
    },
    'innosin-tcg-pc-754018': {
      glb: '/products/innosin-tcg-pc-754018/TCG-PC (754018).glb',
      jpg: '/products/innosin-tcg-pc-754018/TCG-PC (754018).jpg'
    },
    'innosin-wcg-pc-753375': {
      glb: '/products/innosin-wcg-pc-753375/WCG-PC (753375).glb',
      jpg: '/products/innosin-wcg-pc-753375/WCG-PC (753375).jpg'
    }
  };
  
  return uploadedAssets;
};

// Validate asset paths and check if they exist
const validateAssetPath = (path: string): boolean => {
  // Skip validation for placeholder assets
  if (path.includes('PLACEHOLDER') || path.includes('placeholder')) {
    return false;
  }
  
  // In a real environment, this would check if the file exists
  // For development, we'll assume all non-placeholder paths are valid
  return true;
};

// Enhanced product loading with asset validation
const enhanceProductWithAssets = (product: Product): Product => {
  const uploadedAssets = loadUploadedAssets();
  
  // Check if there are uploaded assets for this product
  const productAssets = uploadedAssets[product.id];
  if (productAssets) {
    // Update with uploaded assets if available
    return {
      ...product,
      modelPath: productAssets.glb || product.modelPath,
      thumbnail: productAssets.jpg || product.thumbnail,
      images: productAssets.jpg ? [productAssets.jpg, ...product.images] : product.images
    };
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
      id: "bl-hes-wall-002",
      name: "Hand-Held Eye Shower with Two 45-degree Heads, Wall Mounted",
      category: "Broen-Lab",
      dimensions: "1.5m hose length",
      description: "Wall-mounted, hand-held dual eye and body wash unit for emergency decontamination with advanced easy-clean spray heads.",
      fullDescription: "The wall-mounted, hand-held dual eye and body wash unit is specifically engineered to deliver simultaneous decontamination of the eyes, face, and upper body in emergency scenarios. Featuring advanced easy-clean spray heads, the unit minimizes limescale accumulation, thereby ensuring optimal hydraulic performance and extended system longevity. Dust ingress is prevented through integrated, tightly sealing dust caps, which automatically remain open during operation to enable uninterrupted rinsing. The unit is fully compliant with EN15154 and ANSI Z358.1 standards, guaranteeing an optimal spray pattern, operational safety, and regulatory conformity.",
      specifications: [
        "EN15154 & ANSI Z358.1 compliant",
        "FLOWFIX technology - 12 L/min",
        "TMV compatible - 22°C output",
        "1.5m stainless steel-braided hose",
        "G1/2\" union nut with swivel joint",
        "Non-return valve included",
        "ISO 3864-1 compliant signage",
        "15-minute continuous operation",
        "Wall-mounted design",
        "Trigger-operated spray head"
      ],
      modelPath: "/products/bl-hes-wall-002/model.glb",
      thumbnail: "/products/bl-hes-wall-002/images/front.jpg",
      images: ["/products/bl-hes-wall-002/images/front.jpg"]
    },
    {
      id: "bl-ebs-recessed-003",
      name: "Eye and Body Shower, Wall-Recessed and Stainless Steel",
      category: "Broen-Lab",
      dimensions: "Wall-recessed installation",
      description: "Space-efficient recessed emergency shower system with integrated containment basin and stainless steel construction.",
      fullDescription: "The recessed emergency shower system is purpose-built for simultaneous decontamination of the eyes, face, and body, offering a space-efficient solution by integrating seamlessly into wall structures. Activation is initiated by opening the cabinet door, which also functions as a containment basin for water during operation, enhancing safety and hygiene in the surrounding area. The unit incorporates an integrated 1\" hand-operated activation valve for the body shower, with multiple configurable outlet options available to meet diverse application requirements.",
      specifications: [
        "EN15154 & ANSI Z358.1 compliant",
        "Stainless Steel (316L) construction",
        "BROEN-LAB Polycoat option",
        "FLOWFIX technology - 12 L/min",
        "TMV compatible - 22°C output",
        "Integrated containment basin",
        "1\" hand-operated valve",
        "Easy-clean spray heads",
        "ISO 3864-1 compliant signage",
        "Wall-recessed design"
      ],
      modelPath: "/products/bl-ebs-recessed-003/model.glb",
      thumbnail: "/products/bl-ebs-recessed-003/images/front.jpg",
      images: ["/products/bl-ebs-recessed-003/images/front.jpg"]
    },
    {
      id: "bl-fcs-bowl-004",
      name: "Freestanding Combination Shower with Bowl",
      category: "Broen-Lab",
      dimensions: "Freestanding with floor flange",
      description: "Comprehensive freestanding emergency shower with integrated collection bowl and self-draining mechanism.",
      fullDescription: "The freestanding combination emergency shower is engineered for simultaneous decontamination of the eyes, face, and entire body, delivering comprehensive protection in critical situations. Constructed from high-grade brass and coated with chemical-resistant BROEN-LAB Polycoat, the unit is optimized for demanding environments such as laboratories, cleanrooms, and industrial facilities. A heavy-duty floor flange ensures secure and stable installation, while the corrosion-resistant, easy-clean shower head is designed to minimize limescale accumulation.",
      specifications: [
        "EN15154 & ANSI Z358.1 compliant",
        "Brass construction with Polycoat",
        "FLOWFIX eye wash - 12 L/min",
        "Body shower - 60 L/min",
        "TMV compatible - 22°C output",
        "Self-draining mechanism",
        "Non-return valve included",
        "Integrated collection bowl",
        "Heavy-duty floor flange",
        "ISO 3864-1 compliant signage"
      ],
      modelPath: "/products/bl-fcs-bowl-004/model.glb",
      thumbnail: "/products/bl-fcs-bowl-004/images/front.jpg",
      images: ["/products/bl-fcs-bowl-004/images/front.jpg"]
    },
    {
      id: "bl-fcs-handheld-005",
      name: "Freestanding Combination Shower with Hand-Held Eye Shower",
      category: "Broen-Lab",
      dimensions: "Freestanding with 1.5m hose",
      description: "Freestanding safety shower with hand-held dual eye wash and high-capacity body shower for comprehensive protection.",
      fullDescription: "The freestanding combination safety shower is engineered to provide simultaneous rinsing of the eyes, face, and body, delivering comprehensive protection in emergency situations. Constructed from high-durability brass and coated with chemical-resistant BROEN-LAB Polycoat, the unit is specifically designed for demanding environments such as laboratories, industrial facilities, and cleanroom applications. The integrated hand-held dual eye wash is equipped with precision-engineered spray heads that resist limescale accumulation.",
      specifications: [
        "EN15154 & ANSI Z358.1 compliant",
        "Brass construction with Polycoat",
        "FLOWFIX eye wash - 12 L/min",
        "Body shower - 60 L/min",
        "TMV compatible - 22°C output",
        "1.5m stainless steel-braided hose",
        "G1/2\" union nut with swivel",
        "Reinforced floor flange",
        "Single-action activation",
        "ISO 3864-1 compliant signage"
      ],
      modelPath: "/products/bl-fcs-handheld-005/model.glb",
      thumbnail: "/products/bl-fcs-handheld-005/images/front.jpg",
      images: ["/products/bl-fcs-handheld-005/images/front.jpg"]
    },
    {
      id: "bl-bs-wall-006",
      name: "Body Shower for Exposed Pipework, Wall-Mounted",
      category: "Broen-Lab",
      dimensions: "Wall-mounted installation",
      description: "Wall-mounted body safety shower designed for full-body rinsing with self-draining mechanism and Legionella protection.",
      fullDescription: "The wall-mounted body safety shower is specifically designed to provide full-body rinsing, including emergency scenarios where the injured individual may be in a supine (lying down) position. Constructed from high-strength brass and coated with chemical-resistant BROEN-LAB Polycoat, the unit is engineered for reliable performance across a wide range of environments. The system includes a built-in self-draining mechanism paired with a non-return valve to prevent water stagnation—significantly reducing the risk of Legionella growth.",
      specifications: [
        "EN15154 & ANSI Z358.1 compliant",
        "Brass construction with Polycoat",
        "Flow rate - 60 L/min",
        "TMV compatible - 22°C output",
        "Self-draining mechanism",
        "Non-return valve included",
        "Easy-clean shower head",
        "Single-motion activation",
        "ISO 3864-1 compliant signage",
        "Supine position capability"
      ],
      modelPath: "/products/bl-bs-wall-006/model.glb",
      thumbnail: "/products/bl-bs-wall-006/images/front.jpg",
      images: ["/products/bl-bs-wall-006/images/front.jpg"]
    },
    {
      id: "bl-bmf-metal-007",
      name: "Bench Mounted Fittings With Swivel Spout (Metal Knob)",
      category: "Broen-Lab",
      dimensions: "Bench mounting",
      description: "Professional bench-mounted water fitting with swivel spout and durable metal knob control.",
      fullDescription: "The bench-mounted fitting with swivel spout features robust metal knob control for precise water flow regulation. Designed for laboratory and industrial applications, this fitting provides reliable water access with professional-grade construction and smooth operation.",
      specifications: [
        "Metal knob control",
        "Swivel spout design",
        "Bench mounting system",
        "Professional construction",
        "Precise flow control",
        "Industrial-grade materials",
        "Easy installation",
        "Maintenance-friendly design"
      ],
      modelPath: "/products/bl-bmf-metal-007/model.glb",
      thumbnail: "/products/bl-bmf-metal-007/images/front.jpg",
      images: ["/products/bl-bmf-metal-007/images/front.jpg"]
    },
    {
      id: "bl-bmf-lever-008",
      name: "Bench Mounted Fittings With Swivel Spout (Lever Handle)",
      category: "Broen-Lab",
      dimensions: "Bench mounting",
      description: "Professional bench-mounted water fitting with swivel spout and ergonomic lever handle control.",
      fullDescription: "The bench-mounted fitting with swivel spout features an ergonomic lever handle for easy operation and precise water flow control. Ideal for laboratory and commercial applications where frequent use requires comfortable and reliable operation.",
      specifications: [
        "Ergonomic lever handle",
        "Swivel spout design",
        "Bench mounting system",
        "Easy operation",
        "Precise flow control",
        "Commercial-grade construction",
        "Quick installation",
        "User-friendly design"
      ],
      modelPath: "/products/bl-bmf-lever-008/model.glb",
      thumbnail: "/products/bl-bmf-lever-008/images/front.jpg",
      images: ["/products/bl-bmf-lever-008/images/front.jpg"]
    },
    {
      id: "bl-bmf-column-009",
      name: "Bench Mounted Fittings With Swivel Spout (Column Design)",
      category: "Broen-Lab",
      dimensions: "Bench mounting",
      description: "Professional bench-mounted water fitting with swivel spout in elegant column design.",
      fullDescription: "The bench-mounted fitting features an elegant column design with swivel spout for professional laboratory environments. The sophisticated design combines functionality with aesthetic appeal, making it suitable for high-end laboratory installations.",
      specifications: [
        "Column design aesthetic",
        "Swivel spout functionality",
        "Bench mounting system",
        "Professional appearance",
        "Reliable water flow",
        "Premium construction",
        "Elegant design",
        "Laboratory-grade quality"
      ],
      modelPath: "/products/bl-bmf-column-009/model.glb",
      thumbnail: "/products/bl-bmf-column-009/images/front.jpg",
      images: ["/products/bl-bmf-column-009/images/front.jpg"]
    },
    {
      id: "bl-bmm-two-010",
      name: "Bench Mounted Mixer Two Handle",
      category: "Broen-Lab",
      dimensions: "Bench mounting",
      description: "Professional dual-handle bench-mounted mixer for precise temperature and flow control.",
      fullDescription: "The bench-mounted dual-handle mixer provides independent control of hot and cold water supplies, allowing for precise temperature regulation. Designed for laboratory and commercial applications requiring accurate water temperature control.",
      specifications: [
        "Dual handle operation",
        "Independent temperature control",
        "Bench mounting system",
        "Precise flow regulation",
        "Hot/cold water mixing",
        "Professional construction",
        "Laboratory-grade materials",
        "Reliable operation"
      ],
      modelPath: "/products/bl-bmm-two-010/model.glb",
      thumbnail: "/products/bl-bmm-two-010/images/front.jpg",
      images: ["/products/bl-bmm-two-010/images/front.jpg"]
    },
    {
      id: "bl-bmm-single-011",
      name: "Bench Mounted Mixer Single Handle",
      category: "Broen-Lab",
      dimensions: "Bench mounting",
      description: "Professional single-handle bench-mounted mixer for easy temperature and flow control.",
      fullDescription: "The bench-mounted single-handle mixer offers convenient one-handed operation for both temperature and flow control. Ideal for laboratory environments where ease of use and reliable performance are essential.",
      specifications: [
        "Single handle operation",
        "Combined temperature/flow control",
        "Bench mounting system",
        "One-handed operation",
        "Easy temperature adjustment",
        "Professional design",
        "Laboratory applications",
        "Reliable performance"
      ],
      modelPath: "/products/bl-bmm-single-011/model.glb",
      thumbnail: "/products/bl-bmm-single-011/images/front.jpg",
      images: ["/products/bl-bmm-single-011/images/front.jpg"]
    },

    // HAMILTON LABORATORY SOLUTIONS PRODUCTS
    {
      id: "hls-product-001",
      name: "Safe Aire II Fume Hoods Bench Mounted",
      category: "Hamilton Laboratory Solutions",
      dimensions: "A x B x C mm",
      description: "Features spill containment, high visibility, and energy-efficient airflow—ideal for any modern lab.",
      fullDescription: "Hamilton SafeAire II Fume Hoods deliver advanced protection and comfort with a secondary spill trough, ergonomic flush sill, and a tall 35\" viewing area. Choose from bench or floor-mounted models and four widths. Features include louvered bypass airflow, a chemical-resistant finish, impact-resistant sash, and smart containment details for safe, efficient laboratory operation.",
      specifications: [
        "Widths: 4 ft, 5 ft, 6 ft, 8 ft",
        "35-inch extended viewing height",
        "Secondary spill containment trough",
        "Louvered bypass for steady airflow",
        "Unframed, impact-resistant sash with lock/release",
        "Soft PVC gasketed access panel",
        "Ergonomic, obstruction-free airfoil",
        "Contoured exhaust collar reduces noise and saves energy",
        "Chemical-resistant powdercoat in 18 standard colors",
        "Liner options: polyresin, stainless steel, or PVC (NFPA compliant)",
        "Optional electronic safety monitor and remote baffle control",
        "SEFA 8 and LEED compliant"
      ],
      modelPath: "/products/hls-product-001/model.glb",
      thumbnail: "/products/hls-product-001/thumbnail.webp",
      images: ["/products/hls-product-001/images/front.jpg"]
    },
    {
      id: "hls-product-002",
      name: "Safe Aire II Fume Hoods Floor Mounted",
      category: "Hamilton Laboratory Solutions",
      dimensions: "A x B x C mm",
      description: "Features full-view sashes, side access, integrated lighting, and is compatible with both constant and variable air volume exhaust systems.",
      fullDescription: "The Safe Aire II Floor-Mounted Fume Hood is designed for large or roll-in laboratory equipment and supports both constant and variable air volume exhaust systems. It features a full-view vertical sash, side access panels, fluorescent lighting, electrical outlets, and multiple width options. Safety glass sashes, service access, and pre-plugged utility holes come standard. Units are UL 1805 classified and shipped for easy job-site assembly",
      specifications: [
        "Floor-mounted, restricted bypass fume hood",
        "Available widths: 4 ft, 5 ft, 6 ft, 8 ft",
        "Full-view laminated safety glass vertical sash",
        "Side access panels with PVC gaskets",
        "Integrated fluorescent lighting",
        "Includes cup sink and dual 120 VAC outlets",
        "Pre-plugged holes for utility fixture installation",
        "UL 1805 safety classification",
        "Exhaust volumes: up to 2000 CFM (vertical), 1125 CFM (horizontal)",
        "Shipped knocked-down for easy assembly"
      ],
      modelPath: "/products/hls-product-002/model.glb",
      thumbnail: "/products/hls-product-002/thumbnail.webp",
      images: ["/products/hls-product-002/thumbnail.webp"]
    },

    // ORIENTAL GIKEN PRODUCTS
    {
      id: "og-bsc-001",
      name: "Tangerine Biosafety Cabinet",
      category: "Oriental Giken Inc.",
      dimensions: "X × X × X mm",
      description: "Class II biosafety cabinet featuring Japanese design elegance, intuitive operation, and rigorous safety performance.",
      fullDescription: "Tangerine is a Japan‑designed Class II biosafety cabinet compliant with JIS K 3800 (NSF/ANSI‑49 equivalent). It delivers operator and product protection via precise airflow management, HEPA filtration, and smart sash/monitoring systems. Its curved aesthetics, intuitive interface, ample workspace, digital displays, voice alerts, and castered open-base stand enhance usability and lab adaptability.",
      specifications: [
        "Class II (Type A2/B2) biosafety cabinet, JIS K 3800 compliant",
        "Digital monitoring with inflow/downflow velocity, filter & UV-lamp life",
        "Voice alert system for low airflow or system issues",
        "HEPA filtration ≥99.99% at 0.3 µm",
        "Spacious workspace; larger than standard models",
        "Curved design, intuitive flat-switch panel, LED lighting",
        "Open-base frame with casters for convenient relocation"
      ],
      modelPath: "/products/og-bsc-001/model.glb",
      thumbnail: "/products/og-bsc-001/images/front.jpg",
      images: ["/products/og-bsc-001/images/front.jpg"]
    },
    {
      id: "og-fh-002", 
      name: "NOCE Series Fume Hood",
      category: "Oriental Giken Inc.",
      dimensions: "X × X × X mm",
      description: "Sleek, ergonomic fume hood offering both high containment performance and refined aesthetics.",
      fullDescription: "The Oriental Giken NOCE Series fume hood seamlessly merges cutting‑edge safety with elegant design. Meeting ASHRAE 110 and EN 14175‑3 standards, it incorporates advanced airflow-control technology and ergonomic sash operation to reduce user strain while ensuring containment and efficiency",
      specifications: [
        "ASHRAE 110 & EN 14175‑3 compliance",
        "Advanced Airflow Control Technology",
        "Ergonomic sash design",
        "Chemical‑resistant interior",
        "Integrated lighting and alarm systems"
      ],
      modelPath: "/products/og-fh-002/model.glb", 
      thumbnail: "/products/og-fh-002/images/front.jpg",
      images: ["/products/og-fh-002/images/front.jpg"]
    },

    // INNOSIN LAB PRODUCTS

    // KNEE SPACE SERIES
    {
      id: "innosin-ks-series",
      name: "Knee Space KS Series",
      category: "Innosin Lab",
      dimensions: "700-1200 mm width range",
      description: "Ergonomic knee space units providing comfortable leg room for laboratory workstations in multiple sizes.",
      fullDescription: "The KS Series knee space units are designed to provide optimal comfort and ergonomics for laboratory personnel during extended work periods. Available in multiple widths to accommodate different workstation requirements, from compact 700mm units for space-constrained labs to spacious 1200mm units for collaborative workspaces.",
      specifications: [
        "Multiple width options available",
        "Ergonomic design for extended comfort",
        "Durable construction materials",
        "Easy integration with bench systems",
        "Professional laboratory finish",
        "Available in powder coat and stainless steel"
      ],
      modelPath: "/products/innosin-ks-700/model.glb",
      thumbnail: "/products/innosin-ks-700/images/front.jpg",
      images: ["/products/innosin-ks-700/images/front.jpg"],
      baseProductId: "innosin-ks-series",
      finishes: [
        {
          type: "powder-coat",
          name: "Powder Coat",
          price: "Standard"
        },
        {
          type: "stainless-steel", 
          name: "Stainless Steel",
          price: "Premium"
        }
      ],
      variants: [
        {
          id: "innosin-ks-700",
          size: "KS700",
          dimensions: "700 mm width",
          modelPath: "/products/innosin-ks-700/model.glb",
          thumbnail: "/products/innosin-ks-700/images/front.jpg",
          images: ["/products/innosin-ks-700/images/front.jpg"]
        },
        {
          id: "innosin-ks-750",
          size: "KS750", 
          dimensions: "750 mm width",
          modelPath: "/products/innosin-ks-750/model.glb",
          thumbnail: "/products/innosin-ks-750/images/front.jpg",
          images: ["/products/innosin-ks-750/images/front.jpg"]
        },
        {
          id: "innosin-ks-800",
          size: "KS800",
          dimensions: "800 mm width", 
          modelPath: "/products/innosin-ks-800/model.glb",
          thumbnail: "/products/innosin-ks-800/images/front.jpg",
          images: ["/products/innosin-ks-800/images/front.jpg"]
        },
        {
          id: "innosin-ks-850",
          size: "KS850",
          dimensions: "850 mm width",
          modelPath: "/products/innosin-ks-850/model.glb", 
          thumbnail: "/products/innosin-ks-850/images/front.jpg",
          images: ["/products/innosin-ks-850/images/front.jpg"]
        },
        {
          id: "innosin-ks-900",
          size: "KS900",
          dimensions: "900 mm width",
          modelPath: "/products/innosin-ks-900/model.glb",
          thumbnail: "/products/innosin-ks-900/images/front.jpg", 
          images: ["/products/innosin-ks-900/images/front.jpg"]
        },
        {
          id: "innosin-ks-1000", 
          size: "KS1000",
          dimensions: "1000 mm width",
          modelPath: "/products/innosin-ks-1000/model.glb",
          thumbnail: "/products/innosin-ks-1000/images/front.jpg",
          images: ["/products/innosin-ks-1000/images/front.jpg"]
        },
        {
          id: "innosin-ks-1200",
          size: "KS1200", 
          dimensions: "1200 mm width",
          modelPath: "/products/innosin-ks-1200/model.glb",
          thumbnail: "/products/innosin-ks-1200/images/front.jpg",
          images: ["/products/innosin-ks-1200/images/front.jpg"]
        }
      ]
    },

    // MOBILE CABINET SERIES FOR 750MM H BENCH
    {
      id: "innosin-mc-750-series",
      name: "Mobile Cabinet Series for 750mm Bench",
      category: "Innosin Lab",
      dimensions: "500-750 mm width range",
      description: "Mobile laboratory cabinets designed for 750mm height benches, available in combination, double door, and single door configurations.",
      fullDescription: "The Mobile Cabinet Series for 750mm height benches offers versatile storage solutions for laboratory environments. Available in multiple configurations including combination cabinets with mixed storage, double door units for secure storage, and single door units for easy access. All units feature mobile design with casters for flexible laboratory layouts.",
      specifications: [
        "750mm bench height compatibility",
        "Multiple configuration options",
        "Mobile design with locking casters",
        "Chemical-resistant finish",
        "Professional laboratory construction",
        "Available in powder coat and stainless steel"
      ],
      modelPath: "/products/innosin-mcc-pc-lh-505065/model.glb",
      thumbnail: "/products/mobile-cabinet-750mm-overview/750mm-height-bench-overview.jpg",
      images: ["/products/mobile-cabinet-750mm-overview/750mm-height-bench-overview.jpg"],
      baseProductId: "innosin-mc-750-series",
      finishes: [
        {
          type: "powder-coat",
          name: "Powder Coat",
          price: "Standard"
        },
        {
          type: "stainless-steel",
          name: "Stainless Steel", 
          price: "Premium"
        }
      ],
      variants: [
        {
          id: "innosin-mcc-pc-lh-505065",
          size: "Combination Left Hand",
          dimensions: "500×500×650 mm",
          modelPath: "/products/innosin-mcc-pc-lh-505065/model.glb",
          thumbnail: "/products/innosin-mcc-pc-lh-505065/images/front.jpg",
          images: ["/products/innosin-mcc-pc-lh-505065/images/front.jpg"]
        },
        {
          id: "innosin-mcc-pc-rh-505065",
          size: "Combination Right Hand",
          dimensions: "500×500×650 mm",
          modelPath: "/products/innosin-mcc-pc-rh-505065/model.glb",
          thumbnail: "/products/innosin-mcc-pc-rh-505065/images/front.jpg",
          images: ["/products/innosin-mcc-pc-rh-505065/images/front.jpg"]
        },
        {
          id: "innosin-mc-pc-755065",
          size: "Double Door",
          dimensions: "750×500×650 mm",
          modelPath: "/products/innosin-mc-pc-755065/model.glb",
          thumbnail: "/products/innosin-mc-pc-755065/images/front.jpg",
          images: ["/products/innosin-mc-pc-755065/images/front.jpg"]
        },
        {
          id: "innosin-mcc-pc-755065",
          size: "Combination Double Door",
          dimensions: "750×500×650 mm",
          modelPath: "/products/innosin-mcc-pc-755065/model.glb",
          thumbnail: "/products/innosin-mcc-pc-755065/images/front.jpg",
          images: ["/products/innosin-mcc-pc-755065/images/front.jpg"]
        },
        {
          id: "innosin-mc-pc-lh-505065",
          size: "Single Door Left Hand",
          dimensions: "500×500×650 mm",
          modelPath: "/products/innosin-mc-pc-lh-505065/model.glb",
          thumbnail: "/products/innosin-mc-pc-lh-505065/images/front.jpg",
          images: ["/products/innosin-mc-pc-lh-505065/images/front.jpg"]
        },
        {
          id: "innosin-mc-pc-rh-505065",
          size: "Single Door Right Hand",
          dimensions: "500×500×650 mm",
          modelPath: "/products/innosin-mc-pc-rh-505065/model.glb",
          thumbnail: "/products/innosin-mc-pc-rh-505065/images/front.jpg",
          images: ["/products/innosin-mc-pc-rh-505065/images/front.jpg"]
        },
        {
          id: "innosin-mc-pc-dwr2-905065",
          size: "Drawer Cabinet DD-DWR2",
          dimensions: "900×500×650 mm",
          modelPath: "/products/innosin-mc-pc-dwr2-905065/model.glb",
          thumbnail: "/products/innosin-mc-pc-dwr2-905065/images/front.jpg",
          images: ["/products/innosin-mc-pc-dwr2-905065/images/front.jpg"]
        },
        {
          id: "innosin-mc-pc-dwr3-505065",
          size: "Drawer Cabinet DWR3-1/2",
          dimensions: "500×500×650 mm",
          modelPath: "/products/innosin-mc-pc-dwr3-505065/model.glb",
          thumbnail: "/products/innosin-mc-pc-dwr3-505065/images/front.jpg",
          images: ["/products/innosin-mc-pc-dwr3-505065/images/front.jpg"]
        },
        {
          id: "innosin-mc-pc-dwr6-905065",
          size: "Drawer Cabinet DWR6-1/2",
          dimensions: "900×500×650 mm",
          modelPath: "/products/innosin-mc-pc-dwr6-905065/model.glb",
          thumbnail: "/products/innosin-mc-pc-dwr6-905065/images/front.jpg",
          images: ["/products/innosin-mc-pc-dwr6-905065/images/front.jpg"]
        }
      ]
    },

    // MOBILE CABINET SERIES FOR 900MM H BENCH
    {
      id: "innosin-mc-900-series",
      name: "Mobile Cabinet Series for 900mm Bench",
      category: "Innosin Lab",
      dimensions: "500-750 mm width range",
      description: "Mobile laboratory cabinets designed for 900mm height benches, available in combination, double door, and drawer configurations.",
      fullDescription: "The Mobile Cabinet Series for 900mm height benches provides enhanced storage capacity for laboratory environments. These taller units offer increased storage volume while maintaining mobility through heavy-duty casters. Available in various configurations to meet different laboratory storage requirements.",
      specifications: [
        "900mm bench height compatibility",
        "Enhanced storage capacity",
        "Heavy-duty mobile design",
        "Chemical-resistant finish",
        "Professional laboratory construction",
        "Available in powder coat and stainless steel"
      ],
      modelPath: "/products/innosin-mcc-pc-755080/model.glb",
      thumbnail: "/products/mobile-cabinet-900mm-overview/900mm-height-bench-overview.jpg",
      images: ["/products/mobile-cabinet-900mm-overview/900mm-height-bench-overview.jpg"],
      baseProductId: "innosin-mc-900-series",
      finishes: [
        {
          type: "powder-coat",
          name: "Powder Coat",
          price: "Standard"
        },
        {
          type: "stainless-steel",
          name: "Stainless Steel",
          price: "Premium"
        }
      ],
      variants: [
        {
          id: "innosin-mcc-pc-755080",
          size: "Combination Cabinet",
          dimensions: "750×500×800 mm",
          modelPath: "/products/innosin-mcc-pc-755080/model.glb",
          thumbnail: "/products/innosin-mcc-pc-755080/images/front.jpg",
          images: ["/products/innosin-mcc-pc-755080/images/front.jpg"]
        },
        {
          id: "innosin-mcc-pc-lh-505080",
          size: "Combination Left Hand",
          dimensions: "500×500×800 mm",
          modelPath: "/products/innosin-mcc-pc-lh-505080/model.glb",
          thumbnail: "/products/innosin-mcc-pc-lh-505080/images/front.jpg",
          images: ["/products/innosin-mcc-pc-lh-505080/images/front.jpg"]
        },
        {
          id: "innosin-mcc-pc-rh-505080",
          size: "Combination Right Hand",
          dimensions: "500×500×800 mm",
          modelPath: "/products/innosin-mcc-pc-rh-505080/model.glb",
          thumbnail: "/products/innosin-mcc-pc-rh-505080/images/front.jpg",
          images: ["/products/innosin-mcc-pc-rh-505080/images/front.jpg"]
        },
        {
          id: "innosin-mc-pc-755080",
          size: "Double Door",
          dimensions: "750×500×800 mm",
          modelPath: "/products/innosin-mc-pc-755080/model.glb",
          thumbnail: "/products/innosin-mc-pc-755080/images/front.jpg",
          images: ["/products/innosin-mc-pc-755080/images/front.jpg"]
        },
        {
          id: "innosin-mc-pc-dwr2-905080",
          size: "Drawer Cabinet DD-DWR2",
          dimensions: "900×500×800 mm",
          modelPath: "/products/innosin-mc-pc-dwr2-905080/model.glb",
          thumbnail: "/products/innosin-mc-pc-dwr2-905080/images/front.jpg",
          images: ["/products/innosin-mc-pc-dwr2-905080/images/front.jpg"]
        },
        {
          id: "innosin-mc-pc-dwr34-505080",
          size: "Drawer Cabinet DWR3/4",
          dimensions: "500×500×800 mm",
          modelPath: "/products/innosin-mc-pc-dwr34-505080/model.glb",
          thumbnail: "/products/innosin-mc-pc-dwr34-505080/images/front.jpg",
          images: ["/products/innosin-mc-pc-dwr34-505080/images/front.jpg"]
        },
        {
          id: "innosin-mc-pc-dwr68-905080",
          size: "Drawer Cabinet DWR6/8",
          dimensions: "900×500×800 mm",
          modelPath: "/products/innosin-mc-pc-dwr68-905080/model.glb",
          thumbnail: "/products/innosin-mc-pc-dwr68-905080/images/front.jpg",
          images: ["/products/innosin-mc-pc-dwr68-905080/images/front.jpg"]
        }
      ]
    },

    // MODULAR CABINET SERIES
    {
      id: "innosin-modular-combination-series",
      name: "Modular Combination Cabinet Series",
      category: "Innosin Lab",
      dimensions: "450-900 mm width range",
      description: "Modular combination cabinets with mixed storage solutions including drawers, shelves, and door compartments.",
      fullDescription: "The Modular Combination Cabinet Series offers versatile storage solutions with mixed configurations. These units combine different storage types within a single cabinet, providing optimized organization for various laboratory equipment and supplies.",
      specifications: [
        "Mixed storage configurations",
        "Modular design for flexibility",
        "Professional laboratory construction",
        "Chemical-resistant finish",
        "Available in powder coat and stainless steel",
        "Multiple size options"
      ],
      modelPath: "/products/innosin-pc-cb-755590/model.glb",
      thumbnail: "/products/innosin-pc-cb-755590/images/front.jpg",
      images: ["/products/innosin-pc-cb-755590/images/front.jpg"],
      baseProductId: "innosin-modular-combination-series",
      finishes: [
        {
          type: "powder-coat",
          name: "Powder Coat",
          price: "Standard"
        },
        {
          type: "stainless-steel",
          name: "Stainless Steel",
          price: "Premium"
        }
      ],
      variants: [
        {
          id: "innosin-pc-cb-755590",
          size: "Double Door CB",
          dimensions: "750×550×900 mm",
          modelPath: "/products/innosin-pc-cb-755590/model.glb",
          thumbnail: "/products/innosin-pc-cb-755590/images/front.jpg",
          images: ["/products/innosin-pc-cb-755590/images/front.jpg"]
        },
        {
          id: "innosin-pc-cb-905590",
          size: "Double Door CB",
          dimensions: "900×550×900 mm",
          modelPath: "/products/innosin-pc-cb-905590/model.glb",
          thumbnail: "/products/innosin-pc-cb-905590/images/front.jpg",
          images: ["/products/innosin-pc-cb-905590/images/front.jpg"]
        },
        {
          id: "innosin-pc-cb-105590",
          size: "Double Door CB",
          dimensions: "1050×550×900 mm",
          modelPath: "/products/innosin-pc-cb-105590/model.glb",
          thumbnail: "/products/innosin-pc-cb-105590/images/front.jpg",
          images: ["/products/innosin-pc-cb-105590/images/front.jpg"]
        },
        {
          id: "innosin-pc-cb-lh-455590",
          size: "Single Door CB Left Hand",
          dimensions: "450×550×900 mm",
          modelPath: "/products/innosin-pc-cb-lh-455590/model.glb",
          thumbnail: "/products/innosin-pc-cb-lh-455590/images/front.jpg",
          images: ["/products/innosin-pc-cb-lh-455590/images/front.jpg"]
        },
        {
          id: "innosin-pc-cb-rh-455590",
          size: "Single Door CB Right Hand",
          dimensions: "450×550×900 mm",
          modelPath: "/products/innosin-pc-cb-rh-455590/model.glb",
          thumbnail: "/products/innosin-pc-cb-rh-455590/images/front.jpg",
          images: ["/products/innosin-pc-cb-rh-455590/images/front.jpg"]
        },
        {
          id: "innosin-pc-cb-lh-505590",
          size: "Single Door CB Left Hand",
          dimensions: "500×550×900 mm",
          modelPath: "/products/innosin-pc-cb-lh-505590/model.glb",
          thumbnail: "/products/innosin-pc-cb-lh-505590/images/front.jpg",
          images: ["/products/innosin-pc-cb-lh-505590/images/front.jpg"]
        },
        {
          id: "innosin-pc-cb-rh-505590",
          size: "Single Door CB Right Hand",
          dimensions: "500×550×900 mm",
          modelPath: "/products/innosin-pc-cb-rh-505590/model.glb",
          thumbnail: "/products/innosin-pc-cb-rh-505590/images/front.jpg",
          images: ["/products/innosin-pc-cb-rh-505590/images/front.jpg"]
        },
        {
          id: "innosin-pc-cb-lh-555590",
          size: "Single Door CB Left Hand",
          dimensions: "550×550×900 mm",
          modelPath: "/products/innosin-pc-cb-lh-555590/model.glb",
          thumbnail: "/products/innosin-pc-cb-lh-555590/images/front.jpg",
          images: ["/products/innosin-pc-cb-lh-555590/images/front.jpg"]
        },
        {
          id: "innosin-pc-cb-rh-555590",
          size: "Single Door CB Right Hand",
          dimensions: "550×550×900 mm",
          modelPath: "/products/innosin-pc-cb-rh-555590/model.glb",
          thumbnail: "/products/innosin-pc-cb-rh-555590/images/front.jpg",
          images: ["/products/innosin-pc-cb-rh-555590/images/front.jpg"]
        },
        {
          id: "innosin-pc-cb-lh-605590",
          size: "Single Door CB Left Hand",
          dimensions: "600×550×900 mm",
          modelPath: "/products/innosin-pc-cb-lh-605590/model.glb",
          thumbnail: "/products/innosin-pc-cb-lh-605590/images/front.jpg",
          images: ["/products/innosin-pc-cb-lh-605590/images/front.jpg"]
        },
        {
          id: "innosin-pc-cb-rh-605590",
          size: "Single Door CB Right Hand",
          dimensions: "600×550×900 mm",
          modelPath: "/products/innosin-pc-cb-rh-605590/model.glb",
          thumbnail: "/products/innosin-pc-cb-rh-605590/images/front.jpg",
          images: ["/products/innosin-pc-cb-rh-605590/images/front.jpg"]
        }
      ]
    },

    // MODULAR DOUBLE DOOR CABINET SERIES
    {
      id: "innosin-modular-double-door-series",
      name: "Modular Double Door Cabinet Series",
      category: "Innosin Lab",
      dimensions: "750-1250 mm width range",
      description: "Modular double door cabinets providing secure storage with full-width access for laboratory equipment.",
      fullDescription: "The Modular Double Door Cabinet Series offers spacious storage solutions with dual door access. These cabinets provide secure storage for larger laboratory equipment and supplies, with multiple size options to accommodate different space requirements.",
      specifications: [
        "Double door design for wide access",
        "Secure storage with locking mechanisms",
        "Modular construction",
        "Chemical-resistant finish",
        "Available in powder coat and stainless steel",
        "Multiple size configurations"
      ],
      modelPath: "/products/innosin-pc-dd-105590/model.glb",
      thumbnail: "/products/innosin-pc-dd-105590/images/front.jpg",
      images: ["/products/innosin-pc-dd-105590/images/front.jpg"],
      baseProductId: "innosin-modular-double-door-series",
      finishes: [
        {
          type: "powder-coat",
          name: "Powder Coat",
          price: "Standard"
        },
        {
          type: "stainless-steel",
          name: "Stainless Steel",
          price: "Premium"
        }
      ],
      variants: [
        {
          id: "innosin-pc-dd-105590",
          size: "Double Door",
          dimensions: "1050×550×900 mm",
          modelPath: "/products/innosin-pc-dd-105590/model.glb",
          thumbnail: "/products/innosin-pc-dd-105590/images/front.jpg",
          images: ["/products/innosin-pc-dd-105590/images/front.jpg"]
        },
        {
          id: "innosin-pc-dd-1255590",
          size: "Double Door",
          dimensions: "1250×550×900 mm",
          modelPath: "/products/innosin-pc-dd-1255590/model.glb",
          thumbnail: "/products/innosin-pc-dd-1255590/images/front.jpg",
          images: ["/products/innosin-pc-dd-1255590/images/front.jpg"]
        },
        {
          id: "innosin-pc-dd-125590",
          size: "Double Door",
          dimensions: "1200×550×900 mm",
          modelPath: "/products/innosin-pc-dd-125590/model.glb",
          thumbnail: "/products/innosin-pc-dd-125590/images/front.jpg",
          images: ["/products/innosin-pc-dd-125590/images/front.jpg"]
        },
        {
          id: "innosin-pc-dd-755590",
          size: "Double Door",
          dimensions: "750×550×900 mm",
          modelPath: "/products/innosin-pc-dd-755590/model.glb",
          thumbnail: "/products/innosin-pc-dd-755590/images/front.jpg",
          images: ["/products/innosin-pc-dd-755590/images/front.jpg"]
        },
        {
          id: "innosin-pc-dd-905580",
          size: "Double Door",
          dimensions: "900×550×800 mm",
          modelPath: "/products/innosin-pc-dd-905580/model.glb",
          thumbnail: "/products/innosin-pc-dd-905580/images/front.jpg",
          images: ["/products/innosin-pc-dd-905580/images/front.jpg"]
        },
        {
          id: "innosin-pc-dd-905590",
          size: "Double Door",
          dimensions: "900×550×900 mm",
          modelPath: "/products/innosin-pc-dd-905590/model.glb",
          thumbnail: "/products/innosin-pc-dd-905590/images/front.jpg",
          images: ["/products/innosin-pc-dd-905590/images/front.jpg"]
        }
      ]
    },

    // OPEN RACK SERIES
    {
      id: "innosin-open-rack-series",
      name: "Open Rack Series",
      category: "Innosin Lab",
      dimensions: "380×380 mm footprint",
      description: "Open rack storage solutions for easy access to frequently used laboratory equipment and supplies.",
      fullDescription: "The Open Rack Series provides convenient open storage for laboratory equipment that requires frequent access. Available in both powder coat and stainless steel finishes, these racks offer durability and easy cleaning in laboratory environments.",
      specifications: [
        "Open design for easy access",
        "Compact 380×380 mm footprint",
        "Durable construction",
        "Easy to clean surfaces",
        "Available in powder coat and stainless steel",
        "Laboratory-grade materials"
      ],
      modelPath: "/products/innosin-or-pc-3838/model.glb",
      thumbnail: "/products/innosin-or-pc-3838/images/front.jpg",
      images: ["/products/innosin-or-pc-3838/images/front.jpg"],
      baseProductId: "innosin-open-rack-series",
      finishes: [
        {
          type: "powder-coat",
          name: "Powder Coat",
          price: "Standard"
        },
        {
          type: "stainless-steel",
          name: "Stainless Steel",
          price: "Premium"
        }
      ],
      variants: [
        {
          id: "innosin-or-pc-3838",
          size: "Standard Rack",
          dimensions: "380×380 mm",
          modelPath: "/products/innosin-or-pc-3838/model.glb",
          thumbnail: "/products/innosin-or-pc-3838/images/front.jpg",
          images: ["/products/innosin-or-pc-3838/images/front.jpg"]
        },
        {
          id: "innosin-or-ss304-3838",
          size: "Stainless Steel Rack",
          dimensions: "380×380 mm",
          modelPath: "/products/innosin-or-ss304-3838/model.glb",
          thumbnail: "/products/innosin-or-ss304-3838/images/front.jpg",
          images: ["/products/innosin-or-ss304-3838/images/front.jpg"]
        }
      ]
    },

    // SINK CABINET SERIES
    {
      id: "innosin-sink-cabinet-series",
      name: "Sink Cabinet Series",
      category: "Innosin Lab",
      dimensions: "Various configurations",
      description: "Specialized sink cabinets designed for laboratory washing and cleaning applications.",
      fullDescription: "The Sink Cabinet Series provides specialized storage and plumbing integration for laboratory sinks. These cabinets are designed to accommodate various sink configurations while providing additional storage space for cleaning supplies and equipment.",
      specifications: [
        "Sink integration design",
        "Water-resistant construction",
        "Plumbing access panels",
        "Chemical-resistant finish",
        "Available in powder coat and stainless steel",
        "Multiple door configurations"
      ],
      modelPath: "/products/innosin-sink-cabinet-dd/model.glb",
      thumbnail: "/products/innosin-sink-cabinet-dd/images/front.jpg",
      images: ["/products/innosin-sink-cabinet-dd/images/front.jpg"],
      baseProductId: "innosin-sink-cabinet-series",
      finishes: [
        {
          type: "powder-coat",
          name: "Powder Coat",
          price: "Standard"
        },
        {
          type: "stainless-steel",
          name: "Stainless Steel",
          price: "Premium"
        }
      ],
      variants: [
        {
          id: "innosin-sink-cabinet-dd",
          size: "Double Door Sink Cabinet",
          dimensions: "Custom sized for sink",
          modelPath: "/products/innosin-sink-cabinet-dd/model.glb",
          thumbnail: "/products/innosin-sink-cabinet-dd/images/front.jpg",
          images: ["/products/innosin-sink-cabinet-dd/images/front.jpg"]
        },
        {
          id: "innosin-sink-cabinet-sd",
          size: "Single Door Sink Cabinet",
          dimensions: "Custom sized for sink",
          modelPath: "/products/innosin-sink-cabinet-sd/model.glb",
          thumbnail: "/products/innosin-sink-cabinet-sd/images/front.jpg",
          images: ["/products/innosin-sink-cabinet-sd/images/front.jpg"]
        }
      ]
    },

    // TALL CABINET GLASS DOOR SERIES
    {
      id: "innosin-tall-glass-series",
      name: "Tall Cabinet Glass Door Series",
      category: "Innosin Lab",
      dimensions: "Various heights up to 1900mm",
      description: "Tall storage cabinets with glass doors for visible storage and display of laboratory equipment.",
      fullDescription: "The Tall Cabinet Glass Door Series provides maximum storage height with transparent glass doors for easy identification of contents. These cabinets are ideal for storing glassware, reagents, and equipment that need to be easily visible and accessible.",
      specifications: [
        "Glass door panels for visibility",
        "Maximum height storage",
        "Adjustable shelving",
        "Chemical-resistant finish",
        "Available in powder coat and stainless steel",
        "Safety glass construction"
      ],
      modelPath: "/products/innosin-tcg-pc/model.glb",
      thumbnail: "/products/innosin-tcg-pc/images/front.jpg",
      images: ["/products/innosin-tcg-pc/images/front.jpg"],
      baseProductId: "innosin-tall-glass-series",
      finishes: [
        {
          type: "powder-coat",
          name: "Powder Coat",
          price: "Standard"
        },
        {
          type: "stainless-steel",
          name: "Stainless Steel",
          price: "Premium"
        }
      ],
      variants: [
        {
          id: "innosin-tcg-pc-standard",
          size: "Standard Height",
          dimensions: "600×550×1900 mm",
          modelPath: "/products/innosin-tcg-pc-standard/model.glb",
          thumbnail: "/products/innosin-tcg-pc-standard/images/front.jpg",
          images: ["/products/innosin-tcg-pc-standard/images/front.jpg"]
        },
        {
          id: "innosin-tcg-pc-wide",
          size: "Wide Configuration",
          dimensions: "900×550×1900 mm",
          modelPath: "/products/innosin-tcg-pc-wide/model.glb",
          thumbnail: "/products/innosin-tcg-pc-wide/images/front.jpg",
          images: ["/products/innosin-tcg-pc-wide/images/front.jpg"]
        }
      ]
    },

    // TALL CABINET SOLID DOOR SERIES
    {
      id: "innosin-tall-solid-series",
      name: "Tall Cabinet Solid Door Series", 
      category: "Innosin Lab",
      dimensions: "Various heights up to 1900mm",
      description: "Tall storage cabinets with solid doors for secure storage of sensitive laboratory materials.",
      fullDescription: "The Tall Cabinet Solid Door Series provides maximum storage height with opaque solid doors for secure storage of sensitive materials. These cabinets offer excellent protection from light and unauthorized access while maximizing vertical storage space.",
      specifications: [
        "Solid door panels for security",
        "Maximum height storage",
        "Light-proof construction",
        "Chemical-resistant finish",
        "Available in powder coat and stainless steel",
        "Locking mechanisms available"
      ],
      modelPath: "/products/innosin-tcs-pc/model.glb",
      thumbnail: "/products/innosin-tcs-pc/images/front.jpg",
      images: ["/products/innosin-tcs-pc/images/front.jpg"],
      baseProductId: "innosin-tall-solid-series",
      finishes: [
        {
          type: "powder-coat",
          name: "Powder Coat",
          price: "Standard"
        },
        {
          type: "stainless-steel",
          name: "Stainless Steel",
          price: "Premium"
        }
      ],
      variants: [
        {
          id: "innosin-tcs-pc-standard",
          size: "Standard Height",
          dimensions: "600×550×1900 mm",
          modelPath: "/products/innosin-tcs-pc-standard/model.glb",
          thumbnail: "/products/innosin-tcs-pc-standard/images/front.jpg",
          images: ["/products/innosin-tcs-pc-standard/images/front.jpg"]
        },
        {
          id: "innosin-tcs-pc-wide",
          size: "Wide Configuration",
          dimensions: "900×550×1900 mm",
          modelPath: "/products/innosin-tcs-pc-wide/model.glb",
          thumbnail: "/products/innosin-tcs-pc-wide/images/front.jpg",
          images: ["/products/innosin-tcs-pc-wide/images/front.jpg"]
        }
      ]
    },

    // WALL CABINET SERIES
    {
      id: "innosin-wall-cabinet-series",
      name: "Wall Cabinet Series",
      category: "Innosin Lab",
      dimensions: "Wall-mounted configurations",
      description: "Space-saving wall-mounted cabinets available with glass or solid doors for overhead storage.",
      fullDescription: "The Wall Cabinet Series maximizes laboratory space utilization through wall-mounted storage solutions. Available with either glass doors for visible storage or solid doors for secure storage, these cabinets provide convenient overhead access to frequently used items.",
      specifications: [
        "Wall-mounted design saves floor space",
        "Available with glass or solid doors",
        "Single and double door options",
        "Chemical-resistant finish",
        "Available in powder coat and stainless steel",
        "Secure mounting hardware included"
      ],
      modelPath: "/products/innosin-wall-cabinet-glass-sd/model.glb",
      thumbnail: "/products/innosin-wall-cabinet-glass-sd/images/front.jpg",
      images: ["/products/innosin-wall-cabinet-glass-sd/images/front.jpg"],
      baseProductId: "innosin-wall-cabinet-series",
      finishes: [
        {
          type: "powder-coat",
          name: "Powder Coat",
          price: "Standard"
        },
        {
          type: "stainless-steel",
          name: "Stainless Steel",
          price: "Premium"
        }
      ],
      variants: [
        {
          id: "innosin-wall-cabinet-glass-sd",
          size: "Single Door Glass",
          dimensions: "600×300×600 mm",
          modelPath: "/products/innosin-wall-cabinet-glass-sd/model.glb",
          thumbnail: "/products/innosin-wall-cabinet-glass-sd/images/front.jpg",
          images: ["/products/innosin-wall-cabinet-glass-sd/images/front.jpg"]
        },
        {
          id: "innosin-wall-cabinet-glass-dd",
          size: "Double Door Glass",
          dimensions: "900×300×600 mm",
          modelPath: "/products/innosin-wall-cabinet-glass-dd/model.glb",
          thumbnail: "/products/innosin-wall-cabinet-glass-dd/images/front.jpg",
          images: ["/products/innosin-wall-cabinet-glass-dd/images/front.jpg"]
        },
        {
          id: "innosin-wall-cabinet-solid-sd",
          size: "Single Door Solid",
          dimensions: "600×300×600 mm",
          modelPath: "/products/innosin-wall-cabinet-solid-sd/model.glb",
          thumbnail: "/products/innosin-wall-cabinet-solid-sd/images/front.jpg",
          images: ["/products/innosin-wall-cabinet-solid-sd/images/front.jpg"]
        },
        {
          id: "innosin-wall-cabinet-solid-dd",
          size: "Double Door Solid",
          dimensions: "900×300×600 mm",
          modelPath: "/products/innosin-wall-cabinet-solid-dd/model.glb",
          thumbnail: "/products/innosin-wall-cabinet-solid-dd/images/front.jpg",
          images: ["/products/innosin-wall-cabinet-solid-dd/images/front.jpg"]
        }
      ]
    }
  ];

  // Enhance all products with uploaded assets
  const enhancedProducts = products.map(enhanceProductWithAssets);
  
  console.log('Generated products with uploaded assets:', enhancedProducts);
  return enhancedProducts;
};

// Generate unique categories from products
export const getCategories = (): string[] => {
  const products = getProductsSync();
  const categories = [...new Set(products.map(product => product.category))];
  console.log('Generated categories:', categories);
  return categories;
};
