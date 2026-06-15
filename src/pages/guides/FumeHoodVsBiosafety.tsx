import React from 'react';
import SeoLandingPage from '@/components/seo/SeoLandingPage';
import { useSEO } from '@/hooks/useSEO';

const FumeHoodVsBiosafety: React.FC = () => {
  useSEO('guideFumeVsBSC');
  return (
    <SeoLandingPage
      title="Fume Hood vs Biosafety Cabinet: Which Do You Need?"
      intro="Fume hoods protect users from chemicals; biosafety cabinets protect users, samples and the environment from biological agents. Here's how to choose."
      canonical="https://www.innosinlab.com/guides/fume-hood-vs-biosafety-cabinet"
      primaryCta={{ to: '/fume-hoods-singapore', label: 'Browse fume hoods' }}
      secondaryCta={{ to: '/biosafety-cabinets-singapore', label: 'Browse BSCs' }}
      breadcrumbs={[
        { name: 'Home', url: 'https://www.innosinlab.com/home' },
        { name: 'Guides', url: 'https://www.innosinlab.com/guides' },
        { name: 'Fume Hood vs Biosafety Cabinet', url: 'https://www.innosinlab.com/guides/fume-hood-vs-biosafety-cabinet' },
      ]}
      articleSchema={{
        headline: 'Fume Hood vs Biosafety Cabinet: Which Do You Need?',
        datePublished: '2026-06-15',
      }}
      sections={[
        { heading: 'What they do — at a glance', body: (
          <ul>
            <li><strong>Chemical fume hood</strong> — vents toxic vapours, gases and particulates away from the operator. Operator protection only.</li>
            <li><strong>Biosafety cabinet (BSC)</strong> — HEPA-filtered enclosure for handling biological agents. Class II provides operator, product and environmental protection.</li>
          </ul>
        ) },
        { heading: 'When to use which', body: (
          <p>If you are working with volatile chemicals, organic synthesis, acids or radioisotopes — use a fume hood. If you are handling cell cultures, pathogens, viruses or DNA work — use a biosafety cabinet. Never substitute one for the other; BSCs do not protect from chemical vapours, and fume hoods do not protect samples from contamination.</p>
        ) },
        { heading: 'Standards', body: (
          <ul>
            <li>Fume hoods: EN 14175, ASHRAE 110, SS 651</li>
            <li>Class II BSCs: NSF/ANSI 49, EN 12469</li>
          </ul>
        ) },
        { heading: 'Special cases', body: (
          <p>For work that involves chemicals <em>and</em> biological agents (e.g. chemotherapy compounding) you need a <strong>Class II Type B2 BSC</strong> — total exhaust, hard-ducted. For radiochemistry, specify a hood lined with stainless steel for easy decontamination.</p>
        ) },
      ]}
      faqs={[
        { q: 'Can a fume hood be used for biological work?', a: 'No. Fume hoods do not filter HEPA-grade air and will spread biological contamination through the building exhaust. Use a Class II biosafety cabinet for any work with live cells, pathogens or recombinant DNA.' },
        { q: 'Do biosafety cabinets need ducting?', a: 'Class II Type A2 BSCs recirculate filtered air and do not need ducting. Type B1/B2 cabinets must be hard-ducted to an external exhaust because they handle volatile chemicals.' },
        { q: 'What BSC class is needed for COVID/SARS-CoV-2 work?', a: 'BSL-3 work uses Class II Type A2 or B2 cabinets inside a BSL-3 lab. Confirm with your institutional biosafety officer.' },
        { q: 'How often must they be certified?', a: 'In Singapore, BSCs must be certified annually to NSF/ANSI 49. Fume hoods should be commissioned to ASHRAE 110 / EN 14175 at install and re-tested every 12 months.' },
      ]}
      related={[
        { to: '/products/fume-hood-noce-series', label: 'NOCE Fume Hood' },
        { to: '/products/bio-safety-cabinet-tangerine-series', label: 'TANGERINE Biosafety Cabinet' },
        { to: '/guides/ducted-vs-ductless-fume-hoods', label: 'Ducted vs ductless fume hoods' },
      ]}
    />
  );
};

export default FumeHoodVsBiosafety;
