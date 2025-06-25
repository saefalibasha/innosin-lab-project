# Blog Images Directory

This directory contains all images used in the blog section of the website.

## Directory Structure

```
blog-images/
├── [post-id]/
│   ├── hero.jpg          # Main featured image for the post
│   ├── content-1.jpg     # Additional images used in post content
│   └── content-2.jpg
├── authors/
│   ├── author-name.jpg   # Author profile images
│   └── ...
└── categories/
    ├── safety.jpg        # Category header images
    ├── technical.jpg
    └── ...
```

## How to Add Blog Images

### For a New Blog Post:
1. Create a new folder with the post ID (e.g., `post-7/`)
2. Add the main hero image as `hero.jpg`
3. Add any additional content images with descriptive names
4. Update the `featuredImage` path in `src/data/blogContent.ts`

### For Author Images:
1. Add author photos to the `authors/` folder
2. Use the format: `firstname-lastname.jpg`
3. Recommended size: 400x400px, square format

### For Category Images:
1. Add category header images to the `categories/` folder
2. Use lowercase category names: `safety.jpg`, `technical.jpg`
3. Recommended size: 1200x600px

## Image Guidelines

### File Formats:
- Use JPG for photos and complex images
- Use PNG for logos or images requiring transparency
- Use WebP for better compression (optional)

### File Sizes:
- Hero images: 1200x800px (max 500KB)
- Content images: 800x600px (max 300KB)
- Author images: 400x400px (max 150KB)
- Category images: 1200x600px (max 400KB)

### Naming Convention:
- Use lowercase letters
- Use hyphens instead of spaces
- Be descriptive: `laboratory-safety-equipment.jpg`
- Avoid special characters

## Fallback Images

If an image fails to load, the system will automatically use fallback images from Unsplash. However, it's recommended to always provide proper images for the best user experience.

## Image Optimization

Before uploading images:
1. Compress images to reduce file size
2. Use appropriate dimensions
3. Ensure good quality and clarity
4. Consider using WebP format for better compression

## Updating Blog Content

To add or modify blog posts, edit the file: `src/data/blogContent.ts`

Each blog post requires:
- A unique ID
- Title and excerpt
- Author name
- Publication date
- Category and tags
- Featured image path
- Full content (HTML format)

Example:
```javascript
{
  id: 'new-post-id',
  title: 'Your Blog Post Title',
  excerpt: 'Brief description of the post...',
  featuredImage: '/blog-images/new-post-id/hero.jpg',
  // ... other fields
}
```
