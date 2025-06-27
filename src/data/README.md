
# Data Directory

This directory contains all the structured content data for the Innosin Lab website.

## Content Files Overview

### Homepage Content
- **`homePageContent.ts`** - Text content for homepage sections (excluding hero)
- **`heroContent.ts`** - Hero section content and configuration
- **`shopTheLookContent.ts`** - "Build This Lab" interactive section content

### Page-Specific Content
- **`aboutPageContent.ts`** - About Us page content and timeline data
- **`contactPageContent.ts`** - Contact page content and form configuration
- **`productPageContent.ts`** - Products page content and filtering options
- **`blogContent.ts`** - Blog posts and articles content

### Product & Brand Data
- **`products.ts`** - Complete product catalog with specifications
- **`brandCollections.ts`** - Brand collections and category information

### Site-Wide Content
- **`siteContent.ts`** - Global site content (navigation, footer, etc.)

## Content Management Guidelines

### Text Content Updates
1. Navigate to the appropriate content file
2. Edit the text values in the exported objects
3. Commit changes via GitHub
4. Changes will automatically reflect on the website

### Image References
- All image paths in content files should reference the `/public` directory
- Use descriptive, kebab-case filenames for images
- Include alt text for accessibility

### Adding New Content
- Follow existing data structure patterns
- Use TypeScript interfaces for type safety
- Include comments explaining content sections
- Document any special formatting requirements

### Best Practices
- Keep content organized by page/section
- Use descriptive property names
- Include fallback text for optional content
- Maintain consistent formatting and tone

## File Dependencies

### Component Usage
- Homepage: `homePageContent.ts`, `heroContent.ts`, `shopTheLookContent.ts`
- About Page: `aboutPageContent.ts`
- Contact Page: `contactPageContent.ts`
- Products: `products.ts`, `brandCollections.ts`, `productPageContent.ts`
- Blog: `blogContent.ts`
- Global: `siteContent.ts`

### Related Directories
- `/public/page-images/` - Page-specific images
- `/public/brand-logos/` - Brand and logo assets
- `/public/interactive-lab/` - Build This Lab section images
- `/public/before-after-projects/` - Project transformation photos

