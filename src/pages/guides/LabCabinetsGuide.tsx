import React from 'react';
import SeoLandingPage from '@/components/seo/SeoLandingPage';
import { useSEO } from '@/hooks/useSEO';

const LabCabinetsGuide: React.FC = () => {
  useSEO('guideLabCabinets');
  return (
    <SeoLandingPage
      title="Lab Cabinets Buying Guide: Storage, Safety & Sizing"
      intro="A practical guide to laboratory storage — under-bench cabinets, tall cabinets, wall cabinets, mobile units and chemical safety cabinets — for Singapore labs."
      canonical="https://www.innosinlab.com/guides/lab-cabinets-buying-guide"
      primaryCta={{ to: '/lab-cabinets-singapore', label: 'See cabinet range' }}
      breadcrumbs={[
        { name: 'Home', url: 'https://www.innosinlab.com/home' },
        { name: 'Guides', url: 'https://www.innosinlab.com/guides' },
        { name: 'Lab Cabinets Buying Guide', url: 'https://www.innosinlab.com/guides/lab-cabinets-buying-guide' },
      ]}
      articleSchema={{
        headline: 'Lab Cabinets Buying Guide: Storage, Safety & Sizing',
        datePublished: '2026-06-15',
      }}
      sections={[
        { heading: 'The five lab cabinet families', body: (
          <ol>
            <li><strong>Under-bench mobile cabinets</strong> (750/900 mm) — reconfigurable storage that rolls in and out of knee spaces.</li>
            <li><strong>Tall cabinets</strong> — full-height storage along walls; great for glassware and tall reagent bottles.</li>
            <li><strong>Wall cabinets</strong> — eye-level storage above benches; choose glazed doors for visibility.</li>
            <li><strong>Sink cabinets</strong> — under-bench cabinets engineered for plumbing and water/chemical resistance.</li>
            <li><strong>Chemical safety cabinets</strong> — fire-rated for flammable liquids; vented for corrosives and acids.</li>
          </ol>
        ) },
        { heading: 'Finish: powder coat vs stainless steel', body: (
          <p><strong>Powder coat</strong> is the cost-effective default for life sciences and teaching labs. <strong>SS304/SS316 stainless steel</strong> is required for cleanrooms, food labs, BSL-3 facilities and any environment with frequent decon.</p>
        ) },
        { heading: 'Sizing your storage', body: (
          <p>Rule of thumb: allocate 0.4–0.6 linear metres of cabinet per active researcher in a wet lab, plus a dedicated flammables cabinet per 50 m² of lab floor. Add a vented acid/base cabinet near every sink with corrosives.</p>
        ) },
        { heading: 'Compliance', body: (
          <p>Singapore SCDF requires flammable-liquid storage cabinets to be FM- or UL-approved when storing &gt; 25 L of Class IB/IC solvents. NFPA 30 and OSHA 29 CFR 1910.106 are the underlying references.</p>
        ) },
      ]}
      faqs={[
        { q: 'How many flammable cabinets do I need?', a: 'Singapore SCDF caps storage at 60 gallons (227 L) per cabinet; plan one cabinet per 50 m² of wet lab, more if you stock larger volumes.' },
        { q: 'Mobile or fixed under-bench cabinets?', a: 'Mobile cabinets are now standard in Singapore research labs — they let you reconfigure the bench without calling a contractor. Fixed cabinets are better only when load or plumbing demands it.' },
        { q: 'Do I need a vented acid cabinet?', a: 'Yes, any time you store concentrated mineral acids. Innosin Lab vented cabinets connect to your fume exhaust riser or a dedicated extract fan.' },
        { q: 'What is the difference between SS304 and SS316?', a: 'SS316 adds molybdenum for higher chloride resistance — needed for marine, pharma sterile and chloride-heavy environments. SS304 is the standard for most life-science labs.' },
      ]}
      related={[
        { to: '/lab-cabinets-singapore', label: 'Lab cabinets in Singapore' },
        { to: '/products/modular-cabinet-series', label: 'Modular cabinet series' },
        { to: '/products/tall-cabinet-series', label: 'Tall cabinet series' },
      ]}
    />
  );
};

export default LabCabinetsGuide;
