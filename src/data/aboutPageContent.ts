
// About Page Content Data
// This file contains all the text content for the About Us page
// To modify the text content, simply edit the values below

export const aboutPageContent = {
  // Hero Section
  hero: {
    title: "About",
    titleHighlight: "Innosin Lab",
    description: "At Innosin Lab, we specialize in the design, manufacturing, and installation of high-quality laboratory furniture and custom metal solutions. Crafted from stainless steel and electro-galvanized steel, our products are engineered for precision, durability, and corrosion resistance, making them ideal for demanding laboratory, industrial, and research environments. With a focus on tailored solutions and exceptional craftsmanship, we aim to be your trusted partner for custom lab furniture and precision metal fabrication.",
    // Hero section image
    heroImage: "/page-images/about/hero-section.jpg", // Replace with your image
    heroImageAlt: "About Innosin Lab - innovative laboratory solutions"
  },

  // Mission & Vision
  mission: {
    title: "Our Mission",
    description: "To deliver high-quality, customizable laboratory solutions and stainless steel products through innovation, precision, and sincere service — consistently exceeding the expectations of our partners in science, research, and industry.",
    // Optional mission image
    image: "/page-images/about/mission-vision.jpg", // Replace with your image
    imageAlt: "Our mission to provide world-class laboratory solutions"
  },

  vision: {
    title: "Our Vision", 
    description: "To be the trusted leader in laboratory infrastructure and stainless steel manufacturing across Asia, known for our innovation, integrity, and unwavering commitment to supporting scientific advancement.",
    // Optional vision image
    image: "/page-images/about/mission-vision.jpg", // Replace with your image
    imageAlt: "Our vision for laboratory excellence"
  },

  // Company Timeline
  timeline: {
    title: "Our",
    titleHighlight: "Journey",
    description: "From humble beginnings to becoming a trusted partner in laboratory solutions",
    // Optional timeline background image
    backgroundImage: "/page-images/about/company-timeline.jpg", // Replace with your image
    backgroundImageAlt: "Company journey and timeline background",
    
    // Timeline Events
    events: [
      {
        year: "2024",
        title: "Expansion & Innovation",
        description: "Expanded our product range and introduced cutting-edge laboratory technologies",
        achievements: [
          "Launched advanced equipment line",
          "Implemented new lab technologies", 
          "Enhanced research capabilities",
          "Improved laboratory designs"
        ],
        // Timeline event images for 2024
        images: [
          {
            src: "/page-images/about/timeline-2024-equipment.jpg",
            alt: "2024 modern laboratory equipment"
          },
          {
            src: "/page-images/about/timeline-2024-technology.jpg", 
            alt: "2024 laboratory technology advancement"
          },
          {
            src: "/page-images/about/timeline-2024-research.jpg",
            alt: "2024 research environment"
          },
          {
            src: "/page-images/about/timeline-2024-design.jpg",
            alt: "2024 laboratory design showcase"
          }
        ]
      },
      {
        year: "2018", 
        title: "Regional Growth",
        description: "Expanded operations across Southeast Asia and established key partnerships",
        achievements: [
          "Completed major pharmaceutical lab project",
          "Expanded research facility operations"
        ],
        images: [
          {
            src: "/page-images/about/timeline-2018-pharmaceutical.jpg",
            alt: "2018 pharmaceutical laboratory project"
          },
          {
            src: "/page-images/about/timeline-2018-facility.jpg",
            alt: "2018 research facility expansion"
          }
        ]
      },
      {
        year: "2012",
        title: "Technology Integration", 
        description: "Integrated advanced automation and safety systems into our solutions",
        achievements: [
          "Implemented laboratory automation systems",
          "Enhanced safety protocol standards"
        ],
        images: [
          {
            src: "/page-images/about/timeline-2012-automation.jpg",
            alt: "2012 laboratory automation systems"
          },
          {
            src: "/page-images/about/timeline-2012-safety.jpg",
            alt: "2012 safety protocol implementation"
          }
        ]
      },
      {
        year: "2009",
        title: "Foundation",
        description: "Innosin Lab was founded with a vision to transform laboratory environments",
        achievements: [
          "Company establishment and founding",
          "Started early laboratory design work"
        ],
        images: [
          {
            src: "/page-images/about/timeline-2009-founding.jpg",
            alt: "2009 company foundation"
          },
          {
            src: "/page-images/about/timeline-2009-design.jpg",
            alt: "2009 early laboratory design work"
          }
        ]
      }
    ]
  },

  // Company Values/Stats
  values: {
    title: "Why Choose Us",
    // Optional background image for values section
    backgroundImage: "/page-images/about/team-photo.jpg", // Replace with your image
    backgroundImageAlt: "Our team and company values",
    items: [
      {
        title: "Experience",
        description: "Over 15 years of expertise in laboratory solutions",
        icon: "trophy", // Icon identifier
        image: "/page-images/about/experience-icon.jpg" // Optional image
      },
      {
        title: "Quality", 
        description: "Premium equipment and materials from trusted manufacturers",
        icon: "star",
        image: "/page-images/about/quality-icon.jpg" // Optional image
      },
      {
        title: "Innovation",
        description: "Cutting-edge designs and latest laboratory technologies",
        icon: "lightbulb",
        image: "/page-images/about/innovation-icon.jpg" // Optional image
      },
      {
        title: "Support",
        description: "Comprehensive support from design to maintenance",
        icon: "support",
        image: "/page-images/about/support-icon.jpg" // Optional image
      }
    ]
  }
};

/*
🖼️ ABOUT PAGE IMAGE REPLACEMENT GUIDE

📁 Image Location: /public/page-images/about/

📋 Required Images for About Page:

HERO SECTION:
• hero-section.jpg (1200x800px) - Main about page hero image

MISSION & VISION SECTION:
• mission-vision.jpg (800x600px) - Supporting image for mission/vision

TIMELINE SECTION - 2024:
• timeline-2024-equipment.jpg (600x400px) - Modern laboratory equipment
• timeline-2024-technology.jpg (600x400px) - Laboratory technology advancement
• timeline-2024-research.jpg (600x400px) - Research environment showcase
• timeline-2024-design.jpg (600x400px) - Laboratory design showcase

TIMELINE SECTION - 2018:
• timeline-2018-pharmaceutical.jpg (600x400px) - Pharmaceutical laboratory project
• timeline-2018-facility.jpg (600x400px) - Research facility expansion

TIMELINE SECTION - 2012:
• timeline-2012-automation.jpg (600x400px) - Laboratory automation systems
• timeline-2012-safety.jpg (600x400px) - Safety protocol implementation

TIMELINE SECTION - 2009:
• timeline-2009-founding.jpg (600x400px) - Company founding moment
• timeline-2009-design.jpg (600x400px) - Early laboratory design work

OPTIONAL IMAGES:
• company-timeline.jpg (1920x1080px) - Timeline background
• team-photo.jpg (800x600px) - Team or office photo
• experience-icon.jpg (200x200px) - Experience representation
• quality-icon.jpg (200x200px) - Quality representation
• innovation-icon.jpg (200x200px) - Innovation representation
• support-icon.jpg (200x200px) - Support representation

🔄 How to Replace Images:
1. Upload your images to /public/page-images/about/ in GitHub
2. Use the exact filenames listed above
3. Recommended formats: JPG for photos, PNG for graphics with transparency
4. The images will automatically appear on the About page

💡 Pro Tip: Use descriptive, professional images that represent:
- Modern laboratory environments
- Scientific equipment and technology
- Team collaboration and professionalism
- Innovation and precision in laboratory work
*/
