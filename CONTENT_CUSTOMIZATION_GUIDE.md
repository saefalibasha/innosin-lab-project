
# Content Customization Guide

This guide explains how to customize images and text on your website through GitHub.

## 📁 Folder Structure

```
public/
├── hero-images/          # Hero slider images (homepage)
├── page-images/
│   ├── home/            # Homepage section images
│   ├── about/           # About page images  
│   ├── contact/         # Contact page images
│   └── products/        # Product page images
└── brand-logos/         # Company/brand logos

src/data/
├── heroContent.ts       # Hero slider content & images
├── homePageContent.ts   # Homepage sections content
├── aboutPageContent.ts  # About page content & images
├── contactPageContent.ts # Contact page content & images
├── productPageContent.ts # Product pages content & images
├── brandCollections.ts  # Brand collection data
└── siteContent.ts       # Global site content (nav, footer)
```

## 🖼️ How to Replace Images

### Step 1: Find the Image Folder
1. Go to your GitHub repository
2. Navigate to `public/page-images/[page-name]/`
3. Or use `public/hero-images/` for hero slider

### Step 2: Upload Your Images
1. Click "Add file" → "Upload files" in GitHub
2. Drag your images into the folder
3. Use descriptive names: `about-hero.jpg`, `contact-office.jpg`

### Step 3: Update Image References
1. Navigate to `src/data/[page-name]PageContent.ts`
2. Find the image path (e.g., `heroImage: "/page-images/about/about-hero.jpg"`)
3. Update it to match your new image filename
4. Update the `alt` text to describe your image

## 📝 How to Change Text Content

### Global Site Content (Navigation, Footer)
**File:** `src/data/siteContent.ts`
- Company name, tagline, contact info
- Navigation menu labels
- Footer content and links

### Homepage Content
**File:** `src/data/homePageContent.ts`
- Product Collections section
- Transforming Labs section  
- Call-to-action section

### Hero Slider Content
**File:** `src/data/heroContent.ts`
- Slide images, titles, descriptions
- Button text and links
- Company stats

### About Page Content
**File:** `src/data/aboutPageContent.ts`
- Hero section, mission, vision
- Company timeline and achievements
- Values and why choose us

### Contact Page Content
**File:** `src/data/contactPageContent.ts`
- Page header and description
- Contact form labels
- Quick contact sections
- Office location info

### Product Pages Content
**File:** `src/data/productPageContent.ts`
- Catalog page text
- Product detail labels
- Quote cart messages
- Category descriptions

## 🎯 Quick Examples

### Change Homepage Hero Title
1. Open `src/data/heroContent.ts`
2. Find: `title1: "Innovative Laboratory Solutions."`
3. Change to: `title1: "Your New Title Here"`

### Replace About Page Hero Image
1. Upload image to `public/page-images/about/`
2. Open `src/data/aboutPageContent.ts`
3. Update: `heroImage: "/page-images/about/your-new-hero.jpg"`
4. Update: `heroImageAlt: "Description of your new image"`

### Add Company Logo
1. Upload logo to `public/brand-logos/`
2. Update references in data files
3. Recommended size: 200x60px for header logos

## 🏷️ Image Labeling Best Practices

### Alt Text Guidelines
- Be descriptive but concise
- Focus on what's important in the image
- Don't start with "Image of" or "Picture of"

**Good Examples:**
- `"Modern laboratory with advanced equipment"`
- `"Team meeting in conference room"`
- `"Company office exterior view"`

**Avoid:**
- `"Image1.jpg"`
- `"Picture of lab"`
- `"Photo"`

### File Naming Best Practices
- Use descriptive, lowercase names
- Separate words with hyphens
- Include the section/purpose

**Good Examples:**
- `about-hero-image.jpg`
- `contact-office-exterior.jpg`
- `product-category-fume-hoods.jpg`

## 📐 Recommended Image Sizes

| Image Type | Recommended Size | Format |
|------------|------------------|---------|
| Hero Images | 1920x1080px | JPG |
| Page Headers | 1200x800px | JPG |
| Product Images | 600x400px | JPG/PNG |
| Logos | 200x60px | PNG |
| Team Photos | 400x400px | JPG |
| Office Images | 800x600px | JPG |

## 🔄 Making Changes via GitHub

### Option 1: GitHub Web Interface
1. Navigate to the file you want to edit
2. Click the pencil icon (Edit)
3. Make your changes
4. Scroll down to "Commit changes"
5. Add a description and commit

### Option 2: GitHub Desktop/Local
1. Clone the repository locally
2. Make changes to files
3. Commit and push changes
4. Changes will sync automatically

## ✅ Testing Your Changes

After making changes:
1. Wait a few moments for the site to rebuild
2. Visit your live site to see changes
3. Check that images load correctly
4. Verify text appears as expected

## 🆘 Troubleshooting

### Images Not Showing
- Check file path matches exactly
- Ensure image is uploaded to correct folder
- Verify file extension (.jpg, .png) matches

### Text Not Updating
- Check you edited the correct data file
- Ensure proper syntax (quotes, commas)
- Verify the change was committed to GitHub

### Need Help?
- Check the comments in each data file for specific instructions
- Each folder has a README.md with guidelines
- Look for examples in the existing code

## 📂 File Locations Quick Reference

| Page/Section | Content File | Image Folder |
|--------------|--------------|---------------|
| Hero Slider | `src/data/heroContent.ts` | `public/hero-images/` |
| Homepage | `src/data/homePageContent.ts` | `public/page-images/home/` |
| About Page | `src/data/aboutPageContent.ts` | `public/page-images/about/` |
| Contact Page | `src/data/contactPageContent.ts` | `public/page-images/contact/` |
| Product Pages | `src/data/productPageContent.ts` | `public/page-images/products/` |
| Navigation/Footer | `src/data/siteContent.ts` | `public/brand-logos/` |
| Brand Logos | `src/data/brandCollections.ts` | `public/brand-logos/` |
