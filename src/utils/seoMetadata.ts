
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
    title: "Lab Furniture & Fume Hoods Singapore | Innosin Lab",
    description: "Innosin Lab Singapore supplies laboratory furniture, fume hoods and safety equipment for research, education and industry across Singapore and Southeast Asia.",
    keywords: "lab furniture singapore, laboratory furniture singapore, fume hood singapore, laboratory furniture supplier singapore",
    ogImage: OG_IMAGE,
    canonical: "https://www.innosinlab.com/"
  },
  home: {
    title: "Lab Furniture & Fume Hoods Singapore | Innosin Lab",
    description: "Singapore's trusted source for laboratory furniture, fume hoods, lab cabinets and safety equipment. Designed for research, education and industrial labs since 1986.",
    keywords: "lab furniture singapore, laboratory furniture singapore, fume hood singapore, laboratory furniture supplier, lab cabinets singapore, laboratory design singapore, lab workbenches, lab equipment singapore",
    ogImage: OG_IMAGE,
    canonical: "https://www.innosinlab.com/"
  },
  products: {
    title: "Lab Furniture Catalog — Fume Hoods, Cabinets, Benches | Singapore",
    description: "Browse Innosin Lab's Singapore catalog: fume hoods, mobile/wall/tall lab cabinets, workbenches, sink cabinets and safety equipment with full 3D previews.",
    keywords: "laboratory furniture catalog singapore, fume hoods singapore, lab cabinets, mobile laboratory cabinets, wall cabinets, tall cabinets, lab workbenches, sink cabinets",
    ogImage: OG_IMAGE,
    canonical: "https://www.innosinlab.com/products"
  },
  about: {
    title: "About Innosin Lab Singapore — Laboratory Furniture Since 1986",
    description: "Innosin Lab is a Singapore-based laboratory furniture and fume hood manufacturer with 35+ years serving research, education and industry across Southeast Asia.",
    keywords: "innosin lab singapore, laboratory furniture company singapore, lab equipment manufacturer singapore, laboratory design experts",
    ogImage: OG_IMAGE,
    canonical: "https://www.innosinlab.com/about"
  },
  contact: {
    title: "Contact Innosin Lab Singapore — Lab Furniture Quotes",
    description: "Get in touch with Innosin Lab Singapore for laboratory design, fume hoods, lab cabinets and safety equipment. Quotes and consultation available.",
    keywords: "contact innosin lab singapore, laboratory furniture consultation singapore, lab design services singapore, custom laboratory quote",
    ogImage: OG_IMAGE,
    canonical: "https://www.innosinlab.com/contact"
  },
  blog: {
    title: "Lab Design Blog | Innosin Lab Singapore",
    description: "Insights on laboratory design, fume hood selection and safety best practices from the Innosin Lab Singapore team.",
    keywords: "laboratory design blog singapore, lab furniture trends, fume hood guide, laboratory innovations, lab design best practices",
    ogImage: OG_IMAGE,
    canonical: "https://www.innosinlab.com/blog"
  },
  floorPlanner: {
    title: "Free 3D Laboratory Floor Planner Singapore | Innosin Lab",
    description: "Plan your Singapore lab layout in 3D with real Innosin Lab furniture, cabinets and fume hoods. Free interactive floor planner — no signup needed.",
    keywords: "laboratory floor planner singapore, lab design tool, 3D laboratory design, interactive lab planner, laboratory layout design singapore",
    ogImage: OG_IMAGE,
    canonical: "https://www.innosinlab.com/floor-planner"
  },
  rfqCart: {
    title: "Request a Quote | Innosin Lab Singapore",
    description: "Get a tailored Singapore quote for laboratory furniture, fume hoods and lab equipment from Innosin Lab.",
    keywords: "laboratory furniture quote singapore, lab equipment pricing, custom laboratory quote, fume hood quote singapore",
    ogImage: OG_IMAGE,
    canonical: "https://www.innosinlab.com/rfq-cart"
  },
  productDetail: {
    title: "Lab Product Details | Innosin Lab Singapore",
    description: "Specifications, configurations and finishes for Innosin Lab Singapore laboratory furniture, fume hoods and cabinets.",
    keywords: "laboratory furniture singapore, lab equipment specifications, fume hood specifications, lab furniture configurations",
    ogImage: OG_IMAGE,
    canonical: "https://www.innosinlab.com/products"
  },
  labFurnitureSG: {
    title: "Lab Furniture Singapore — Cabinets, Benches & Workstations | Innosin Lab",
    description: "Buy lab furniture in Singapore — modular cabinets, workbenches, sink cabinets, mobile and tall cabinets engineered for research and teaching labs. Free 3D planner and Singapore-based support.",
    keywords: "lab furniture singapore, laboratory furniture singapore, lab cabinets singapore, lab workbenches singapore, laboratory furniture supplier singapore",
    ogImage: OG_IMAGE,
    canonical: "https://www.innosinlab.com/lab-furniture-singapore"
  },
  fumeHoodsSG: {
    title: "Fume Hoods Singapore — Ducted, Ductless & Bio Safety | Innosin Lab",
    description: "Fume hoods in Singapore: NOCE ducted, Safe Aire II and TANGERINE Class II bio safety cabinets. Built to SS, EN 14175 and NSF/ANSI 49 standards with local installation and service.",
    keywords: "fume hood singapore, ductless fume hood singapore, bio safety cabinet singapore, fume cupboard singapore, laboratory fume hood",
    ogImage: OG_IMAGE,
    canonical: "https://www.innosinlab.com/fume-hoods-singapore"
  },
  supplierSG: {
    title: "Laboratory Furniture Supplier Singapore | Innosin Lab",
    description: "A trusted laboratory furniture supplier in Singapore for universities, hospitals, biotech and industrial labs. End-to-end design, supply, installation and after-sales support.",
    keywords: "laboratory furniture supplier singapore, lab furniture supplier singapore, laboratory equipment supplier, lab fitout singapore, lab refurbishment singapore",
    ogImage: OG_IMAGE,
    canonical: "https://www.innosinlab.com/laboratory-furniture-supplier-singapore"
  },
  labCabinetsSG: {
    title: "Lab Cabinets Singapore — Modular, Tall, Wall & Mobile | Innosin Lab",
    description: "Laboratory cabinets in Singapore — modular, tall, wall, mobile and SCDF-compliant flammable safety cabinets in powder coat or stainless steel.",
    keywords: "lab cabinets singapore, laboratory cabinets singapore, mobile cabinets, tall lab cabinet, flammable storage cabinet singapore",
    ogImage: OG_IMAGE,
    canonical: "https://www.innosinlab.com/lab-cabinets-singapore"
  },
  labBenchesSG: {
    title: "Lab Benches Singapore — Modular & Knee-Space Workbenches | Innosin Lab",
    description: "Laboratory workbenches in Singapore — modular, knee-space and fixed benches with epoxy, phenolic, stainless or polypropylene tops.",
    keywords: "lab bench singapore, laboratory bench singapore, lab workbench, knee space bench, modular lab bench",
    ogImage: OG_IMAGE,
    canonical: "https://www.innosinlab.com/lab-benches-singapore"
  },
  biosafetySG: {
    title: "Biosafety Cabinets Singapore — Class II Type A2 BSCs | Innosin Lab",
    description: "Class II Type A2 and B2 biosafety cabinets in Singapore, NSF/ANSI 49 listed with annual recertification and decontamination service.",
    keywords: "biosafety cabinet singapore, class ii bsc singapore, nsf 49 cabinet, microbiological safety cabinet singapore",
    ogImage: OG_IMAGE,
    canonical: "https://www.innosinlab.com/biosafety-cabinets-singapore"
  },
  labFurnitureMY: {
    title: "Laboratory Furniture Malaysia — Fume Hoods, Benches & Cabinets | Innosin",
    description: "Laboratory furniture in Malaysia from Innosin Technologies — fume hoods, benches and cabinets manufactured in Johor and supplied across Malaysia.",
    keywords: "laboratory furniture malaysia, lab furniture johor, fume hood malaysia, lab cabinets malaysia",
    ogImage: OG_IMAGE,
    canonical: "https://www.innosinlab.com/laboratory-furniture-malaysia"
  },
  labDesignSG: {
    title: "Laboratory Design Singapore — Fit-out & 3D Planning | Innosin Lab",
    description: "End-to-end laboratory design in Singapore — concept, 3D layout, furniture supply, fume-hood commissioning and turnkey fit-out.",
    keywords: "laboratory design singapore, lab fit out singapore, lab refurbishment singapore, laboratory consultants singapore",
    ogImage: OG_IMAGE,
    canonical: "https://www.innosinlab.com/laboratory-design-singapore"
  },
  guideLabBenches: {
    title: "How to Choose Lab Benches — Buyer's Guide (2026) | Innosin Lab",
    description: "Modular vs fixed lab benches, worktop materials, ergonomics, load ratings and Singapore compliance — a practical buyer's guide.",
    keywords: "lab bench, choosing lab benches, modular lab bench, epoxy worktop, lab bench height",
    ogImage: OG_IMAGE,
    canonical: "https://www.innosinlab.com/guides/choosing-lab-benches"
  },
  guideFumeVsBSC: {
    title: "Fume Hood vs Biosafety Cabinet — Which Do You Need? | Innosin Lab",
    description: "When to use a chemical fume hood and when to use a Class II biosafety cabinet — standards, special cases and Singapore guidance.",
    keywords: "fume hood vs biosafety cabinet, bsc vs fume hood, class ii a2, chemical fume hood",
    ogImage: OG_IMAGE,
    canonical: "https://www.innosinlab.com/guides/fume-hood-vs-biosafety-cabinet"
  },
  guideDuctedVsDuctless: {
    title: "Ducted vs Ductless Fume Hoods — Which Should You Buy? | Innosin Lab",
    description: "Pros, cons and 10-year cost comparison for ducted vs ductless (filtered) fume hoods, with Singapore standards (SS 651, EN 14175).",
    keywords: "ducted vs ductless fume hood, filtered fume hood, recirculating fume hood, en 14175",
    ogImage: OG_IMAGE,
    canonical: "https://www.innosinlab.com/guides/ducted-vs-ductless-fume-hoods"
  },
  guideLabCabinets: {
    title: "Lab Cabinets Buying Guide — Storage, Safety & Sizing | Innosin Lab",
    description: "Under-bench, tall, wall, mobile and chemical safety cabinets — how to size and specify laboratory storage for Singapore labs.",
    keywords: "lab cabinets, laboratory storage, flammable cabinet, ss304 lab cabinet, mobile cabinet",
    ogImage: OG_IMAGE,
    canonical: "https://www.innosinlab.com/guides/lab-cabinets-buying-guide"
  },
  guideStandardsSG: {
    title: "Lab Furniture Standards in Singapore — SS, EN, NSF & SCDF | Innosin Lab",
    description: "Reference guide to SS 651, EN 14175, ASHRAE 110, NSF/ANSI 49, SEFA 8 and SCDF flammable storage codes for Singapore labs.",
    keywords: "ss 651, en 14175, nsf 49, sefa 8, lab standards singapore, scdf flammable storage",
    ogImage: OG_IMAGE,
    canonical: "https://www.innosinlab.com/guides/lab-furniture-standards-singapore"
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

export const addStructuredData = (data: any, key = 'page') => {
  // Only remove previously-injected dynamic blocks (preserves the static
  // Organization / WebSite / LocalBusiness JSON-LD in index.html).
  document
    .querySelectorAll(`script[type="application/ld+json"][data-dynamic="${key}"]`)
    .forEach((s) => s.remove());

  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.setAttribute('data-dynamic', key);
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
};
