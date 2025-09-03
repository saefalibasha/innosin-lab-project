// src/pages/EnhancedProductDetail.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, ShoppingCart, Package, Camera, Box, Building2, Settings } from 'lucide-react';
import { useRFQ } from '@/contexts/RFQContext';
import { toast } from 'sonner';
import Enhanced3DViewerOptimized from '@/components/Enhanced3DViewerOptimized';
import InnosinLabConfigurator from '@/components/product/InnosinLabConfigurator';
import ProductImageGallery from '@/components/ProductImageGallery';
import AnimatedSection from '@/components/AnimatedSection';
import VariantSelector from '@/components/product/VariantSelector';
import TallCabinetConfigurator from '@/components/product/TallCabinetConfigurator';
import OpenRackConfigurator from '@/components/product/OpenRackConfigurator';
import WallCabinetConfigurator from '@/components/product/WallCabinetConfigurator';
import ModularCabinetConfigurator from '@/components/product/ModularCabinetConfigurator';
import { SpecificProductSelector } from '@/components/floorplan/SpecificProductSelector';
import { fetchProductById, fetchProductsByParentSeriesId } from '@/api/products';

const EnhancedProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { addItem } = useRFQ();

  const [activeTab, setActiveTab] = useState('photos');
  const [loading, setLoading] = useState(true);
  const [series, setSeries] = useState<any>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  const [selectedFinish, setSelectedFinish] = useState<string>('PC');
  const [selectedModularConfiguration, setSelectedModularConfiguration] = useState<any>(null);
  const [currentAssets, setCurrentAssets] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    fetchProductData(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchProductData = async (productId: string) => {
    try {
      setLoading(true);
      const product = await fetchProductById(productId);
      setSeries(product);

      if (product?.is_series_parent) {
        const variants = await fetchProductsByParentSeriesId(productId);
        setSeries({ ...product, variants });
        if (variants?.length > 0) setSelectedVariantId(variants[0].id);
      } else if (product?.parent_series_id) {
        try {
          const parentProduct = await fetchProductById(product.parent_series_id);
          const variants = await fetchProductsByParentSeriesId(product.parent_series_id);
          setSeries({ ...parentProduct, variants, is_series_parent: true });
          setSelectedVariantId(product.id);
        } catch {
          setSeries(product);
        }
      }
    } catch (error) {
      console.error('Error fetching product data:', error);
      toast.error('Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  const currentVariant = useMemo(
    () => series?.variants?.find((v: any) => v.id === selectedVariantId),
    [series, selectedVariantId]
  );

  const displayProduct = useMemo(() => currentVariant || series, [currentVariant, series]);

  const hasVariants = Boolean(series?.variants?.length);

  useEffect(() => {
    if (currentVariant) {
      setCurrentAssets({
        thumbnail: currentVariant.thumbnail_path,
        model: currentVariant.model_path,
        images: currentVariant.additional_images || [],
      });
    } else if (series) {
      setCurrentAssets({
        thumbnail: series.series_thumbnail_path || series.thumbnail_path,
        model: series.series_model_path || series.model_path,
        images: series.additional_images || [],
      });
    }
  }, [currentVariant, selectedFinish, series]);

  const handleVariantSelect = (variant: any) => setSelectedVariantId(variant.id);

  const handleAddToQuote = () => {
    if (!series) return;

    const finishText = selectedFinish === 'PC' ? 'Powder Coat' : 'Stainless Steel';

    const itemToAdd = {
      id: currentVariant ? currentVariant.id : series.id,
      name: currentVariant
        ? `${series.name} - ${currentVariant.dimensions || 'Standard'} - ${finishText}`
        : series.name,
      category: series.category,
      dimensions: currentVariant ? currentVariant.dimensions : series.dimensions || '',
      image: currentAssets?.thumbnail || series.series_thumbnail_path || series.thumbnail_path,
    };

    addItem(itemToAdd);
    toast.success(`${itemToAdd.name} added to quote`);
  };

  const getDisplayImages = () => {
    if (currentAssets?.images?.length) return currentAssets.images;
    if (currentAssets?.thumbnail) return [currentAssets.thumbnail];
    return [];
  };

  const getProductDescription = () => {
    if (currentVariant?.description) return currentVariant.description;
    if (series?.description) return series.description;
    return 'High-quality laboratory furniture designed for professional environments, offering durability and functionality for modern laboratory applications.';
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container-custom py-8 pt-20">
        {/* Breadcrumb */}
        <AnimatedSection animation="fade-in" delay={100}>
          <div className="flex items-center gap-2 mb-8">
            <Link to="/products" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to Catalog
            </Link>
          </div>
        </AnimatedSection>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column - Photos/3D Model Toggle */}
          <div className="space-y-6">
            <AnimatedSection animation="slide-in-left" delay={200}>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6 h-12">
                  <TabsTrigger value="photos" className="flex items-center gap-2 text-sm font-medium">
                    <Camera className="w-4 h-4" />
                    Photos
                  </TabsTrigger>
                  <TabsTrigger value="3d" className="flex items-center gap-2 text-sm font-medium">
                    <Box className="w-4 h-4" />
                    3D Model
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="photos" className="mt-0">
                  <div className="rounded-xl overflow-hidden border shadow-sm">
                    <ProductImageGallery
                      images={getDisplayImages()}
                      thumbnail={currentAssets?.thumbnail || ''}
                      productName={series.name}
                      className="w-full h-96 lg:h-[500px]"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="3d" className="mt-0">
                  <div className="rounded-xl overflow-hidden border shadow-sm">
                    <Enhanced3DViewerOptimized
                      modelPath={currentAssets?.model || ''}
                      className="w-full h-96 lg:h-[500px]"
                      productId={id}
                      preloadModels={
                        currentVariant?.model_path
                          ? [currentVariant.model_path]
                          : currentAssets?.model
                          ? [currentAssets.model]
                          : []
                      }
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </AnimatedSection>
          </div>

          {/* Right Column - Product Info */}
          <div className="space-y-6">
            {/* Product Header */}
            <AnimatedSection animation="slide-in-right" delay={300}>
              <div className="space-y-4">
                <h1 className="text-3xl lg:text-4xl font-bold text-foreground leading-tight">
                  {series.name}
                </h1>
                <Badge variant="outline" className="border-sea text-sea text-base px-4 py-2 font-medium">
                  <Building2 className="w-4 h-4 mr-2" />
                  {series.category}
                </Badge>
              </div>
            </AnimatedSection>

            {/* Product Overview */}
            <AnimatedSection animation="slide-in-right" delay={350}>
              <Card className="shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Package className="w-5 h-5 text-primary" />
                    Product Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed text-base">
                    {getProductDescription()}
                  </p>
                </CardContent>
              </Card>
            </AnimatedSection>

            {/* Add to Quote Button */}
            <AnimatedSection animation="slide-in-right" delay={400}>
              <Button
                onClick={handleAddToQuote}
                size="lg"
                className="w-full h-12 bg-sea hover:bg-sea-dark transition-all duration-300 hover:scale-[1.02] text-white font-semibold shadow-lg hover:shadow-xl"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Add to Quote
              </Button>
            </AnimatedSection>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedProductDetail;
