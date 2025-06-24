
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
    // Mission video instead of image
    video: "/page-images/about/mission-vision.mp4", // Replace with your video
    videoAlt: "Our mission to provide world-class laboratory solutions"
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
    
    // Timeline Events - Ordered chronologically from 1986 to 2024
    events: [
      {
        year: "1986",
        title: "Humble Beginnings",
        description: "Founded in Johor Bahru, Innosin began as a stainless steel kitchen equipment fabricator, grounded in craftsmanship, quality, and a spirit of innovation.",
        image: "/page-images/about/timeline-1986.jpg",
        imageAlt: "1986 - Foundation & Vision"
      },
      {
        year: "1990",
        title: "Growing Stronger", 
        description: "With growing demand, we expanded our services into a wide range of metal fabrication solutions, catering to commercial, industrial, and custom-built applications across various sectors.",
        image: "/page-images/about/timeline-1990.jpg",
        imageAlt: "1990 - Early Growth Phase achievements"
      },
      {
        year: "2012", 
        title: "Engineering Excellence & Lab Transformation",
        description: "A pivotal year: Innosin relocated to Ulu Tiram, Johor, and began a strategic shift towards laboratory furniture manufacturing and turnkey lab setups. Our upgraded facilities empowered us to deliver integrated design, fabrication, and installation solutions tailored to scientific and research environments.",
        image: "/page-images/about/timeline-2012.jpg",
        imageAlt: "2012 - Technology Integration milestones"
      },
      {
        year: "2024",
        title: "Modern Innovation Era",
        description: "Today, Innosin Lab is a leading provider of custom laboratory furniture and infrastructure across Asia Pacific, Europe, and the Middle East. With nearly four decades of expertise, we continue to innovate with sincerity — building laboratories that shape the future of research and discovery.",
        // Timeline image for 2024
        image: "/page-images/about/timeline-2024.jpg",
        imageAlt: "2024 - Modern Innovation Era showcase"
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
• mission-vision.mp4 (video file) - Supporting video for mission/vision

TIMELINE SECTION (ONE IMAGE PER YEAR):
• timeline-1986.jpg (800x500px) - 1986 Foundation & Vision
• timeline-1990.jpg (800x500px) - 1990 Early Growth Phase  
• timeline-2012.jpg (800x500px) - 2012 Technology Integration
• timeline-2024.jpg (800x500px) - 2024 Modern Innovation Era

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
3. Recommended formats: JPG for photos, PNG for graphics with transparency, MP4 for videos
4. The images will automatically appear on the About page

💡 Pro Tip: Use descriptive, professional images that represent:
- 1986: Company founding moments, vision setting, entrepreneurial beginnings
- 1990: Early growth, expanding operations, developing capabilities
- 2012: Technology integration, advanced manufacturing, automation systems
- 2024: Modern laboratory environments, latest technology, digital innovation

🎯 Timeline Content Guide:
- **1986 (Foundation)**: Company establishment, vision development, first projects
- **1990 (Growth)**: Facility expansion, team building, capability development  
- **2012 (Integration)**: Technology advancement, automation, quality systems
- **2024 (Innovation)**: Digital platforms, modern solutions, industry leadership

⚠️ IMPORTANT: Your uploaded image filenames must match exactly:
- timeline-1986.jpg (rename from timeline-2009.jpg if needed)
- timeline-1990.jpg (rename from timeline-2018.jpg if needed)  
- timeline-2012.jpg (should already exist)
- timeline-2024.jpg (should already exist)

🆘 Troubleshooting:
If images don't show after the update, ensure your uploaded files match the exact filenames above.
*/
