
interface SEOMetadata {
  title: string;
  description: string;
  keywords: string;
  ogImage?: string;
  canonical?: string;
}

export const pageSEOMetadata: Record<string, SEOMetadata> = {
  home: {
    title: "Innosin Lab - Premium Laboratory Furniture & Equipment Solutions",
    description: "Leading provider of innovative laboratory furniture, equipment, and custom design solutions. Specializing in high-quality lab cabinets, workbenches, and complete laboratory setups for research institutions.",
    keywords: "laboratory furniture, lab equipment, laboratory design, lab cabinets, scientific furniture, lab workbenches, laboratory solutions, research equipment, lab safety furniture, laboratory installation",
    ogImage: "/branding/hero-logo.png",
    canonical: "https://www.innosinlab.com/"
  },
  products: {
    title: "Laboratory Furniture & Equipment | Product Catalog - Innosin Lab",
    description: "Explore our comprehensive range of laboratory furniture including mobile cabinets, wall cabinets, tall cabinets, and specialized lab equipment. Premium quality with multiple finish options.",
    keywords: "laboratory furniture catalog, lab cabinets, mobile laboratory cabinets, wall cabinets, tall cabinets, lab equipment, powder coat finish, stainless steel lab furniture",
    ogImage: "/branding/hero-logo.png",
    canonical: "https://www.innosinlab.com/products"
  },
  about: {
    title: "About Innosin Lab - Laboratory Solutions Experts Since 1986",
    description: "Learn about Innosin Lab's 35+ years of expertise in laboratory furniture and equipment. Our commitment to innovation, quality, and customer satisfaction in laboratory solutions.",
    keywords: "Innosin Lab history, laboratory furniture company, lab equipment manufacturer, laboratory design experts, quality laboratory furniture",
    ogImage: "/branding/hero-logo.png",
    canonical: "https://www.innosinlab.com/about"
  },
  contact: {
    title: "Contact Innosin Lab - Laboratory Furniture & Equipment Specialists",
    description: "Get in touch with Innosin Lab for custom laboratory design, furniture solutions, and equipment needs. Professional consultation and worldwide service.",
    keywords: "contact Innosin Lab, laboratory furniture consultation, lab design services, laboratory equipment support, custom lab solutions",
    ogImage: "/branding/hero-logo.png",
    canonical: "https://www.innosinlab.com/contact"
  },
  blog: {
    title: "Laboratory Design Blog & Insights - Innosin Lab",
    description: "Stay updated with the latest trends in laboratory design, furniture innovations, and industry insights from Innosin Lab's experts.",
    keywords: "laboratory design blog, lab furniture trends, laboratory innovations, scientific furniture insights, lab design best practices",
    ogImage: "/branding/hero-logo.png",
    canonical: "https://www.innosinlab.com/blog"
  },
  floorPlanner: {
    title: "Interactive Laboratory Floor Planner - Design Your Lab | Innosin Lab",
    description: "Use our interactive 3D floor planner to design your laboratory layout with Innosin Lab furniture. Visualize and plan your perfect laboratory space.",
    keywords: "laboratory floor planner, lab design tool, 3D laboratory design, interactive lab planner, laboratory layout design",
    ogImage: "/branding/hero-logo.png",
    canonical: "https://www.innosinlab.com/floor-planner"
  },
  rfqCart: {
    title: "Request for Quote - Laboratory Furniture & Equipment | Innosin Lab",
    description: "Get a customized quote for your laboratory furniture and equipment needs. Professional consultation and competitive pricing from Innosin Lab.",
    keywords: "laboratory furniture quote, lab equipment pricing, custom laboratory quote, lab furniture cost, laboratory design consultation",
    ogImage: "/branding/hero-logo.png",
    canonical: "https://www.innosinlab.com/rfq-cart"
  },
  productDetail: {
    title: "Product Details - Laboratory Furniture | Innosin Lab",
    description: "View detailed specifications and configurations for laboratory furniture and equipment from Innosin Lab.",
    keywords: "laboratory furniture, lab equipment, product specifications, product details, lab furniture configurations",
    ogImage: "/branding/hero-logo.png",
    canonical: "https://www.innosinlab.com/products"
  }
};

export const updatePageSEO = (pageKey: keyof typeof pageSEOMetadata, customData?: Partial<SEOMetadata>) => {
  const metadata = { ...pageSEOMetadata[pageKey], ...customData };
  
  // Determine if this is a private/admin route
  const isPrivateRoute = ['admin', 'auth'].some(route => pageKey.toLowerCase().includes(route));
  
  // Update title
  document.title = metadata.title;
  
  // Update or create meta description
  let metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    metaDescription.setAttribute('content', metadata.description);
  } else {
    metaDescription = document.createElement('meta');
    metaDescription.setAttribute('name', 'description');
    metaDescription.setAttribute('content', metadata.description);
    document.head.appendChild(metaDescription);
  }
  
  // Update or create meta keywords
  let metaKeywords = document.querySelector('meta[name="keywords"]');
  if (metaKeywords) {
    metaKeywords.setAttribute('content', metadata.keywords);
  } else {
    metaKeywords = document.createElement('meta');
    metaKeywords.setAttribute('name', 'keywords');
    metaKeywords.setAttribute('content', metadata.keywords);
    document.head.appendChild(metaKeywords);
  }
  
  // Update or create meta robots tag
  const robotsContent = isPrivateRoute ? 'noindex, nofollow' : 'index, follow';
  updateOrCreateMeta('name', 'robots', robotsContent);
  
  // Update Open Graph tags
  updateOrCreateMeta('property', 'og:title', metadata.title);
  updateOrCreateMeta('property', 'og:description', metadata.description);
  updateOrCreateMeta('property', 'og:image', metadata.ogImage || '/branding/hero-logo.png');
  updateOrCreateMeta('property', 'og:type', 'website');
  updateOrCreateMeta('property', 'og:site_name', 'Innosin Lab');
  
  // Update Twitter Card tags
  updateOrCreateMeta('name', 'twitter:card', 'summary_large_image');
  updateOrCreateMeta('name', 'twitter:title', metadata.title);
  updateOrCreateMeta('name', 'twitter:description', metadata.description);
  updateOrCreateMeta('name', 'twitter:image', metadata.ogImage || '/branding/hero-logo.png');
  
  // Update canonical URL - use clean URL without tracking parameters
  const canonical = document.querySelector('link[rel="canonical"]');
  const cleanUrl = getCleanCanonicalUrl(metadata.canonical);
  if (canonical) {
    canonical.setAttribute('href', cleanUrl);
  } else {
    const link = document.createElement('link');
    link.rel = 'canonical';
    link.href = cleanUrl;
    document.head.appendChild(link);
  }
  
  // Update og:url with clean URL
  updateOrCreateMeta('property', 'og:url', cleanUrl);
};

// Helper function to create clean canonical URLs
const getCleanCanonicalUrl = (preferredCanonical?: string): string => {
  if (preferredCanonical) {
    return preferredCanonical;
  }
  
  // Fallback: create clean URL from current location
  const url = new URL(window.location.href);
  // Remove tracking parameters
  const trackingParams = ['srsltid', 'utm_source', 'utm_medium', 'utm_campaign', 'fbclid', 'gclid'];
  trackingParams.forEach(param => url.searchParams.delete(param));
  
  return url.toString();
};

const updateOrCreateMeta = (attributeType: 'name' | 'property', attributeValue: string, content: string) => {
  let meta = document.querySelector(`meta[${attributeType}="${attributeValue}"]`);
  if (meta) {
    meta.setAttribute('content', content);
  } else {
    meta = document.createElement('meta');
    meta.setAttribute(attributeType, attributeValue);
    meta.setAttribute('content', content);
    document.head.appendChild(meta);
  }
};

export const addStructuredData = (data: any) => {
  // Remove existing structured data
  const existingScript = document.querySelector('script[type="application/ld+json"]');
  if (existingScript) {
    existingScript.remove();
  }
  
  // Add new structured data
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
};
