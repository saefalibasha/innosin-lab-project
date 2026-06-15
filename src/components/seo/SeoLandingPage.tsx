import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { addStructuredData } from '@/utils/seoMetadata';

export interface SeoFaq { q: string; a: string; }
export interface SeoRelated { to: string; label: string; }

interface Props {
  title: string;
  intro: string;
  canonical: string;
  primaryCta?: { to: string; label: string };
  secondaryCta?: { to: string; label: string };
  sections: { heading: string; body: React.ReactNode }[];
  faqs: SeoFaq[];
  related?: SeoRelated[];
  breadcrumbs?: { name: string; url: string }[];
  articleSchema?: { headline: string; datePublished: string; image?: string };
}

/**
 * Shared template for SEO landing pages and cornerstone guides.
 * Injects FAQPage, BreadcrumbList and (optional) Article JSON-LD.
 */
const SeoLandingPage: React.FC<Props> = ({
  title,
  intro,
  canonical,
  primaryCta,
  secondaryCta,
  sections,
  faqs,
  related,
  breadcrumbs,
  articleSchema,
}) => {
  React.useEffect(() => {
    if (faqs.length) {
      addStructuredData(
        {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqs.map((f) => ({
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: { '@type': 'Answer', text: f.a },
          })),
        },
        'faq'
      );
    }
    if (breadcrumbs?.length) {
      addStructuredData(
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: breadcrumbs.map((b, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: b.name,
            item: b.url,
          })),
        },
        'breadcrumbs'
      );
    }
    if (articleSchema) {
      addStructuredData(
        {
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: articleSchema.headline,
          datePublished: articleSchema.datePublished,
          dateModified: articleSchema.datePublished,
          image: articleSchema.image || 'https://www.innosinlab.com/branding/hero-logo.png',
          author: { '@type': 'Organization', name: 'Innosin Lab Pte. Ltd.' },
          publisher: {
            '@type': 'Organization',
            name: 'Innosin Lab Pte. Ltd.',
            logo: { '@type': 'ImageObject', url: 'https://www.innosinlab.com/branding/hero-logo.png' },
          },
          mainEntityOfPage: canonical,
        },
        'article'
      );
    }
  }, [faqs, breadcrumbs, articleSchema, canonical]);

  return (
    <>
      <Helmet>
        <link rel="canonical" href={canonical} />
      </Helmet>

      <main className="container mx-auto px-4 py-16 max-w-5xl">
        <header className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{title}</h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">{intro}</p>
          {(primaryCta || secondaryCta) && (
            <div className="mt-6 flex gap-3 justify-center flex-wrap">
              {primaryCta && (
                <Button asChild size="lg"><Link to={primaryCta.to}>{primaryCta.label}</Link></Button>
              )}
              {secondaryCta && (
                <Button asChild size="lg" variant="outline">
                  <Link to={secondaryCta.to}>{secondaryCta.label}</Link>
                </Button>
              )}
            </div>
          )}
        </header>

        <article className="prose max-w-none mb-12">
          {sections.map((s) => (
            <section key={s.heading}>
              <h2>{s.heading}</h2>
              {s.body}
            </section>
          ))}
        </article>

        {faqs.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-6">Frequently asked questions</h2>
            <div className="space-y-4">
              {faqs.map((f) => (
                <details key={f.q} className="border rounded-lg p-4">
                  <summary className="font-medium cursor-pointer">{f.q}</summary>
                  <p className="mt-2 text-muted-foreground">{f.a}</p>
                </details>
              ))}
            </div>
          </section>
        )}

        {related && related.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-6">Related</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {related.map((r) => (
                <Card key={r.to} className="hover:shadow-md transition">
                  <CardContent className="p-5">
                    <Link to={r.to} className="font-semibold hover:underline">{r.label}</Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        <section className="bg-muted rounded-xl p-8 text-center">
          <h2 className="text-2xl font-semibold mb-2">Speak to Innosin Lab Singapore</h2>
          <p className="text-muted-foreground mb-6">
            11 Changi North Street 1, #02-04 · +65 6993 4996 · enquiry@innosinlab.com
          </p>
          <Button asChild size="lg"><Link to="/contact">Request a quote</Link></Button>
        </section>
      </main>
    </>
  );
};

export default SeoLandingPage;
