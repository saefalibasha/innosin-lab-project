import React from 'react';
import SeoLandingPage from '@/components/seo/SeoLandingPage';
import { useSEO } from '@/hooks/useSEO';

const DuctedVsDuctless: React.FC = () => {
  useSEO('guideDuctedVsDuctless');
  return (
    <SeoLandingPage
      title="Ducted vs Ductless Fume Hoods: Which Should You Buy?"
      intro="Ducted hoods exhaust contaminated air outside; ductless hoods filter and recirculate. Both have legitimate uses — this guide explains when each is the right choice."
      canonical="https://www.innosinlab.com/guides/ducted-vs-ductless-fume-hoods"
      primaryCta={{ to: '/fume-hoods-singapore', label: 'See fume hoods' }}
      breadcrumbs={[
        { name: 'Home', url: 'https://www.innosinlab.com/home' },
        { name: 'Guides', url: 'https://www.innosinlab.com/guides' },
        { name: 'Ducted vs Ductless Fume Hoods', url: 'https://www.innosinlab.com/guides/ducted-vs-ductless-fume-hoods' },
      ]}
      articleSchema={{
        headline: 'Ducted vs Ductless Fume Hoods: Which Should You Buy?',
        datePublished: '2026-06-15',
      }}
      sections={[
        { heading: 'How they differ', body: (
          <p><strong>Ducted (constant-volume or VAV)</strong> hoods pull air across the sash and exhaust it through a roof stack. They handle unknown and unlimited chemistry. <strong>Ductless</strong> hoods pass air through carbon and/or HEPA filters and recirculate it back to the room — they only work for well-characterised, low-volume chemistry that matches the filter.</p>
        ) },
        { heading: 'When ducted is required', body: (
          <ul>
            <li>Unknown reactions, scale-up or process development</li>
            <li>Perchloric acid, hydrofluoric acid, radio-isotope work</li>
            <li>Solvent volumes &gt; 500 ml/day</li>
            <li>Any institution following EN 14175 or SS 651 for chemistry</li>
          </ul>
        ) },
        { heading: 'When ductless is acceptable', body: (
          <ul>
            <li>Secondary-school and university teaching labs</li>
            <li>Forensics / drug-screening labs with a single known matrix</li>
            <li>Refit projects where ducting is structurally impossible</li>
            <li>Mobile / temporary lab pods</li>
          </ul>
        ) },
        { heading: 'Total cost over 10 years', body: (
          <p>Ductless looks cheaper at purchase but filter replacement (every 6–18 months at S$800–S$2,500 per set) and mandatory breakthrough testing push 10-year cost above a ducted hood for any moderate-use lab. Ducted hoods have higher install cost but lower running cost.</p>
        ) },
      ]}
      faqs={[
        { q: 'Are ductless fume hoods safe?', a: 'Yes — when used inside their chemical compatibility list, monitored with a breakthrough sensor and serviced on schedule. They are unsafe for unknown chemistry or anything outside the filter spec.' },
        { q: 'Do ductless hoods need certification?', a: 'Yes. Singapore best practice is annual face-velocity verification plus filter breakthrough testing every 6 months.' },
        { q: 'Can I convert a ductless hood to ducted later?', a: 'Most ductless hoods can be field-converted with a transition collar, but you will still need building ductwork and an exhaust fan. Plan the install up front if possible.' },
        { q: 'What face velocity should I specify?', a: 'EN 14175 calls for 0.3–0.5 m/s at full open sash. Singapore SS 651 follows the same range.' },
      ]}
      related={[
        { to: '/fume-hoods-singapore', label: 'Fume hoods in Singapore' },
        { to: '/guides/fume-hood-vs-biosafety-cabinet', label: 'Fume hood vs biosafety cabinet' },
        { to: '/guides/lab-furniture-standards-singapore', label: 'Singapore lab standards' },
      ]}
    />
  );
};

export default DuctedVsDuctless;
