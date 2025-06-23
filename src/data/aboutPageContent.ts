
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
    
    // Timeline Events - Updated with correct years matching uploaded images
    events: [
      {
        year: "2024",
        title: "Expansion & Innovation",
        description: "Achieved ISO certification and expanded our digital laboratory design platform. Launched innovative modular lab furniture solutions and reached 500+ completed projects milestone.",
        achievements: [
          "Launched advanced equipment line",
          "Implemented new lab technologies", 
          "Enhanced research capabilities",
          "Improved laboratory designs"
        ],
        // Timeline image for 2024
        image: "/page-images/about/timeline-2024.jpg",
        imageAlt: "2024 - Expansion & Innovation showcase"
      },
      {
        year: "2018", 
        title: "Regional Growth",
        description: "Major expansion year with entry into pharmaceutical laboratory design. Established partnerships with leading research institutions across Southeast Asia. Pioneered sustainable laboratory practices and introduced energy-efficient ventilation systems.",
        achievements: [
          "Completed major pharmaceutical lab project",
          "Expanded research facility operations",
          "Established Southeast Asia partnerships",
          "Introduced energy-efficient systems"
        ],
        image: "/page-images/about/timeline-2018.jpg",
        imageAlt: "2018 - Regional Growth achievements"
      },
      {
        year: "2012",
        title: "Technology Integration", 
        description: "A pivotal year: Innosin relocated to Ulu Tiram, Johor, and began a strategic shift towards laboratory furniture manufacturing and turnkey lab setups. Our upgraded facilities empowered us to deliver integrated design, fabrication, and installation solutions tailored to scientific and research environments.",
        achievements: [
          "Implemented laboratory automation systems",
          "Enhanced safety protocol standards",
          "Launched automated sample handling",
          "Received Singapore Safety Excellence Award"
        ],
        image: "/page-images/about/timeline-2012.jpg",
        imageAlt: "2012 - Technology Integration milestones"
      },
      {
        year: "2009",
        title: "Foundation",
        description: "Founded Innosin Lab with a vision to revolutionize laboratory design in Singapore. Started with a small team of 5 dedicated professionals and our first major project with the National University of Singapore.",
        achievements: [
          "Company establishment and founding",
          "Started early laboratory design work",
          "First major university project",
          "Team of 5 dedicated professionals"
        ],
        image: "/page-images/about/timeline-2009.jpg",
        imageAlt: "2009 - Company Foundation"
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

TIMELINE SECTION (ONE IMAGE PER YEAR):
• timeline-2024.jpg (800x500px) - 2024 Expansion & Innovation
• timeline-2018.jpg (800x500px) - 2018 Regional Growth  
• timeline-2012.jpg (800x500px) - 2012 Technology Integration
• timeline-2009.jpg (800x500px) - 2009 Company Foundation

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
- 2024: Modern laboratory environments, latest technology
- 2018: Partnership growth, pharmaceutical projects
- 2012: Automation systems, safety protocols
- 2009: Founding moments, early laboratory work

🎯 Simplified Structure: Each timeline year now has ONE representative image
making it easier to manage and replace specific images for each milestone.
*/
