
import { Product } from '@/types/product';

export const detectSeriesType = (series: any, variants: Product[] = []): string => {
  const seriesName = series?.product_series?.toLowerCase() || series?.name?.toLowerCase() || '';
  const category = series?.category?.toLowerCase() || '';
  
  // Innosin Lab products
  if (seriesName.includes('mobile cabinet') || seriesName.includes('modular cabinet')) {
    return 'mobile_cabinet';
  }
  if (seriesName.includes('wall cabinet')) return 'wall_cabinet';
  if (seriesName.includes('tall cabinet')) return 'tall_cabinet';
  if (seriesName.includes('open rack')) return 'open_rack';
  
  // Broen-Lab products
  if (seriesName.includes('uniflex') || seriesName.includes('tap') || 
      variants.some(v => v.mixing_type || v.handle_type)) {
    return 'uniflex';
  }
  if (seriesName.includes('emergency shower') || 
      variants.some(v => v.emergency_shower_type)) {
    return 'emergency_shower';
  }
  
  // Oriental Giken products
  if (category.includes('bio safety') || seriesName.includes('bio safety')) {
    return 'bio_safety';
  }
  if (seriesName.includes('noce') || seriesName.includes('fume hood')) {
    return 'noce_fume_hood';
  }
  
  // Hamilton Laboratory Solutions
  if (seriesName.includes('safe aire') || seriesName.includes('fume hood') ||
      variants.some(v => v.mounting_type)) {
    return 'fume_hood';
  }
  
  return 'standard';
};

export const getSeriesConfigurationAttributes = (seriesType: string, variants: Product[]): string[] => {
  const attributes = [];
  
  if (!variants || variants.length === 0) return attributes;
  
  const sampleVariant = variants[0];
  
  // Common attributes for all series
  if (sampleVariant.dimensions) attributes.push('dimensions');
  
  // Series-specific attributes based on unified grouping
  switch (seriesType) {
    case 'mobile_cabinet':
    case 'wall_cabinet':
    case 'tall_cabinet':
      if (sampleVariant.number_of_drawers || sampleVariant.drawer_count) {
        attributes.push('drawer_count');
      }
      if (sampleVariant.door_type && sampleVariant.door_type !== 'None') {
        attributes.push('door_type');
      }
      if (sampleVariant.orientation && sampleVariant.orientation !== 'None') {
        attributes.push('orientation');
      }
      break;
      
    case 'uniflex':
      if (sampleVariant.mixing_type) attributes.push('mixing_type');
      if (sampleVariant.handle_type) attributes.push('handle_type');
      break;
      
    case 'emergency_shower':
      if (sampleVariant.emergency_shower_type) attributes.push('emergency_shower_type');
      if (sampleVariant.mounting_type) attributes.push('mounting_type');
      break;
      
    case 'fume_hood':
    case 'noce_fume_hood':
      if (sampleVariant.mounting_type) attributes.push('mounting_type');
      break;

    case 'bio_safety':
      if (sampleVariant.cabinet_class) attributes.push('cabinet_class');
      break;
      
    case 'open_rack':
      // Open racks typically only have dimensions and finish
      break;
  }
  
  return attributes;
};

export const getSeriesFinishOptions = (seriesType: string) => {
  switch (seriesType) {
    case 'open_rack':
      return [
        { value: 'PC', label: 'Powder Coat' },
        { value: 'SS304', label: 'SS304' }
      ];
    case 'uniflex':
    case 'emergency_shower':
      return [
        { value: 'brass', label: 'Brass' },
        { value: 'stainless', label: 'Stainless Steel' }
      ];
    default:
      return [
        { value: 'PC', label: 'Powder Coat' },
        { value: 'SS', label: 'Stainless Steel' }
      ];
  }
};

export const formatAttributeDisplay = (attribute: string, value: any): string => {
  switch (attribute) {
    case 'number_of_drawers':
    case 'drawer_count':
      return `${value} Drawers`;
    case 'dimensions':
      return String(value);
    case 'door_type':
      return `${value} Door`;
    case 'orientation':
      return String(value);
    case 'mixing_type':
      return `${value} Mix`;
    case 'handle_type':
      return `${value} Handle`;
    case 'emergency_shower_type':
      return String(value);
    case 'mounting_type':
      return `${value} Mount`;
    case 'cabinet_class':
      return String(value);
    default:
      return String(value || '');
  }
};
