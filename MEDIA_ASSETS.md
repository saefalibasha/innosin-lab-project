
# Media Assets Documentation

This document provides a comprehensive guide for replacing all images and media assets in the Innosin Lab website. Each asset is clearly labeled with its purpose, location, and recommended specifications.

## Quick Replacement Guide

To replace any image:
1. Navigate to the appropriate folder in the `public/` directory
2. Upload your new image with the exact same filename
3. Ensure the image meets the recommended dimensions and format
4. Commit your changes via GitHub

## Asset Organization

### Brand Logos (`/public/brand-logos/`)

#### Main Company Logo
- **File**: `innosin-logo.png`
- **Location**: Navigation header
- **Purpose**: Main company branding
- **Dimensions**: 32x32px (icon size)
- **Format**: PNG with transparency
- **Description**: Primary Innosin Lab logo displayed in navigation

#### Partner Brand Logos (Product Collections)
- **File**: `broen-lab-logo.png`
- **Location**: Homepage Product Collections section
- **Purpose**: Broen-Lab brand representation
- **Dimensions**: 128x128px
- **Format**: PNG with transparency
- **Description**: Displayed in Broen-Lab product collection card

- **File**: `hamilton-laboratory-logo.png`
- **Location**: Homepage Product Collections section
- **Purpose**: Hamilton Laboratory Solutions brand representation
- **Dimensions**: 128x128px
- **Format**: PNG with transparency
- **Description**: Displayed in Hamilton Laboratory Solutions product collection card

- **File**: `oriental-giken-logo.png`
- **Location**: Homepage Product Collections section
- **Purpose**: Oriental Giken Inc. brand representation
- **Dimensions**: 128x128px
- **Format**: PNG with transparency
- **Description**: Displayed in Oriental Giken Inc. product collection card

- **File**: `innosin-lab-logo.png`
- **Location**: Homepage Product Collections section
- **Purpose**: Innosin Lab brand representation in products
- **Dimensions**: 128x128px
- **Format**: PNG with transparency
- **Description**: Displayed in Innosin Lab product collection card

### Hero Section (`/public/hero-section/`)

#### Company Story Video
- **File**: `company-story-video.mp4`
- **Location**: VideoHero component
- **Purpose**: Background video for hero section
- **Dimensions**: 1920x1080px minimum
- **Format**: MP4, H.264 codec
- **Duration**: 30-60 seconds recommended

### Before/After Projects (`/public/before-after-projects/`)

#### University Chemistry Lab Project
- **File**: `university-chemistry-lab-before.jpg`
- **Purpose**: Before state of university chemistry laboratory
- **Dimensions**: 800x600px
- **Format**: JPG, high quality

- **File**: `university-chemistry-lab-after.jpg`
- **Purpose**: After state of university chemistry laboratory
- **Dimensions**: 800x600px
- **Format**: JPG, high quality

#### Hospital Pathology Lab Project
- **File**: `hospital-pathology-lab-before.jpg`
- **Purpose**: Before state of hospital pathology laboratory
- **Dimensions**: 800x600px
- **Format**: JPG, high quality

- **File**: `hospital-pathology-lab-after.jpg`
- **Purpose**: After state of hospital pathology laboratory
- **Dimensions**: 800x600px
- **Format**: JPG, high quality

#### Biotech Research Facility Project
- **File**: `biotech-research-facility-before.jpg`
- **Purpose**: Before state of biotech research facility
- **Dimensions**: 800x600px
- **Format**: JPG, high quality

- **File**: `biotech-research-facility-after.jpg`
- **Purpose**: After state of biotech research facility
- **Dimensions**: 800x600px
- **Format**: JPG, high quality

### Interactive Lab (`/public/interactive-lab/`)

#### Main Laboratory Setup
- **File**: `modern-laboratory-setup.jpg`
- **Location**: ShopTheLook component
- **Purpose**: Background image for interactive laboratory showcase
- **Dimensions**: 1200x800px
- **Format**: JPG, high quality
- **Description**: Modern laboratory with equipment and workstations

### About Us Page (`/public/about-us/`)

#### Hero Section
- **File**: `about-hero-laboratory.jpg`
- **Purpose**: Main hero image for About Us page
- **Dimensions**: 1200x600px
- **Format**: JPG, high quality

#### Mission & Vision Section
- **File**: `mission-modern-laboratory.jpg`
- **Purpose**: Supporting image for mission section
- **Dimensions**: 600x400px
- **Format**: JPG, high quality

#### Company Timeline Images

##### 2024 Achievements
- **File**: `timeline-2024-modern-equipment.jpg`
- **Purpose**: Modern laboratory equipment (2024)
- **Dimensions**: 500x300px
- **Format**: JPG

- **File**: `timeline-2024-lab-technology.jpg`
- **Purpose**: Laboratory technology advancement (2024)
- **Dimensions**: 500x300px
- **Format**: JPG

- **File**: `timeline-2024-research.jpg`
- **Purpose**: Research environment (2024)
- **Dimensions**: 500x300px
- **Format**: JPG

- **File**: `timeline-2024-lab-design.jpg`
- **Purpose**: Laboratory design showcase (2024)
- **Dimensions**: 500x300px
- **Format**: JPG

##### 2018 Expansion
- **File**: `timeline-2018-pharmaceutical-lab.jpg`
- **Purpose**: Pharmaceutical laboratory project (2018)
- **Dimensions**: 500x300px
- **Format**: JPG

- **File**: `timeline-2018-research-facility.jpg`
- **Purpose**: Research facility expansion (2018)
- **Dimensions**: 500x300px
- **Format**: JPG

##### 2012 Milestones
- **File**: `timeline-2012-automation.jpg`
- **Purpose**: Laboratory automation systems (2012)
- **Dimensions**: 500x300px
- **Format**: JPG

- **File**: `timeline-2012-safety.jpg`
- **Purpose**: Safety protocol implementation (2012)
- **Dimensions**: 500x300px
- **Format**: JPG

##### 2009 Foundation
- **File**: `timeline-2009-founding.jpg`
- **Purpose**: Company founding moment (2009)
- **Dimensions**: 500x300px
- **Format**: JPG

- **File**: `timeline-2009-early-design.jpg`
- **Purpose**: Early laboratory design work (2009)
- **Dimensions**: 500x300px
- **Format**: JPG

### Product Comparison (`/public/product-comparison/`)

#### Placeholder Products
- **File**: `standard-fume-hood.jpg`
- **Purpose**: Standard fume hood product image
- **Dimensions**: 300x200px
- **Format**: JPG

- **File**: `premium-fume-hood.jpg`
- **Purpose**: Premium fume hood product image
- **Dimensions**: 300x200px
- **Format**: JPG

- **File**: `compact-lab-bench.jpg`
- **Purpose**: Compact lab bench product image
- **Dimensions**: 300x200px
- **Format**: JPG

## Brand Logo Replacement Instructions

### Product Collections Section
The homepage Product Collections section displays four brand logos. To replace these:

1. Navigate to `/public/brand-logos/` in your GitHub repository
2. Upload your brand logo files with these exact names:
   - `broen-lab-logo.png` - Broen-Lab brand logo
   - `hamilton-laboratory-logo.png` - Hamilton Laboratory Solutions logo
   - `oriental-giken-logo.png` - Oriental Giken Inc. logo
   - `innosin-lab-logo.png` - Innosin Lab logo

3. **Important specifications:**
   - **Dimensions**: 80x80px (square format)
   - **Format**: PNG with transparent background preferred
   - **Quality**: High resolution for crisp display
   - **Style**: Clean, professional appearance that matches the site design

4. The logos will automatically display with hover effects and responsive scaling

### Fallback System
If a logo file is not found, the system will automatically fall back to the original emoji icons:
- Broen-Lab: 💨 (wind/ventilation symbol)
- Hamilton Laboratory: 🧪 (lab equipment symbol)
- Oriental Giken: 🛡️ (safety/protection symbol)
- Innosin Lab: 📦 (storage/equipment symbol)

## Image Replacement Instructions

### Via GitHub Web Interface
1. Navigate to the appropriate folder in the repository
2. Click "Add file" > "Upload files"
3. Drag and drop your new image with the exact filename
4. Add a commit message describing the change
5. Click "Commit changes"

### Via GitHub Desktop/Git
1. Clone the repository locally
2. Navigate to the appropriate folder
3. Replace the image file with your new image (same filename)
4. Commit and push changes

## Best Practices

### Image Quality
- Use high-resolution images for better display on retina screens
- Optimize file sizes without compromising quality
- Maintain consistent lighting and color schemes

### File Formats
- **JPG**: For photographs and complex images
- **PNG**: For logos, graphics with transparency
- **WebP**: For web-optimized images (modern browsers)

### Naming Convention
- Use descriptive, kebab-case filenames
- Include purpose and context in filename
- Maintain consistency across similar assets

### Visual Consistency
- Ensure new images match the overall design aesthetic
- Maintain consistent color temperature and saturation
- Consider the context where images will be displayed

## Contact

For questions about image replacement or technical assistance, please refer to the project documentation or contact the development team.
