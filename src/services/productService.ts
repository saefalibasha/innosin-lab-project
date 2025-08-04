import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types/product';

export const fetchProductsFromDatabase = async (): Promise<Product[]> => {
  try {
    // Fetch both series parents and their variants
    const { data: allProducts, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('series_order', { ascending: true });

    if (error) {
      console.error('Error fetching products:', error);
      return [];
    }

    if (!allProducts) return [];

    // Separate series parents and variants
    const seriesParents = allProducts.filter(p => p.is_series_parent === true);
    const variants = allProducts.filter(p => p.is_series_parent === false && p.parent_series_id);

    // Create a map of series parent ID to their variants
    const variantsByParent = variants.reduce((acc, variant) => {
      const parentId = variant.parent_series_id;
      if (!acc[parentId]) acc[parentId] = [];
      acc[parentId].push(variant);
      return acc;
    }, {} as Record<string, any[]>);

    // Convert series parents to Product type and include their variants
    const convertedProducts: Product[] = seriesParents.map(product => {
      const productVariants = variantsByParent[product.id] || [];
      
      return {
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
        variants: productVariants.map(variant => ({
          id: variant.id,
          size: variant.dimensions || '',
          dimensions: variant.dimensions || '',
          type: variant.variant_type || 'standard',
          orientation: variant.orientation === 'LH' ? 'LH' : variant.orientation === 'RH' ? 'RH' : 'None',
          modelPath: variant.model_path || '',
          thumbnail: variant.thumbnail_path || '',
          images: variant.additional_images || []
        })),
        baseProductId: product.parent_series_id || undefined,
        // Add series-specific fields for the parent
        is_series_parent: true,
        parent_series_id: product.parent_series_id,
        product_series: product.product_series
      };
    });

    return convertedProducts;
  } catch (error) {
    console.error('Error in fetchProductsFromDatabase:', error);
    return [];
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
      return [];
    }

    if (!products) return [];

    // Get unique categories
    const categories = [...new Set(products.map(p => p.category).filter(Boolean))];
    return categories;
  } catch (error) {
    console.error('Error in fetchCategoriesFromDatabase:', error);
    return [];
  }
};

export const fetchProductsByCategory = async (category: string): Promise<Product[]> => {
  try {
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
    const seriesParents = allProducts.filter(p => p.is_series_parent === true);
    const variants = allProducts.filter(p => p.is_series_parent === false && p.parent_series_id);

    // Create a map of series parent ID to their variants
    const variantsByParent = variants.reduce((acc, variant) => {
      const parentId = variant.parent_series_id;
      if (!acc[parentId]) acc[parentId] = [];
      acc[parentId].push(variant);
      return acc;
    }, {} as Record<string, any[]>);

    // Convert to frontend Product type with variants
    const convertedProducts: Product[] = seriesParents.map(product => {
      const productVariants = variantsByParent[product.id] || [];
      
      return {
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
        variants: productVariants.map(variant => ({
          id: variant.id,
          size: variant.dimensions || '',
          dimensions: variant.dimensions || '',
          type: variant.variant_type || 'standard',
          orientation: variant.orientation === 'LH' ? 'LH' : variant.orientation === 'RH' ? 'RH' : 'None',
          modelPath: variant.model_path || '',
          thumbnail: variant.thumbnail_path || '',
          images: variant.additional_images || []
        })),
        baseProductId: product.parent_series_id || undefined,
        // Add series-specific fields for the parent
        is_series_parent: true,
        parent_series_id: product.parent_series_id,
        product_series: product.product_series
      };
    });

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

// New function to fetch variants for admin dashboard
export const fetchVariantsByParentId = async (parentId: string) => {
  try {
    const { data: variants, error } = await supabase
      .from('products')
      .select('*')
      .eq('parent_series_id', parentId)
      .eq('is_active', true)
      .order('variant_order', { ascending: true });

    if (error) {
      console.error('Error fetching variants:', error);
      return [];
    }

    return variants || [];
  } catch (error) {
    console.error('Error in fetchVariantsByParentId:', error);
    return [];
  }
};

// Function to subscribe to real-time product updates
export const subscribeToProductUpdates = (callback: (payload: any) => void) => {
  const subscription = supabase
    .channel('products-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'products'
      },
      (payload) => {
        console.log('Product update received:', payload);
        callback(payload);
      }
    )
    .subscribe();

  return subscription;
};

// Function to unsubscribe from real-time updates
export const unsubscribeFromProductUpdates = (subscription: any) => {
  if (subscription) {
    supabase.removeChannel(subscription);
  }
};
