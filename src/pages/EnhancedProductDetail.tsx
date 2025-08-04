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
import UniversalConfigurator from '@/components/product/UniversalConfigurator';
import { fetchProductById, fetchProductsByParentSeriesId } from '@/api/products';

const EnhancedProductDetail = () => {
  const { productId } = useParams<{ productId: string }>();
  const { addItem } = useRFQ();
  const [activeTab, setActiveTab] = useState('photos');
  const [loading, setLoading] = useState(true);
  const [series, setSeries] = useState<any>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  const [selectedFinish, setSelectedFinish] = useState<string>('PC');
  const [selectedUniversalConfiguration, setSelectedUniversalConfiguration] = useState<any>(null);
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

  // Handle universal configuration selection
  const handleUniversalConfigurationSelect = (configuration: any) => {
    console.log('🎯 Universal configuration selected:', configuration);
    setSelectedUniversalConfiguration(configuration);
    
    // Set the first variant as the selected variant for display purposes
    if (configuration.variants && configuration.variants.length > 0) {
      setSelectedVariantId(configuration.variants[0].id);
      
      // Update finish based on the selected variant
      const selectedVariant = configuration.variants[0];
      if (selectedVariant.finish_type) {
        const finishType = selectedVariant.finish_type === 'SS304' ? 'SS' : selectedVariant.finish_type;
        setSelectedFinish(finishType);
      }
    }
  };

  const handleAddToQuote = () => {
    if (!series) return;
    
    // For products with universal configuration, use the selected configuration
    if (isInnosinProduct && selectedUniversalConfiguration) {
      const selectedTerms = selectedUniversalConfiguration.terms;
      const finishText = selectedTerms.finish_type === 'PC' ? 'Powder Coat' : 
                        selectedTerms.finish_type === 'SS' ? 'Stainless Steel' : 'Standard';
      
      let configName = '';
      if (selectedTerms.dimensions) configName += selectedTerms.dimensions;
      if (selectedTerms.door_type) configName += ` ${selectedTerms.door_type}`;
      if (selectedTerms.orientation && selectedTerms.orientation !== 'None') configName += ` (${selectedTerms.orientation})`;
      if (selectedTerms.drawer_count && selectedTerms.drawer_count !== '0') {
        const count = parseInt(selectedTerms.drawer_count);
        configName += ` - ${count} Drawer${count > 1 ? 's' : ''}`;
      }
      
      const itemToAdd = {
        id: selectedUniversalConfiguration.variants[0]?.id || series.id,
        name: `${series.name}${configName ? ` - ${configName}` : ''} - ${finishText}`,
        category: series.category,
        dimensions: selectedTerms.dimensions || '',
        image: selectedUniversalConfiguration.variants[0]?.thumbnail_path || currentAssets?.thumbnail || series.series_thumbnail_path || series.thumbnail_path
      };
      
      addItem(itemToAdd);
      toast.success(`${itemToAdd.name} added to quote`);
      return;
    }
    
    // Use SS304 for Open Rack series, Stainless Steel for others
    const isOpenRackSeries = series?.product_series?.toLowerCase().includes('open rack');
    const finishText = isOpenRackSeries ? 
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
                    <UniversalConfigurator
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
                      selectedConfiguration={selectedUniversalConfiguration}
                      onConfigurationSelect={handleUniversalConfigurationSelect}
                    />
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
                        {series?.product_series?.toLowerCase().includes('open rack') ? 
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

                  {/* Current Selection - Show for configured products */}
                  {(currentVariant || selectedUniversalConfiguration) && (
                    <div className="bg-muted/30 p-4 rounded-lg border">
                      <h4 className="font-semibold text-foreground mb-3 text-base">Current Selection</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        {selectedUniversalConfiguration ? (
                          <>
                            {selectedUniversalConfiguration.terms.dimensions && (
                              <div>
                                <span className="font-medium text-foreground">Dimensions:</span>
                                <p className="text-muted-foreground">{selectedUniversalConfiguration.terms.dimensions}</p>
                              </div>
                            )}
                            {selectedUniversalConfiguration.terms.finish_type && (
                              <div>
                                <span className="font-medium text-foreground">Finish:</span>
                                <p className="text-muted-foreground">
                                  {selectedUniversalConfiguration.terms.finish_type === 'PC' ? 'Powder Coat' : 
                                   selectedUniversalConfiguration.terms.finish_type === 'SS' ? 
                                     (series?.product_series?.toLowerCase().includes('open rack') ? 'SS304' : 'Stainless Steel') : 
                                   selectedUniversalConfiguration.terms.finish_type}
                                </p>
                              </div>
                            )}
                            {selectedUniversalConfiguration.terms.door_type && (
                              <div>
                                <span className="font-medium text-foreground">Door Type:</span>
                                <p className="text-muted-foreground">{selectedUniversalConfiguration.terms.door_type}</p>
                              </div>
                            )}
                            {selectedUniversalConfiguration.terms.orientation && selectedUniversalConfiguration.terms.orientation !== 'None' && (
                              <div>
                                <span className="font-medium text-foreground">Orientation:</span>
                                <p className="text-muted-foreground">
                                  {selectedUniversalConfiguration.terms.orientation === 'LH' ? 'Left Hand' : 
                                   selectedUniversalConfiguration.terms.orientation === 'RH' ? 'Right Hand' : 
                                   selectedUniversalConfiguration.terms.orientation}
                                </p>
                              </div>
                            )}
                            {selectedUniversalConfiguration.terms.drawer_count && selectedUniversalConfiguration.terms.drawer_count !== '0' && (
                              <div>
                                <span className="font-medium text-foreground">Drawers:</span>
                                <p className="text-muted-foreground">
                                  {selectedUniversalConfiguration.terms.drawer_count} drawer{parseInt(selectedUniversalConfiguration.terms.drawer_count) > 1 ? 's' : ''}
                                </p>
                              </div>
                            )}
                            <div>
                              <span className="font-medium text-foreground">Variants:</span>
                              <p className="text-muted-foreground">{selectedUniversalConfiguration.variants.length} option(s)</p>
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
                              <p className="text-muted-foreground">
                                {selectedFinish === 'PC' ? 'Powder Coat' : 
                                 series?.product_series?.toLowerCase().includes('open rack') ? 'SS304' : 'Stainless Steel'}
                              </p>
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
