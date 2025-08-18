
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ShoppingCart, Package, FileText, Building2 } from 'lucide-react';
import { useRFQ } from '@/contexts/RFQContext';
import { toast } from 'sonner';
import AnimatedSection from '@/components/AnimatedSection';
import SeriesProductConfigurator from '@/components/product/SeriesProductConfigurator';
import ProductAssetViewer from '@/components/product/ProductAssetViewer';
import { useMissingModelsTracker } from '@/hooks/useMissingModelsTracker';
import { fetchProductById, fetchProductsByParentSeriesId } from '@/api/products';
import { Product } from '@/types/product';
import { detectSeriesType } from '@/utils/seriesUtils';

const ProductDetail = () => {
  const { productId } = useParams<{ productId: string }>();
  const { addItem } = useRFQ();
  const [loading, setLoading] = useState(true);
  const [series, setSeries] = useState<any>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  const [selectedFinish, setSelectedFinish] = useState<string>('PC');
  const [currentAssets, setCurrentAssets] = useState<any>(null);
  const { trackMissingModel } = useMissingModelsTracker();
  
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
  const hasVariants = series?.variants && series.variants.length > 0;
  const seriesType = detectSeriesType(series, series?.variants || []);

  // Update assets when variant or finish changes
  useEffect(() => {
    if (currentVariant) {
      setCurrentAssets({
        thumbnail: currentVariant.thumbnail_path,
        model: currentVariant.model_path,
        images: currentVariant.additional_images || []
      });
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
    
    // Use appropriate finish label based on series type
    const finishText = seriesType === 'open_rack' ? 
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
          {/* Left Column - Product Assets & Configuration */}
          <div className="space-y-6">
            {/* Product Asset Viewer */}
            <AnimatedSection animation="slide-in-left" delay={200}>
              <ProductAssetViewer
                currentAssets={currentAssets}
                productName={series.name}
                className="w-full"
                onMissingModel={trackMissingModel}
                productId={currentVariant?.id || series.id}
              />
            </AnimatedSection>

            {/* Universal Product Configuration */}
            {hasVariants && (
              <AnimatedSection animation="slide-in-left" delay={300}>
                <SeriesProductConfigurator
                  series={series}
                  variants={series.variants}
                  selectedVariantId={selectedVariantId}
                  onVariantChange={setSelectedVariantId}
                  selectedFinish={selectedFinish}
                  onFinishChange={setSelectedFinish}
                  className="w-full"
                />
              </AnimatedSection>
            )}
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

            {/* Technical Specifications */}
            <AnimatedSection animation="slide-in-right" delay={400}>
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
                        {seriesType === 'open_rack' ? 
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

                  {/* Current Selection */}
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
                          <p className="text-muted-foreground">{selectedFinish === 'PC' ? 'Powder Coat' : seriesType === 'open_rack' ? 'SS304' : 'Stainless Steel'}</p>
                        </div>
                        {currentVariant.door_type && (
                          <div>
                            <span className="font-medium text-foreground">Door Type:</span>
                            <p className="text-muted-foreground">{currentVariant.door_type}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </AnimatedSection>

            {/* Add to Quote Button */}
            <AnimatedSection animation="slide-in-right" delay={450}>
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

export default ProductDetail;
