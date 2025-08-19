
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, ShoppingCart, Package, Camera, Box, FileText, Building2, Settings } from 'lucide-react';
import { useRFQ } from '@/contexts/RFQContext';
import { toast } from 'sonner';
import Enhanced3DViewer from '@/components/Enhanced3DViewer';
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
  const { productId } = useParams<{ productId: string }>();
  const { addItem } = useRFQ();
  const [activeTab, setActiveTab] = useState('photos');
  const [loading, setLoading] = useState(true);
  const [series, setSeries] = useState<any>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  const [selectedFinish, setSelectedFinish] = useState<string>('PC');
  const [selectedModularConfiguration, setSelectedModularConfiguration] = useState<any>(null);
  const [currentAssets, setCurrentAssets] = useState<any>(null);
  
  useEffect(() => {
    if (productId) {
      fetchProductData();
    }
  }, [productId]);

  const fetchProductData = async () => {
    try {
      setLoading(true);
      
      // Fetch the main product/series
      const product = await fetchProductById(productId!);
      setSeries(product);
      
      // If it's a series parent, fetch child products as variants
      if (product.is_series_parent) {
        const variants = await fetchProductsByParentSeriesId(productId!);
        setSeries({...product, variants});
        
        if (variants.length > 0) {
          setSelectedVariantId(variants[0].id);
        }
      } else if (product.parent_series_id) {
        // If this is a variant, fetch the parent and all siblings
        try {
          const parentProduct = await fetchProductById(product.parent_series_id);
          const variants = await fetchProductsByParentSeriesId(product.parent_series_id);
          setSeries({...parentProduct, variants, is_series_parent: true});
          setSelectedVariantId(product.id);
        } catch (error) {
          // If parent doesn't exist, treat as standalone product
          console.log('Parent product not found, treating as standalone');
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

  const currentVariant = series?.variants?.find((v: any) => v.id === selectedVariantId);
  const displayProduct = currentVariant || series;

  // Enhanced product type detection
  const getProductType = () => {
    if (!series && !displayProduct) return 'standard';
    
    const product = displayProduct || series;
    const productSeries = product?.product_series?.toLowerCase() || '';
    const category = product?.category?.toLowerCase() || '';
    const name = product?.name?.toLowerCase() || '';
    
    console.log('Product detection:', { productSeries, category, name, product });
    
    // UNIFLEX Taps detection
    if (productSeries.includes('uniflex') || 
        productSeries.includes('single way taps') || 
        name.includes('uniflex') ||
        product?.mixing_type || 
        product?.handle_type) {
      return 'uniflex';
    }
    
    // Emergency Shower detection
    if (productSeries.includes('emergency shower') || 
        name.includes('emergency shower') ||
        product?.emergency_shower_type) {
      return 'emergency_shower';
    }
    
    // Safe Aire II / Fume Hoods detection
    if (productSeries.includes('safe aire') || 
        productSeries.includes('fume hood') ||
        category.includes('fume') ||
        name.includes('fume hood') ||
        name.includes('safe aire') ||
        product?.mounting_type) {
      return 'fume_hood';
    }
    
    // Tall Cabinet detection
    if (productSeries.includes('tall cabinet') || name.includes('tall cabinet')) {
      return 'tall_cabinet';
    }
    
    // Open Rack detection
    if (productSeries.includes('open rack') || name.includes('open rack')) {
      return 'open_rack';
    }
    
    // Wall Cabinet detection
    if (productSeries.includes('wall cabinet') || name.includes('wall cabinet')) {
      return 'wall_cabinet';
    }
    
    // Modular Cabinet detection
    if (productSeries.includes('mobile cabinet') || 
        productSeries.includes('modular cabinet') ||
        name.includes('mobile cabinet') ||
        name.includes('modular cabinet')) {
      return 'modular_cabinet';
    }
    
    // Innosin Lab detection - more specific
    if (category.includes('innosin') || 
        productSeries.includes('innosin') ||
        product?.company_tags?.includes('Innosin Lab') ||
        productSeries.includes('mobile cabinet') ||
        productSeries.includes('knee space')) {
      return 'innosin_lab';
    }
    
    return 'standard';
  };

  const productType = getProductType();
  const hasVariants = series?.variants && series.variants.length > 0;
  const shouldShowConfigurator = hasVariants || productType !== 'standard';

  console.log('Configurator logic:', { 
    productType, 
    hasVariants, 
    shouldShowConfigurator, 
    variantCount: series?.variants?.length || 0 
  });

  // Update assets when variant or finish changes
  useEffect(() => {
    if (currentVariant) {
      setCurrentAssets({
        thumbnail: currentVariant.thumbnail_path,
        model: currentVariant.model_path,
        images: currentVariant.additional_images || []
      });
      
      console.log('Updated assets for variant:', currentVariant.id, 'with finish:', selectedFinish);
    } else if (series) {
      setCurrentAssets({
        thumbnail: series.series_thumbnail_path || series.thumbnail_path,
        model: series.series_model_path || series.model_path,
        images: series.additional_images || []
      });
    }
  }, [currentVariant, selectedFinish, series]);

  // Handle modular cabinet configuration selection
  const handleModularConfigurationSelect = (configuration: any) => {
    console.log('🎯 Modular configuration selected:', configuration);
    setSelectedModularConfiguration(configuration);
    
    // Set the first variant as the selected variant for display purposes
    if (configuration.variants && configuration.variants.length > 0) {
      setSelectedVariantId(configuration.variants[0].id);
    }
  };

  const handleVariantSelect = (variant: any) => {
    console.log('Variant selected:', variant);
    setSelectedVariantId(variant.id);
  };

  const handleAddToQuote = () => {
    if (!series) return;
    
    // For modular cabinets, use the selected configuration
    if (productType === 'modular_cabinet' && selectedModularConfiguration) {
      const finishText = selectedFinish === 'PC' ? 'Powder Coat' : 'Stainless Steel';
      
      const itemToAdd = {
        id: selectedModularConfiguration.variants[0]?.id || series.id,
        name: `${series.name} - ${selectedModularConfiguration.name} - ${finishText}`,
        category: series.category,
        dimensions: selectedModularConfiguration.dimensions || '',
        image: selectedModularConfiguration.variants[0]?.thumbnail_path || currentAssets?.thumbnail || series.series_thumbnail_path || series.thumbnail_path
      };
      
      addItem(itemToAdd);
      toast.success(`${itemToAdd.name} added to quote`);
      return;
    }
    
    // Use SS304 for Open Rack series, Stainless Steel for others
    const finishText = productType === 'open_rack' ? 
      (selectedFinish === 'PC' ? 'Powder Coat' : 'SS304') :
      (selectedFinish === 'PC' ? 'Powder Coat' : 'Stainless Steel');
    
    const itemToAdd = {
      id: currentVariant ? currentVariant.id : series.id,
      name: currentVariant ? 
        `${series.name} - ${currentVariant.dimensions || 'Standard'} - ${finishText}` : 
        series.name,
      category: series.category,
      dimensions: currentVariant ? currentVariant.dimensions : series.dimensions || '',
      image: currentAssets?.thumbnail || series.series_thumbnail_path || series.thumbnail_path
    };
    
    addItem(itemToAdd);
    toast.success(`${itemToAdd.name} added to quote`);
  };

  const getDisplayImages = () => {
    if (currentAssets?.images && currentAssets.images.length > 0) {
      return currentAssets.images;
    }
    if (currentAssets?.thumbnail) {
      return [currentAssets.thumbnail];
    }
    return [];
  };

  const getProductDescription = () => {
    if (currentVariant && currentVariant.description) {
      return currentVariant.description;
    }
    if (series?.description) {
      return series.description;
    }
    return 'High-quality laboratory furniture designed for professional environments, offering durability and functionality for modern laboratory applications.';
  };

  // Render the appropriate configurator
  const renderConfigurator = () => {
    if (!shouldShowConfigurator) return null;

    console.log('Rendering configurator for product type:', productType);

    // For UNIFLEX, Emergency Shower, and Fume Hood products, use SpecificProductSelector
    if (['uniflex', 'emergency_shower', 'fume_hood'].includes(productType)) {
      const variants = hasVariants ? series.variants : [displayProduct];
      return (
        <SpecificProductSelector
          products={variants}
          selectedProduct={currentVariant || displayProduct}
          onProductSelect={handleVariantSelect}
        />
      );
    }
    
    // For modular cabinets
    if (productType === 'modular_cabinet') {
      return (
        <ModularCabinetConfigurator
          variants={series.variants.map(v => ({
            id: v.id,
            name: v.name,
            product_code: v.product_code,
            dimensions: v.dimensions,
            finish_type: v.finish_type,
            orientation: v.orientation || 'None',
            door_type: v.door_type || '',
            drawer_count: v.drawer_count || 0,
            thumbnail_path: v.thumbnail_path,
            model_path: v.model_path,
            additional_images: v.additional_images || []
          }))}
          selectedConfiguration={selectedModularConfiguration}
          onConfigurationSelect={handleModularConfigurationSelect}
        />
      );
    }
    
    // For tall cabinets
    if (productType === 'tall_cabinet') {
      return (
        <TallCabinetConfigurator
          variants={series.variants}
          selectedVariantId={selectedVariantId}
          onVariantChange={setSelectedVariantId}
          selectedFinish={selectedFinish}
          onFinishChange={setSelectedFinish}
        />
      );
    }
    
    // For open racks
    if (productType === 'open_rack') {
      return (
        <OpenRackConfigurator
          variants={series.variants}
          selectedVariantId={selectedVariantId}
          onVariantChange={setSelectedVariantId}
          selectedFinish={selectedFinish}
          onFinishChange={setSelectedFinish}
        />
      );
    }
    
    // For wall cabinets
    if (productType === 'wall_cabinet') {
      return (
        <WallCabinetConfigurator
          variants={series.variants.map(v => ({
            id: v.id,
            product_code: v.product_code,
            name: v.name,
            dimensions: v.dimensions,
            finish_type: v.finish_type,
            orientation: v.orientation || 'None',
            door_type: v.door_type,
            thumbnail_path: v.thumbnail_path,
            model_path: v.model_path,
            additional_images: v.additional_images || []
          }))}
          onConfigurationSelect={(config) => {
            if (config.variants && config.variants.length > 0) {
              setSelectedVariantId(config.variants[0].id);
            }
          }}
        />
      );
    }
    
    // Innosin Lab specific configurator
    if (productType === 'innosin_lab' && hasVariants) {
      return (
        <InnosinLabConfigurator
          variants={series.variants}
          selectedVariantId={selectedVariantId}
          onVariantChange={setSelectedVariantId}
          selectedFinish={selectedFinish}
          onFinishChange={setSelectedFinish}
          seriesName={series.product_series}
        />
      );
    }
    
    // Default fallback - use generic VariantSelector
    if (hasVariants) {
      return (
        <VariantSelector
          variants={series.variants}
          selectedVariantId={selectedVariantId}
          onVariantChange={setSelectedVariantId}
          selectedFinish={selectedFinish}
          onFinishChange={setSelectedFinish}
          seriesSlug={series.series_slug}
          seriesName={series.product_series}
        />
      );
    }
    
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!series) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Product not found</h1>
          <Link to="/products">
            <Button>Back to Catalog</Button>
          </Link>
        </div>
      </div>
    );
  }

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
                    {productType === 'innosin_lab' ? (
                      <Enhanced3DViewerOptimized
                        modelPath={currentAssets?.model || ''}
                        className="w-full h-96 lg:h-[500px]"
                        productId={productId}
                        preloadModels={series?.variants?.map(v => v.model_path).filter(Boolean) || []}
                      />
                    ) : (
                      <Enhanced3DViewer
                        modelPath={currentAssets?.model || ''}
                        className="w-full h-96 lg:h-[500px]"
                        productId={productId}
                      />
                    )}
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
                {/* Debug info */}
                <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                  <p>Product Type: {productType}</p>
                  <p>Has Variants: {hasVariants ? 'Yes' : 'No'} ({series?.variants?.length || 0})</p>
                  <p>Should Show Configurator: {shouldShowConfigurator ? 'Yes' : 'No'}</p>
                </div>
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

            {/* Product Configuration */}
            {shouldShowConfigurator && (
              <AnimatedSection animation="slide-in-right" delay={400}>
                <Card className="shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Settings className="w-5 h-5 text-primary" />
                      Product Configuration
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {renderConfigurator()}
                  </CardContent>
                </Card>
              </AnimatedSection>
            )}

            {/* Technical Specifications */}
            <AnimatedSection animation="slide-in-right" delay={450}>
              <Card className="shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <FileText className="w-5 h-5 text-primary" />
                    Technical Specifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-foreground mb-3 text-base">Key Features</h4>
                    <ul className="text-muted-foreground space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-sea rounded-full mt-2 flex-shrink-0"></span>
                        Chemical-resistant construction for laboratory environments
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-sea rounded-full mt-2 flex-shrink-0"></span>
                        Professional laboratory grade materials and finishes
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-sea rounded-full mt-2 flex-shrink-0"></span>
                        Ergonomic design optimized for laboratory workflow
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-sea rounded-full mt-2 flex-shrink-0"></span>
                        Available in multiple configurations and sizes
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-sea rounded-full mt-2 flex-shrink-0"></span>
                        Meets stringent laboratory safety standards
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-foreground mb-3 text-base">Construction Details</h4>
                    <ul className="text-muted-foreground space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-sea rounded-full mt-2 flex-shrink-0"></span>
                        {productType === 'open_rack' ? 
                          'Finish Options: Powder Coat (PC) or SS304' :
                          'Finish Options: Powder Coat (PC) or Stainless Steel (SS)'
                        }
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-sea rounded-full mt-2 flex-shrink-0"></span>
                        Heavy-duty steel frame with reinforced joints
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-sea rounded-full mt-2 flex-shrink-0"></span>
                        Heavy-duty casters with locking mechanism
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-sea rounded-full mt-2 flex-shrink-0"></span>
                        Comprehensive manufacturer warranty included
                      </li>
                    </ul>
                  </div>

                  {/* Current Selection - Show for modular cabinets too */}
                  {(currentVariant || selectedModularConfiguration) && productType !== 'open_rack' && (
                    <div className="bg-muted/30 p-4 rounded-lg border">
                      <h4 className="font-semibold text-foreground mb-3 text-base">Current Selection</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        {productType === 'modular_cabinet' && selectedModularConfiguration ? (
                          <>
                            <div>
                              <span className="font-medium text-foreground">Configuration:</span>
                              <p className="text-muted-foreground">{selectedModularConfiguration.name}</p>
                            </div>
                            <div>
                              <span className="font-medium text-foreground">Dimensions:</span>
                              <p className="text-muted-foreground">{selectedModularConfiguration.dimensions}</p>
                            </div>
                            <div>
                              <span className="font-medium text-foreground">Finish:</span>
                              <p className="text-muted-foreground">{selectedFinish === 'PC' ? 'Powder Coat' : 'Stainless Steel'}</p>
                            </div>
                            <div>
                              <span className="font-medium text-foreground">Variants:</span>
                              <p className="text-muted-foreground">{selectedModularConfiguration.variants.length} option(s)</p>
                            </div>
                          </>
                        ) : currentVariant ? (
                          <>
                            <div>
                              <span className="font-medium text-foreground">Product Code:</span>
                              <p className="text-muted-foreground">{currentVariant.product_code}</p>
                            </div>
                            <div>
                              <span className="font-medium text-foreground">Dimensions:</span>
                              <p className="text-muted-foreground">{currentVariant.dimensions}</p>
                            </div>
                            <div>
                              <span className="font-medium text-foreground">Finish:</span>
                              <p className="text-muted-foreground">{selectedFinish === 'PC' ? 'Powder Coat' : 'Stainless Steel'}</p>
                            </div>
                            {currentVariant.door_type && (
                              <div>
                                <span className="font-medium text-foreground">Door Type:</span>
                                <p className="text-muted-foreground">{currentVariant.door_type}</p>
                              </div>
                            )}
                            {currentVariant.orientation && currentVariant.orientation !== 'None' && (
                              <div>
                                <span className="font-medium text-foreground">Orientation:</span>
                                <p className="text-muted-foreground">{currentVariant.orientation}</p>
                              </div>
                            )}
                          </>
                        ) : null}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </AnimatedSection>

            {/* Add to Quote Button */}
            <AnimatedSection animation="slide-in-right" delay={500}>
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
