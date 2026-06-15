import React from 'react';
import SeoLandingPage from '@/components/seo/SeoLandingPage';
import { useSEO } from '@/hooks/useSEO';

const LabFurnitureMalaysia: React.FC = () => {
  useSEO('labFurnitureMY');
  return (
    <SeoLandingPage
      title="Laboratory Furniture Malaysia — Fume Hoods, Benches & Cabinets"
      intro="Laboratory furniture in Malaysia from Innosin Technologies Sdn Bhd — fume hoods, benches, cabinets and full lab fit-outs from our Johor Bahru manufacturing facility."
      canonical="https://www.innosinlab.com/laboratory-furniture-malaysia"
      primaryCta={{ to: '/products', label: 'Browse catalog' }}
      secondaryCta={{ to: '/contact', label: 'Talk to our Malaysia team' }}
      breadcrumbs={[
        { name: 'Home', url: 'https://www.innosinlab.com/home' },
        { name: 'Laboratory Furniture Malaysia', url: 'https://www.innosinlab.com/laboratory-furniture-malaysia' },
      ]}
      sections={[
        { heading: 'Made in Malaysia, supplied across ASEAN', body: (
          <p>Innosin Technologies Sdn Bhd manufactures laboratory furniture in Ulu Tiram, Johor, with a branch office in Kuala Lumpur and sister entity Innosin Lab Pte. Ltd. in Singapore. We supply universities, hospitals, biotech firms and industrial labs across Malaysia.</p>
        ) },
        { heading: 'Product range', body: (
          <ul>
            <li>Fume hoods (NOCE, Safe Aire II) and biosafety cabinets (TANGERINE).</li>
            <li>Modular and knee-space laboratory benches.</li>
            <li>Under-bench, tall, wall and mobile cabinets in powder coat or SS304.</li>
            <li>Sink cabinets, write-up workstations and emergency safety showers.</li>
          </ul>
        ) },
        { heading: 'Coverage', body: (
          <p>HQ: Johor Bahru. Branch: Petaling Jaya (KL). Project deliveries across Selangor, Penang, Sarawak, Sabah and East Malaysia.</p>
        ) },
      ]}
      faqs={[
        { q: 'Where are your Malaysia offices?', a: 'Headquarters at Lot 48, 18km Jalan Johor Bahru – Kota Tinggi, 81800 Ulu Tiram, Johor; KL branch at EMHUB, Persiaran Surian, Petaling Jaya.' },
        { q: 'Do you handle full lab fit-outs in Malaysia?', a: 'Yes — design, supply, install and after-sales service for full laboratory fit-outs across all states.' },
        { q: 'Can you ship to East Malaysia?', a: 'Yes, project shipments to Sarawak and Sabah are routine.' },
      ]}
      related={[
        { to: '/lab-furniture-singapore', label: 'Lab furniture Singapore' },
        { to: '/products', label: 'Product catalog' },
        { to: '/contact', label: 'Contact our team' },
      ]}
    />
  );
};

export default LabFurnitureMalaysia;
