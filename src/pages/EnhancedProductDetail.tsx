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
import ProductImageGallery from '@/components/ProductImageGallery';
import AnimatedSection from '@/components/AnimatedSection';
import VariantSelector from '@/components/product/VariantSelector';
import { fetchSeriesWithVariants, getVariantAssetUrls } from '@/services/variantService';
import TallCabinetConfigurator from '@/components/product/TallCabinetConfigurator';

const EnhancedProductDetail = () => {
  const { productId } = useParams<{ productId: string }>();
  const { addItem } = useRFQ();
  const [activeTab, setActiveTab] = useState('photos');
  const [loading, setLoading] = useState(true);
  const [series, setSeries] = useState<any>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  const [selectedFinish, setSelectedFinish] = useState<string>('PC');
  const [currentAssets, setCurrentAssets] = useState<any>(null);
  
  useEffect(() => {
    if (productId) {
      fetchProductData();
    }
  }, [productId]);

  const fetchProductData = async () => {
    try {
      setLoading(true);
      
      const seriesData = await fetchSeriesWithVariants();
      const foundSeries = seriesData.find(s => s.id === productId);
      
      if (foundSeries) {
        setSeries(foundSeries);
        if (foundSeries.variants && foundSeries.variants.length > 0) {
          setSelectedVariantId(foundSeries.variants[0].id);
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
  const isInnosinProduct = series?.category === 'Innosin Lab';
  const isTallCabinetSeries = series?.product_series?.toLowerCase().includes('tall cabinet');

  // Update assets when variant or finish changes
  useEffect(() => {
    if (currentVariant) {
      const assets = getVariantAssetUrls(currentVariant);
      
      setCurrentAssets({
        thumbnail: assets.thumbnail,
        model: assets.model,
        images: assets.images || []
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

  const handleAddToQuote = () => {
    if (!series) return;
    
    const itemToAdd = {
      id: currentVariant ? currentVariant.id : series.id,
      name: currentVariant ? 
        `${series.name} - ${currentVariant.dimensions || 'Standard'} - ${selectedFinish === 'PC' ? 'Powder Coat' : 'Stainless Steel'}` : 
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
                    <Enhanced3DViewer
                      modelPath={currentAssets?.model || ''}
                      className="w-full h-96 lg:h-[500px]"
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

            {/* Product Configuration */}
            {isInnosinProduct && series.variants && series.variants.length > 0 && (
              <AnimatedSection animation="slide-in-right" delay={400}>
                <Card className="shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Settings className="w-5 h-5 text-primary" />
                      Product Configuration
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isTallCabinetSeries ? (
                      <TallCabinetConfigurator
                        variants={series.variants}
                        selectedVariantId={selectedVariantId}
                        onVariantChange={setSelectedVariantId}
                        selectedFinish={selectedFinish}
                        onFinishChange={setSelectedFinish}
                      />
                    ) : (
                      <VariantSelector
                        variants={series.variants}
                        selectedVariantId={selectedVariantId}
                        onVariantChange={setSelectedVariantId}
                        selectedFinish={selectedFinish}
                        onFinishChange={setSelectedFinish}
                        groupByDimensions={true}
                      />
                    )}
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
                        Finish Options: Powder Coat (PC) or Stainless Steel (SS)
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

                  {currentVariant && (
                    <div className="bg-muted/30 p-4 rounded-lg border">
                      <h4 className="font-semibold text-foreground mb-3 text-base">Current Selection</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
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
