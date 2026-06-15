import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useSEO } from '@/hooks/useSEO';
import { addStructuredData } from '@/utils/seoMetadata';

const PRODUCT_LINKS = [
  { id: '98535774-921b-4003-a048-f878da72d06c', name: 'Mobile Cabinets (750mm)' },
  { id: '62592e68-88a4-4f3a-a176-6cb7351ab4a4', name: 'Mobile Cabinets (900mm)' },
  { id: '9ae7c8e7-337d-41f6-b39b-f306b2e74003', name: 'Modular Cabinets' },
  { id: '105ef44e-2db5-4084-a541-51e30f89dbb5', name: 'Knee Space Lab Benches' },
  { id: '1ddb039d-0d3e-4d8a-87dc-01064f7002c7', name: 'Tall Cabinets' },
  { id: 'cbd89884-373f-4086-b7b5-5cedb9441ea7', name: 'Wall Cabinets' },
  { id: '63d78a14-bb48-4b63-9128-d8386cbe9960', name: 'Sink Cabinets' },
  { id: 'f0c3d7cb-4b99-4c8e-9cdf-a1618128ffb2', name: 'Open Racks' },
];

const FAQS = [
  {
    q: 'Who supplies lab furniture in Singapore?',
    a: 'Innosin Lab is a Singapore-based laboratory furniture manufacturer. We design, supply and install lab cabinets, benches, fume hoods and safety equipment for universities, hospitals, biotech firms and industrial labs across Singapore.',
  },
  {
    q: 'What materials are used in your Singapore lab furniture?',
    a: 'Our standard cabinets use cold-rolled steel with epoxy powder-coat finish, with stainless steel and chemical-resistant phenolic options for wet labs and harsh chemistry environments — suitable for Singapore’s humidity.',
  },
  {
    q: 'Do you handle installation and after-sales support in Singapore?',
    a: 'Yes. Our Singapore team manages site survey, delivery, installation, commissioning and on-going service so your lab is fully operational and compliant.',
  },
  {
    q: 'Can I see how the furniture fits my lab before ordering?',
    a: 'Yes — try our free 3D laboratory floor planner. Lay out cabinets, benches and fume hoods in your real room dimensions, then send the plan to our team for a quote.',
  },
];

const LabFurnitureSingapore: React.FC = () => {
  useSEO('labFurnitureSG');

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
        <link rel="canonical" href="https://www.innosinlab.com/lab-furniture-singapore" />
      </Helmet>

      <main className="container mx-auto px-4 py-16 max-w-5xl">
        <header className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Lab Furniture Singapore
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Modular cabinets, workbenches, fume hoods and safety equipment engineered
            for Singapore research, teaching and industrial labs — supplied, delivered
            and installed by Innosin Lab.
          </p>
          <div className="mt-6 flex gap-3 justify-center flex-wrap">
            <Button asChild size="lg"><Link to="/floor-planner">Plan your lab in 3D</Link></Button>
            <Button asChild size="lg" variant="outline"><Link to="/contact">Request a quote</Link></Button>
          </div>
        </header>

        <section className="prose max-w-none mb-12">
          <h2>Built for Singapore labs since 1986</h2>
          <p>
            Innosin Lab has supplied <strong>laboratory furniture in Singapore</strong>
            for more than three decades — including universities, polytechnics,
            hospitals, semiconductor labs and biotech facilities. Every cabinet,
            bench and fume hood is built to handle Singapore’s humidity, daily
            chemical exposure and 7-day research schedules.
          </p>
          <h2>What we supply</h2>
          <ul>
            <li>Steel and stainless steel lab cabinets — mobile, wall and tall</li>
            <li>Knee-space benches and modular worktops (PP, epoxy resin, phenolic)</li>
            <li>Fume hoods, ductless fume hoods and Class II bio safety cabinets</li>
            <li>Sink cabinets, eyewash and emergency shower stations</li>
            <li>Custom storage and chemical safety cabinets</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Popular product series</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {PRODUCT_LINKS.map((p) => (
              <Card key={p.id} className="hover:shadow-md transition">
                <CardContent className="p-4">
                  <Link to={`/products/${p.id}`} className="font-medium hover:underline">
                    {p.name}
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Frequently asked questions</h2>
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
          <h2 className="text-2xl font-semibold mb-2">Get a Singapore lab furniture quote</h2>
          <p className="text-muted-foreground mb-6">
            Send us your floor plan or list of products and we’ll come back with a tailored quote.
          </p>
          <Button asChild size="lg"><Link to="/rfq-cart">Start your quote</Link></Button>
        </section>
      </main>
    </>
  );
};

export default LabFurnitureSingapore;
