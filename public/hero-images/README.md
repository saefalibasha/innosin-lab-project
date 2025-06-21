
# Hero Images Setup Guide

## Quick Start
1. Upload your hero images to this folder
2. Use descriptive filenames (e.g., `lab-equipment.jpg`, `research-facility.jpg`)
3. Update `src/data/heroContent.ts` with your image paths and labels

## Image Requirements
- **Size**: 1920x1080px (recommended)
- **Format**: JPG or PNG
- **Quality**: High resolution for crisp display
- **Aspect Ratio**: 16:9 for best fit

## File Naming Best Practices
```
✅ Good names:
- lab-equipment-modern.jpg
- research-facility-advanced.jpg
- innovation-workspace.jpg

❌ Avoid:
- image1.jpg
- photo.jpg
- IMG_001.jpg
```

## Image Labeling (Accessibility)
When updating `heroContent.ts`, always include descriptive `alt` text:

```javascript
{
  image: "/hero-images/lab-equipment-modern.jpg",
  alt: "Modern laboratory with advanced scientific equipment and clean workspace"
}
```

## Example File Structure
```
public/hero-images/
├── slide-1-precision.jpg
├── slide-2-research.jpg
├── slide-3-future.jpg
└── README.md
```

## How to Update Content
1. Add your images to this folder
2. Edit `src/data/heroContent.ts`
3. Update image paths and alt text
4. Customize titles, descriptions, and buttons
5. Changes appear immediately on the website

