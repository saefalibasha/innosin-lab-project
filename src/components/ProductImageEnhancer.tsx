
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Download, Image as ImageIcon, Loader2 } from 'lucide-react';
import { removeBackground, loadImage, cropAndEnhanceProductImage } from '@/utils/imageProcessing';
import { toast } from 'sonner';

const ProductImageEnhancer: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [enhancedImage, setEnhancedImage] = useState<string | null>(null);
  const [processingStep, setProcessingStep] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setOriginalImage(e.target?.result as string);
        setEnhancedImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const enhanceImage = async () => {
    if (!originalImage) return;

    setIsProcessing(true);
    setProcessingStep('Loading image...');

    try {
      // Create image element from original
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = originalImage;
      });

      setProcessingStep('Removing background...');
      
      // Remove background
      const backgroundRemovedBlob = await removeBackground(img);
      
      setProcessingStep('Cropping and enhancing...');
      
      // Load the background-removed image
      const bgRemovedImg = await loadImage(backgroundRemovedBlob);
      
      // Crop and enhance for product display
      const finalBlob = await cropAndEnhanceProductImage(bgRemovedImg);
      
      // Convert to data URL for display
      const reader = new FileReader();
      reader.onload = (e) => {
        setEnhancedImage(e.target?.result as string);
        setProcessingStep('');
        toast.success('Image enhanced successfully!');
      };
      reader.readAsDataURL(finalBlob);
      
    } catch (error) {
      console.error('Error enhancing image:', error);
      toast.error('Failed to enhance image. Please try again.');
      setProcessingStep('');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadEnhanced = () => {
    if (!enhancedImage) return;
    
    const link = document.createElement('a');
    link.href = enhancedImage;
    link.download = 'enhanced-product-image.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="w-6 h-6" />
            Product Image Enhancer
          </CardTitle>
          <p className="text-muted-foreground">
            Upload a product image to remove the background and optimize it for the catalog.
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* File Upload */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="w-full"
            >
              <Upload className="w-4 h-4 mr-2" />
              Select Product Image
            </Button>
          </div>

          {/* Image Preview */}
          {originalImage && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-2">Original Image</h3>
                <div className="border rounded-lg p-4 bg-gray-50">
                  <img
                    src={originalImage}
                    alt="Original"
                    className="w-full h-64 object-contain"
                  />
                </div>
              </div>
              
              {enhancedImage && (
                <div>
                  <h3 className="font-medium mb-2">Enhanced Image</h3>
                  <div className="border rounded-lg p-4 bg-white">
                    <img
                      src={enhancedImage}
                      alt="Enhanced"
                      className="w-full h-64 object-contain"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Processing Status */}
          {isProcessing && (
            <div className="flex items-center gap-2 text-blue-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{processingStep}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={enhanceImage}
              disabled={!originalImage || isProcessing}
              className="flex-1"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Enhance Image'
              )}
            </Button>
            
            {enhancedImage && (
              <Button
                onClick={downloadEnhanced}
                variant="outline"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Editing Instructions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>How to Edit Product Text</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Location:</h4>
            <code className="bg-gray-100 px-2 py-1 rounded text-sm">
              src/utils/productAssets.ts
            </code>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Oriental Giken Products (lines ~295-350):</h4>
            <div className="bg-gray-50 p-4 rounded border text-sm">
              <p><strong>BSC Product ID:</strong> og-bsc-001</p>
              <p><strong>Fume Hood Product ID:</strong> og-fh-002</p>
              <br />
              <p><strong>Fields you can edit:</strong></p>
              <ul className="list-disc ml-4 space-y-1">
                <li><code>name</code> - Product title shown in catalog</li>
                <li><code>dimensions</code> - Size specifications</li>
                <li><code>description</code> - Short description for catalog grid</li>
                <li><code>fullDescription</code> - Detailed description for product page</li>
                <li><code>specifications</code> - Array of key features and specs</li>
              </ul>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Example Edit:</h4>
            <div className="bg-gray-50 p-4 rounded border text-sm font-mono">
              {`{
  id: "og-bsc-001",
  name: "Your Custom BSC Name Here",
  category: "Oriental Giken",
  dimensions: "1200 × 600 × 2000 mm",
  description: "Your short description here",
  fullDescription: "Your detailed description here...",
  specifications: [
    "Your spec 1",
    "Your spec 2",
    "Your spec 3"
  ]
}`}
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground">
            After editing the text, your changes will automatically appear in the product catalog and detail pages.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductImageEnhancer;
