
// Utility functions for managing product assets and data
// This file handles the generation of product data from the public/products directory structure

import { Product } from '@/types/product';

// Product asset management
export const getProductsSync = (): Product[] => {
  // Generate products based on available assets in public/products directory
  const products: Product[] = [
    {
      id: "bl-hes-bench-001",
      name: "Hand-Held Eye Shower with Two 45-degree Heads, Bench Mounted",
      category: "Broen Lab",
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
      thumbnail: "/products/bl-hes-bench-001/thumbnail.webp",
      images: ["/products/bl-hes-bench-001/images/front.jpg"] // Only front image
    },
    {
      id: "bl-hes-wall-002",
      name: "Hand-Held Eye Shower with Two 45-degree Heads, Wall Mounted",
      category: "Broen Lab",
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
      thumbnail: "/products/bl-hes-wall-002/thumbnail.webp",
      images: ["/products/bl-hes-wall-002/images/front.jpg"] // Only front image
    },
    {
      id: "bl-ebs-recessed-003",
      name: "Eye and Body Shower, Wall-Recessed and Stainless Steel",
      category: "Broen Lab",
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
      thumbnail: "/products/bl-ebs-recessed-003/thumbnail.webp",
      images: ["/products/bl-ebs-recessed-003/images/front.jpg"] // Only front image
    },
    {
      id: "bl-fcs-bowl-004",
      name: "Freestanding Combination Shower with Bowl",
      category: "Broen Lab",
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
      thumbnail: "/products/bl-fcs-bowl-004/thumbnail.webp",
      images: ["/products/bl-fcs-bowl-004/images/front.jpg"] // Only front image
    },
    {
      id: "bl-fcs-handheld-005",
      name: "Freestanding Combination Shower with Hand-Held Eye Shower",
      category: "Broen Lab",
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
      thumbnail: "/products/bl-fcs-handheld-005/thumbnail.webp",
      images: ["/products/bl-fcs-handheld-005/images/front.jpg"] // Only front image
    },
    {
      id: "bl-bs-wall-006",
      name: "Body Shower for Exposed Pipework, Wall-Mounted",
      category: "Broen Lab",
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
      thumbnail: "/products/bl-bs-wall-006/thumbnail.webp",
      images: ["/products/bl-bs-wall-006/images/front.jpg"] // Only front image
    },
    {
      id: "bl-bmf-metal-007",
      name: "Bench Mounted Fittings With Swivel Spout (Metal Knob)",
      category: "Broen Lab",
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
      thumbnail: "/products/bl-bmf-metal-007/thumbnail.webp",
      images: ["/products/bl-bmf-metal-007/images/front.jpg"] // Only front image
    },
    {
      id: "bl-bmf-lever-008",
      name: "Bench Mounted Fittings With Swivel Spout (Lever Handle)",
      category: "Broen Lab",
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
      thumbnail: "/products/bl-bmf-lever-008/thumbnail.webp",
      images: ["/products/bl-bmf-lever-008/images/front.jpg"] // Only front image
    },
    {
      id: "bl-bmf-column-009",
      name: "Bench Mounted Fittings With Swivel Spout (Column Design)",
      category: "Broen Lab",
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
      thumbnail: "/products/bl-bmf-column-009/thumbnail.webp",
      images: ["/products/bl-bmf-column-009/images/front.jpg"] // Only front image
    },
    {
      id: "bl-bmm-two-010",
      name: "Bench Mounted Mixer Two Handle",
      category: "Broen Lab",
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
      thumbnail: "/products/bl-bmm-two-010/thumbnail.webp",
      images: ["/products/bl-bmm-two-010/images/front.jpg"] // Only front image
    },
    {
      id: "bl-bmm-single-011",
      name: "Bench Mounted Mixer Single Handle",
      category: "Broen Lab",
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
      thumbnail: "/products/bl-bmm-single-011/thumbnail.webp",
      images: ["/products/bl-bmm-single-011/images/front.jpg"] // Only front image
    }
  ];

  console.log('Generated products:', products);
  return products;
};

// Generate unique categories from products
export const getCategories = (): string[] => {
  const products = getProductsSync();
  const categories = [...new Set(products.map(product => product.category))];
  console.log('Generated categories:', categories);
  return categories;
};

