import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types/product';

export const fetchProductsFromDatabase = async (): Promise<Product[]> => {
  try {
    console.log('🔍 Starting product fetch from database...');
    
    // First, let's try to get total count to verify connection
    const { count: totalCount, error: countError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('❌ Error connecting to products table:', countError);
      return [];
    }
    
    console.log(`📊 Total products in database: ${totalCount}`);
    
    // Try the original restrictive query first
    console.log('🎯 Attempting original restrictive query (is_active=true AND is_series_parent=true)...');
    let { data: products, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .eq('is_series_parent', true)
      .order('series_order', { ascending: true });

    if (error) {
      console.error('❌ Error with restrictive query:', error);
      return [];
    }

    console.log(`🎯 Restrictive query returned: ${products?.length || 0} products`);

    // If no products found with restrictive query, try alternative strategies
    if (!products || products.length === 0) {
      console.log('🔄 No products found with restrictive filters, trying alternative strategies...');
      
      // Strategy 1: Only is_active=true
      console.log('📋 Strategy 1: Only is_active=true...');
      const { data: activeProducts, error: activeError } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('series_order', { ascending: true });
      
      if (!activeError && activeProducts && activeProducts.length > 0) {
        console.log(`✅ Found ${activeProducts.length} products with is_active=true`);
        products = activeProducts;
      } else {
        // Strategy 2: No filters at all
        console.log('📋 Strategy 2: No filters (get all products)...');
        const { data: allProducts, error: allError } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50); // Limit to prevent overwhelming results
        
        if (!allError && allProducts && allProducts.length > 0) {
          console.log(`✅ Found ${allProducts.length} products with no filters`);
          products = allProducts;
        } else {
          console.log('❌ No products found even without filters');
          return [];
        }
      }
    }

    if (!products || products.length === 0) {
      console.log('⚠️ No products available in database');
      return [];
    }

    console.log(`✅ Processing ${products.length} products for frontend...`);

    // Convert database products to frontend Product type
    const convertedProducts: Product[] = products.map(product => ({
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
    }));

    return convertedProducts;
  } catch (error) {
    console.error('Error in fetchProductsFromDatabase:', error);
    return [];
  }
};

export const fetchCategoriesFromDatabase = async (): Promise<string[]> => {
  try {
    console.log('🏷️ Fetching categories from database...');
    
    // Try the restrictive query first
    let { data: products, error } = await supabase
      .from('products')
      .select('category')
      .eq('is_active', true)
      .eq('is_series_parent', true);

    if (error) {
      console.error('❌ Error fetching categories with restrictive filters:', error);
      return [];
    }

    // If no products found with restrictive query, try alternatives
    if (!products || products.length === 0) {
      console.log('🔄 No categories found with restrictive filters, trying alternatives...');
      
      // Try with only is_active=true
      const { data: activeProducts, error: activeError } = await supabase
        .from('products')
        .select('category')
        .eq('is_active', true);
      
      if (!activeError && activeProducts && activeProducts.length > 0) {
        products = activeProducts;
      } else {
        // Try with no filters
        const { data: allProducts, error: allError } = await supabase
          .from('products')
          .select('category');
        
        if (!allError && allProducts && allProducts.length > 0) {
          products = allProducts;
        }
      }
    }

    if (!products) return [];

    // Get unique categories
    const categories = [...new Set(products.map(p => p.category).filter(Boolean))];
    console.log(`🏷️ Found categories: ${categories.join(', ')}`);
    return categories;
  } catch (error) {
    console.error('❌ Error in fetchCategoriesFromDatabase:', error);
    return [];
  }
};

export const fetchProductsByCategory = async (category: string): Promise<Product[]> => {
  try {
    console.log(`🏷️ Fetching products for category: ${category}`);
    
    // Try the restrictive query first
    let { data: products, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .eq('is_series_parent', true)
      .eq('category', category)
      .order('series_order', { ascending: true });

    if (error) {
      console.error('❌ Error fetching products by category with restrictive filters:', error);
      return [];
    }

    // If no products found with restrictive query, try alternatives
    if (!products || products.length === 0) {
      console.log('🔄 No products found with restrictive filters, trying alternatives...');
      
      // Try with only is_active=true
      const { data: activeProducts, error: activeError } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .eq('category', category)
        .order('series_order', { ascending: true });
      
      if (!activeError && activeProducts && activeProducts.length > 0) {
        products = activeProducts;
      } else {
        // Try with no filters except category
        const { data: categoryProducts, error: categoryError } = await supabase
          .from('products')
          .select('*')
          .eq('category', category)
          .order('created_at', { ascending: false });
        
        if (!categoryError && categoryProducts && categoryProducts.length > 0) {
          products = categoryProducts;
        }
      }
    }

    if (!products) return [];

    console.log(`✅ Found ${products.length} products for category: ${category}`);

    // Convert to frontend Product type
    const convertedProducts: Product[] = products.map(product => ({
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
