
// About Page Content Data
// This file contains all the text content for the About Us page
// To modify the text content, simply edit the values below

export const aboutPageContent = {
  // Hero Section
  hero: {
    title: "About",
    titleHighlight: "Innosin Lab",
    description: "We are passionate about creating innovative laboratory environments that enable groundbreaking research and scientific discovery.",
    // Hero section image
    heroImage: "/page-images/about/about-hero.jpg", // Replace with your image
    heroImageAlt: "About Innosin Lab - innovative laboratory solutions"
  },

  // Mission & Vision
  mission: {
    title: "Our Mission",
    description: "To provide world-class laboratory solutions that empower researchers and scientists to achieve their goals through innovative design, quality equipment, and exceptional service.",
    // Optional mission image
    image: "/page-images/about/mission-vision.jpg", // Replace with your image
    imageAlt: "Our mission to provide world-class laboratory solutions"
  },

  vision: {
    title: "Our Vision", 
    description: "To be the leading provider of laboratory solutions in Southeast Asia, known for our commitment to excellence, innovation, and customer satisfaction.",
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
        // Optional image for this timeline event
        image: "/page-images/about/2024-expansion.jpg", // Replace with your image
        imageAlt: "2024 expansion and innovation achievements"
      },
      {
        year: "2018", 
        title: "Regional Growth",
        description: "Expanded operations across Southeast Asia and established key partnerships",
        achievements: [
          "Completed major pharmaceutical lab project",
          "Expanded research facility operations"
        ],
        image: "/page-images/about/2018-growth.jpg", // Replace with your image
        imageAlt: "2018 regional growth and partnerships"
      },
      {
        year: "2012",
        title: "Technology Integration", 
        description: "Integrated advanced automation and safety systems into our solutions",
        achievements: [
          "Implemented laboratory automation systems",
          "Enhanced safety protocol standards"
        ],
        image: "/page-images/about/2012-technology.jpg", // Replace with your image
        imageAlt: "2012 technology integration and automation"
      },
      {
        year: "2009",
        title: "Foundation",
        description: "Innosin Lab was founded with a vision to transform laboratory environments",
        achievements: [
          "Company establishment and founding",
          "Started early laboratory design work"
        ],
        image: "/page-images/about/2009-foundation.jpg", // Replace with your image
        imageAlt: "2009 company foundation and early beginnings"
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
HOW TO EDIT ABOUT PAGE CONTENT VIA GITHUB:
1. Navigate to this file: src/data/aboutPageContent.ts
2. Edit any text values in the aboutPageContent object above
3. Add your images to public/page-images/about/ folder
4. Update the image paths above to reference your new images
5. Commit your changes to GitHub

IMAGE CUSTOMIZATION:
1. Upload images to public/page-images/about/ folder
2. Update heroImage, backgroundImage, and event images paths above
3. Update the alt text for accessibility
4. Recommended sizes:
   - Hero image: 1200x800px
   - Timeline event images: 400x300px
   - Background images: 1920x1080px

SECTIONS INCLUDED:
1. Hero section - Title, description, and hero image
2. Mission/Vision - Text and optional images
3. Timeline - Company journey with individual event images
4. Values - Company values with optional icons/images

EXAMPLES:
To change the hero title:
- Change hero.title: "Your New Title"

To add a hero image:
- Upload image to /public/page-images/about/your-hero.jpg
- Change hero.heroImage: "/page-images/about/your-hero.jpg"
- Update hero.heroImageAlt: "Description of your image"

To add timeline event images:
- Upload images to /public/page-images/about/
- Update the image field for each timeline event
- Update the imageAlt field with descriptive text
*/
