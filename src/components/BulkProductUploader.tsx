
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, FileImage, Box, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface FileWithPreview extends File {
  preview?: string;
  productCode?: string;
  fileType?: 'image' | 'model';
}

interface ProductPair {
  productCode: string;
  imageFile?: FileWithPreview;
  modelFile?: FileWithPreview;
  status: 'pending' | 'processing' | 'success' | 'error';
  error?: string;
}

interface BulkProductUploaderProps {
  onComplete: () => void;
}

const BulkProductUploader: React.FC<BulkProductUploaderProps> = ({ onComplete }) => {
  const { toast } = useToast();
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [productPairs, setProductPairs] = useState<ProductPair[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const processedFiles: FileWithPreview[] = acceptedFiles.map(file => {
      const fileName = file.name;
      const productCode = fileName.split('.')[0]; // Extract product code from filename
      const fileType: 'image' | 'model' = file.type.startsWith('image/') ? 'image' : 'model';
      
      return Object.assign(file, {
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
        productCode,
        fileType
      });
    });

    setFiles(prev => [...prev, ...processedFiles]);
    
    // Group files by product code
    const grouped = [...files, ...processedFiles].reduce((acc, file) => {
      const code = file.productCode!;
      if (!acc[code]) {
        acc[code] = { productCode: code, status: 'pending' as const };
      }
      
      if (file.fileType === 'image') {
        acc[code].imageFile = file;
      } else {
        acc[code].modelFile = file;
      }
      
      return acc;
    }, {} as Record<string, ProductPair>);

    setProductPairs(Object.values(grouped));
  }, [files]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'model/gltf-binary': ['.glb']
    },
    multiple: true
  });

  const extractProductCodeFromFilename = (filename: string): string => {
    // Extract product code from various filename patterns
    const nameWithoutExt = filename.split('.')[0];
    // Handle patterns like "product-code-123", "MC-PC (755065)", etc.
    return nameWithoutExt;
  };

  const generateProductName = (productCode: string): string => {
    // Generate a human-readable name from product code
    return productCode
      .replace(/[-_]/g, ' ')
      .replace(/\([^)]*\)/g, '') // Remove parentheses and content
      .trim()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const determineCategory = (productCode: string): string => {
    const code = productCode.toLowerCase();
    
    if (code.includes('mc-') || code.includes('mobile')) return 'Mobile Cabinets';
    if (code.includes('wc-') || code.includes('wall')) return 'Wall Cabinets';
    if (code.includes('tc-') || code.includes('tall')) return 'Tall Cabinets';
    if (code.includes('or-') || code.includes('rack')) return 'Open Racks';
    if (code.includes('ks-') || code.includes('sink')) return 'Sinks';
    if (code.includes('fh-') || code.includes('hood')) return 'Fume Hoods';
    if (code.includes('bl-') || code.includes('broen')) return 'Broen Lab';
    if (code.includes('hl-') || code.includes('hamilton')) return 'Hamilton Laboratory';
    if (code.includes('og-') || code.includes('oriental')) return 'Oriental Giken';
    
    return 'Laboratory Equipment';
  };

  const uploadFileToStorage = async (file: File, path: string): Promise<string> => {
    const { data, error } = await supabase.storage
      .from('products')
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from('products')
      .getPublicUrl(path);

    return publicUrl;
  };

  const createProductInDatabase = async (pair: ProductPair): Promise<void> => {
    const productCode = pair.productCode;
    const productName = generateProductName(productCode);
    const category = determineCategory(productCode);

    let thumbnailPath = '';
    let modelPath = '';

    // Upload image file if present
    if (pair.imageFile) {
      const imagePath = `${productCode}/${pair.imageFile.name}`;
      thumbnailPath = await uploadFileToStorage(pair.imageFile, imagePath);
    }

    // Upload model file if present
    if (pair.modelFile) {
      const modelFilePath = `${productCode}/${pair.modelFile.name}`;
      modelPath = await uploadFileToStorage(pair.modelFile, modelFilePath);
    }

    // Create product record in database
    const { error } = await supabase
      .from('products')
      .insert({
        product_code: productCode,
        name: productName,
        category: category,
        description: `${productName} - Professional laboratory equipment`,
        thumbnail_path: thumbnailPath,
        model_path: modelPath,
        is_active: true
      });

    if (error) throw error;
  };

  const handleUpload = async () => {
    if (productPairs.length === 0) {
      toast({
        title: "No Files",
        description: "Please select files to upload.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    setProgress(0);

    const totalPairs = productPairs.length;
    let completed = 0;

    for (const pair of productPairs) {
      try {
        setProductPairs(prev => 
          prev.map(p => 
            p.productCode === pair.productCode 
              ? { ...p, status: 'processing' }
              : p
          )
        );

        await createProductInDatabase(pair);

        setProductPairs(prev => 
          prev.map(p => 
            p.productCode === pair.productCode 
              ? { ...p, status: 'success' }
              : p
          )
        );

        completed++;
        setProgress((completed / totalPairs) * 100);

      } catch (error) {
        console.error(`Error uploading ${pair.productCode}:`, error);
        
        setProductPairs(prev => 
          prev.map(p => 
            p.productCode === pair.productCode 
              ? { ...p, status: 'error', error: error instanceof Error ? error.message : 'Unknown error' }
              : p
          )
        );
        
        completed++;
        setProgress((completed / totalPairs) * 100);
      }
    }

    setUploading(false);
    
    const successCount = productPairs.filter(p => p.status === 'success').length;
    const errorCount = productPairs.filter(p => p.status === 'error').length;

    toast({
      title: "Upload Complete",
      description: `${successCount} products uploaded successfully. ${errorCount} failed.`,
      variant: errorCount > 0 ? "destructive" : "default",
    });

    if (successCount > 0) {
      setTimeout(() => {
        onComplete();
      }, 2000);
    }
  };

  const clearFiles = () => {
    setFiles([]);
    setProductPairs([]);
    setProgress(0);
  };

  const getStatusIcon = (status: ProductPair['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'processing':
        return <AlertCircle className="h-4 w-4 text-yellow-600 animate-pulse" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* File Drop Zone */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Product Assets</CardTitle>
          <CardDescription>
            Drop .jpg and .glb files here. Files will be automatically paired by product code.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            {isDragActive ? (
              <p className="text-lg">Drop the files here...</p>
            ) : (
              <div>
                <p className="text-lg mb-2">Drag & drop files here, or click to select</p>
                <p className="text-sm text-muted-foreground">
                  Supports .jpg and .glb files
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Product Pairs Preview */}
      {productPairs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Product Pairs ({productPairs.length})</CardTitle>
            <CardDescription>
              Files grouped by product code. Each product should have an image (.jpg) and optionally a 3D model (.glb).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {productPairs.map((pair) => (
                <div key={pair.productCode} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(pair.status)}
                    <div>
                      <div className="font-medium">{pair.productCode}</div>
                      <div className="text-sm text-muted-foreground">
                        {generateProductName(pair.productCode)} • {determineCategory(pair.productCode)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {pair.imageFile && (
                      <Badge variant="outline" className="gap-1">
                        <FileImage className="h-3 w-3" />
                        JPG
                      </Badge>
                    )}
                    {pair.modelFile && (
                      <Badge variant="outline" className="gap-1">
                        <Box className="h-3 w-3" />
                        GLB
                      </Badge>
                    )}
                    {pair.status === 'error' && (
                      <Badge variant="destructive">
                        Error
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Progress */}
      {uploading && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading products...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={clearFiles} disabled={uploading}>
          Clear Files
        </Button>
        <Button 
          onClick={handleUpload} 
          disabled={productPairs.length === 0 || uploading}
          className="gap-2"
        >
          <Upload className="h-4 w-4" />
          Upload {productPairs.length} Products
        </Button>
      </div>
    </div>
  );
};

export default BulkProductUploader;
