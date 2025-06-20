
import React, { useState } from 'react';
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
import { products } from '@/data/products';
import { productPageContent } from '@/data/productPageContent';

const ProductDetail = () => {
  const { productId } = useParams<{ productId: string }>();
  const { addItem } = useRFQ();
  const [activeTab, setActiveTab] = useState('photos');
  
  const product = products.find(p => p.id === productId);

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
    addItem({
      id: product.id,
      name: product.name,
      category: product.category,
      dimensions: product.dimensions,
      image: product.thumbnail
    });
    toast.success(`${product.name} ${productPageContent.productDetail.addToQuoteSuccess}`);
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
                    images={product.images}
                    thumbnail={product.thumbnail}
                    productName={product.name}
                    className="w-full h-96 lg:h-[500px]"
                  />
                </TabsContent>

                <TabsContent value="3d">
                  <Enhanced3DViewer
                    modelPath={product.modelPath}
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
                  <span>{productPageContent.productDetail.dimensionsLabel} {product.dimensions}</span>
                </div>
              </div>
            </AnimatedSection>

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
