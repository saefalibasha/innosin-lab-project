
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
    
    // Timeline Events - Updated with years 1986, 1995, 2005, 2024
    events: [
      {
        year: "2024",
        title: "Modern Innovation Era",
        description: "Achieved ISO certification and expanded our digital laboratory design platform. Launched innovative modular lab furniture solutions and reached 500+ completed projects milestone. Leading the industry with cutting-edge technology and sustainable practices.",
        achievements: [
          "Launched advanced equipment line",
          "Implemented new lab technologies", 
          "Enhanced research capabilities",
          "Improved laboratory designs"
        ],
        // Timeline image for 2024
        image: "/page-images/about/timeline-2024.jpg",
        imageAlt: "2024 - Modern Innovation Era showcase"
      },
      {
        year: "2005", 
        title: "Technology Integration",
        description: "Major technological advancement period where Innosin embraced modern manufacturing techniques and quality systems. Implemented advanced fabrication processes and began developing specialized laboratory automation solutions that would set us apart in the industry.",
        achievements: [
          "Implemented advanced manufacturing systems",
          "Developed laboratory automation solutions",
          "Enhanced quality control processes",
          "Expanded product line capabilities"
        ],
        image: "/page-images/about/timeline-2012.jpg",
        imageAlt: "2005 - Technology Integration milestones"
      },
      {
        year: "1995",
        title: "Strategic Expansion", 
        description: "Significant growth and expansion of operations. Established our first dedicated manufacturing facility and began developing specialized laboratory equipment. This period marked our transition from a small startup to a recognized player in the laboratory solutions industry.",
        achievements: [
          "Opened first manufacturing facility",
          "Developed specialized laboratory equipment",
          "Expanded team and capabilities",
          "Established quality control processes"
        ],
        image: "/page-images/about/timeline-2018.jpg",
        imageAlt: "1995 - Strategic Expansion achievements"
      },
      {
        year: "1986",
        title: "Foundation & Vision",
        description: "Founded Innosin Lab with a bold vision to revolutionize laboratory design and manufacturing. Started with a small dedicated team and an unwavering commitment to quality and innovation. Our founding principles of excellence, precision, and customer-focused solutions remain at the heart of everything we do today.",
        achievements: [
          "Company establishment and founding",
          "Development of core business vision",
          "First laboratory design projects",
          "Building foundational team"
        ],
        image: "/page-images/about/timeline-2009.jpg",
        imageAlt: "1986 - Foundation & Vision"
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
        description: "Nearly 40 years of expertise in laboratory solutions since 1986",
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

TIMELINE SECTION (ONE IMAGE PER YEAR):
• timeline-2024.jpg (800x500px) - 2024 Modern Innovation Era
• timeline-2012.jpg (800x500px) - 2012 Strategic Expansion  
• timeline-1990.jpg (800x500px) - 1990 Early Growth Phase
• timeline-1986.jpg (800x500px) - 1986 Foundation & Vision

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
- 2024: Modern laboratory environments, latest technology, digital innovation
- 2012: Facility expansion, advanced manufacturing, automation systems
- 1990: Early growth, expanding operations, developing capabilities
- 1986: Founding moments, vision setting, entrepreneurial beginnings

🎯 Timeline Content Guide:
- **1986 (Foundation)**: Company establishment, vision development, first projects
- **1990 (Growth)**: Facility expansion, team building, capability development  
- **2012 (Expansion)**: Relocation to Johor, strategic shift, technology integration
- **2024 (Innovation)**: Digital platforms, modern solutions, industry leadership

⚠️ IMPORTANT: Update your uploaded image filenames to match:
- Rename timeline-2009.jpg to timeline-1986.jpg
- Rename timeline-2018.jpg to timeline-1990.jpg
- Keep timeline-2012.jpg as is
- Keep timeline-2024.jpg as is

🆘 Troubleshooting:
If images don't show after the update, ensure your uploaded files match the exact filenames above.
*/
