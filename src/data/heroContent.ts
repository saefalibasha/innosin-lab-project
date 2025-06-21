
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
      image: "/hero-images/slide-1-precision.jpg",
      alt: "Modern laboratory equipment showcasing precision instruments",
      titles: {
        title1: "Innovative Laboratory Solutions.",
      },
      description: {
        line1: "Empowering research and industry with cutting-edge design and advanced fabrication.",
        line2: "Discover lab spaces built for tomorrow."
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
      image: "/hero-images/slide-2-research.jpg",
      alt: "Advanced research facility with state-of-the-art equipment",
      titles: {
        title1: "Sincerity in Every Project.",
      },
      description: {
        line1: "Our team’s honest approach ensures your needs are heard and your vision realized",
        line2: " — from consultation to installation."
      },
      buttons: {
        primary: {
          text: "About Us",
          link: "/about"
        },
        secondary: {
          text: "Schedule Consultation",
          link: "/floor-planner"
        }
      }
    },
    {
      id: 3,
      image: "/hero-images/slide-3-future.jpg",
      alt: "Futuristic laboratory workspace showcasing innovation",
      titles: {
        title1: "Your Trusted Lab Partner",
      },
      description: {
        line1: "Combining innovation and sincerity, we deliver safe, efficient, ",
        line2: "and inspiring laboratories for every client."
      },
      buttons: {
        primary: {
          text: "Get Quote",
          link: "/rfq-cart"
        },
        secondary: {
          text: "Floor Planner",
          link: "/floor-planner"
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
HOW TO REPLACE IMAGES AND TEXT:

1. REPLACING IMAGES:
   - Go to public/hero-images/ folder
   - Replace these files with your own images:
     * slide-1-precision.jpg (for slide 1)
     * slide-2-research.jpg (for slide 2) 
     * slide-3-future.jpg (for slide 3)
   - Keep the same filenames, or update the 'image' property above
   - Recommended size: 1920x1080px for best quality

2. CHANGING TEXT FOR EACH SLIDE:
   - Edit the titles object (title1, title2, title3)
   - Edit the description object (line1, line2)
   - Edit the buttons object (primary/secondary text and links)
   - Update the alt text to describe your new images

3. EXAMPLE - To change slide 1:
   slides[0].titles.title1 = "Your New"
   slides[0].titles.title2 = "Title"
   slides[0].titles.title3 = "Here"
   slides[0].description.line1 = "Your new description"
   slides[0].description.line2 = "Your second line"

4. IMAGE LABELING (ALT TEXT):
   - Update the 'alt' property for each slide
   - Describe what's in your image for accessibility
   - Example: "Modern chemistry lab with advanced equipment"

CURRENT IMAGES READY TO REPLACE:
✅ /public/hero-images/slide-1-precision.jpg - Slide 1 background
✅ /public/hero-images/slide-2-research.jpg - Slide 2 background  
✅ /public/hero-images/slide-3-future.jpg - Slide 3 background

Simply replace these image files with your own and edit the text content above!
*/
