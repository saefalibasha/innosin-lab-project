import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, ShoppingCart, Package, Ruler, Camera, Box } from 'lucide-react';
import { useRFQ } from '@/contexts/RFQContext';
import { toast } from 'sonner';
import Enhanced3DViewer from '@/components/Enhanced3DViewer';
import ProductImageGallery from '@/components/ProductImageGallery';
import AnimatedSection from '@/components/AnimatedSection';
import VariantSelector from '@/components/product/VariantSelector';
import { fetchSeriesWithVariants, getVariantAssetUrls } from '@/services/variantService';
import { productPageContent } from '@/data/productPageContent';

const EnhancedProductDetail = () => {
  const { productId } = useParams<{ productId: string }>();
  const { addItem } = useRFQ();
  const [activeTab, setActiveTab] = useState('photos');
  const [loading, setLoading] = useState(true);
  const [series, setSeries] = useState<any>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  
  useEffect(() => {
    if (productId) {
      fetchProductData();
    }
  }, [productId]);

  const fetchProductData = async () => {
    try {
      setLoading(true);
      
      // For now, we'll fetch all series and find the one that matches
      // In a real implementation, you'd fetch by series slug or ID
      const seriesData = await fetchSeriesWithVariants();
      const foundSeries = seriesData.find(s => 
        s.series_slug === productId || 
        s.id === productId ||
        s.variants.some(v => v.id === productId)
      );
      
      if (foundSeries) {
        setSeries(foundSeries);
        // Set the first variant as default if available
        if (foundSeries.variants && foundSeries.variants.length > 0) {
          setSelectedVariantId(foundSeries.variants[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching product data:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentVariant = series?.variants?.find((v: any) => v.id === selectedVariantId);
  const isInnosinProduct = series?.category === 'Innosin Lab';

  const handleAddToQuote = () => {
    if (!series) return;
    
    const itemToAdd = {
      id: currentVariant ? currentVariant.id : series.id,
      name: currentVariant ? 
        `${series.name} - ${currentVariant.dimensions || 'Standard'}` : 
        series.name,
      category: series.category,
      dimensions: currentVariant ? currentVariant.dimensions : series.dimensions,
      image: currentVariant ? currentVariant.thumbnail_path : series.series_thumbnail_path
    };
    
    addItem(itemToAdd);
    toast.success(`${itemToAdd.name} added to quote`);
  };

  // Get current display assets
  const currentAssets = currentVariant ? getVariantAssetUrls(currentVariant) : {
    thumbnail: series?.series_thumbnail_path,
    model: series?.series_model_path,
    images: []
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
              {productPageContent.productDetail.backToCatalog}
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
                    {productPageContent.productDetail.photosTab}
                  </TabsTrigger>
                  <TabsTrigger value="3d" className="flex items-center gap-2">
                    <Box className="w-4 h-4" />
                    {productPageContent.productDetail.modelTab}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="photos">
                  <ProductImageGallery
                    images={currentAssets.images?.length ? currentAssets.images : 
                            currentAssets.thumbnail ? [currentAssets.thumbnail] : []}
                    thumbnail={currentAssets.thumbnail || ''}
                    productName={series.name}
                    className="w-full h-96 lg:h-[500px]"
                  />
                </TabsContent>

                <TabsContent value="3d">
                  <Enhanced3DViewer
                    modelPath={currentAssets.model || ''}
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
                <div className="flex items-center gap-2 text-muted-foreground mb-6">
                  <Ruler className="w-4 h-4" />
                  <span>
                    {productPageContent.productDetail.dimensionsLabel} 
                    {currentVariant ? currentVariant.dimensions : 'Multiple sizes available'}
                  </span>
                </div>
              </div>
            </AnimatedSection>

            {/* Variant Selection */}
            {isInnosinProduct && series.variants && series.variants.length > 0 && (
              <AnimatedSection animation="slide-in-right" delay={350}>
                <VariantSelector
                  variants={series.variants}
                  selectedVariantId={selectedVariantId}
                  onVariantChange={setSelectedVariantId}
                  groupByDimensions={true}
                />
              </AnimatedSection>
            )}

            <AnimatedSection animation="slide-in-right" delay={400}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    {productPageContent.productDetail.overviewTitle}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {series.description || 'Product description not available.'}
                  </p>
                </CardContent>
              </Card>
            </AnimatedSection>

            <AnimatedSection animation="slide-in-right" delay={600}>
              <Button
                onClick={handleAddToQuote}
                size="lg"
                className="w-full bg-sea hover:bg-sea-dark transition-all duration-300 hover:scale-105"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                {productPageContent.productDetail.addToQuoteButton}
              </Button>
            </AnimatedSection>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedProductDetail;