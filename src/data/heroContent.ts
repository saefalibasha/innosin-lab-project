
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

  // Individual Slide Content - Each slide can have unique content
  slides: [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1920&h=1080&fit=crop",
      alt: "Modern laboratory equipment",
      titles: {
        title1: "Precision.",
        title2: "Innovation.", 
        title3: "Excellence."
      },
      description: {
        line1: "Empowering scientific breakthroughs with high-quality lab solutions.",
        line2: "Transform your research environment with cutting-edge equipment and design."
      },
      buttons: {
        primary: {
          text: "Explore Solutions",
          link: "/products"
        },
        secondary: {
          text: "Schedule Consultation",
          link: "/contact"
        }
      }
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1920&h=1080&fit=crop",
      alt: "Advanced research facility",
      titles: {
        title1: "Advanced.",
        title2: "Research.", 
        title3: "Facilities."
      },
      description: {
        line1: "State-of-the-art laboratory environments designed for breakthrough discoveries.",
        line2: "Comprehensive solutions from planning to implementation."
      },
      buttons: {
        primary: {
          text: "View Projects",
          link: "/about"
        },
        secondary: {
          text: "Floor Planner",
          link: "/floor-planner"
        }
      }
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=1920&h=1080&fit=crop",
      alt: "Scientific innovation workspace",
      titles: {
        title1: "Future.",
        title2: "Ready.", 
        title3: "Labs."
      },
      description: {
        line1: "Building tomorrow's laboratories with innovative design and technology.",
        line2: "Your partner in creating spaces where science thrives."
      },
      buttons: {
        primary: {
          text: "Get Quote",
          link: "/rfq-cart"
        },
        secondary: {
          text: "Learn More",
          link: "/about"
        }
      }
    }
  ],

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
HOW TO EDIT INDIVIDUAL SLIDE CONTENT VIA GITHUB:
1. Navigate to this file: src/data/heroContent.ts
2. Find the "slides" array above
3. Edit any slide's content by modifying its properties:
   - titles: Change title1, title2, title3 for the main headline
   - description: Change line1, line2 for the subtitle/description
   - buttons: Change primary/secondary button text and links
   - image: Update the image URL
   - alt: Update the image alt text

SLIDE CONTENT STRUCTURE:
Each slide in the slides array has:
- id: Unique identifier for the slide
- image: Background image URL
- alt: Image alt text for accessibility
- titles: Three-part main headline (title1, title2, title3)
- description: Two-line description (line1, line2)
- buttons: Primary and secondary CTA buttons with text and link

EXAMPLES:
- To change slide 1's main title: Edit slides[0].titles.title1, title2, or title3
- To change slide 2's description: Edit slides[1].description.line1 or line2
- To change slide 3's buttons: Edit slides[2].buttons.primary.text or .link
- To add a new slide: Add a new object to the slides array with the same structure

HOW TO EDIT HERO SLIDER IMAGES:
1. Upload your images to a hosting service or use Unsplash URLs
2. Update the image property in the respective slide object
3. Update the alt property for accessibility
4. Recommended size: 1920x1080px for best quality

LOGO REPLACEMENT:
- The logo file is located at: /public/branding/hero-logo.png
- To replace: Upload a new image file with the same name and path
- Recommended dimensions: 64x64px or higher for best quality
*/
