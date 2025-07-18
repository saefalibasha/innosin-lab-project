
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
import ProductFinishToggle from '@/components/ProductFinishToggle';
import ProductSizeSelector from '@/components/ProductSizeSelector';
import ProductTypeSelector from '@/components/ProductTypeSelector';
import ProductOrientationSelector from '@/components/ProductOrientationSelector';
import { products } from '@/data/products';
import { productPageContent } from '@/data/productPageContent';

const ProductDetail = () => {
  const { productId } = useParams<{ productId: string }>();
  const { addItem } = useRFQ();
  const [activeTab, setActiveTab] = useState('photos');
  const [selectedFinish, setSelectedFinish] = useState<string>('powder-coat');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedOrientation, setSelectedOrientation] = useState<'LH' | 'RH' | 'None'>('None');
  const [selectedVariant, setSelectedVariant] = useState<string>('');
  
  const product = products.find(p => p.id === productId);
  
  // Get unique types and orientations from variants
  const availableTypes = product?.variants ? 
    [...new Set(product.variants.map(v => v.type || 'Default').filter(Boolean))] : [];
  
  const getAvailableOrientations = (type: string): ('LH' | 'RH')[] => {
    if (!product?.variants) return [];
    const typeVariants = product.variants.filter(v => (v.type || 'Default') === type);
    const orientations = typeVariants
      .map(v => v.orientation)
      .filter((o): o is 'LH' | 'RH' => o === 'LH' || o === 'RH');
    return [...new Set(orientations)];
  };

  const getFilteredVariants = () => {
    if (!product?.variants) return [];
    let filtered = product.variants.filter(v => (v.type || 'Default') === selectedType);
    
    if (selectedOrientation !== 'None') {
      filtered = filtered.filter(v => v.orientation === selectedOrientation);
    }
    
    return filtered;
  };

  // Initialize selections when product changes
  useEffect(() => {
    if (product && product.variants && product.variants.length > 0) {
      // Set first available type
      if (availableTypes.length > 0 && !selectedType) {
        setSelectedType(availableTypes[0]);
      } else if (availableTypes.length === 0 && product.variants.length > 0) {
        // Fallback for products without types
        setSelectedVariant(product.variants[0].id);
      }
    }
  }, [product, availableTypes, selectedType]);

  // Update orientation when type changes
  useEffect(() => {
    if (selectedType) {
      const orientations = getAvailableOrientations(selectedType);
      if (orientations.length > 0) {
        setSelectedOrientation(orientations[0]);
      } else {
        setSelectedOrientation('None');
      }
    }
  }, [selectedType]);

  // Update variant when type or orientation changes
  useEffect(() => {
    const filteredVariants = getFilteredVariants();
    if (filteredVariants.length > 0) {
      setSelectedVariant(filteredVariants[0].id);
    }
  }, [selectedType, selectedOrientation]);
  
  // Get current variant data for display
  const currentVariant = product?.variants?.find(v => v.id === selectedVariant);
  const isInnosinProduct = product?.category === 'Innosin Lab';

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">{productPageContent.productDetail.productNotFoundTitle}</h1>
          <Link to="/products">
            <Button>{productPageContent.productDetail.backToCatalogButton}</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleAddToQuote = () => {
    const itemToAdd = {
      id: currentVariant ? currentVariant.id : product.id,
      name: isInnosinProduct && currentVariant ? 
        `${product.name} - ${currentVariant.size}` : 
        product.name,
      category: product.category,
      dimensions: currentVariant ? currentVariant.dimensions : product.dimensions,
      image: currentVariant ? currentVariant.thumbnail : product.thumbnail
    };
    
    addItem(itemToAdd);
    toast.success(`${itemToAdd.name} ${productPageContent.productDetail.addToQuoteSuccess}`);
  };

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
                    images={currentVariant ? currentVariant.images : product.images}
                    thumbnail={currentVariant ? currentVariant.thumbnail : product.thumbnail}
                    productName={product.name}
                    className="w-full h-96 lg:h-[500px]"
                  />
                </TabsContent>

                <TabsContent value="3d">
                  <Enhanced3DViewer
                    modelPath={currentVariant ? currentVariant.modelPath : product.modelPath}
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
                  {product.category}
                </Badge>
                <h1 className="text-4xl font-serif font-bold text-primary mb-4">
                  {product.name}
                </h1>
                <div className="flex items-center gap-2 text-muted-foreground mb-6">
                  <Ruler className="w-4 h-4" />
                  <span>{productPageContent.productDetail.dimensionsLabel} {currentVariant ? currentVariant.dimensions : product.dimensions}</span>
                </div>
              </div>
            </AnimatedSection>

            {/* Innosin Lab Product Configuration */}
            {isInnosinProduct && (product.finishes || product.variants) && (
              <AnimatedSection animation="slide-in-right" delay={350}>
                <Card>
                  <CardHeader>
                    <CardTitle>Product Configuration</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {product.finishes && (
                      <ProductFinishToggle
                        finishes={product.finishes}
                        selectedFinish={selectedFinish}
                        onFinishChange={setSelectedFinish}
                      />
                    )}
                    {product.variants && (
                      <>
                        {availableTypes.length > 0 ? (
                          <>
                            <ProductTypeSelector
                              types={availableTypes}
                              selectedType={selectedType}
                              onTypeChange={setSelectedType}
                            />
                            {selectedType && (
                              <ProductOrientationSelector
                                orientations={getAvailableOrientations(selectedType)}
                                selectedOrientation={selectedOrientation}
                                onOrientationChange={setSelectedOrientation}
                              />
                            )}
                            {selectedType && (
                              <ProductSizeSelector
                                variants={getFilteredVariants()}
                                selectedVariant={selectedVariant}
                                onVariantChange={setSelectedVariant}
                              />
                            )}
                          </>
                        ) : (
                          <ProductSizeSelector
                            variants={product.variants}
                            selectedVariant={selectedVariant}
                            onVariantChange={setSelectedVariant}
                          />
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
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
                    {product.fullDescription}
                  </p>
                </CardContent>
              </Card>
            </AnimatedSection>

            {/* Only show specifications for non-Innosin Lab products */}
            {!isInnosinProduct && product.specifications && product.specifications.length > 0 && (
              <AnimatedSection animation="slide-in-right" delay={500}>
                <Card>
                  <CardHeader>
                    <CardTitle>{productPageContent.productDetail.specificationsTitle}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {product.specifications.map((spec, index) => (
                        <Badge key={index} variant="secondary">
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </AnimatedSection>
            )}

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

export default ProductDetail;
