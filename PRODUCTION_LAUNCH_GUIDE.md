
# Innosin Lab - Production Launch Guide

## Pre-Launch Checklist

### 1. Domain Configuration
- [ ] Update `src/utils/environmentDetection.ts` with your actual production domain(s)
- [ ] Replace `'innosinlab.com'` and `'www.innosinlab.com'` with your real domain
- [ ] Test environment detection on staging/preview URLs

### 2. SEO Optimization
- [ ] Verify all meta tags are properly set in maintenance page
- [ ] Ensure Innosin Lab logo is correctly displayed as favicon
- [ ] Test social media sharing (Facebook, Twitter, LinkedIn)
- [ ] Validate structured data using Google's Rich Results Test

### 3. Content Review
- [ ] Review all maintenance page content for accuracy
- [ ] Verify contact information (email, phone, address)
- [ ] Update progress percentages and launch timeline
- [ ] Check all form fields are working correctly

### 4. Technical Setup
- [ ] Configure Google Analytics (add tracking code)
- [ ] Set up Google Search Console
- [ ] Create XML sitemap
- [ ] Configure robots.txt file
- [ ] Test all HubSpot integrations

## Launch Process

### Step 1: Environment Switch
To switch from maintenance mode to full website:

1. **Update Environment Detection** (Optional - for gradual rollout)
   ```typescript
   // In src/utils/environmentDetection.ts
   // Temporarily allow full site for testing
   export const isLovableDevelopment = (): boolean => {
     // Return true to show full site, false to show maintenance
     return true; // CHANGE THIS TO false FOR MAINTENANCE MODE
   };
   ```

2. **Or Update Production Domains** (Recommended)
   ```typescript
   // Remove your domain from production list to show full site
   const productionDomains = [
     // 'innosinlab.com', // Comment out to show full site
     // 'www.innosinlab.com', // Comment out to show full site
   ];
   ```

### Step 2: Full Site SEO Setup
When ready to launch the full site, implement SEO for all pages:

1. **Add SEO to main pages**:
   ```typescript
   // Import in each page component
   import { updatePageSEO } from '@/utils/seoMetadata';
   
   // Add in useEffect
   useEffect(() => {
     updatePageSEO('home'); // or 'products', 'about', etc.
   }, []);
   ```

2. **Update page-specific content**:
   - Home page: Hero content, product highlights
   - Products: Category descriptions, product details
   - About: Company story, team information
   - Contact: Complete contact details

### Step 3: Performance Optimization
- [ ] Optimize images (compress, use WebP format)
- [ ] Enable caching headers
- [ ] Minimize JavaScript bundles
- [ ] Test page load speeds
- [ ] Verify mobile responsiveness

### Step 4: Monitoring Setup
- [ ] Set up uptime monitoring
- [ ] Configure error tracking (Sentry, LogRocket, etc.)
- [ ] Monitor site performance (PageSpeed Insights)
- [ ] Track user analytics and conversions

## Post-Launch Tasks

### Week 1
- [ ] Monitor site performance and uptime
- [ ] Check Google Search Console for crawl errors
- [ ] Verify all forms are receiving submissions
- [ ] Test HubSpot integration functionality
- [ ] Monitor user feedback and inquiries

### Week 2-4
- [ ] Submit sitemap to search engines
- [ ] Monitor search engine indexing
- [ ] Analyze user behavior with analytics
- [ ] Optimize based on performance data
- [ ] Update content based on user feedback

### Ongoing Maintenance
- [ ] Regular content updates
- [ ] SEO optimization based on search data
- [ ] Performance monitoring and optimization
- [ ] Security updates and monitoring
- [ ] User experience improvements

## Emergency Rollback

If issues arise after launch, quickly revert to maintenance mode:

1. **Quick Rollback**:
   ```typescript
   // In src/utils/environmentDetection.ts
   const productionDomains = [
     'innosinlab.com',
     'www.innosinlab.com',
     // Add your domain back to force maintenance mode
   ];
   ```

2. **Test the rollback** on a staging environment first
3. **Communicate with users** about temporary maintenance
4. **Fix issues** and re-launch when ready

## Support Contacts

- **Technical Issues**: Development team
- **Content Updates**: Marketing team
- **SEO Questions**: SEO specialist
- **HubSpot Integration**: CRM administrator

---

**Note**: Always test changes in a staging environment before applying to production!
