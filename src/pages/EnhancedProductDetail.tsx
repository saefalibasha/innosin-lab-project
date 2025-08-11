
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Download, Share2, ShoppingCart, Eye } from 'lucide-react';
import { Product } from '@/types/product';
import ProductImageGallery from '@/components/ProductImageGallery';
import ProductModel3D from '@/components/ProductModel3D';
import { SpecificProductSelector } from '@/components/floorplan/SpecificProductSelector';
import ProductVariantSelector from '@/components/ProductVariantSelector';
import { fetchProductsBySeriesName } from '@/services/productSeriesService';
import { useToast } from '@/hooks/use-toast';

const EnhancedProductDetail = () => {
  const { seriesName } = useParams<{ seriesName: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModel, setShowModel] = useState(false);

  useEffect(() => {
    const loadProducts = async () => {
      if (!seriesName) {
        setError('No series specified');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const decodedSeriesName = decodeURIComponent(seriesName);
        const seriesProducts = await fetchProductsBySeriesName(decodedSeriesName);
        
        if (seriesProducts.length === 0) {
          setError('No products found for this series');
          return;
        }
        
        setProducts(seriesProducts);
        setSelectedProduct(seriesProducts[0]);
      } catch (err) {
        console.error('Error loading product series:', err);
        setError('Failed to load product details');
        toast({
          title: "Error",
          description: "Failed to load product details. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [seriesName, toast]);

  const handleAddToQuote = () => {
    if (!selectedProduct) return;
    
    toast({
      title: "Added to Quote",
      description: `${selectedProduct.name} has been added to your quote.`,
    });
  };

  const handleDownloadSpec = () => {
    if (!selectedProduct) return;
    
    toast({
      title: "Download Started",
      description: "Product specification sheet is being downloaded.",
    });
  };

  const handleShare = () => {
    if (navigator.share && selectedProduct) {
      navigator.share({
        title: selectedProduct.name,
        text: selectedProduct.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Copied",
        description: "Product link has been copied to clipboard.",
      });
    }
  };

  // Determine if this is a specialized series that needs SpecificProductSelector
  const isSpecializedSeries = products.length > 0 && (
    products.some(p => p.emergency_shower_type) ||
    products.some(p => p.mixing_type) ||
    products.some(p => p.mounting_type) ||
    products.some(p => p.cabinet_class)
  );

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3"></div>
          <span>Loading product details...</span>
        </div>
      </div>
    );
  }

  if (error || !selectedProduct) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-red-500 mb-4">{error || 'Product not found'}</p>
            <Button onClick={() => navigate('/products')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Catalog
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const productImages = [
    selectedProduct.thumbnail,
    ...(selectedProduct.images || [])
  ].filter(Boolean);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate('/products')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Catalog
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{selectedProduct.name}</h1>
          <p className="text-muted-foreground">{selectedProduct.category}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownloadSpec}>
            <Download className="w-4 h-4 mr-2" />
            Download Spec
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Left Column - Images and 3D Model */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Product Images</h3>
                {selectedProduct.modelPath && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowModel(!showModel)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    {showModel ? 'Show Images' : 'View 3D Model'}
                  </Button>
                )}
              </div>
              
              {showModel && selectedProduct.modelPath ? (
                <div className="aspect-square">
                  <ProductModel3D 
                    modelUrl={selectedProduct.modelPath}
                    productName={selectedProduct.name}
                  />
                </div>
              ) : (
                <ProductImageGallery
                  images={productImages}
                  productName={selectedProduct.name}
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Product Details */}
        <div className="space-y-6">
          {/* Product Info */}
          <Card>
            <CardHeader>
              <CardTitle>Product Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-muted-foreground">{selectedProduct.fullDescription}</p>
              </div>

              {selectedProduct.product_code && (
                <div>
                  <h4 className="font-medium mb-2">Product Code</h4>
                  <Badge variant="outline">{selectedProduct.product_code}</Badge>
                </div>
              )}

              {selectedProduct.dimensions && (
                <div>
                  <h4 className="font-medium mb-2">Dimensions</h4>
                  <p className="text-muted-foreground">{selectedProduct.dimensions}</p>
                </div>
              )}

              {selectedProduct.specifications && selectedProduct.specifications.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Specifications</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    {selectedProduct.specifications.map((spec, index) => (
                      <li key={index}>{spec}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="pt-4">
                <Button 
                  onClick={handleAddToQuote}
                  className="w-full"
                  size="lg"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Add to Quote
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Variant Selection */}
      {products.length > 1 && (
        <div className="mb-8">
          {isSpecializedSeries ? (
            <SpecificProductSelector
              products={products}
              selectedProduct={selectedProduct}
              onProductSelect={setSelectedProduct}
            />
          ) : (
            <ProductVariantSelector
              products={products}
              selectedProduct={selectedProduct}
              onProductSelect={setSelectedProduct}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default EnhancedProductDetail;
