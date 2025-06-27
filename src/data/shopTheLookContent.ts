// Shop The Look / Build This Lab Content Data
// This file contains all the text content and configuration for the interactive lab section
// To modify the content, simply edit the values below

export const shopTheLookContent = {
  // Main Section Configuration
  section: {
    title: "Build This",
    titleHighlight: "Lab",
    description: "Explore our interactive laboratory showcase. Click on the hotspots to discover the products and solutions that make this modern lab environment possible.",
    backgroundImage: "/interactive-lab/modern-laboratory-setup.jpg",
    backgroundAlt: "Modern laboratory setup with interactive hotspots"
  },

  // Interactive Hotspots Configuration - Repositioned for enclosure, chair, and tabletops
  hotspots: [
    {
      id: 1,
      x: 35, // Position on fume hood enclosure
      y: 25, 
      title: "Premium Fume Hood",
      description: "State-of-the-art fume hood with advanced airflow technology and safety features.",
      price: "From $12,500",
      category: "Safety Equipment",
      image: "/interactive-lab/fume-hood-detail.jpg",
      productLink: "/products?category=Safety%20Equipment"
    },
    {
      id: 2,
      x: 60, // Position on lab bench tabletop
      y: 55,
      title: "Modular Lab Bench",
      description: "Customizable laboratory workbench with integrated utilities and storage solutions.",
      price: "From $3,200",
      category: "Laboratory Furniture",
      image: "/interactive-lab/lab-bench-setup.jpg",
      productLink: "/products?category=Laboratory%20Furniture"
    },
    {
      id: 3,
      x: 75, // Position on right side tabletop
      y: 45,
      title: "Safety Equipment Station",
      description: "Complete safety equipment including eyewash station and emergency shower.",
      price: "From $1,800",
      category: "Safety Equipment", 
      image: "/interactive-lab/safety-equipment.jpg",
      productLink: "/products?category=Safety%20Equipment"
    },
    {
      id: 4,
      x: 20, // Position on left side enclosure/storage
      y: 65,
      title: "Storage Solutions",
      description: "Comprehensive laboratory storage with specialized compartments for chemicals and equipment.",
      price: "From $2,500",
      category: "Storage Systems",
      image: "/interactive-lab/storage-solutions.jpg",
      productLink: "/products?category=Storage%20Systems"
    },
    {
      id: 5,
      x: 45, // Position on chair/seating area
      y: 75,
      title: "Laboratory Seating",
      description: "Ergonomic laboratory chairs designed for long working hours with adjustable height and support.",
      price: "From $450",
      category: "Laboratory Furniture",
      image: "/interactive-lab/lab-seating.jpg",
      productLink: "/products?category=Laboratory%20Furniture"
    }
  ],

  // Process Steps Configuration
  processSteps: {
    title: "How We Build Your Lab",
    description: "Our proven 4-step process ensures your laboratory meets your exact specifications and requirements.",
    steps: [
      {
        id: 1,
        title: "Consultation",
        description: "We understand your requirements, space constraints, and specific laboratory needs through detailed consultation.",
        image: "/interactive-lab/step-1-consultation.jpg",
        duration: "1-2 weeks"
      },
      {
        id: 2,
        title: "Design & Planning",
        description: "Our experts create detailed 3D designs and technical specifications tailored to your laboratory workflow.",
        image: "/interactive-lab/step-2-design.jpg",
        duration: "2-3 weeks"
      },
      {
        id: 3,
        title: "Installation",
        description: "Professional installation team implements your laboratory design with minimal disruption to your operations.",
        image: "/interactive-lab/step-3-installation.jpg",
        duration: "3-6 weeks"
      },
      {
        id: 4,
        title: "Completion & Support",
        description: "Final inspection, training, and ongoing support to ensure your laboratory operates at peak efficiency.",
        image: "/interactive-lab/step-4-completion.jpg",
        duration: "Ongoing"
      }
    ]
  },

  // Call to Action Configuration
  cta: {
    primaryButton: "Get Custom Quote",
    primaryButtonLink: "/contact",
    secondaryButton: "View All Products", 
    secondaryButtonLink: "/products",
    floorPlannerButton: "Try Floor Planner",
    floorPlannerButtonLink: "/floor-planner"
  }
};

/*
HOW TO EDIT BUILD THIS LAB CONTENT VIA GITHUB:
1. Navigate to this file: src/data/shopTheLookContent.ts
2. Edit any text values in the shopTheLookContent object above
3. Add your images to public/interactive-lab/ folder
4. Update the image paths above to reference your new images
5. Commit your changes to GitHub

IMAGE CUSTOMIZATION:
1. Upload images to public/interactive-lab/ folder
2. Update the backgroundImage and hotspot image paths above
3. Update the alt text for accessibility
4. Example: backgroundImage: "/interactive-lab/your-custom-lab.jpg"

HOTSPOT CUSTOMIZATION:
1. Adjust x and y coordinates (0-100) to position hotspots on your lab image
2. Update titles, descriptions, prices, and categories
3. Link hotspots to relevant product pages
4. Add or remove hotspots as needed

PROCESS STEPS CUSTOMIZATION:
1. Edit step titles and descriptions
2. Update duration estimates
3. Replace step images with your own process photos
4. Add or modify steps as needed for your workflow

EXAMPLES:
- To change section title: Edit section.title or titleHighlight
- To add new hotspot: Add new object to hotspots array with unique id
- To change process step: Edit processSteps.steps array
- To update CTA buttons: Edit cta object properties

NOTE: Coordinate with the actual ShopTheLook component implementation
*/
