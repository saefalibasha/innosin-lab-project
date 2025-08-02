import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import ProductImageGallery from '@/components/ProductImageGallery';
import ProductSpecifications from '@/components/ProductSpecifications';
import ProductVariantSelector from '@/components/ProductVariantSelector';
import Model3DViewer from '@/components/Model3DViewer';
import { toast } from 'sonner';

// Define the Product interface
interface Product {
  id: string;
  name: string;
  product_code: string;
  category: string;
  description: string | null;
  full_description: string | null;
  dimensions: string | null;
  specifications: any[];
  images: string[];
  thumbnail_path: string | null;
  model_path: string | null;
  keywords: string[];
  finish_type: string;
  orientation: string;
  product_series: string | null;
  variant_type: string;
  mounting_type: string | null;
}

interface ProductVariant {
  id: string;
  variant_name: string;
  variant_code: string;
  finish_type: string;
  color: string | null;
  size_dimensions: string | null;
  thumbnail_path: string | null;
  model_path: string | null;
  additional_images: string[];
  additional_specs: any;
}

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedFinish, setSelectedFinish] = useState<string>('');

  // Fetch product details
  const { data: product, isLoading: productLoading, error: productError } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      console.log('🔍 Fetching product with ID:', id);
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('❌ Error fetching product:', error);
        throw error;
      }

      console.log('✅ Product data fetched:', {
        id: data.id,
        name: data.name,
        product_code: data.product_code,
        category: data.category,
        product_series: data.product_series,
        variant_type: data.variant_type,
        finish_type: data.finish_type,
        additional_images: data.additional_images,
        thumbnail_path: data.thumbnail_path
      });

      // Transform the product data to match our interface
      const product: Product = {
        ...data,
        images: data.additional_images || []
      };

      return product;
    },
    enabled: !!id,
  });

  // Enhanced series detection function
  const detectSeriesFromProduct = (product: Product): string | null => {
    if (!product) return null;

    const productName = product.name?.toLowerCase() || '';
    const productCode = product.product_code?.toLowerCase() || '';
    const category = product.category?.toLowerCase() || '';
    const productSeries = product.product_series?.toLowerCase() || '';

    console.log('🔍 Series Detection for:', {
      productName,
      productCode, 
      category,
      productSeries,
      originalName: product.name,
      originalCode: product.product_code
    });

    // Direct series field check
    if (product.product_series) {
      console.log('✅ Found series from product_series field:', product.product_series);
      return product.product_series;
    }

    // Enhanced series detection patterns
    const seriesPatterns = [
      // UNIFLEX Taps Series
      { pattern: /uniflex.*tap/i, series: 'Broen-Lab UNIFLEX Taps Series' },
      { pattern: /broen.*uniflex/i, series: 'Broen-Lab UNIFLEX Taps Series' },
      { pattern: /single.*way/i, series: 'Broen-Lab UNIFLEX Taps Series' },
      
      // Emergency Shower Series  
      { pattern: /emergency.*shower/i, series: 'Broen-Lab Emergency Shower Series' },
      { pattern: /eye.*wash/i, series: 'Broen-Lab Emergency Shower Series' },
      
      // NOCE Series
      { pattern: /noce.*series/i, series: 'NOCE Series Fume Hood' },
      { pattern: /fume.*hood.*noce/i, series: 'NOCE Series Fume Hood' },
      
      // TANGERINE Series
      { pattern: /tangerine/i, series: 'Bio Safety Cabinet - TANGERINE Series' },
      { pattern: /bio.*safety.*cabinet.*tangerine/i, series: 'Bio Safety Cabinet - TANGERINE Series' },
      
      // Safe Aire II
      { pattern: /safe.*aire.*ii/i, series: 'Safe Aire II Fume Hoods' },
      { pattern: /safe.*air.*2/i, series: 'Safe Aire II Fume Hoods' },
      
      // Innosin Lab (mobile cabinets)
      { pattern: /^mc-pc/i, series: 'Innosin Lab' },
      { pattern: /^mcc-pc/i, series: 'Innosin Lab' },
      { pattern: /mobile.*cabinet/i, series: 'Innosin Lab' },
      
      // General fallbacks
      { pattern: /fume.*hood/i, series: 'Fume Hoods' },
      { pattern: /bio.*safety/i, series: 'Bio Safety Cabinets' },
      { pattern: /laminar.*flow/i, series: 'Laminar Flow Cabinets' }
    ];

    const fullText = `${productName} ${productCode} ${category}`.toLowerCase();
    
    for (const { pattern, series } of seriesPatterns) {
      if (pattern.test(fullText)) {
        console.log('✅ Detected series:', series, 'from pattern:', pattern);
        return series;
      }
    }

    console.log('❌ No series detected for product');
    return null;
  };

  // Fetch product variants based on detected series
  const detectedSeries = product ? detectSeriesFromProduct(product) : null;
  
  const { data: variants, isLoading: variantsLoading } = useQuery({
    queryKey: ['product-variants', detectedSeries, product?.product_code],
    queryFn: async () => {
      if (!detectedSeries || !product) {
        console.log('⚠️ No series detected or product not loaded, skipping variants fetch');
        return [];
      }

      console.log('🔍 Fetching variants for series:', detectedSeries);
      console.log('🔍 Base product code:', product.product_code);

      let query = supabase
        .from('product_variants')
        .select(`
          id,
          variant_name,
          variant_code,
          finish_type,
          color,
          size_dimensions,
          thumbnail_path,
          model_path,
          additional_images,
          additional_specs,
          product_id,
          products!inner(
            id,
            name,
            product_code,
            product_series,
            category
          )
        `)
        .eq('is_active', true);

      // Try to find variants by series matching
      const { data: seriesVariants, error: seriesError } = await query
        .ilike('products.product_series', `%${detectedSeries}%`);

      if (seriesError) {
        console.error('❌ Error fetching series variants:', seriesError);
      }

      console.log('📊 Found series variants:', seriesVariants?.length || 0);

      // If no series variants found, try by product code pattern
      let allVariants = seriesVariants || [];
      
      if (allVariants.length === 0) {
        console.log('🔍 Trying product code pattern matching...');
        const baseCode = product.product_code.replace(/[^a-zA-Z]/g, '');
        
        const { data: codeVariants, error: codeError } = await query
          .ilike('products.product_code', `%${baseCode}%`);
          
        if (codeError) {
          console.error('❌ Error fetching code variants:', codeError);
        }
        
        console.log('📊 Found code variants:', codeVariants?.length || 0);
        allVariants = codeVariants || [];
      }

      // Transform variants to match expected interface
      const transformedVariants: ProductVariant[] = allVariants.map((v: any) => ({
        id: v.id,
        variant_name: v.variant_name,
        variant_code: v.variant_code,
        finish_type: v.finish_type || 'PC',
        color: v.color,
        size_dimensions: v.size_dimensions,
        thumbnail_path: v.thumbnail_path,
        model_path: v.model_path,
        additional_images: v.additional_images || [],
        additional_specs: v.additional_specs || {}
      }));

      console.log('✅ Transformed variants:', transformedVariants.length);
      console.log('📋 Variant details:', transformedVariants.map(v => ({
        name: v.variant_name,
        code: v.variant_code,
        finish: v.finish_type
      })));

      return transformedVariants;
    },
    enabled: !!detectedSeries && !!product,
  });

  // Set default variant and finish
  useEffect(() => {
    if (variants && variants.length > 0 && !selectedVariant) {
      const defaultVariant = variants[0];
      setSelectedVariant(defaultVariant);
      setSelectedFinish(defaultVariant.finish_type || 'PC');
      console.log('🎯 Set default variant:', defaultVariant.variant_name);
    }
  }, [variants, selectedVariant]);

  // Handle loading and error states
  if (productLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (productError || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <Button onClick={() => navigate('/products')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Button>
        </div>
      </div>
    );
  }

  // Get current display data (variant or product)
  const currentThumbnail = selectedVariant?.thumbnail_path || product.thumbnail_path;
  const currentImages = selectedVariant?.additional_images?.length > 0 
    ? selectedVariant.additional_images 
    : product.images;
  const currentModel = selectedVariant?.model_path || product.model_path;
  const currentSpecs = selectedVariant?.additional_specs || product.specifications;

  console.log('🖼️ Current display assets:', {
    thumbnail: currentThumbnail,
    images: currentImages,
    model: currentModel,
    hasVariants: variants?.length > 0,
    selectedVariant: selectedVariant?.variant_name
  });

  const handleDownloadSpecs = () => {
    toast.success('Specifications downloaded successfully');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Button 
            onClick={() => navigate('/products')} 
            variant="ghost" 
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Button>
          
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {product.name}
              </h1>
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <Badge variant="secondary">{product.product_code}</Badge>
                <Badge variant="outline">{product.category}</Badge>
                {detectedSeries && (
                  <Badge variant="default">{detectedSeries}</Badge>
                )}
                {product.finish_type && product.finish_type !== 'None' && (
                  <Badge variant="secondary">Finish: {product.finish_type}</Badge>
                )}
              </div>
            </div>
            
            <Button onClick={handleDownloadSpecs} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Download Specs
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Image Gallery */}
          <div>
            <ProductImageGallery
              images={currentImages || []}
              thumbnail={currentThumbnail || '/placeholder.svg'}
              productName={selectedVariant?.variant_name || product.name}
              isProductPage={true}
              className="mb-6"
            />
            
            {/* 3D Model Viewer */}
            {currentModel && (
              <Card>
                <CardHeader>
                  <CardTitle>3D Model</CardTitle>
                  <CardDescription>Interactive 3D view of the product</CardDescription>
                </CardHeader>
                <CardContent>
                  <Model3DViewer
                    modelPath={currentModel}
                    productName={selectedVariant?.variant_name || product.name}
                  />
                </CardContent>
              </Card>
            )}
          </div>

          {/* Product Information */}
          <div className="space-y-6">
            {/* Product Configuration */}
            {variants && variants.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Product Configuration</CardTitle>
                  <CardDescription>
                    Select finish and specifications for {detectedSeries}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ProductVariantSelector
                    variants={variants}
                    selectedVariant={selectedVariant}
                    selectedFinish={selectedFinish}
                    onVariantChange={setSelectedVariant}
                    onFinishChange={setSelectedFinish}
                  />
                </CardContent>
              </Card>
            )}

            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Product Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {product.description && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                    <p className="text-gray-600">{product.description}</p>
                  </div>
                )}

                {product.dimensions && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Dimensions</h4>
                    <p className="text-gray-600">{product.dimensions}</p>
                  </div>
                )}

                {selectedVariant?.size_dimensions && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Variant Dimensions</h4>
                    <p className="text-gray-600">{selectedVariant.size_dimensions}</p>
                  </div>
                )}

                {product.keywords && product.keywords.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Keywords</h4>
                    <div className="flex flex-wrap gap-1">
                      {product.keywords.map((keyword, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Specifications */}
            <ProductSpecifications 
              specifications={currentSpecs || []}
              variantName={selectedVariant?.variant_name}
            />

            {/* Full Description */}
            {product.full_description && (
              <Card>
                <CardHeader>
                  <CardTitle>Full Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    <p className="whitespace-pre-line">{product.full_description}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Debug Information (development only) */}
        {process.env.NODE_ENV === 'development' && (
          <Card className="mt-8 bg-yellow-50 border-yellow-200">
            <CardHeader>
              <CardTitle className="text-yellow-800">Debug Information</CardTitle>
            </CardHeader>
            <CardContent className="text-yellow-700 space-y-2">
              <p><strong>Product ID:</strong> {product.id}</p>
              <p><strong>Detected Series:</strong> {detectedSeries || 'None'}</p>
              <p><strong>Variants Found:</strong> {variants?.length || 0}</p>
              <p><strong>Variants Loading:</strong> {variantsLoading ? 'Yes' : 'No'}</p>
              <p><strong>Current Variant:</strong> {selectedVariant?.variant_name || 'None'}</p>
              <p><strong>Current Finish:</strong> {selectedFinish || 'None'}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
