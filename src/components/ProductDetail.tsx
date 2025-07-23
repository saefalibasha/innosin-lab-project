
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Download, ShoppingCart, Eye, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ProductImageGallery from '@/components/ProductImageGallery';
import ModelViewer from '@/components/ModelViewer';
import AnimatedSection from '@/components/AnimatedSection';
import { useRFQ } from '@/contexts/RFQContext';
import { toast } from 'sonner';
import { Product } from '@/types/product';
import { productPageContent } from '@/data/productPageContent';
import { usePerformanceLogger } from '@/hooks/usePerformanceLogger';
import { useProductById } from '@/hooks/useEnhancedProducts';
import { getWallCabinetVariants } from '@/services/variantService';
import MobileCabinetConfigurator from './product/MobileCabinetConfigurator';
import OpenRackConfigurator from './product/OpenRackConfigurator';
import TallCabinetConfigurator from './product/TallCabinetConfigurator';
import WallCabinetConfigurator from './product/WallCabinetConfigurator';

const ProductDetail: React.FC = () => {
  usePerformanceLogger('ProductDetail');
  const { id } = useParams<{ id: string }>();
  const { product, loading: productLoading, error } = useProductById(id);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [selectedFinish, setSelectedFinish] = useState<string>('PC');
  const [seriesVariants, setSeriesVariants] = useState<any[]>([]);
  
  // Enhanced loading state management
  const [variantsLoading, setVariantsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const { addItem } = useRFQ();

  // Load variants when product changes
  useEffect(() => {
    const loadVariants = async () => {
      if (!product?.id) return;
      
      console.log('🔍 Loading variants for product:', product.id);
      setVariantsLoading(true);
      
      try {
        if (product.category === 'Wall Cabinet') {
          const variants = await getWallCabinetVariants(product.id);
          console.log('✅ Loaded wall cabinet variants:', variants.length);
          setSeriesVariants(variants);
        } else {
          // For other product types, you might want to implement similar logic
          console.log('ℹ️ Product type not configured for variants:', product.category);
          setSeriesVariants([]);
        }
      } catch (error) {
        console.error('❌ Error loading variants:', error);
        setSeriesVariants([]);
      } finally {
        setVariantsLoading(false);
      }
    };

    loadVariants();
  }, [product?.id, product?.category]);

  // Handle variant selection from configurator
  const handleVariantSelect = (variant: any) => {
    console.log('🎯 Variant selected:', variant?.product_code);
    setSelectedVariant(variant);
  };

  // Handle add to quote
  const handleAddToQuote = () => {
    if (!product) return;
    
    const itemToAdd = selectedVariant || product;
    const displayName = selectedVariant 
      ? `${product.name} - ${selectedVariant.product_code} (${selectedFinish})`
      : `${product.name} (${selectedFinish})`;
    
    addItem({
      id: itemToAdd.id,
      name: displayName,
      category: product.category,
      dimensions: itemToAdd.dimensions || product.dimensions,
      image: itemToAdd.thumbnail_path || product.thumbnail
    });
    
    toast.success(`${displayName} added to quote`);
  };

  // Get the current display image
  const getCurrentImage = () => {
    if (selectedVariant?.thumbnail_path && !selectedVariant.thumbnail_path.includes('placeholder')) {
      return selectedVariant.thumbnail_path;
    }
    return product?.seriesOverviewImage || 
           product?.overviewImage || 
           product?.thumbnail || 
           '/placeholder.svg';
  };

  // Get the current model path
  const getCurrentModel = () => {
    if (selectedVariant?.model_path && !selectedVariant.model_path.includes('placeholder')) {
      return selectedVariant.model_path;
    }
    return product?.modelPath || '';
  };

  // Get current product images for gallery
  const getCurrentImages = () => {
    const images = [];
    const currentImage = getCurrentImage();
    
    if (currentImage) {
      images.push(currentImage);
    }
    
    // Add additional images if available
    if (selectedVariant?.additional_images && selectedVariant.additional_images.length > 0) {
      const additionalImages = selectedVariant.additional_images.filter(img => 
        img && !img.includes('placeholder') && img !== currentImage
      );
      images.push(...additionalImages);
    }
    
    return images.length > 0 ? images : ['/placeholder.svg'];
  };

  // Determine which configurator to use
  const getConfiguratorComponent = () => {
    if (!product) return null;
    
    const productSeries = product.product_series || product.category;
    
    if (productSeries.includes('Wall Cabinet') || product.category === 'Wall Cabinet') {
      return (
        <WallCabinetConfigurator
          variants={seriesVariants}
          selectedVariant={selectedVariant}
          onVariantSelect={handleVariantSelect}
          isLoading={variantsLoading}
        />
      );
    }
    
    // Add other configurators as needed
    return null;
  };

  // Loading state
  if (productLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="pt-20">
          <div className="container-custom py-12">
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading product details...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="pt-20">
          <div className="container-custom py-12">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-foreground mb-4">Error Loading Product</h1>
              <p className="text-muted-foreground mb-8">{error}</p>
              <Link to="/products">
                <Button variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Products
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Not found state
  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <div className="pt-20">
          <div className="container-custom py-12">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-foreground mb-4">Product Not Found</h1>
              <p className="text-muted-foreground mb-8">The product you're looking for doesn't exist.</p>
              <Link to="/products">
                <Button variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Products
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const images = getCurrentImages();
  const currentModel = getCurrentModel();

  return (
    <div className="min-h-screen bg-background">
      <div className="pt-20">
        <div className="container-custom py-8">
          {/* Breadcrumb */}
          <AnimatedSection animation="fade-in" delay={100}>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
              <Link to="/products" className="hover:text-foreground transition-colors">
                Products
              </Link>
              <span>/</span>
              <span className="text-foreground">
                {selectedVariant?.product_code || product.name}
              </span>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Product Images */}
            <AnimatedSection animation="slide-in-left" delay={200}>
              <div className="space-y-6">
                <ProductImageGallery
                  images={images}
                  thumbnail={getCurrentImage()}
                  productName={selectedVariant?.product_code || product.name}
                  className="w-full h-96 lg:h-[500px]"
                />
              </div>
            </AnimatedSection>

            {/* Product Details */}
            <AnimatedSection animation="slide-in-right" delay={300}>
              <div className="space-y-6">
                {/* Header */}
                <div>
                  <Badge variant="outline" className="mb-3 border-sea text-sea">
                    {product.category}
                  </Badge>
                  <h1 className="text-3xl font-serif font-bold text-primary mb-2">
                    {selectedVariant?.product_code || product.name}
                  </h1>
                  <p className="text-lg text-muted-foreground">
                    {selectedVariant?.dimensions || product.dimensions}
                  </p>
                </div>

                {/* Description */}
                <div>
                  <p className="text-muted-foreground leading-relaxed">
                    {product.fullDescription || product.description}
                  </p>
                </div>

                {/* Finish Selection */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">Finish</h3>
                  <Select value={selectedFinish} onValueChange={setSelectedFinish}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select finish" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PC">Powder Coat</SelectItem>
                      <SelectItem value="SS">Stainless Steel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  <Button 
                    onClick={handleAddToQuote}
                    className="flex-1 bg-sea hover:bg-sea-dark transition-all duration-300"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Add to Quote
                  </Button>
                  {currentModel && (
                    <Button variant="outline" className="flex-1">
                      <Eye className="w-4 h-4 mr-2" />
                      View 3D Model
                    </Button>
                  )}
                </div>
              </div>
            </AnimatedSection>
          </div>

          {/* Configurator */}
          {getConfiguratorComponent() && (
            <AnimatedSection animation="fade-in" delay={400}>
              <div className="mt-16">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="w-5 h-5" />
                      Product Configuration
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {getConfiguratorComponent()}
                  </CardContent>
                </Card>
              </div>
            </AnimatedSection>
          )}

          {/* 3D Model Section */}
          {currentModel && (
            <AnimatedSection animation="fade-in" delay={500}>
              <div className="mt-16">
                <Card>
                  <CardHeader>
                    <CardTitle>3D Model</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-96 bg-muted rounded-lg">
                      <ModelViewer modelPath={currentModel} />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </AnimatedSection>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
