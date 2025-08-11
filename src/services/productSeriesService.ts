
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
      const seriesKey = product.product_series || product.category || 'Unknown';
      if (!seriesMap.has(seriesKey)) {
        seriesMap.set(seriesKey, []);
      }
      seriesMap.get(seriesKey)!.push({
        id: product.id || '',
        name: product.name || '',
        category: product.category || '',
        dimensions: product.dimensions || '',
        modelPath: product.model_path || '',
        thumbnail: product.thumbnail_path || '',
        overviewImage: product.overview_image_path,
        seriesOverviewImage: product.series_overview_image_path,
        images: product.additional_images || [],
        description: product.description || '',
        fullDescription: product.full_description || '',
        specifications: product.specifications || [],
        finish_type: product.finish_type,
        orientation: product.orientation,
        drawer_count: product.number_of_drawers || 0,
        door_type: product.door_type,
        product_code: product.product_code,
        thumbnail_path: product.thumbnail_path,
        model_path: product.model_path,
        mounting_type: product.mounting_type,
        mixing_type: product.mixing_type,
        handle_type: product.handle_type,
        emergency_shower_type: product.emergency_shower_type,
        company_tags: product.company_tags,
        product_series: product.product_series,
        cabinet_class: product.cabinet_class || 'standard',
        parent_series_id: product.parent_series_id,
        is_series_parent: product.is_series_parent,
        editable_title: product.name || '',
        editable_description: product.description || '',
        created_at: product.created_at,
        updated_at: product.updated_at,
        is_active: product.is_active
      });
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

    return products.map((product) => ({
      id: product.id || '',
      name: product.name || '',
      category: product.category || '',
      dimensions: product.dimensions || '',
      modelPath: product.model_path || '',
      thumbnail: product.thumbnail_path || '',
      overviewImage: product.overview_image_path,
      seriesOverviewImage: product.series_overview_image_path,
      images: product.additional_images || [],
      description: product.description || '',
      fullDescription: product.full_description || '',
      specifications: product.specifications || [],
      finish_type: product.finish_type,
      orientation: product.orientation,
      drawer_count: product.number_of_drawers || 0,
      door_type: product.door_type,
      product_code: product.product_code,
      thumbnail_path: product.thumbnail_path,
      model_path: product.model_path,
      mounting_type: product.mounting_type,
      mixing_type: product.mixing_type,
      handle_type: product.handle_type,
      emergency_shower_type: product.emergency_shower_type,
      company_tags: product.company_tags,
      product_series: product.product_series,
      cabinet_class: product.cabinet_class || 'standard',
      parent_series_id: product.parent_series_id,
      is_series_parent: product.is_series_parent,
      editable_title: product.name || '',
      editable_description: product.description || '',
      created_at: product.created_at,
      updated_at: product.updated_at,
      is_active: product.is_active
    }));
  } catch (error) {
    console.error('Error fetching products by series:', error);
    throw error;
  }
};
