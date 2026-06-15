import React from 'react';
import SeoLandingPage from '@/components/seo/SeoLandingPage';
import { useSEO } from '@/hooks/useSEO';

const LabBenchesSingapore: React.FC = () => {
  useSEO('labBenchesSG');
  return (
    <SeoLandingPage
      title="Lab Benches Singapore — Modular & Knee-Space Workbenches"
      intro="Laboratory workbenches in Singapore — modular and knee-space designs with epoxy, phenolic, stainless steel or polypropylene tops, delivered and installed locally."
      canonical="https://www.innosinlab.com/lab-benches-singapore"
      primaryCta={{ to: '/products/knee-space-laboratory-bench-series', label: 'See bench series' }}
      secondaryCta={{ to: '/contact', label: 'Request a quote' }}
      breadcrumbs={[
        { name: 'Home', url: 'https://www.innosinlab.com/home' },
        { name: 'Lab Benches Singapore', url: 'https://www.innosinlab.com/lab-benches-singapore' },
      ]}
      sections={[
        { heading: 'Bench types we supply', body: (
          <ul>
            <li><strong>Knee-space modular benches</strong> — flexible reconfiguration with rollaway under-bench cabinets.</li>
            <li><strong>Fixed perimeter benches</strong> — heavy-instrument, sink-integrated.</li>
            <li><strong>Island benches</strong> — central lab work zones with services on both sides.</li>
            <li><strong>Write-up / dry benches</strong> — for documentation, microscopy and instrumentation.</li>
          </ul>
        ) },
        { heading: 'Worktop materials', body: (
          <p>Epoxy resin (chemistry), phenolic resin (life sciences and teaching), SS304/316 (sterile and cleanroom), polypropylene (acid digestion). Singapore stock for the most common configurations.</p>
        ) },
        { heading: 'Heights & ergonomics', body: (
          <p>Standing 900 mm, sitting 750 mm, knee-space accessibility 720 mm. ADA-style cut-outs available on request.</p>
        ) },
      ]}
      faqs={[
        { q: 'How quickly can benches be installed in Singapore?', a: 'Standard configurations ship from local stock in 4–6 weeks. Site install is typically 2–5 days for a 200 m² lab.' },
        { q: 'Do benches come pre-plumbed?', a: 'Sink benches arrive with cut-outs and waste fittings; final plumbing is by your M&E contractor or our partner installer.' },
        { q: 'Can I get heavy-load benches for instruments?', a: 'Yes — heavy-duty frames rated to 300 kg/m UDL are available for centrifuges, ovens and autoclaves.' },
      ]}
      related={[
        { to: '/guides/choosing-lab-benches', label: 'How to choose lab benches' },
        { to: '/lab-cabinets-singapore', label: 'Lab cabinets Singapore' },
        { to: '/products/knee-space-laboratory-bench-series', label: 'Knee-space bench series' },
      ]}
    />
  );
};

export default LabBenchesSingapore;
