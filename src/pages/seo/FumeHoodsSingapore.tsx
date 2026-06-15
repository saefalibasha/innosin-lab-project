import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useSEO } from '@/hooks/useSEO';
import { addStructuredData } from '@/utils/seoMetadata';

const HOOD_SERIES = [
  { id: '65563e13-5476-408e-9d75-8aac834a542e', name: 'NOCE Fume Hood', desc: 'Ducted fume hood for general chemistry — VAV-ready, low face velocity.' },
  { id: '50a770f2-6974-4adb-826b-7a5e1d7de77b', name: 'Safe Aire II Fume Hoods', desc: 'High-performance constant volume fume hoods for demanding labs.' },
  { id: '24c65511-9923-4573-acf4-4b0767e20f66', name: 'TANGERINE Bio Safety Cabinet', desc: 'Class II Type A2 bio safety cabinet — NSF/ANSI 49 listed.' },
];

const FAQS = [
  {
    q: 'Which fume hood standards apply in Singapore?',
    a: 'Singapore labs commonly specify EN 14175, ASHRAE 110 and SS 651 for chemical fume hoods, and NSF/ANSI 49 for Class II bio safety cabinets. Innosin Lab fume hoods are designed and tested to meet these standards.',
  },
  {
    q: 'Ducted or ductless fume hood — which do I need?',
    a: 'Ducted fume hoods are required for most chemistry, organic synthesis and unknown-chemical work. Ductless (filtered) fume hoods suit teaching labs and well-characterised low-volume work. Our Singapore team can recommend the right option after a brief site review.',
  },
  {
    q: 'Do you install and certify fume hoods in Singapore?',
    a: 'Yes. We deliver, install, balance airflow and provide ASHRAE 110 / EN 14175 commissioning reports, plus annual re-certification and service contracts across Singapore.',
  },
  {
    q: 'How long does a Singapore fume hood project take?',
    a: 'Standard ducted fume hoods are typically delivered within 6–10 weeks of confirmed order, with installation in 1–3 days depending on duct routing. Bio safety cabinets are often faster.',
  },
];

const FumeHoodsSingapore: React.FC = () => {
  useSEO('fumeHoodsSG');

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
        <link rel="canonical" href="https://www.innosinlab.com/fume-hoods-singapore" />
      </Helmet>

      <main className="container mx-auto px-4 py-16 max-w-5xl">
        <header className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Fume Hoods Singapore</h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Ducted and ductless fume hoods, plus Class II bio safety cabinets,
            engineered for Singapore research, teaching and industrial labs — supplied,
            installed and certified by Innosin Lab.
          </p>
          <div className="mt-6 flex gap-3 justify-center flex-wrap">
            <Button asChild size="lg"><Link to="/contact">Speak to a fume hood specialist</Link></Button>
            <Button asChild size="lg" variant="outline"><Link to="/floor-planner">Plan in 3D</Link></Button>
          </div>
        </header>

        <section className="prose max-w-none mb-12">
          <h2>Fume hoods designed for Singapore labs</h2>
          <p>
            Innosin Lab supplies <strong>fume hoods in Singapore</strong> across
            chemistry, life sciences, semiconductor and academic markets. Our hoods
            meet EN 14175 and ASHRAE 110 containment standards, with options
            including low-velocity ducted, ductless filtered, walk-in, perchloric
            acid and radio-isotope variants.
          </p>
          <h2>Why Singapore labs choose Innosin Lab</h2>
          <ul>
            <li>Local stock and short lead times to Singapore sites</li>
            <li>On-site ASHRAE 110 / EN 14175 commissioning</li>
            <li>Annual recertification and service contracts</li>
            <li>Integration with cabinets, benches and lab gas/water services</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Fume hood &amp; bio safety series</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {HOOD_SERIES.map((p) => (
              <Card key={p.id} className="hover:shadow-md transition h-full">
                <CardContent className="p-5">
                  <Link to={`/products/${p.id}`} className="font-semibold hover:underline block mb-2">
                    {p.name}
                  </Link>
                  <p className="text-sm text-muted-foreground">{p.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Fume hood FAQs (Singapore)</h2>
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
          <h2 className="text-2xl font-semibold mb-2">Get a Singapore fume hood quote</h2>
          <p className="text-muted-foreground mb-6">
            Tell us your application (chemistry, biology, semiconductor) and room size — we’ll recommend the right hood.
          </p>
          <Button asChild size="lg"><Link to="/contact">Request a quote</Link></Button>
        </section>
      </main>
    </>
  );
};

export default FumeHoodsSingapore;
