
import { Product } from '@/types/product';

export interface GroupedVariants {
  [groupKey: string]: Product[];
}

export interface SeriesConfiguration {
  groupingStrategy: 'dimensions' | 'configuration' | 'type' | 'mixed';
  groupingAttributes: string[];
  displayName: string;
  finishOptions: Array<{ value: string; label: string }>;
}

export const getSeriesConfiguration = (seriesSlug: string, seriesName: string): SeriesConfiguration => {
  const slug = seriesSlug?.toLowerCase() || '';
  const name = seriesName?.toLowerCase() || '';

  // Innosin Lab series configurations
  if (name.includes('mobile cabinet') || name.includes('modular cabinet')) {
    return {
      groupingStrategy: 'configuration',
      groupingAttributes: ['dimensions', 'drawer_count', 'orientation', 'door_type'],
      displayName: 'Mobile Cabinet Configuration',
      finishOptions: [
        { value: 'PC', label: 'Powder Coat' },
        { value: 'SS', label: 'Stainless Steel' }
      ]
    };
  }

  if (name.includes('wall cabinet')) {
    return {
      groupingStrategy: 'dimensions',
      groupingAttributes: ['dimensions', 'door_type'],
      displayName: 'Wall Cabinet Size',
      finishOptions: [
        { value: 'PC', label: 'Powder Coat' },
        { value: 'SS', label: 'Stainless Steel' }
      ]
    };
  }

  if (name.includes('tall cabinet')) {
    return {
      groupingStrategy: 'configuration',
      groupingAttributes: ['dimensions', 'door_type', 'drawer_count'],
      displayName: 'Tall Cabinet Configuration',
      finishOptions: [
        { value: 'PC', label: 'Powder Coat' },
        { value: 'SS', label: 'Stainless Steel' }
      ]
    };
  }

  if (name.includes('open rack')) {
    return {
      groupingStrategy: 'dimensions',
      groupingAttributes: ['dimensions'],
      displayName: 'Open Rack Size',
      finishOptions: [
        { value: 'PC', label: 'Powder Coat' },
        { value: 'SS304', label: 'SS304' }
      ]
    };
  }

  // Oriental Giken series configurations
  if (name.includes('bio safety') || slug.includes('bio-safety')) {
    return {
      groupingStrategy: 'dimensions',
      groupingAttributes: ['dimensions', 'cabinet_class'],
      displayName: 'Bio Safety Cabinet Size',
      finishOptions: [
        { value: 'PC', label: 'Powder Coat' },
        { value: 'SS', label: 'Stainless Steel' }
      ]
    };
  }

  if (name.includes('noce') || name.includes('fume hood')) {
    return {
      groupingStrategy: 'configuration',
      groupingAttributes: ['dimensions', 'mounting_type'],
      displayName: 'Fume Hood Configuration',
      finishOptions: [
        { value: 'PC', label: 'Powder Coat' },
        { value: 'SS', label: 'Stainless Steel' }
      ]
    };
  }

  // Broen-Lab series configurations (existing)
  if (slug === 'single-way-taps' || slug === 'broen-lab-uniflex-taps-series') {
    return {
      groupingStrategy: 'mixed',
      groupingAttributes: ['mixing_type', 'handle_type'],
      displayName: 'Tap Configuration',
      finishOptions: [
        { value: 'brass', label: 'Brass' },
        { value: 'stainless', label: 'Stainless Steel' }
      ]
    };
  }

  if (slug === 'broen-lab-emergency-shower-systems' || 
      slug === 'broen-lab-emergency-shower-series' || 
      slug === 'emergency-shower') {
    return {
      groupingStrategy: 'mixed',
      groupingAttributes: ['emergency_shower_type', 'mounting_type'],
      displayName: 'Emergency Shower Configuration',
      finishOptions: [
        { value: 'brass', label: 'Brass' },
        { value: 'stainless', label: 'Stainless Steel' }
      ]
    };
  }

  // Safe Aire II Fume Hoods (existing)
  if (slug === 'safe-aire-ii-fume-hoods') {
    return {
      groupingStrategy: 'dimensions',
      groupingAttributes: ['dimensions'],
      displayName: 'Fume Hood Size',
      finishOptions: [
        { value: 'PC', label: 'Powder Coat' },
        { value: 'SS', label: 'Stainless Steel' }
      ]
    };
  }

  // Default configuration
  return {
    groupingStrategy: 'configuration',
    groupingAttributes: ['dimensions'],
    displayName: 'Product Configuration',
    finishOptions: [
      { value: 'PC', label: 'Powder Coat' },
      { value: 'SS', label: 'Stainless Steel' }
    ]
  };
};

export const groupVariantsByConfiguration = (
  variants: Product[], 
  configuration: SeriesConfiguration
): GroupedVariants => {
  const grouped: GroupedVariants = {};

  variants.forEach((variant) => {
    let groupKey = '';

    switch (configuration.groupingStrategy) {
      case 'dimensions':
        groupKey = variant.dimensions || variant.name || variant.product_code || 'Unknown';
        break;

      case 'configuration':
        const configParts = configuration.groupingAttributes
          .map(attr => {
            switch (attr) {
              case 'dimensions':
                return variant.dimensions;
              case 'drawer_count':
                return variant.drawer_count ? `${variant.drawer_count} Drawers` : null;
              case 'orientation':
                return variant.orientation && variant.orientation !== 'None' ? variant.orientation : null;
              case 'door_type':
                return variant.door_type && variant.door_type !== 'None' ? `${variant.door_type} Door` : null;
              case 'mounting_type':
                return variant.mounting_type;
              case 'cabinet_class':
                return variant.cabinet_class;
              default:
                return null;
            }
          })
          .filter(Boolean);
        groupKey = configParts.join(' | ') || variant.name || variant.product_code || 'Unknown';
        break;

      case 'mixed':
        const mixedParts = configuration.groupingAttributes
          .map(attr => {
            switch (attr) {
              case 'mixing_type':
                return variant.mixing_type;
              case 'handle_type':
                return variant.handle_type;
              case 'emergency_shower_type':
                return variant.emergency_shower_type;
              case 'mounting_type':
                return variant.mounting_type;
              default:
                return null;
            }
          })
          .filter(Boolean);
        groupKey = mixedParts.join(' | ') || variant.name || variant.product_code || 'Unknown';
        break;

      default:
        groupKey = variant.name || variant.product_code || 'Unknown';
    }

    if (!grouped[groupKey]) {
      grouped[groupKey] = [];
    }
    grouped[groupKey].push(variant);
  });

  return grouped;
};

export const formatAttributeValue = (attribute: string, value: any): string => {
  if (!value) return '';

  switch (attribute) {
    case 'orientation':
      if (value === 'LH') return 'Left Hand';
      if (value === 'RH') return 'Right Hand';
      return value;
    case 'drawer_count':
      return `${value} ${value === 1 ? 'Drawer' : 'Drawers'}`;
    case 'door_type':
      return `${value} Door`;
    case 'cabinet_class':
      return value.charAt(0).toUpperCase() + value.slice(1);
    default:
      return String(value);
  }
};
