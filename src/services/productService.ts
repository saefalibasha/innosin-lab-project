import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types/product';
import { mockProductSeries, mockCategories } from '@/data/mockProducts';
import { DatabaseProduct } from '@/types/supabase';

export const fetchProductsFromDatabase = async (): Promise<Product[]> => {
  try {
    // Fetch both series parents AND their variants
    const { data: allProducts, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('series_order', { ascending: true });

    if (error) {
      console.error('Error fetching products:', error);
      
      // Fallback to mock data when database is unavailable
      console.log('🔄 Falling back to mock product data for development');
      return mockProductSeries;
    }

    if (!allProducts || allProducts.length === 0) {
      console.log('⚠️ No products found in database, using mock data');
      return mockProductSeries;
    }

    // Separate series parents and variants
    const seriesParents = allProducts.filter(product => product.is_series_parent === true);
    const variants = allProducts.filter(product => product.parent_series_id !== null);

    // If no series parents found, fall back to mock data
    if (seriesParents.length === 0) {
      console.log('⚠️ No series parents found in database, using mock data');
      return mockProductSeries;
    }

    // Group variants by parent series
    const variantsByParent = variants.reduce((acc, variant) => {
      const parentId = variant.parent_series_id;
      if (!acc[parentId]) acc[parentId] = [];
      acc[parentId].push(variant);
      return acc;
    }, {} as Record<string, DatabaseProduct[]>);

    // Convert database products to frontend Product type with variants populated
    const convertedProducts: Product[] = seriesParents.map(product => ({
      id: product.id,
      name: product.name,
      category: product.category || 'Uncategorized',
      dimensions: product.dimensions || '',
      modelPath: product.series_model_path || product.model_path || '',
      thumbnail: product.series_thumbnail_path || product.thumbnail_path || '',
      overviewImage: product.overview_image_path || product.series_thumbnail_path || product.thumbnail_path || '',
      // Prioritize series_overview_image_path for series display
      seriesOverviewImage: product.series_overview_image_path || product.overview_image_path || product.series_thumbnail_path || '',
      images: product.additional_images || [],
      description: product.description || '',
      fullDescription: product.full_description || product.description || '',
      specifications: product.specifications ? 
        (Array.isArray(product.specifications) ? product.specifications.map(spec => String(spec)) : []) : [],
      finishes: [{
        type: product.finish_type === 'SS' ? 'stainless-steel' : 'powder-coat',
        name: product.finish_type === 'SS' ? 'Stainless Steel' : 'Powder Coat',
        modelPath: product.series_model_path || product.model_path,
        thumbnail: product.series_thumbnail_path || product.thumbnail_path
      }],
      variants: (variantsByParent[product.id] || []).map(variant => ({
        id: variant.id,
        size: variant.dimensions || 'Standard',
        dimensions: variant.dimensions || '',
        type: variant.variant_type || 'standard',
        orientation: variant.orientation || 'None',
        modelPath: variant.model_path || '',
        thumbnail: variant.thumbnail_path || '',
        images: variant.additional_images || []
      })),
      baseProductId: product.parent_series_id || undefined
    }));

    console.log(`✅ Successfully loaded ${convertedProducts.length} product series from database`);
    return convertedProducts;
  } catch (error) {
    console.error('Error in fetchProductsFromDatabase:', error);
    
    // Fallback to mock data on any error (including network issues)
    console.log('🔄 Falling back to mock product data due to error');
    return mockProductSeries;
  }
};

export const fetchCategoriesFromDatabase = async (): Promise<string[]> => {
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('category')
      .eq('is_active', true)
      .eq('is_series_parent', true);

    if (error) {
      console.error('Error fetching categories:', error);
      
      // Fallback to mock categories when database is unavailable
      console.log('🔄 Falling back to mock categories for development');
      return mockCategories;
    }

    if (!products || products.length === 0) {
      console.log('⚠️ No categories found in database, using mock data');
      return mockCategories;
    }

    // Get unique categories
    const categories = [...new Set(products.map(p => p.category).filter(Boolean))];
    
    if (categories.length === 0) {
      console.log('⚠️ No valid categories found, using mock data');
      return mockCategories;
    }
    
    console.log(`✅ Successfully loaded ${categories.length} categories from database`);
    return categories;
  } catch (error) {
    console.error('Error in fetchCategoriesFromDatabase:', error);
    
    // Fallback to mock categories on any error
    console.log('🔄 Falling back to mock categories due to error');
    return mockCategories;
  }
};

export const fetchProductsByCategory = async (category: string): Promise<Product[]> => {
  try {
    // Fetch both series parents AND their variants for the specific category
    const { data: allProducts, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .eq('category', category)
      .order('series_order', { ascending: true });

    if (error) {
      console.error('Error fetching products by category:', error);
      return [];
    }

    if (!allProducts) return [];

    // Separate series parents and variants
    const seriesParents = allProducts.filter(product => product.is_series_parent === true);
    const variants = allProducts.filter(product => product.parent_series_id !== null);

    // Group variants by parent series
    const variantsByParent = variants.reduce((acc, variant) => {
      const parentId = variant.parent_series_id;
      if (!acc[parentId]) acc[parentId] = [];
      acc[parentId].push(variant);
      return acc;
    }, {} as Record<string, DatabaseProduct[]>);

    // Convert to frontend Product type with variants populated
    const convertedProducts: Product[] = seriesParents.map(product => ({
      id: product.id,
      name: product.name,
      category: product.category || 'Uncategorized',
      dimensions: product.dimensions || '',
      modelPath: product.series_model_path || product.model_path || '',
      thumbnail: product.series_thumbnail_path || product.thumbnail_path || '',
      overviewImage: product.overview_image_path || product.series_thumbnail_path || product.thumbnail_path || '',
      // Prioritize series_overview_image_path for series display
      seriesOverviewImage: product.series_overview_image_path || product.overview_image_path || product.series_thumbnail_path || '',
      images: product.additional_images || [],
      description: product.description || '',
      fullDescription: product.full_description || product.description || '',
      specifications: product.specifications ? 
        (Array.isArray(product.specifications) ? product.specifications.map(spec => String(spec)) : []) : [],
      finishes: [{
        type: product.finish_type === 'SS' ? 'stainless-steel' : 'powder-coat',
        name: product.finish_type === 'SS' ? 'Stainless Steel' : 'Powder Coat',
        modelPath: product.series_model_path || product.model_path,
        thumbnail: product.series_thumbnail_path || product.thumbnail_path
      }],
      variants: (variantsByParent[product.id] || []).map(variant => ({
        id: variant.id,
        size: variant.dimensions || 'Standard',
        dimensions: variant.dimensions || '',
        type: variant.variant_type || 'standard',
        orientation: variant.orientation || 'None',
        modelPath: variant.model_path || '',
        thumbnail: variant.thumbnail_path || '',
        images: variant.additional_images || []
      })),
      baseProductId: product.parent_series_id || undefined
    }));

    return convertedProducts;
  } catch (error) {
    console.error('Error in fetchProductsByCategory:', error);
    return [];
  }
};

export const fetchProductWithVariants = async (productId: string) => {
  try {
    // First fetch the series parent
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .eq('is_series_parent', true)
      .eq('is_active', true)
      .single();

    if (productError) {
      console.error('Error fetching product:', productError);
      return null;
    }

    if (!product) return null;

    // Fetch all variants for this series
    const { data: variants, error: variantsError } = await supabase
      .from('products')
      .select('*')
      .eq('parent_series_id', productId)
      .eq('is_active', true)
      .order('variant_order', { ascending: true });

    if (variantsError) {
      console.error('Error fetching variants:', variantsError);
    }

    // Map database orientation values to frontend format
    const mapOrientation = (dbOrientation: string | null) => {
      if (!dbOrientation || dbOrientation === 'None') return 'None';
      if (dbOrientation.includes('Left') || dbOrientation === 'LH') return 'LH';
      if (dbOrientation.includes('Right') || dbOrientation === 'RH') return 'RH';
      return 'None';
    };

    // Convert variants to the format expected by VariantSelector
    const mappedVariants = (variants || []).map(variant => ({
      id: variant.id,
      name: variant.name,
      product_code: variant.product_code,
      category: variant.category,
      dimensions: variant.dimensions || '',
      description: variant.description || '',
      full_description: variant.full_description || '',
      specifications: variant.specifications || {},
      thumbnail_path: variant.thumbnail_path || '',
      model_path: variant.model_path || '',
      additional_images: variant.additional_images || [],
      finish_type: variant.finish_type || 'PC',
      orientation: mapOrientation(variant.orientation),
      door_type: variant.door_type || '',
      variant_type: variant.variant_type || 'standard',
      drawer_count: variant.drawer_count || undefined,
      parent_series_id: variant.parent_series_id
    }));

    // Convert series parent to Product type
    const convertedProduct = {
      id: product.id,
      name: product.name,
      category: product.category || 'Uncategorized',
      dimensions: product.dimensions || '',
      modelPath: product.series_model_path || product.model_path || '',
      thumbnail: product.series_thumbnail_path || product.thumbnail_path || '',
      overviewImage: product.overview_image_path || product.series_thumbnail_path || product.thumbnail_path || '',
      // Prioritize series_overview_image_path for series display
      seriesOverviewImage: product.series_overview_image_path || product.overview_image_path || product.series_thumbnail_path || '',
      images: product.additional_images || [],
      description: product.description || '',
      fullDescription: product.full_description || product.description || '',
      specifications: product.specifications ? 
        (Array.isArray(product.specifications) ? product.specifications.map(spec => String(spec)) : []) : [],
      finishes: [{
        type: product.finish_type === 'SS' ? 'stainless-steel' : 'powder-coat',
        name: product.finish_type === 'SS' ? 'Stainless Steel' : 'Powder Coat',
        modelPath: product.series_model_path || product.model_path,
        thumbnail: product.series_thumbnail_path || product.thumbnail_path
      }],
      variants: [],
      baseProductId: product.parent_series_id || undefined
    };

    return {
      product: convertedProduct,
      variants: mappedVariants
    };
  } catch (error) {
    console.error('Error in fetchProductWithVariants:', error);
    return null;
  }
};

// Real-time data synchronization
export const subscribeToProductUpdates = (callback: (payload: unknown) => void) => {
  return supabase
    .channel('products-changes')
    .on('postgres_changes', { 
      event: '*', 
      schema: 'public', 
      table: 'products' 
    }, callback)
    .subscribe();
};
