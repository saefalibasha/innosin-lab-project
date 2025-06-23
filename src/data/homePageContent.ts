
// Homepage Content Data
// This file contains all the text content for the homepage sections (excluding hero)
// To modify the text content, simply edit the values below

export const homePageContent = {
  // Product Collections Section
  productCollections: {
    title: "Product",
    titleHighlight: "Collections",
    description: "Explore our comprehensive range of laboratory solutions from leading manufacturers",
    viewAllButton: "View All Products",
    // Optional background image for this section
    backgroundImage: "/page-images/home/product-collections-bg.jpg", // Replace with your image
    backgroundAlt: "Laboratory equipment showcase background"
  },

  // Transforming Laboratories Section
  transformingLabs: {
    title: "Transforming",
    titleHighlight: "Laboratories", 
    description: "See how we've revolutionized research environments across Singapore and beyond",
    // Optional images for this section
    showcaseImage: "/page-images/home/lab-transformation.jpg", // Replace with your image
    showcaseAlt: "Modern laboratory transformation showcase"
  },

  // Lab Transform CTA Section
  labTransformCTA: {
    title: "Ready to Transform Your",
    titleHighlight: "Laboratory?",
    description: "Let's collaborate to create a laboratory solution that exceeds your expectations and elevates your research capabilities to new heights.",
    getStartedButton: "Get Started",
    floorPlannerButton: "Try Floor Planner",
    // Optional background image for CTA section
    backgroundImage: "/page-images/home/cta-background.jpg", // Replace with your image
    backgroundAlt: "Call to action background showing modern laboratory"
  }
};

/*
HOW TO EDIT HOMEPAGE CONTENT VIA GITHUB:
1. Navigate to this file: src/data/homePageContent.ts
2. Edit any text values in the homePageContent object above
3. Add your images to public/page-images/home/ folder
4. Update the image paths above to reference your new images
5. Commit your changes to GitHub

IMAGE CUSTOMIZATION:
1. Upload images to public/page-images/home/ folder
2. Update the backgroundImage, showcaseImage paths above
3. Update the alt text for accessibility
4. Example: backgroundImage: "/page-images/home/your-custom-bg.jpg"

SECTIONS INCLUDED:
1. Product Collections - Text and optional background for the product showcase section
2. Transforming Labs - Text and showcase image for the before/after comparison section  
3. Lab Transform CTA - Text and optional background for the final call-to-action section

EXAMPLES:
- To change product collections title: Edit productCollections.title or titleHighlight
- To add background image: Upload to /public/page-images/home/ and update backgroundImage path
- To change transforming labs description: Edit transformingLabs.description
- To change CTA section text: Edit labTransformCTA.title, description, or button text

NOTE: Hero section content is managed in src/data/heroContent.ts
*/
