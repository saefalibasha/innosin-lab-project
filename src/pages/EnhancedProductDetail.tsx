
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, ShoppingCart, Package, Camera, Box, FileText } from 'lucide-react';
import { useRFQ } from '@/contexts/RFQContext';
import { toast } from 'sonner';
import Enhanced3DViewer from '@/components/Enhanced3DViewer';
import ProductImageGallery from '@/components/ProductImageGallery';
import AnimatedSection from '@/components/AnimatedSection';
import VariantSelector from '@/components/product/VariantSelector';
import { fetchSeriesWithVariants, getVariantAssetUrls } from '@/services/variantService';

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

  // Update assets when variant or finish changes
  useEffect(() => {
    if (currentVariant) {
      const assets = getVariantAssetUrls(currentVariant);
      // Update assets based on finish selection
      const finishSuffix = selectedFinish === 'SS' ? '-ss' : '';
      
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
      <div className="container-custom py-12 pt-20">
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
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="photos" className="flex items-center gap-2">
                    <Camera className="w-4 h-4" />
                    Photos
                  </TabsTrigger>
                  <TabsTrigger value="3d" className="flex items-center gap-2">
                    <Box className="w-4 h-4" />
                    3D Model
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="photos">
                  <ProductImageGallery
                    images={getDisplayImages()}
                    thumbnail={currentAssets?.thumbnail || ''}
                    productName={series.name}
                    className="w-full h-96 lg:h-[500px]"
                  />
                </TabsContent>

                <TabsContent value="3d">
                  <Enhanced3DViewer
                    modelPath={currentAssets?.model || ''}
                    className="w-full h-96 lg:h-[500px]"
                  />
                </TabsContent>
              </Tabs>
            </AnimatedSection>
          </div>

          {/* Right Column - Product Info */}
          <div className="space-y-6">
            <AnimatedSection animation="slide-in-right" delay={300}>
              <div>
                <Badge variant="outline" className="mb-4 border-sea text-sea">
                  {series.category}
                </Badge>
                <h1 className="text-4xl font-serif font-bold text-primary mb-4">
                  {series.name}
                </h1>
              </div>
            </AnimatedSection>

            {/* Variant Selection */}
            {isInnosinProduct && series.variants && series.variants.length > 0 && (
              <AnimatedSection animation="slide-in-right" delay={350}>
                <VariantSelector
                  variants={series.variants}
                  selectedVariantId={selectedVariantId}
                  onVariantChange={setSelectedVariantId}
                  selectedFinish={selectedFinish}
                  onFinishChange={setSelectedFinish}
                  groupByDimensions={true}
                />
              </AnimatedSection>
            )}

            {/* Product Overview */}
            <AnimatedSection animation="slide-in-right" delay={400}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Product Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {series.description || 'High-quality laboratory furniture designed for professional environments, offering durability and functionality for modern laboratory applications.'}
                  </p>
                </CardContent>
              </Card>
            </AnimatedSection>

            {/* Product Details */}
            <AnimatedSection animation="slide-in-right" delay={450}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Product Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Features & Benefits</h4>
                    <ul className="text-muted-foreground space-y-1">
                      <li>• Chemical-resistant construction for laboratory environments</li>
                      <li>• Professional laboratory grade materials and finishes</li>
                      <li>• Ergonomic design optimized for laboratory workflow</li>
                      <li>• Available in multiple configurations and sizes</li>
                      <li>• Meets stringent laboratory safety standards</li>
                      <li>• Easy to clean and maintain surfaces</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Technical Specifications</h4>
                    <ul className="text-muted-foreground space-y-1">
                      <li>• Finish Options: Powder Coat (PC) or Stainless Steel (SS)</li>
                      <li>• Construction: Heavy-duty steel frame with reinforced joints</li>
                      <li>• Mobility: Heavy-duty casters with locking mechanism</li>
                      <li>• Compliance: Meets laboratory furniture standards</li>
                      <li>• Warranty: Comprehensive manufacturer warranty included</li>
                    </ul>
                  </div>

                  {currentVariant && (
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">Current Selection</h4>
                      <div className="bg-muted p-3 rounded-lg">
                        <p className="text-sm">
                          <span className="font-medium">Product Code:</span> {currentVariant.product_code}
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">Dimensions:</span> {currentVariant.dimensions}
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">Finish:</span> {selectedFinish === 'PC' ? 'Powder Coat' : 'Stainless Steel'}
                        </p>
                        {currentVariant.orientation && currentVariant.orientation !== 'None' && (
                          <p className="text-sm">
                            <span className="font-medium">Orientation:</span> {currentVariant.orientation}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </AnimatedSection>

            <AnimatedSection animation="slide-in-right" delay={500}>
              <Button
                onClick={handleAddToQuote}
                size="lg"
                className="w-full bg-sea hover:bg-sea-dark transition-all duration-300 hover:scale-105"
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
