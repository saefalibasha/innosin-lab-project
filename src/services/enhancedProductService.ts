
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types/product';
import { DatabaseProduct } from '@/types/supabase';

// Enhanced database product transformation
const ensureDatabaseProduct = (rawProduct: any): DatabaseProduct => {
  return {
    id: rawProduct.id || '',
    name: rawProduct.name || '',
    category: rawProduct.category || '',
    dimensions: rawProduct.dimensions || '',
    model_path: rawProduct.model_path || '',
    thumbnail_path: rawProduct.thumbnail_path || '',
    additional_images: rawProduct.additional_images || [],
    description: rawProduct.description || '',
    full_description: rawProduct.full_description || '',
    specifications: rawProduct.specifications || [],
    finish_type: rawProduct.finish_type || '',
    orientation: rawProduct.orientation || '',
    door_type: rawProduct.door_type || '',
    variant_type: rawProduct.variant_type || '',
    drawer_count: rawProduct.drawer_count || 0,
    cabinet_class: rawProduct.cabinet_class || 'standard',
    product_code: rawProduct.product_code || '',
    mounting_type: rawProduct.mounting_type || '',
    mixing_type: rawProduct.mixing_type || '',
    handle_type: rawProduct.handle_type || '',
    emergency_shower_type: rawProduct.emergency_shower_type || '',
    company_tags: rawProduct.company_tags || [],
    product_series: rawProduct.product_series || '',
    parent_series_id: rawProduct.parent_series_id || '',
    is_series_parent: rawProduct.is_series_parent || false,
    is_active: rawProduct.is_active !== undefined ? rawProduct.is_active : true,
    series_model_path: rawProduct.series_model_path || '',
    series_thumbnail_path: rawProduct.series_thumbnail_path || '',
    series_overview_image_path: rawProduct.series_overview_image_path || '',
    overview_image_path: rawProduct.overview_image_path || '',
    series_order: rawProduct.series_order || 0,
    variant_order: rawProduct.variant_order || 0,
    created_at: rawProduct.created_at || '',
    updated_at: rawProduct.updated_at || '',
    editable_title: rawProduct.editable_title || rawProduct.name || '',
    editable_description: rawProduct.editable_description || rawProduct.description || '',
    inherits_series_assets: rawProduct.inherits_series_assets || false,
    target_variant_count: rawProduct.target_variant_count || 0,
    keywords: rawProduct.keywords || []
  };
};

// Enhanced product transformation with asset path resolution
const transformDatabaseProduct = (dbProduct: DatabaseProduct): Product => {
  return {
    id: dbProduct.id,
    name: dbProduct.editable_title || dbProduct.name,
    category: dbProduct.category,
    dimensions: dbProduct.dimensions || '',
    // Enhanced asset path resolution - prefer series assets, fallback to individual
    modelPath: dbProduct.series_model_path || dbProduct.model_path || '',
    thumbnail: dbProduct.series_thumbnail_path || dbProduct.thumbnail_path || '',
    images: dbProduct.additional_images || [],
    description: dbProduct.editable_description || dbProduct.description || '',
    fullDescription: dbProduct.editable_description || dbProduct.full_description || dbProduct.description || '',
    specifications: Array.isArray(dbProduct.specifications) ? dbProduct.specifications : [],
    finishes: [],
    variants: [],
    baseProductId: dbProduct.parent_series_id,
    // Variant-specific fields
    finish_type: dbProduct.finish_type,
    orientation: dbProduct.orientation,
    drawer_count: dbProduct.drawer_count || 0,
    door_type: dbProduct.door_type,
    product_code: dbProduct.product_code || '',
    thumbnail_path: dbProduct.series_thumbnail_path || dbProduct.thumbnail_path,
    model_path: dbProduct.series_model_path || dbProduct.model_path,
    // Enhanced variant fields for all product types
    mounting_type: dbProduct.mounting_type,
    mixing_type: dbProduct.mixing_type,
    handle_type: dbProduct.handle_type,
    emergency_shower_type: dbProduct.emergency_shower_type,
    cabinet_class: dbProduct.cabinet_class || 'standard',
    company_tags: dbProduct.company_tags || [],
    product_series: dbProduct.product_series,
    // Admin editable fields
    editable_title: dbProduct.editable_title,
    editable_description: dbProduct.editable_description,
    // Enhanced image fields
    overviewImage: dbProduct.overview_image_path,
    seriesOverviewImage: dbProduct.series_overview_image_path,
    // Timestamps and status
    created_at: dbProduct.created_at,
    updated_at: dbProduct.updated_at,
    is_active: dbProduct.is_active,
    // Series parent relationship
    parent_series_id: dbProduct.parent_series_id
  };
};

class EnhancedProductService {
  async getProductWithVariants(productId: string): Promise<{ product: Product | null; variants: Product[] }> {
    try {
      console.log(`🔍 Fetching product ${productId} with variants...`);

      // First, get the main product
      const { data: mainProduct, error: mainError } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (mainError) {
        console.error('Error fetching main product:', mainError);
        return { product: null, variants: [] };
      }

      if (!mainProduct) {
        console.log('Product not found');
        return { product: null, variants: [] };
      }

      const transformedProduct = transformDatabaseProduct(ensureDatabaseProduct(mainProduct));

      // Determine the series ID to fetch variants
      let seriesId = mainProduct.parent_series_id;
      
      // If this product is a series parent, use its own ID
      if (mainProduct.is_series_parent) {
        seriesId = mainProduct.id;
      }

      // If no series relationship, return just the product
      if (!seriesId) {
        console.log('No series relationship found, returning single product');
        return { product: transformedProduct, variants: [transformedProduct] };
      }

      // Fetch all variants in the series (excluding the series parent)
      const { data: variantData, error: variantError } = await supabase
        .from('products')
        .select('*')
        .eq('parent_series_id', seriesId)
        .eq('is_series_parent', false)
        .order('variant_order', { ascending: true });

      if (variantError) {
        console.error('Error fetching variants:', variantError);
        return { product: transformedProduct, variants: [transformedProduct] };
      }

      const variants = (variantData || [])
        .map(ensureDatabaseProduct)
        .map(transformDatabaseProduct);

      console.log(`✅ Found ${variants.length} variants for product ${productId}`);

      return {
        product: transformedProduct,
        variants: variants.length > 0 ? variants : [transformedProduct]
      };

    } catch (error) {
      console.error('Error in getProductWithVariants:', error);
      return { product: null, variants: [] };
    }
  }

  async getAllProductSeries(): Promise<Product[]> {
    try {
      console.log('🔍 Fetching all product series...');

      const { data: seriesData, error } = await supabase
        .from('products')
        .select('*')
        .or('is_series_parent.eq.true,parent_series_id.is.null')
        .eq('is_active', true)
        .order('series_order', { ascending: true });

      if (error) {
        console.error('Error fetching product series:', error);
        throw error;
      }

      const series = (seriesData || [])
        .filter(product => product.thumbnail_path || product.series_thumbnail_path) // Only include series with images
        .map(ensureDatabaseProduct)
        .map(transformDatabaseProduct);

      console.log(`✅ Found ${series.length} product series`);
      return series;

    } catch (error) {
      console.error('Error in getAllProductSeries:', error);
      throw error;
    }
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', category)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;

      return (data || [])
        .map(ensureDatabaseProduct)
        .map(transformDatabaseProduct);
    } catch (error) {
      console.error('Error fetching products by category:', error);
      throw error;
    }
  }

  async searchProducts(query: string): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%,product_code.ilike.%${query}%,editable_title.ilike.%${query}%,editable_description.ilike.%${query}%`)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;

      return (data || [])
        .map(ensureDatabaseProduct)
        .map(transformDatabaseProduct);
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  }

  async validateAssetExists(assetPath: string): Promise<boolean> {
    if (!assetPath) return false;
    
    try {
      // For local assets, we can't easily validate without making HTTP requests
      // For Supabase storage assets, we could check the storage API
      if (assetPath.startsWith('http')) {
        const response = await fetch(assetPath, { method: 'HEAD' });
        return response.ok;
      }
      
      // For local assets, assume they exist if the path is provided
      // This could be enhanced with actual file system checks in a real environment
      return true;
    } catch {
      return false;
    }
  }
}

const enhancedProductService = new EnhancedProductService();

export const fetchProductWithVariants = (productId: string) => 
  enhancedProductService.getProductWithVariants(productId);

export const fetchAllProductSeries = () => 
  enhancedProductService.getAllProductSeries();

export const searchProducts = (query: string) => 
  enhancedProductService.searchProducts(query);

export const validateAssetExists = (assetPath: string) => 
  enhancedProductService.validateAssetExists(assetPath);

export default enhancedProductService;
