import React from 'react';
import SeoLandingPage from '@/components/seo/SeoLandingPage';
import { useSEO } from '@/hooks/useSEO';

const BiosafetyCabinetsSingapore: React.FC = () => {
  useSEO('biosafetySG');
  return (
    <SeoLandingPage
      title="Biosafety Cabinets Singapore — Class II Type A2 BSCs | Innosin Lab"
      intro="Class II Type A2 and B2 biosafety cabinets in Singapore, NSF/ANSI 49 listed, with annual certification and service contracts across BSL-1, BSL-2 and BSL-3 labs."
      canonical="https://www.innosinlab.com/biosafety-cabinets-singapore"
      primaryCta={{ to: '/products/bio-safety-cabinet-tangerine-series', label: 'See TANGERINE BSC' }}
      secondaryCta={{ to: '/contact', label: 'Request a Singapore quote' }}
      breadcrumbs={[
        { name: 'Home', url: 'https://www.innosinlab.com/home' },
        { name: 'Biosafety Cabinets Singapore', url: 'https://www.innosinlab.com/biosafety-cabinets-singapore' },
      ]}
      sections={[
        { heading: 'Class II BSCs for Singapore labs', body: (
          <p>The TANGERINE Class II Type A2 biosafety cabinet is suitable for BSL-1 and BSL-2 work — cell culture, microbiology, recombinant DNA. Type B2 (total-exhaust) variants are available for work involving volatile chemicals such as chemotherapy compounding.</p>
        ) },
        { heading: 'Certification & service', body: (
          <p>All BSCs supplied with NSF/ANSI 49 commissioning at install and annual recertification. Our Singapore service team handles HEPA replacement, decontamination and Form 1 reporting.</p>
        ) },
        { heading: 'BSL containment guidance', body: (
          <ul>
            <li><strong>BSL-1</strong> — Class II Type A2 inside any compliant lab.</li>
            <li><strong>BSL-2</strong> — Class II Type A2 in a dedicated lab with limited access.</li>
            <li><strong>BSL-3</strong> — Class II Type A2 or B2 in a contained, directional-airflow facility.</li>
          </ul>
        ) },
      ]}
      faqs={[
        { q: 'How often must BSCs be certified in Singapore?', a: 'Annual NSF/ANSI 49 certification is the Singapore standard. Recertification is also required after relocation or HEPA replacement.' },
        { q: 'Type A2 or B2?', a: 'Type A2 recirculates filtered air and is fine for biological work. Type B2 is hard-ducted to total exhaust and is required when volatile chemicals or radionuclides are also used.' },
        { q: 'How long is a Singapore install?', a: 'Typical lead time is 6–10 weeks from order; site install plus commissioning is usually 1–2 days per cabinet.' },
        { q: 'Do you offer decontamination service?', a: 'Yes — vapour-phase hydrogen peroxide decontamination is available for relocations, filter changes and end-of-project decommissioning.' },
      ]}
      related={[
        { to: '/guides/fume-hood-vs-biosafety-cabinet', label: 'Fume hood vs biosafety cabinet' },
        { to: '/fume-hoods-singapore', label: 'Fume hoods Singapore' },
        { to: '/products/bio-safety-cabinet-tangerine-series', label: 'TANGERINE BSC series' },
      ]}
    />
  );
};

export default BiosafetyCabinetsSingapore;
