import React from 'react';
import SeoLandingPage from '@/components/seo/SeoLandingPage';
import { useSEO } from '@/hooks/useSEO';

const LabCabinetsSingapore: React.FC = () => {
  useSEO('labCabinetsSG');
  return (
    <SeoLandingPage
      title="Lab Cabinets Singapore — Modular, Tall, Wall & Mobile"
      intro="Laboratory cabinets in Singapore from Innosin Lab — modular, tall, wall, mobile and chemical safety cabinets in powder coat or stainless steel, with Singapore-based delivery and installation."
      canonical="https://www.innosinlab.com/lab-cabinets-singapore"
      primaryCta={{ to: '/products', label: 'Browse cabinet catalog' }}
      secondaryCta={{ to: '/contact', label: 'Request a Singapore quote' }}
      breadcrumbs={[
        { name: 'Home', url: 'https://www.innosinlab.com/home' },
        { name: 'Lab Cabinets Singapore', url: 'https://www.innosinlab.com/lab-cabinets-singapore' },
      ]}
      sections={[
        { heading: 'Cabinet ranges available in Singapore', body: (
          <ul>
            <li><strong>Modular cabinets</strong> — reconfigurable under-bench storage in powder coat or SS304.</li>
            <li><strong>Tall cabinets</strong> — solid- and glass-door for glassware and reagent storage.</li>
            <li><strong>Wall cabinets</strong> — above-bench storage with adjustable shelves.</li>
            <li><strong>Mobile cabinets</strong> — 750 mm and 900 mm heights to match standing or sitting benches.</li>
            <li><strong>Sink cabinets</strong> — moisture-resistant under-sink storage.</li>
          </ul>
        ) },
        { heading: 'Specification & compliance', body: (
          <p>All Innosin Lab cabinets supplied in Singapore meet SEFA 8 casework requirements, with epoxy-coated steel or 304/316 stainless construction. SCDF-compliant flammable safety cabinets are available for solvent storage.</p>
        ) },
        { heading: 'Singapore delivery & install', body: (
          <p>Local stock in Singapore for standard sizes, with delivery and install typically within 4–6 weeks. Tower blocks, MOE schools, A*STAR institutes and biotech start-ups served.</p>
        ) },
      ]}
      faqs={[
        { q: 'Do you supply flammable storage cabinets to Singapore SCDF spec?', a: 'Yes — FM-approved flammable cabinets up to 60 gallons capacity, plus vented acid/corrosive variants.' },
        { q: 'Can cabinets be customised?', a: 'Yes. Custom widths, drawer configurations and special finishes (SS316, electropolished) are available with 4–6 week lead time.' },
        { q: 'What is the warranty?', a: 'Standard 5-year manufacturer warranty on casework, 2 years on hardware.' },
      ]}
      related={[
        { to: '/guides/lab-cabinets-buying-guide', label: 'Lab cabinets buying guide' },
        { to: '/products/modular-cabinet-series', label: 'Modular cabinets' },
        { to: '/products/tall-cabinet-series', label: 'Tall cabinets' },
      ]}
    />
  );
};

export default LabCabinetsSingapore;
