import React from 'react';
import SeoLandingPage from '@/components/seo/SeoLandingPage';
import { useSEO } from '@/hooks/useSEO';

const ChoosingLabBenches: React.FC = () => {
  useSEO('guideLabBenches');
  return (
    <SeoLandingPage
      title="How to Choose Lab Benches: A Buyer's Guide (2026)"
      intro="A practical guide to selecting laboratory benches — modular vs fixed, work-surface materials, ergonomics, load ratings and Singapore compliance."
      canonical="https://www.innosinlab.com/guides/choosing-lab-benches"
      primaryCta={{ to: '/products/knee-space-laboratory-bench-series', label: 'See bench series' }}
      secondaryCta={{ to: '/contact', label: 'Talk to a specialist' }}
      breadcrumbs={[
        { name: 'Home', url: 'https://www.innosinlab.com/home' },
        { name: 'Guides', url: 'https://www.innosinlab.com/guides' },
        { name: 'Choosing Lab Benches', url: 'https://www.innosinlab.com/guides/choosing-lab-benches' },
      ]}
      articleSchema={{
        headline: "How to Choose Lab Benches: A Buyer's Guide (2026)",
        datePublished: '2026-06-15',
      }}
      sections={[
        { heading: 'Modular vs fixed lab benches', body: (
          <>
            <p><strong>Modular benches</strong> let you reconfigure your lab as research priorities change — useful for shared facilities, biotech start-ups and university teaching labs. They typically have a steel frame with removable cabinet modules, drawers and worktops.</p>
            <p><strong>Fixed (built-in) benches</strong> maximise rigidity and storage density. Best when the workflow is stable for 10+ years — QC labs, hospital pathology, semiconductor metrology.</p>
            <p>For most Singapore labs we recommend modular for ground-floor wet labs and fixed perimeter benches where heavy instruments or sinks are involved.</p>
          </>
        ) },
        { heading: 'Work-surface materials', body: (
          <ul>
            <li><strong>Epoxy resin</strong> — best all-round chemical resistance, the default for chemistry labs.</li>
            <li><strong>Phenolic resin</strong> — lighter, cheaper, good for teaching labs and life sciences.</li>
            <li><strong>Stainless steel 304/316</strong> — sterile bio labs, cleanrooms, food labs.</li>
            <li><strong>Polypropylene</strong> — trace metal, HF and acid-digestion work.</li>
            <li><strong>Solid surface (Corian-type)</strong> — write-up benches and dry labs only.</li>
          </ul>
        ) },
        { heading: 'Ergonomics and height', body: (
          <p>Standing-height benches are 900–910 mm (most Innosin Lab benches). Sitting/teaching benches are 750 mm. Knee-space modules at 720 mm allow ADA-style accessibility — important for university teaching labs in Singapore.</p>
        ) },
        { heading: 'Load rating and frame', body: (
          <p>Specify uniformly-distributed load (UDL) per linear metre. Innosin Lab steel frames carry 150 kg/m UDL as standard; heavy-instrument benches go to 300 kg/m. Always confirm if you mount centrifuges, ovens or autoclaves on the bench.</p>
        ) },
      ]}
      faqs={[
        { q: 'What is the standard lab bench height in Singapore?', a: 'Standing-height labs use 900 mm worktops, teaching and sitting-height labs use 750 mm. Knee-space accessibility modules sit at 720 mm.' },
        { q: 'Epoxy resin or phenolic resin worktops?', a: 'Choose epoxy resin for synthetic chemistry and aggressive solvents. Phenolic resin is fine for life-sciences, teaching labs and low-chemical-load work and costs roughly 30–40% less.' },
        { q: 'Can I mix modular and fixed benches in the same lab?', a: 'Yes — most Singapore labs use fixed perimeter benches (with sinks and services) and modular island benches that can be reconfigured.' },
        { q: 'What lead time should I expect?', a: 'Standard Innosin Lab bench packages ship from Singapore in 4–8 weeks. Custom worktops or stainless-steel frames add 2–4 weeks.' },
      ]}
      related={[
        { to: '/lab-benches-singapore', label: 'Lab benches in Singapore →' },
        { to: '/products/knee-space-laboratory-bench-series', label: 'Knee Space bench series' },
        { to: '/guides/lab-cabinets-buying-guide', label: 'Lab cabinets buying guide' },
      ]}
    />
  );
};

export default ChoosingLabBenches;
