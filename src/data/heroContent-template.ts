
// HERO CONTENT TEMPLATE
// Copy this template to customize your hero slider content

export const heroContentTemplate = {
  slides: [
    {
      id: 1,
      // Replace with your custom image path: "/hero-images/your-image-1.jpg"
      image: "/hero-images/slide-1-precision.jpg",
      // Image label/description for accessibility and SEO
      alt: "Modern laboratory equipment showcasing precision instruments",
      titles: {
        title1: "Your First",      // Main headline part 1
        title2: "Title Word",      // Highlighted word (styled in sand-light color)
        title3: "Here."           // Main headline part 3
      },
      description: {
        line1: "Your compelling first description line goes here",
        line2: "Second line provides additional context or benefits"
      },
      buttons: {
        primary: {
          text: "Primary Action",    // Main call-to-action button
          link: "/your-primary-link" // Where the button should navigate
        },
        secondary: {
          text: "Secondary Action",  // Secondary button
          link: "/your-secondary-link"
        }
      }
    },
    {
      id: 2,
      image: "/hero-images/slide-2-research.jpg",
      alt: "Advanced research facility with state-of-the-art equipment",
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
      image: "/hero-images/slide-3-future.jpg",
      alt: "Futuristic laboratory workspace showcasing innovation",
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
  ]
};

/* 
CUSTOMIZATION INSTRUCTIONS:

1. IMAGE SETUP:
   - Upload your images to /public/hero-images/ folder
   - Use descriptive filenames: lab-equipment.jpg, research-facility.jpg
   - Recommended size: 1920x1080px for best quality
   - Update the 'image' field with your file path: "/hero-images/your-image.jpg"

2. IMAGE LABELING (ALT TEXT):
   - The 'alt' field describes the image for accessibility
   - Be descriptive but concise: "Modern laboratory with advanced equipment"
   - This helps screen readers and improves SEO

3. TITLE STRUCTURE:
   - title1: First part of your headline
   - title2: Middle word that gets highlighted in sand-light color
   - title3: Final part of your headline
   - Example: "Precision." + "Innovation." + "Excellence."

4. DESCRIPTIONS:
   - line1: Main value proposition or benefit
   - line2: Supporting information or call-to-action context

5. BUTTONS:
   - primary: Main action you want users to take
   - secondary: Alternative action or more information
   - Update both 'text' and 'link' fields

6. TO APPLY CHANGES:
   - Copy your customized content from this template
   - Paste it into src/data/heroContent.ts (replace the existing slides array)
   - Your changes will appear immediately on the homepage

7. ADDING MORE SLIDES:
   - Copy the slide structure and add it to the slides array
   - Increment the id number
   - Follow the same pattern for all fields
*/

