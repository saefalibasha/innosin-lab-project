import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { useSEO } from '@/hooks/useSEO';
import { addStructuredData } from '@/utils/seoMetadata';

const FAQS = [
  {
    q: 'What does a laboratory furniture supplier do?',
    a: 'A laboratory furniture supplier designs, supplies and installs the cabinets, benches, fume hoods, sinks and safety equipment that make a lab functional and compliant. Innosin Lab handles the full scope in Singapore — from concept and 3D layout through to delivery, installation and after-sales support.',
  },
  {
    q: 'Which sectors do you serve in Singapore?',
    a: 'We supply universities and polytechnics, research institutes, hospitals and clinical labs, biotech and pharma manufacturing, semiconductor cleanrooms, F&B QC labs, and government and industrial test labs across Singapore.',
  },
  {
    q: 'Can you handle a full lab fit-out, not just furniture?',
    a: 'Yes. We coordinate with M&E contractors on ducting, electrical, gas and water services so your fume hoods, benches and safety equipment land in a fully working lab. We can lead the fit-out or work alongside your appointed builder.',
  },
  {
    q: 'How do I start a project with Innosin Lab Singapore?',
    a: 'Share your floor plan, scope or product list via our contact form or RFQ cart. We respond within one business day with next steps — typically a brief consultation, site visit and itemised quote.',
  },
];

const LaboratoryFurnitureSupplierSingapore: React.FC = () => {
  useSEO('supplierSG');

  React.useEffect(() => {
    addStructuredData(
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: FAQS.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
      'faq'
    );
  }, []);

  return (
    <>
      <Helmet>
        <link rel="canonical" href="https://www.innosinlab.com/laboratory-furniture-supplier-singapore" />
      </Helmet>

      <main className="container mx-auto px-4 py-16 max-w-5xl">
        <header className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Laboratory Furniture Supplier Singapore
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Innosin Lab is a Singapore-based laboratory furniture supplier serving
            universities, hospitals, biotech, semiconductor and industrial labs —
            with full-service design, supply, installation and after-sales support.
          </p>
          <div className="mt-6 flex gap-3 justify-center flex-wrap">
            <Button asChild size="lg"><Link to="/contact">Talk to our Singapore team</Link></Button>
            <Button asChild size="lg" variant="outline"><Link to="/products">Browse the catalog</Link></Button>
          </div>
        </header>

        <section className="prose max-w-none mb-12">
          <h2>End-to-end lab fit-out in Singapore</h2>
          <p>
            As a <strong>laboratory furniture supplier in Singapore</strong>,
            Innosin Lab covers every stage of the project:
          </p>
          <ol>
            <li><strong>Consultation</strong> — site visit, workflow review, code compliance.</li>
            <li><strong>3D layout</strong> — interactive plan with real product dimensions.</li>
            <li><strong>Supply</strong> — cabinets, benches, fume hoods, sinks, safety stations.</li>
            <li><strong>Installation &amp; commissioning</strong> — local team, certified hand-over.</li>
            <li><strong>After-sales</strong> — annual service, recertification, spares.</li>
          </ol>

          <h2>What sets Innosin Lab apart</h2>
          <ul>
            <li>35+ years building lab furniture for Asia-Pacific</li>
            <li>Singapore-based project management and service team</li>
            <li>Compliance with SS, EN 14175, ASHRAE 110 and NSF/ANSI 49</li>
            <li>Free 3D <Link to="/floor-planner">laboratory floor planner</Link> for fast iteration</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">FAQs</h2>
          <div className="space-y-4">
            {FAQS.map((f) => (
              <details key={f.q} className="border rounded-lg p-4">
                <summary className="font-medium cursor-pointer">{f.q}</summary>
                <p className="mt-2 text-muted-foreground">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="bg-muted rounded-xl p-8 text-center">
          <h2 className="text-2xl font-semibold mb-2">Start your Singapore lab project</h2>
          <p className="text-muted-foreground mb-6">
            Send us a floor plan or scope and we’ll come back within one business day.
          </p>
          <Button asChild size="lg"><Link to="/rfq-cart">Request a quote</Link></Button>
        </section>
      </main>
    </>
  );
};

export default LaboratoryFurnitureSupplierSingapore;
