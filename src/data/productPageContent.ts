
// Product Page Content Data
// This file contains all the text content for product-related pages
// To modify the text content, simply edit the values below

export const productPageContent = {
  // Product Catalog Page
  catalog: {
    title: "Product Catalog",
    description: "Browse our comprehensive range of laboratory equipment and furniture from leading manufacturers",
    showingProductsText: "Showing products from:",
    searchPlaceholder: "Search products...",
    allCategoriesText: "All Categories",
    noProductsFound: "No products found",
    noProductsDescription: "Try adjusting your search criteria or browse all categories.",
    // Catalog page images
    heroImage: "/page-images/products/products-hero.jpg", // Replace with your image
    heroImageAlt: "Product catalog showcase",
    categoryBanners: {
      // Category-specific banner images
      "Broen-Lab": "/page-images/products/broen-lab-banner.jpg",
      "Hamilton Laboratory Solutions": "/page-images/products/hamilton-banner.jpg",
      "Oriental Giken Inc.": "/page-images/products/oriental-giken-banner.jpg",
      "Innosin Lab": "/page-images/products/innosin-banner.jpg"
    }
  },

  // Product Detail Page
  productDetail: {
    backToCatalog: "Back to Catalog",
    productNotFoundTitle: "Product Not Found",
    backToCatalogButton: "Back to Catalog",
    photosTab: "Photos",
    modelTab: "3D Model",
    overviewTitle: "Product Overview",
    specificationsTitle: "Key Features & Specifications",
    dimensionsLabel: "Dimensions:",
    dimensions: "Dimensions",
    category: "Category",
    keyFeatures: "Key Features",
    addToQuote: "Add to Quote",
    addToQuoteButton: "Add to Quote Request",
    addToQuoteSuccess: "added to quote request",
    productOverview: "Product Overview",
    technicalSpecs: "Technical Specifications",
    interactiveModel: "Interactive 3D Model",
    downloadResources: "Download Resources",
    tabs: {
      overview: "Overview",
      specifications: "Specifications",
      model3D: "3D Model",
      downloads: "Downloads"
    },
    // Product detail images
    placeholderImage: "/page-images/products/product-placeholder.jpg", // Default product image
    placeholderImageAlt: "Product image placeholder"
  },

  // Quote Cart
  quoteCart: {
    title: "Request for Quotation",
    description: "Review your selected items and submit your quote request",
    emptyCartTitle: "Your quote cart is empty",
    emptyCartDescription: "Add some products to your cart to request a quote.",
    browseProductsButton: "Browse Products",
    itemsInCartText: "items in your cart",
    removeItemButton: "Remove",
    clearCartButton: "Clear Cart",
    submitQuoteButton: "Submit Quote Request",
    cartClearedMessage: "Cart cleared successfully",
    itemRemovedMessage: "Item removed from cart",
    quoteSubmittedMessage: "Quote request submitted successfully! We'll get back to you soon.",
    // Quote cart images
    emptyCartImage: "/page-images/products/empty-cart.jpg", // Replace with your image
    emptyCartImageAlt: "Empty shopping cart illustration",
    quoteSuccessImage: "/page-images/products/quote-success.jpg", // Replace with your image
    quoteSuccessImageAlt: "Successful quote submission"
  },

  // Product Categories
  categories: {
    title: "Product Categories",
    description: "Explore our organized product categories",
    // Category showcase images
    categoryShowcase: [
      {
        name: "Fume Hoods",
        description: "Advanced ventilation and safety equipment",
        image: "/page-images/products/fume-hoods-category.jpg", // Replace with your image
        imageAlt: "Fume hoods category showcase"
      },
      {
        name: "Laboratory Furniture",
        description: "Professional lab benches and storage",
        image: "/page-images/products/furniture-category.jpg", // Replace with your image
        imageAlt: "Laboratory furniture category showcase"
      },
      {
        name: "Safety Equipment",
        description: "Emergency and safety solutions",
        image: "/page-images/products/safety-category.jpg", // Replace with your image
        imageAlt: "Safety equipment category showcase"
      },
      {
        name: "Storage Solutions",
        description: "Organized storage for laboratories",
        image: "/page-images/products/storage-category.jpg", // Replace with your image
        imageAlt: "Storage solutions category showcase"
      }
    ]
  }
};

/*
HOW TO EDIT PRODUCT PAGE CONTENT VIA GITHUB:
1. Navigate to this file: src/data/productPageContent.ts
2. Edit any text values in the productPageContent object above
3. Add your images to public/page-images/products/ folder
4. Update the image paths above to reference your new images
5. Commit your changes to GitHub

IMAGE CUSTOMIZATION:
1. Upload images to public/page-images/products/ folder
2. Update heroImage, categoryBanners, and showcase images paths above
3. Update the alt text for accessibility
4. Recommended sizes:
   - Hero image: 1200x800px
   - Category banners: 1000x300px
   - Category showcase: 600x400px
   - Product placeholders: 400x300px

SECTIONS INCLUDED:
1. Catalog - Main product page with hero image and category banners
2. Product Detail - Individual product pages with placeholder images
3. Quote Cart - Shopping cart with empty state and success images
4. Categories - Product category showcase with images

EXAMPLES:
To change the catalog title:
- Change catalog.title: "Equipment Catalog"

To add a hero image:
- Upload image to /public/page-images/products/your-hero.jpg
- Change catalog.heroImage: "/page-images/products/your-hero.jpg"
- Update catalog.heroImageAlt: "Description of your image"

To add category banner images:
- Upload images to /public/page-images/products/
- Update the categoryBanners object with your image paths
- Use the exact category names as keys

To add category showcase images:
- Upload images to /public/page-images/products/
- Update the categoryShowcase array with your image paths and descriptions
- Update alt text for accessibility

To change quote button text:
- Change productDetail.addToQuoteButton: "Request Quote"
*/
