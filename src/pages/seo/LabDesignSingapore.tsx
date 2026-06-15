import React from 'react';
import SeoLandingPage from '@/components/seo/SeoLandingPage';
import { useSEO } from '@/hooks/useSEO';

const LabDesignSingapore: React.FC = () => {
  useSEO('labDesignSG');
  return (
    <SeoLandingPage
      title="Laboratory Design Singapore — Fit-out, Refit & 3D Planning"
      intro="End-to-end laboratory design in Singapore — concept, 3D layout, furniture supply, fume-hood commissioning and turnkey fit-out for research, teaching and industrial labs."
      canonical="https://www.innosinlab.com/laboratory-design-singapore"
      primaryCta={{ to: '/floor-planner', label: 'Try our free 3D planner' }}
      secondaryCta={{ to: '/contact', label: 'Book a design consult' }}
      breadcrumbs={[
        { name: 'Home', url: 'https://www.innosinlab.com/home' },
        { name: 'Laboratory Design Singapore', url: 'https://www.innosinlab.com/laboratory-design-singapore' },
      ]}
      sections={[
        { heading: 'Our Singapore lab design process', body: (
          <ol>
            <li><strong>Brief &amp; site walk</strong> — workflow, hazard class, headcount, services.</li>
            <li><strong>Concept layout</strong> — 2D + 3D plans with our free interactive planner.</li>
            <li><strong>Spec &amp; tender</strong> — furniture, fume hoods, BSCs to SS 651 / NSF 49.</li>
            <li><strong>Build &amp; install</strong> — coordinated with your M&amp;E and main contractor.</li>
            <li><strong>Commissioning</strong> — ASHRAE 110, EN 14175 and NSF/ANSI 49 reports.</li>
          </ol>
        ) },
        { heading: 'Lab types we design', body: (
          <ul>
            <li>Universities &amp; polytechnics (NUS, NTU, SMU, polytechnics, MOE schools)</li>
            <li>A*STAR institutes &amp; research foundations</li>
            <li>Hospitals (SGH, NUH) &amp; clinical labs</li>
            <li>Biotech &amp; pharma start-ups in Biopolis / Tuas Biomedical Park</li>
            <li>QC, materials &amp; industrial process labs</li>
          </ul>
        ) },
        { heading: 'Why work with Innosin Lab', body: (
          <p>Singapore office in Changi North, regional manufacturing in Johor, 35+ years in the ASEAN lab market, and an in-house 3D planner so you can iterate the layout before signing off.</p>
        ) },
      ]}
      faqs={[
        { q: 'Can you handle BCA / SCDF approvals?', a: 'We coordinate with your QP and SCDF consultant for fume-hood exhaust risers, flammable storage and BSL containment classifications.' },
        { q: 'How long does a typical Singapore lab project take?', a: 'A 200 m² wet lab is typically 8–12 weeks from confirmed layout to handover, depending on fume-hood lead time and M&E coordination.' },
        { q: 'Do you offer refit / refurbishment?', a: 'Yes — many of our Singapore projects are upgrading existing labs in occupied buildings, with phased night-and-weekend installs.' },
        { q: 'Can I start with just the 3D planner?', a: 'Yes — our floor planner is free, no signup needed. Save your layout and our Singapore team will follow up with a quote.' },
      ]}
      related={[
        { to: '/floor-planner', label: '3D Floor Planner' },
        { to: '/guides/lab-furniture-standards-singapore', label: 'Singapore lab standards' },
        { to: '/laboratory-furniture-supplier-singapore', label: 'Lab furniture supplier Singapore' },
      ]}
    />
  );
};

export default LabDesignSingapore;
