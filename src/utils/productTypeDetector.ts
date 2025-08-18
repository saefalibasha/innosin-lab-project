
import { Product } from '@/types/product';

export interface ProductTypeConfig {
  primaryAttributes: string[];
  secondaryAttributes: string[];
  finishOptions: Array<{ value: string; label: string }>;
  seriesName: string;
  hasConfigurator: boolean;
}

export class ProductTypeDetector {
  static detectProductType(product: Product, variants: Product[] = []): ProductTypeConfig {
    const productName = product.name?.toLowerCase() || '';
    const category = product.category?.toLowerCase() || '';
    const seriesName = product.product_series?.toLowerCase() || '';
    const companyTags = product.company_tags || [];

    // Broen-Lab Emergency Showers
    if (this.isEmergencyShower(productName, category, seriesName)) {
      return {
        primaryAttributes: ['emergency_shower_type', 'dimensions'],
        secondaryAttributes: ['mounting_type', 'finish_type'],
        finishOptions: [
          { value: 'SS', label: 'Stainless Steel' },
          { value: 'PC', label: 'Powder Coat' },
          { value: 'Chrome', label: 'Chrome Finish' }
        ],
        seriesName: 'Broen-Lab Emergency Showers',
        hasConfigurator: true
      };
    }

    // Broen-Lab UNIFLEX Taps
    if (this.isUniflexTap(productName, category, seriesName)) {
      return {
        primaryAttributes: ['mixing_type', 'handle_type', 'dimensions'],
        secondaryAttributes: ['mounting_type', 'finish_type'],
        finishOptions: [
          { value: 'SS', label: 'Stainless Steel' },
          { value: 'Chrome', label: 'Chrome Finish' },
          { value: 'PC', label: 'Powder Coat' }
        ],
        seriesName: 'Broen-Lab UNIFLEX Taps',
        hasConfigurator: true
      };
    }

    // Safe Aire II Fume Hoods
    if (this.isFumeHood(productName, category, seriesName)) {
      return {
        primaryAttributes: ['dimensions', 'mounting_type'],
        secondaryAttributes: ['door_type', 'finish_type'],
        finishOptions: [
          { value: 'Epoxy', label: 'Epoxy Resin' },
          { value: 'SS', label: 'Stainless Steel' },
          { value: 'PC', label: 'Powder Coat' }
        ],
        seriesName: 'Safe Aire II Fume Hoods',
        hasConfigurator: true
      };
    }

    // Oriental Giken Cabinets
    if (this.isOrientalGiken(productName, category, seriesName, companyTags)) {
      return {
        primaryAttributes: ['dimensions', 'drawer_count', 'number_of_drawers'],
        secondaryAttributes: ['orientation', 'door_type', 'mounting_type'],
        finishOptions: [
          { value: 'PC', label: 'Powder Coat' },
          { value: 'SS', label: 'Stainless Steel' },
          { value: 'Epoxy', label: 'Epoxy Resin' }
        ],
        seriesName: 'Oriental Giken Laboratory Furniture',
        hasConfigurator: true
      };
    }

    // Innosin Lab Furniture
    if (this.isInnosinLab(productName, category, seriesName, companyTags)) {
      return {
        primaryAttributes: ['dimensions', 'drawer_count', 'number_of_drawers'],
        secondaryAttributes: ['orientation', 'door_type', 'finish_type'],
        finishOptions: [
          { value: 'PC', label: 'Powder Coat' },
          { value: 'SS', label: 'Stainless Steel' }
        ],
        seriesName: 'Innosin Lab Furniture',
        hasConfigurator: true
      };
    }

    // Check if we have variants that would benefit from a configurator
    const hasVariants = variants.length > 1;
    const hasConfigurableAttributes = this.hasConfigurableAttributes(product, variants);

    // Default configuration
    return {
      primaryAttributes: ['dimensions'],
      secondaryAttributes: ['orientation', 'door_type', 'drawer_count', 'number_of_drawers', 'finish_type'],
      finishOptions: [
        { value: 'PC', label: 'Powder Coat' },
        { value: 'SS', label: 'Stainless Steel' },
        { value: 'Epoxy', label: 'Epoxy Resin' },
        { value: 'Chrome', label: 'Chrome Finish' }
      ],
      seriesName: 'Standard Laboratory Equipment',
      hasConfigurator: hasVariants || hasConfigurableAttributes
    };
  }

  private static isEmergencyShower(productName: string, category: string, seriesName: string): boolean {
    return productName.includes('emergency') || 
           productName.includes('shower') ||
           category.includes('emergency') ||
           seriesName.includes('emergency');
  }

  private static isUniflexTap(productName: string, category: string, seriesName: string): boolean {
    return productName.includes('uniflex') || 
           productName.includes('tap') ||
           seriesName.includes('uniflex') ||
           seriesName.includes('single way');
  }

  private static isFumeHood(productName: string, category: string, seriesName: string): boolean {
    return productName.includes('fume') || 
           productName.includes('hood') ||
           category.includes('fume') ||
           seriesName.includes('safe aire');
  }

  private static isOrientalGiken(productName: string, category: string, seriesName: string, companyTags: string[]): boolean {
    return category.includes('oriental') ||
           seriesName.includes('oriental') ||
           companyTags.includes('Oriental Giken') ||
           productName.includes('modular_cabinet') ||
           productName.includes('mobile_cabinet');
  }

  private static isInnosinLab(productName: string, category: string, seriesName: string, companyTags: string[]): boolean {
    return category.includes('innosin') ||
           seriesName.includes('innosin') ||
           companyTags.includes('Innosin');
  }

  private static hasConfigurableAttributes(product: Product, variants: Product[]): boolean {
    const configurableFields = [
      'drawer_count', 'number_of_drawers', 'door_type', 'orientation', 
      'mounting_type', 'mixing_type', 'handle_type', 'emergency_shower_type'
    ];

    // Check if the main product has any configurable attributes
    const productHasAttributes = configurableFields.some(field => product[field]);

    // Check if variants have different values for any attribute
    const variantsHaveDifferences = configurableFields.some(field => {
      const values = variants.map(v => v[field]).filter(Boolean);
      return new Set(values).size > 1;
    });

    return productHasAttributes || variantsHaveDifferences;
  }

  static shouldShowConfigurator(product: Product, variants: Product[] = []): boolean {
    const config = this.detectProductType(product, variants);
    return config.hasConfigurator;
  }
}
