
// Hero Section Content Data
// This file contains all the text content for the hero section
// To modify the hero text content, simply edit the values below

export const heroContent = {
  // Company Logo (used in hero section)
  logo: {
    alt: "Company Logo",
    // Logo is located at: /public/branding/hero-logo.png
    // To update: Replace the file at /public/branding/hero-logo.png
    // Recommended size: 64x64px or higher for crisp display
  },

  // Main Hero Titles (large text)
  mainTitles: {
    title1: "Precision.",
    title2: "Innovation.", 
    title3: "Excellence."
  },

  // Hero Description/Subtitle
  description: {
    line1: "Empowering scientific breakthroughs with high-quality lab solutions.",
    line2: "Transform your research environment with cutting-edge equipment and design."
  },

  // Call-to-Action Buttons
  buttons: {
    primary: "Explore Solutions",
    secondary: "Schedule Consultation"
  },

  // Our Story Section
  ourStory: {
    title: "Our",
    titleHighlight: "Story",
    description: "For over a decade, Innosin Lab has been at the forefront of laboratory innovation, transforming research environments across Singapore and beyond. Our journey began with a simple mission: to provide world-class laboratory solutions that empower scientific discovery.",
    
    // Statistics
    stats: {
      projectsCompleted: {
        number: "500+",
        label: "Projects Completed"
      },
      yearsOfExcellence: {
        number: "15+", 
        label: "Years of Excellence"
      },
      researchInstitutions: {
        number: "50+",
        label: "Research Institutions"
      }
    },

    // Video/Story Button
    videoButton: "Watch Our Story"
  }
};

/*
HOW TO EDIT HERO CONTENT VIA GITHUB:
1. Navigate to this file: src/data/heroContent.ts
2. Edit any text values in the heroContent object above
3. Commit your changes to GitHub

EXAMPLES:
- To change main hero title: Edit mainTitles.title1, title2, or title3
- To change hero description: Edit description.line1 or line2  
- To change button text: Edit buttons.primary or buttons.secondary
- To change story stats: Edit stats.projectsCompleted.number or .label
- To change story description: Edit ourStory.description

LOGO REPLACEMENT:
- The logo file is located at: /public/branding/hero-logo.png
- To replace: Upload a new image file with the same name and path
- Recommended dimensions: 64x64px or higher for best quality
*/
