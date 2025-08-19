
import { useQuery } from '@tanstack/react-query';
import { fetchProductById } from '@/api/products';
import { Product } from '@/types/product';

const transformDatabaseProduct = (dbProduct: any): Product => {
  return {
    id: dbProduct.id,
    name: dbProduct.name,
    category: dbProduct.category,
    dimensions: dbProduct.dimensions || '',
    modelPath: dbProduct.model_path || '',
    thumbnail: dbProduct.thumbnail_path || '',
    images: dbProduct.additional_images || [],
    description: dbProduct.description || '',
    fullDescription: dbProduct.full_description || dbProduct.description || '',
    specifications: Array.isArray(dbProduct.specifications) ? dbProduct.specifications : [],
    finishes: [],
    variants: [],
    baseProductId: dbProduct.parent_series_id,
    finish_type: dbProduct.finish_type,
    orientation: dbProduct.orientation,
    drawer_count: dbProduct.drawer_count || 0,
    door_type: dbProduct.door_type,
    product_code: dbProduct.product_code || '',
    thumbnail_path: dbProduct.thumbnail_path,
    model_path: dbProduct.model_path,
    mounting_type: dbProduct.mounting_type,
    mixing_type: dbProduct.mixing_type,
    handle_type: dbProduct.handle_type,
    emergency_shower_type: dbProduct.emergency_shower_type,
    company_tags: dbProduct.company_tags || [],
    product_series: dbProduct.product_series,
    parent_series_id: dbProduct.parent_series_id,
    created_at: dbProduct.created_at,
    updated_at: dbProduct.updated_at,
    is_active: dbProduct.is_active
  };
};

export const useProductById = (productId: string) => {
  return useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      if (!productId) return null;
      const dbProduct = await fetchProductById(productId);
      return transformDatabaseProduct(dbProduct);
    },
    enabled: !!productId,
  });
};
