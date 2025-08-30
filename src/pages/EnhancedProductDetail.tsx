
import React, { useState, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Plus, Minus, ShoppingCart, Download, Eye, Package } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { getProductById } from '@/data/products';
import ProductImageGallery from '@/components/ProductImageGallery';
import ProductSpecifications from '@/components/ProductSpecifications';
import ThreeDModel from '@/components/ThreeDModel';
import { useRFQ } from '@/contexts/RFQContext';
import HeroNavigation from '@/components/HeroNavigation';
import Footer from '@/components/Footer';
import { Product } from '@/types/product';

const EnhancedProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'details' | 'specs' | '3d'>('details');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { addItem } = useRFQ();

  React.useEffect(() => {
    if (id) {
      const foundProduct = getProductById(id);
      if (foundProduct) {
        setProduct(foundProduct);
      }
      setLoading(false);
    }
  }, [id]);

  const handleAddToRFQ = () => {
    if (!product) return;
    
    addItem({
      id: product.id,
      name: product.name,
      category: product.category,
      dimensions: product.dimensions,
      image: product.thumbnail || product.images[0] || '/placeholder-product.jpg'
    });

    toast({
      title: "Added to RFQ",
      description: `${product.name} has been added to your request for quotation.`,
    });
  };

  const handleViewRFQ = () => {
    navigate('/rfq');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <HeroNavigation />
        <div className="flex-grow pt-20 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <HeroNavigation />
        <div className="flex-grow pt-20 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Product Not Found</h1>
            <p className="text-muted-foreground mb-4">The product you're looking for doesn't exist.</p>
            <Button onClick={() => navigate('/products')}>Browse Products</Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const imageUrl = product.thumbnail || product.images[0] || '/placeholder-product.jpg';
  const fallbackImage = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = '/placeholder-product.jpg';
  };

  return (
    <div className="min-h-screen flex flex-col">
      <HeroNavigation />
      
      <main className="flex-grow pt-20">
        <div className="container mx-auto px-4 py-8">
          {/* Back Navigation */}
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Button>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Left Column - Images and 3D */}
            <div className="space-y-6">
              {/* Tab Navigation */}
              <div className="flex space-x-1 bg-muted p-1 rounded-lg">
                <button
                  onClick={() => setActiveTab('details')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'details' 
                      ? 'bg-background text-foreground shadow-sm' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Eye className="inline mr-2 h-4 w-4" />
                  Images
                </button>
                <button
                  onClick={() => setActiveTab('3d')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    activeTab === '3d' 
                      ? 'bg-background text-foreground shadow-sm' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Package className="inline mr-2 h-4 w-4" />
                  3D Model
                </button>
              </div>

              {/* Content based on active tab */}
              {activeTab === 'details' && (
                <ProductImageGallery
                  thumbnail={product.thumbnail}
                  images={product.images}
                  productName={product.name}
                />
              )}

              {activeTab === '3d' && (
                <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                  <Suspense fallback={
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  }>
                    <ThreeDModel modelPath={product.modelPath} />
                  </Suspense>
                </div>
              )}
            </div>

            {/* Right Column - Product Details */}
            <div className="space-y-6">
              {/* Product Header */}
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-foreground">{product.name}</h1>
                    <p className="text-lg text-muted-foreground mt-1">{product.category}</p>
                  </div>
                  <Badge variant="secondary" className="text-sm">
                    {product.category}
                  </Badge>
                </div>

                <div className="flex items-center gap-4">
                  <Badge variant="outline">ID: {product.id}</Badge>
                  {product.dimensions && (
                    <Badge variant="outline">{product.dimensions}</Badge>
                  )}
                </div>
              </div>

              <Separator />

              {/* Description */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Description</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {product.fullDescription || product.description}
                </p>
              </div>

              {/* Features */}
              {product.company_tags && product.company_tags.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Features</h3>
                  <ul className="space-y-2">
                    {product.company_tags.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <Separator />

              {/* Quantity and Actions */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium">Quantity:</label>
                  <div className="flex items-center border rounded-md">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-1"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="px-4 py-2 min-w-[3rem] text-center">{quantity}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-3 py-1"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button 
                    onClick={handleAddToRFQ}
                    className="flex-1"
                    size="lg"
                  >
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Add to RFQ
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleViewRFQ}
                    size="lg"
                  >
                    View RFQ
                  </Button>
                </div>

                <Button variant="outline" className="w-full" size="lg">
                  <Download className="mr-2 h-4 w-4" />
                  Download Datasheet
                </Button>
              </div>

              <Separator />

              {/* Additional Information */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-foreground">Category:</span>
                  <p className="text-muted-foreground">{product.category}</p>
                </div>
                {product.category && (
                  <div>
                    <span className="font-medium text-foreground">Company:</span>
                    <p className="text-muted-foreground">{product.category}</p>
                  </div>
                )}
                {product.dimensions && (
                  <div>
                    <span className="font-medium text-foreground">Dimensions:</span>
                    <p className="text-muted-foreground">{product.dimensions}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Specifications Section */}
          {activeTab === 'specs' && (
            <div className="mt-12">
              <Card>
                <CardHeader>
                  <CardTitle>Technical Specifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <ProductSpecifications 
                    specifications={product.specifications}
                    image={product.thumbnail || product.images[0] || '/placeholder-product.jpg'}
                  />
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default EnhancedProductDetail;
