import React from 'react';
import SeoLandingPage from '@/components/seo/SeoLandingPage';
import { useSEO } from '@/hooks/useSEO';

const LabStandardsSG: React.FC = () => {
  useSEO('guideStandardsSG');
  return (
    <SeoLandingPage
      title="Lab Furniture Standards in Singapore: SS, EN, NSF & SCDF"
      intro="A reference for the codes that apply to laboratory furniture, fume hoods and chemical storage in Singapore — and how to specify them in your tender documents."
      canonical="https://www.innosinlab.com/guides/lab-furniture-standards-singapore"
      primaryCta={{ to: '/contact', label: 'Speak to a compliance specialist' }}
      breadcrumbs={[
        { name: 'Home', url: 'https://www.innosinlab.com/home' },
        { name: 'Guides', url: 'https://www.innosinlab.com/guides' },
        { name: 'Lab Furniture Standards Singapore', url: 'https://www.innosinlab.com/guides/lab-furniture-standards-singapore' },
      ]}
      articleSchema={{
        headline: 'Lab Furniture Standards in Singapore: SS, EN, NSF & SCDF',
        datePublished: '2026-06-15',
      }}
      sections={[
        { heading: 'Fume hoods', body: (
          <ul>
            <li><strong>SS 651</strong> — Singapore Standard for chemical fume hood performance.</li>
            <li><strong>EN 14175</strong> — European containment, robustness and energy tests.</li>
            <li><strong>ASHRAE 110</strong> — tracer-gas containment, "as-installed" and "as-used".</li>
          </ul>
        ) },
        { heading: 'Biological safety', body: (
          <ul>
            <li><strong>NSF/ANSI 49</strong> — Class II BSC design and certification.</li>
            <li><strong>EN 12469</strong> — European equivalent; accepted by most Singapore institutions.</li>
            <li><strong>MOH BSL guidelines</strong> — containment lab classification (BSL-1 → BSL-3).</li>
          </ul>
        ) },
        { heading: 'Laboratory furniture', body: (
          <ul>
            <li><strong>SEFA 8</strong> — Scientific Equipment &amp; Furniture Association casework, benches and shelving.</li>
            <li><strong>EN 13150</strong> — European workbench standard (dimensions, load, stability).</li>
            <li><strong>ISO 14644</strong> — cleanroom classification (relevant for casework finish and outgassing).</li>
          </ul>
        ) },
        { heading: 'Chemical & fire safety', body: (
          <ul>
            <li><strong>SCDF FSSD</strong> — Fire Safety Bureau guidelines on flammable-liquid storage cabinets.</li>
            <li><strong>NFPA 30</strong> — global reference for flammable / combustible liquids code.</li>
            <li><strong>SS 532</strong> — storage of flammable liquids in Singapore.</li>
          </ul>
        ) },
        { heading: 'How to write a Singapore lab tender spec', body: (
          <p>Reference the standard <em>and</em> the test report you expect. Example: "Fume hoods shall comply with SS 651 and be tested to ASHRAE 110 as-installed at &lt; 0.05 ppm AI release. Class II BSCs shall be NSF/ANSI 49 listed with serial-numbered certification."</p>
        ) },
      ]}
      faqs={[
        { q: 'Is SS 651 mandatory in Singapore?', a: 'SS 651 is voluntary but referenced in most public-sector tenders (MOE, A*STAR, NUS, NTU, SGH). Compliance is effectively required for institutional projects.' },
        { q: 'Do I need both EN 14175 and ASHRAE 110?', a: 'EN 14175 covers product design; ASHRAE 110 covers on-site as-installed performance. Most Singapore institutions ask for both.' },
        { q: 'Who certifies BSCs in Singapore?', a: 'Use an NSF-accredited field certifier. Innosin Lab can arrange annual certification as part of a service contract.' },
        { q: 'What about cleanroom furniture?', a: 'Specify ISO 14644-1 compatible finishes (electropolished SS316, no outgassing paints) and confirm particle shedding test data with your supplier.' },
      ]}
      related={[
        { to: '/guides/ducted-vs-ductless-fume-hoods', label: 'Ducted vs ductless fume hoods' },
        { to: '/guides/fume-hood-vs-biosafety-cabinet', label: 'Fume hood vs biosafety cabinet' },
        { to: '/laboratory-design-singapore', label: 'Laboratory design Singapore' },
      ]}
    />
  );
};

export default LabStandardsSG;
