
## SEO gap analysis — innosinlab.com (Semrush snapshot)

| Metric (SG) | Value | Issue |
|---|---|---|
| Authority Score | 2 | Very new domain — needs time + content |
| Organic keywords | 1 | Only "lab furniture" at pos 35 |
| Top page | `/` | Nothing else indexed-and-ranking |
| Backlinks / Ref.domains | 153 / 91 | Decent — under-leveraged because on-page targets the wrong market |

The biggest unforced error: **the site is a Singapore company (innosinlab.com, Pte. Ltd.) but every signal — title, description, geo meta, JSON-LD address, og:locale — tells Google "Malaysia"**. SG users searching "lab furniture singapore", "fume hood singapore", "laboratory furniture supplier" (all KDI 0, low competition) don't see the site. Fixing this alone unlocks the keywords already within reach.

There's also a **silent bug** in `src/utils/seoMetadata.ts → addStructuredData()`: it removes *the first* `<script type="application/ld+json">` on every route change, which deletes the sitewide Organization block from `index.html`. JSON-LD coverage is effectively broken after the first navigation.

## Plan

### 1. Re-target the site to Singapore (highest impact)

**`index.html`**
- Title → `Innosin Lab — Laboratory Furniture & Fume Hoods Singapore`
- Meta description → mention Singapore + Southeast Asia, drop "Malaysia"
- `og:locale` → `en_SG`
- Geo tags → `geo.region=SG`, `geo.placename=Singapore`, ICBM Singapore coords
- Organization JSON-LD → `addressCountry: SG`, replace placeholder phone `+60-3-1234-5678` (ask user for real number, otherwise remove ContactPoint), `availableLanguage: ["English"]`
- Drop the `<meta http-equiv="Cache-Control">` / `Expires` tags (no effect from HTML, just noise)

**`src/utils/seoMetadata.ts`** — rewrite each page's title/description/keywords around SG terms:
- home: "Laboratory Furniture & Fume Hoods in Singapore | Innosin Lab"
- products: "Lab Furniture Catalog — Fume Hoods, Cabinets, Benches | Singapore"
- about: "Innosin Lab Singapore — Laboratory Furniture Since 1986"
- contact: "Contact Innosin Lab Singapore — Lab Furniture Quotes"
- floorPlanner: keep, add "Singapore" suffix
- Replace "Malaysia and Asia" wording everywhere

### 2. Fix the JSON-LD removal bug

In `addStructuredData()`, scope the remove to a tagged script we own:

```ts
document.querySelectorAll('script[type="application/ld+json"][data-dynamic="page"]').forEach(s => s.remove());
script.setAttribute('data-dynamic', 'page');
```

This preserves the sitewide Organization + WebSite blocks across route changes.

### 3. Add LocalBusiness + BreadcrumbList schema

- Append a `LocalBusiness` JSON-LD block to `index.html` with SG address, opening hours, geo coords, sameAs. Strong local-SEO signal.
- In `useSEO.ts`, emit a `BreadcrumbList` for every non-home route (Home > Products > [series name], etc.).

### 4. Product-page SEO (currently zero per-product meta)

Product routes use UUIDs. Without changing URLs (memory rule), still emit per-product Helmet meta from `ProductDetail` / `EnhancedProductDetail`:
- title: `{Product Name} — {Series} | Innosin Lab Singapore`
- description: first 155 chars of product description + "Available in Singapore."
- canonical: self-referential
- `Product` JSON-LD: name, brand=Innosin Lab, category, image, sku, offers (priceCurrency SGD, availability InStock or RequestQuote)

This is what currently turns 13 product series pages into dead weight in the sitemap.

### 5. Sitemap hygiene

- Fix future-dated `<lastmod>2025-12-18>` → today's date
- Add `<xhtml:link rel="alternate" hreflang="en-sg">` on each URL
- Add `<lastmod>` rounding to YYYY-MM-DD only (already OK)
- Add image entries for product series pages (top product image)

### 6. New SG-targeted landing pages (where the traffic is)

Each is a real route with its own Helmet meta + content (~600 words). All target KDI ≈ 0 keywords:

| Route | Primary keyword | SG volume |
|---|---|---|
| `/lab-furniture-singapore` | lab furniture singapore | 20 |
| `/fume-hoods-singapore` | fume hood singapore | 30 |
| `/laboratory-furniture-supplier-singapore` | laboratory furniture supplier | 20 |

Each page: H1 with keyword, intro, product strip (links to existing series UUIDs), local trust block (Singapore projects/standards), FAQPage JSON-LD, CTA to RFQ. Add to sitemap + internal links from home and footer.

### 7. Robots / misc

- `robots.txt` already fine; no change needed
- Remove placeholder phone from Organization schema if user has no real one to give

## Out of scope for this pass

- Backlink building (off-site)
- Blog content calendar (suggested as follow-up)
- Switching product URLs to slugs (memory says UUID routing is intentional)

## Files touched

- `index.html`
- `src/utils/seoMetadata.ts`
- `src/hooks/useSEO.ts`
- `public/sitemap.xml`
- `src/components/EnhancedProductDetail.tsx` (per-product Helmet/JSON-LD)
- New: `src/pages/seo/LabFurnitureSingapore.tsx`, `FumeHoodsSingapore.tsx`, `LaboratoryFurnitureSupplierSingapore.tsx`
- `src/components/LazyRoutes.tsx` (register new routes)

## One thing I need from you

The Organization JSON-LD currently lists `+60-3-1234-5678` (a Malaysia placeholder). Do you want me to (a) drop the phone block, (b) replace with your real Singapore number, or (c) leave the placeholder? I'd recommend (a) or (b).
