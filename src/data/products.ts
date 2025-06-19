
import { Product } from '@/types/product';

// Sample products - you can easily modify this list to add/remove products
export const products: Product[] = [
  {
    id: 'fh-001',
    name: 'Chemical Fume Hood - Standard',
    category: 'Broen-Lab',
    dimensions: '1500 × 750 × 2400mm',
    image: '/placeholder.svg',
    modelType: 'box',
    modelColor: '#1E88E5',
    description: 'Standard chemical fume hood with variable air volume control and energy-efficient design.',
    specifications: ['VAV Control', 'Energy Efficient', 'ASHRAE 110 Compliant']
  },
  {
    id: 'lb-001',
    name: 'Epoxy Resin Lab Bench',
    category: 'Hamilton Laboratory Solutions',
    dimensions: '3000 × 750 × 850mm',
    image: '/placeholder.svg',
    modelType: 'box',
    modelColor: '#1E88E5',
    description: 'Chemical-resistant epoxy resin lab bench with integrated utilities.',
    specifications: ['Chemical Resistant', 'Integrated Utilities', 'Modular Design']
  },
  {
    id: 'ew-001',
    name: 'Emergency Eye Wash Station',
    category: 'Oriental Giken Inc.',
    dimensions: '600 × 400 × 1200mm',
    image: '/placeholder.svg',
    modelType: 'cone',
    modelColor: '#1E88E5',
    description: 'ANSI Z358.1 compliant emergency eye wash station with stainless steel construction.',
    specifications: ['ANSI Z358.1', 'Stainless Steel', 'Hands-Free Operation']
  },
  {
    id: 'ss-001',
    name: 'Emergency Safety Shower',
    category: 'Oriental Giken Inc.',
    dimensions: '900 × 900 × 2300mm',
    image: '/placeholder.svg',
    modelType: 'sphere',
    modelColor: '#1E88E5',
    description: 'Emergency safety shower with thermostatic mixing valve and freeze protection.',
    specifications: ['Thermostatic Valve', 'Freeze Protection', 'Easy Maintenance']
  },
  {
    id: 'sc-001',
    name: 'Chemical Storage Cabinet',
    category: 'Innosin Lab',
    dimensions: '1200 × 600 × 1800mm',
    image: '/placeholder.svg',
    modelType: 'box',
    modelColor: '#1E88E5',
    description: 'Fire-resistant chemical storage cabinet with ventilation system.',
    specifications: ['Fire Resistant', 'Ventilated', 'Multiple Shelves']
  },
  {
    id: 'fh-002',
    name: 'Perchloric Acid Fume Hood',
    category: 'Broen-Lab',
    dimensions: '1800 × 750 × 2400mm',
    image: '/placeholder.svg',
    modelType: 'box',
    modelColor: '#1E88E5',
    description: 'Specialized fume hood for perchloric acid applications with wash-down system.',
    specifications: ['Wash-down System', 'Specialized Design', 'Corrosion Resistant']
  }
];

// Generate unique categories from products
export const getCategories = (): string[] => {
  const uniqueCategories = [...new Set(products.map(product => product.category))];
  return ['all', ...uniqueCategories];
};
