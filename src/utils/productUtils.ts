
import { Product } from '@/types/product';

export const getProductType = (product: Product): string => {
  const name = product.name?.toLowerCase() || '';
  const category = product.category?.toLowerCase() || '';
  const productCode = product.product_code?.toLowerCase() || '';
  
  // Mobile Cabinet detection
  if (name.includes('mobile cabinet') || productCode.includes('mc-') || productCode.includes('mcc-')) {
    return 'mobile_cabinet';
  }
  
  // Wall Cabinet detection
  if (name.includes('wall cabinet') || productCode.includes('wc-') || productCode.includes('wcg-')) {
    return 'wall_cabinet';
  }
  
  // Tall Cabinet detection
  if (name.includes('tall cabinet') || productCode.includes('tc-') || productCode.includes('tcg-') || productCode.includes('tcs-')) {
    return 'tall_cabinet';
  }
  
  // Open Rack detection
  if (name.includes('open rack') || productCode.includes('or-')) {
    return 'open_rack';
  }
  
  // Laboratory specific categories
  if (category.includes('innosin lab') || category.includes('laboratory')) {
    return 'laboratory_equipment';
  }
  
  return 'standard';
};

export const getDrawerCount = (product: Product): number => {
  // Innosin Lab products use number_of_drawers, others use drawer_count
  return product.number_of_drawers || product.drawer_count || 0;
};

export const getConfigurableAttributes = (product: Product, productType: string): string[] => {
  const attributes = [];
  const name = product.name?.toLowerCase() || '';
  const productCode = product.product_code?.toLowerCase() || '';
  
  // Always include dimensions for Innosin Lab products
  if (product.dimensions) attributes.push('dimensions');
  
  // Only include drawer count for products that actually have drawers
  // Exclude knee space benches and other non-cabinet products
  const isKneeSpace = name.includes('knee space') || productCode.includes('ks');
  const isOpenRack = name.includes('open rack') || productCode.includes('or-');
  
  if (!isKneeSpace && !isOpenRack) {
    const drawerCount = getDrawerCount(product);
    if (drawerCount > 0) {
      attributes.push(product.number_of_drawers ? 'number_of_drawers' : 'drawer_count');
    }
  }
  
  // Include other relevant attributes
  if (product.door_type && product.door_type !== 'None' && product.door_type !== '') attributes.push('door_type');
  if (product.orientation && product.orientation !== 'None' && product.orientation !== '') attributes.push('orientation');
  if (product.mounting_type && product.mounting_type !== '') attributes.push('mounting_type');
  
  return attributes;
};

export const formatAttributeValue = (attribute: string, value: any): string => {
  switch (attribute) {
    case 'number_of_drawers':
    case 'drawer_count':
      return `${value} Drawers`;
    case 'dimensions':
      return value;
    case 'door_type':
      return `${value} Door`;
    case 'orientation':
      return value;
    default:
      return value?.toString() || '';
  }
};
