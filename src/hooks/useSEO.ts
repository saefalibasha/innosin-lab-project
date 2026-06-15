import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { pageSEOMetadata, updatePageSEO, addStructuredData } from '@/utils/seoMetadata';

interface SEOMetadata {
  title: string;
  description: string;
  keywords: string;
  ogImage?: string;
  canonical?: string;
}

export const useSEO = (pageKey?: keyof typeof pageSEOMetadata, customData?: Partial<SEOMetadata>) => {
  const location = useLocation();

  useEffect(() => {
    const currentPageKey = pageKey || getPageKeyFromRoute(location.pathname);

    if (currentPageKey && pageSEOMetadata[currentPageKey]) {
      updatePageSEO(currentPageKey, customData);
      addPageStructuredData(currentPageKey, location.pathname);
    } else {
      updatePageSEO('home', customData);
    }

    // Breadcrumbs for every non-home route
    addBreadcrumbs(location.pathname);
  }, [pageKey, customData, location.pathname]);
};

const getPageKeyFromRoute = (pathname: string): keyof typeof pageSEOMetadata | null => {
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length === 0 || segments[0] === 'home') return 'home';
  if (segments[0] === 'products') return 'products';
  if (segments[0] === 'about') return 'about';
  if (segments[0] === 'contact') return 'contact';
  if (segments[0] === 'blog') return 'blog';
  if (segments[0] === 'floor-planner') return 'floorPlanner';
  if (segments[0] === 'rfq-cart') return 'rfqCart';
  if (segments[0] === 'lab-furniture-singapore') return 'labFurnitureSG';
  if (segments[0] === 'fume-hoods-singapore') return 'fumeHoodsSG';
  if (segments[0] === 'laboratory-furniture-supplier-singapore') return 'supplierSG';

  return null;
};

const prettify = (slug: string) =>
  slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

const addBreadcrumbs = (pathname: string) => {
  const baseUrl = 'https://www.innosinlab.com';
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0 || segments[0] === 'home') return;

  const items: any[] = [
    { '@type': 'ListItem', position: 1, name: 'Home', item: `${baseUrl}/` },
  ];

  let path = '';
  segments.forEach((seg, i) => {
    path += `/${seg}`;
    // Skip UUID segments — use the parent label instead
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(seg);
    items.push({
      '@type': 'ListItem',
      position: i + 2,
      name: isUuid ? 'Product' : prettify(seg),
      item: `${baseUrl}${path}`,
    });
  });

  addStructuredData(
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items,
    },
    'breadcrumbs'
  );
};

const addPageStructuredData = (pageKey: keyof typeof pageSEOMetadata, pathname: string) => {
  const baseUrl = window.location.origin;
  const fullUrl = `${baseUrl}${pathname}`;

  let structuredData: any;

  switch (pageKey) {
    case 'products':
      structuredData = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: pageSEOMetadata[pageKey].title,
        description: pageSEOMetadata[pageKey].description,
        url: fullUrl,
        mainEntity: {
          '@type': 'ItemList',
          name: 'Laboratory Equipment Catalog',
          description: 'Complete range of laboratory furniture and equipment for Singapore',
          itemListOrder: 'https://schema.org/ItemListUnordered',
          numberOfItems: 14,
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Mobile Cabinets', url: `${baseUrl}/products?category=mobile-cabinets` },
            { '@type': 'ListItem', position: 2, name: 'Wall Cabinets', url: `${baseUrl}/products?category=wall-cabinets` },
            { '@type': 'ListItem', position: 3, name: 'Tall Cabinets', url: `${baseUrl}/products?category=tall-cabinets` },
            { '@type': 'ListItem', position: 4, name: 'Fume Hoods', url: `${baseUrl}/products?category=fume-hoods` },
            { '@type': 'ListItem', position: 5, name: 'Bio Safety Cabinets', url: `${baseUrl}/products?category=bio-safety-cabinets` },
          ],
        },
        publisher: {
          '@type': 'Organization',
          name: 'Innosin Lab Pte. Ltd.',
          url: 'https://www.innosinlab.com',
        },
      };
      break;

    case 'about':
      structuredData = {
        '@context': 'https://schema.org',
        '@type': 'AboutPage',
        name: pageSEOMetadata[pageKey].title,
        description: pageSEOMetadata[pageKey].description,
        url: fullUrl,
        mainEntity: {
          '@type': 'Organization',
          name: 'Innosin Lab Pte. Ltd.',
          foundingDate: '1986',
          description: 'Singapore-based laboratory furniture and fume hood manufacturer',
        },
      };
      break;

    case 'contact':
      structuredData = {
        '@context': 'https://schema.org',
        '@type': 'ContactPage',
        name: pageSEOMetadata[pageKey].title,
        description: pageSEOMetadata[pageKey].description,
        url: fullUrl,
        mainEntity: {
          '@type': 'ContactPoint',
          contactType: 'Customer Service',
          email: 'info@innosinlab.com',
          areaServed: 'SG',
          availableLanguage: ['English'],
        },
      };
      break;

    case 'blog':
      structuredData = {
        '@context': 'https://schema.org',
        '@type': 'Blog',
        name: pageSEOMetadata[pageKey].title,
        description: pageSEOMetadata[pageKey].description,
        url: fullUrl,
        about: 'Laboratory design, furniture innovations, and Singapore industry insights',
      };
      break;

    default:
      structuredData = {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: pageSEOMetadata[pageKey].title,
        description: pageSEOMetadata[pageKey].description,
        url: fullUrl,
        inLanguage: 'en-SG',
        isPartOf: {
          '@type': 'WebSite',
          name: 'Innosin Lab',
          url: baseUrl,
        },
      };
  }

  addStructuredData(structuredData);
};
