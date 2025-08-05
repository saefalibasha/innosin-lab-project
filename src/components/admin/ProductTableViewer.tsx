
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ProductRow {
  id: string;
  name: string | null;
  category: string | null;
  product_code: string | null;
  dimensions: string | null;
  is_series_parent: boolean | null;
  parent_series_id: string | null;
  variant_type: string | null;
  orientation: string | null;
  finish_type: string | null;
  door_type: string | null;
  emergency_shower_type: string | null;
  mounting_type: string | null;
  is_active: boolean | null;
}

export const ProductTableViewer = () => {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select(`
            id,
            name,
            category,
            product_code,
            dimensions,
            is_series_parent,
            parent_series_id,
            variant_type,
            orientation,
            finish_type,
            door_type,
            emergency_shower_type,
            mounting_type,
            is_active
          `)
          .order('category, name');

        if (error) {
          throw error;
        }

        console.log('Raw products from database:', data);
        setProducts(data || []);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <div className="p-4">Loading products...</div>;
  if (error) return <div className="p-4 text-red-600">Error: {error}</div>;

  // Group products by category
  const productsByCategory = products.reduce((acc, product) => {
    const category = product.category || 'Uncategorized';
    if (!acc[category]) acc[category] = [];
    acc[category].push(product);
    return acc;
  }, {} as Record<string, ProductRow[]>);

  // Separate series parents and variants
  const seriesParents = products.filter(p => p.is_series_parent === true);
  const variants = products.filter(p => p.parent_series_id !== null);
  const standaloneProducts = products.filter(p => p.is_series_parent !== true && p.parent_series_id === null);

  return (
    <div className="p-6 space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Products Table Summary</h2>
        <div className="grid grid-cols-4 gap-4 text-sm">
          <div>Total Products: {products.length}</div>
          <div>Series Parents: {seriesParents.length}</div>
          <div>Variants: {variants.length}</div>
          <div>Standalone: {standaloneProducts.length}</div>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2 text-green-700">Series Parents ({seriesParents.length})</h3>
          {seriesParents.map(product => (
            <div key={product.id} className="bg-green-50 p-3 mb-2 rounded border-l-4 border-green-500">
              <div className="font-medium">{product.name}</div>
              <div className="text-sm text-gray-600">
                Category: {product.category} | Code: {product.product_code} | Active: {product.is_active ? 'Yes' : 'No'}
              </div>
              <div className="text-xs text-gray-500">ID: {product.id}</div>
            </div>
          ))}
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2 text-blue-700">Variants ({variants.length})</h3>
          {variants.map(product => (
            <div key={product.id} className="bg-blue-50 p-3 mb-2 rounded border-l-4 border-blue-500">
              <div className="font-medium">{product.name}</div>
              <div className="text-sm text-gray-600">
                Category: {product.category} | Dimensions: {product.dimensions} | 
                Variant Type: {product.variant_type} | Orientation: {product.orientation}
              </div>
              <div className="text-sm text-gray-600">
                Finish: {product.finish_type} | Door: {product.door_type} | 
                Emergency Type: {product.emergency_shower_type} | Mount: {product.mounting_type}
              </div>
              <div className="text-xs text-gray-500">
                Parent ID: {product.parent_series_id} | Active: {product.is_active ? 'Yes' : 'No'}
              </div>
            </div>
          ))}
        </div>

        {standaloneProducts.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-2 text-gray-700">Standalone Products ({standaloneProducts.length})</h3>
            {standaloneProducts.map(product => (
              <div key={product.id} className="bg-gray-50 p-3 mb-2 rounded border-l-4 border-gray-500">
                <div className="font-medium">{product.name}</div>
                <div className="text-sm text-gray-600">
                  Category: {product.category} | Code: {product.product_code}
                </div>
                <div className="text-xs text-gray-500">ID: {product.id}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-yellow-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Debug Information</h3>
        <div className="text-sm space-y-1">
          <div>Products by Category:</div>
          {Object.entries(productsByCategory).map(([category, categoryProducts]) => (
            <div key={category} className="ml-4">
              {category}: {categoryProducts.length} products
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
