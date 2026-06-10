
interface SEOMetadata {
  title: string;
  description: string;
  keywords: string;
  ogImage?: string;
  canonical?: string;
}

const OG_IMAGE = "https://www.innosinlab.com/branding/hero-logo.png";

export const pageSEOMetadata: Record<string, SEOMetadata> = {
  welcome: {
    title: "Innosin Lab — Laboratory Furniture & Equipment",
    description: "Laboratory furniture, fume hoods and safety equipment for research labs across Malaysia and Asia.",
    keywords: "laboratory furniture, lab equipment, laboratory design, lab cabinets, scientific furniture, Malaysia",
    ogImage: OG_IMAGE,
    canonical: "https://www.innosinlab.com/"
  },
  home: {
    title: "Innosin Lab — Laboratory Furniture & Equipment",
    description: "Laboratory furniture, fume hoods, cabinets and safety equipment for research labs across Malaysia and Asia.",
    keywords: "laboratory furniture, lab equipment, laboratory design, lab cabinets, scientific furniture, lab workbenches, laboratory solutions, research equipment, lab safety furniture, laboratory installation",
    ogImage: OG_IMAGE,
    canonical: "https://www.innosinlab.com/"
  },
  products: {
    title: "Laboratory Furniture Catalog | Innosin Lab",
    description: "Browse mobile, wall and tall lab cabinets, fume hoods, benches and safety equipment from Innosin Lab and partner brands.",
    keywords: "laboratory furniture catalog, lab cabinets, mobile laboratory cabinets, wall cabinets, tall cabinets, lab equipment, powder coat finish, stainless steel lab furniture",
    ogImage: OG_IMAGE,
    canonical: "https://www.innosinlab.com/products"
  },
  about: {
    title: "About Innosin Lab — Since 1986",
    description: "35+ years building laboratory furniture and equipment for research, education and industry across Asia.",
    keywords: "Innosin Lab history, laboratory furniture company, lab equipment manufacturer, laboratory design experts, quality laboratory furniture",
    ogImage: OG_IMAGE,
    canonical: "https://www.innosinlab.com/about"
  },
  contact: {
    title: "Contact Innosin Lab",
    description: "Talk to Innosin Lab about laboratory design, furniture, fume hoods and safety equipment. Quotes and consultation available.",
    keywords: "contact Innosin Lab, laboratory furniture consultation, lab design services, laboratory equipment support, custom lab solutions",
    ogImage: OG_IMAGE,
    canonical: "https://www.innosinlab.com/contact"
  },
  blog: {
    title: "Lab Design Blog | Innosin Lab",
    description: "Insights on laboratory design, furniture innovations and safety best practices from the Innosin Lab team.",
    keywords: "laboratory design blog, lab furniture trends, laboratory innovations, scientific furniture insights, lab design best practices",
    ogImage: OG_IMAGE,
    canonical: "https://www.innosinlab.com/blog"
  },
  floorPlanner: {
    title: "3D Laboratory Floor Planner | Innosin Lab",
    description: "Plan your lab layout in 3D with real Innosin Lab furniture. Free interactive floor planner.",
    keywords: "laboratory floor planner, lab design tool, 3D laboratory design, interactive lab planner, laboratory layout design",
    ogImage: OG_IMAGE,
    canonical: "https://www.innosinlab.com/floor-planner"
  },
  rfqCart: {
    title: "Request a Quote | Innosin Lab",
    description: "Get a tailored quote for laboratory furniture, fume hoods and equipment from Innosin Lab.",
    keywords: "laboratory furniture quote, lab equipment pricing, custom laboratory quote, lab furniture cost, laboratory design consultation",
    ogImage: OG_IMAGE,
    canonical: "https://www.innosinlab.com/rfq-cart"
  },
  productDetail: {
    title: "Product Details | Innosin Lab",
    description: "Specifications, configurations and finish options for Innosin Lab laboratory furniture and equipment.",
    keywords: "laboratory furniture, lab equipment, product specifications, product details, lab furniture configurations",
    ogImage: OG_IMAGE,
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
