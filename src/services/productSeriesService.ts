
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types/product';

export interface ProductSeries {
  id: string;
  name: string;
  category: string;
  description: string;
  thumbnail: string;
  seriesOverviewImage?: string;
  productCount: number;
  sampleProduct: Product;
}

const mapDatabaseProductToProduct = (dbProduct: any): Product => {
  return {
    id: dbProduct.id || '',
    name: dbProduct.name || '',
    category: dbProduct.category || '',
    dimensions: dbProduct.dimensions || '',
    modelPath: dbProduct.model_path || '',
    thumbnail: dbProduct.thumbnail_path || '',
    overviewImage: dbProduct.overview_image_path,
    seriesOverviewImage: dbProduct.series_overview_image_path,
    images: Array.isArray(dbProduct.additional_images) ? dbProduct.additional_images : [],
    description: dbProduct.description || '',
    fullDescription: dbProduct.full_description || '',
    specifications: Array.isArray(dbProduct.specifications) ? dbProduct.specifications : [],
    finish_type: dbProduct.finish_type,
    orientation: dbProduct.orientation,
    drawer_count: dbProduct.number_of_drawers || 0,
    door_type: dbProduct.door_type,
    product_code: dbProduct.product_code,
    thumbnail_path: dbProduct.thumbnail_path,
    model_path: dbProduct.model_path,
    mounting_type: dbProduct.mounting_type,
    mixing_type: dbProduct.mixing_type,
    handle_type: dbProduct.handle_type,
    emergency_shower_type: dbProduct.emergency_shower_type,
    company_tags: Array.isArray(dbProduct.company_tags) ? dbProduct.company_tags : [],
    product_series: dbProduct.product_series,
    cabinet_class: dbProduct.cabinet_class || 'standard',
    parent_series_id: dbProduct.parent_series_id,
    is_series_parent: dbProduct.is_series_parent,
    editable_title: dbProduct.name || '',
    editable_description: dbProduct.description || '',
    created_at: dbProduct.created_at,
    updated_at: dbProduct.updated_at,
    is_active: dbProduct.is_active
  };
};

export const fetchProductSeries = async (): Promise<ProductSeries[]> => {
  try {
    // Fetch all active products
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('series_order', { ascending: true });

    if (error) throw error;

    if (!products || products.length === 0) {
      return [];
    }

    // Group products by series
    const seriesMap = new Map<string, Product[]>();
    
    products.forEach((product) => {
      const mappedProduct = mapDatabaseProductToProduct(product);
      const seriesKey = product.product_series || product.category || 'Unknown';
      if (!seriesMap.has(seriesKey)) {
        seriesMap.set(seriesKey, []);
      }
      seriesMap.get(seriesKey)!.push(mappedProduct);
    });

    // Convert to ProductSeries array
    const series: ProductSeries[] = Array.from(seriesMap.entries()).map(([seriesName, seriesProducts]) => {
      const sampleProduct = seriesProducts[0];
      return {
        id: seriesName,
        name: seriesName,
        category: sampleProduct.category,
        description: sampleProduct.fullDescription || sampleProduct.description,
        thumbnail: sampleProduct.seriesOverviewImage || sampleProduct.thumbnail,
        seriesOverviewImage: sampleProduct.seriesOverviewImage,
        productCount: seriesProducts.length,
        sampleProduct
      };
    });

    return series;
  } catch (error) {
    console.error('Error fetching product series:', error);
    throw error;
  }
};

export const fetchProductsBySeriesName = async (seriesName: string): Promise<Product[]> => {
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .eq('product_series', seriesName)
      .eq('is_active', true)
      .order('variant_order', { ascending: true });

    if (error) throw error;

    if (!products) return [];

    return products.map(mapDatabaseProductToProduct);
  } catch (error) {
    console.error('Error fetching products by series:', error);
    throw error;
  }
};
