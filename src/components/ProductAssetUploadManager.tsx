import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, FileText, X, Package, Image, Box, CheckCircle, AlertCircle } from 'lucide-react';
import EnhancedAssetManager from './EnhancedAssetManager';

interface UploadFile {
  file: File;
  brand: string;
  productId: string;
  fileType: 'image' | 'model' | 'unknown';
  progress: number;
  status: 'pending' | 'uploading' | 'complete' | 'error';
  error?: string;
  targetPath?: string;
}

interface UploadFileWithIndex extends UploadFile {
  index: number;
}

interface ProductGroup {
  productId: string;
  files: UploadFileWithIndex[];
  hasModel: boolean;
  hasImage: boolean;
}

interface UploadedProduct {
  productId: string;
  brand: string;
  hasModel: boolean;
  hasImage: boolean;
  hasDescription: boolean;
  modelPath?: string;
  imagePath?: string;
  descriptionPath?: string;
  uploadDate: string;
}

const ProductAssetUploadManager = () => {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [uploadedProducts, setUploadedProducts] = useState<UploadedProduct[]>([]);
  const [activeTab, setActiveTab] = useState<string>('enhanced');
  const { toast } = useToast();

  const brands = [
    { value: 'broen-lab', label: 'Broen Lab' },
    { value: 'oriental-giken', label: 'Oriental Giken' },
    { value: 'innosin-lab', label: 'Innosin Lab' },
    { value: 'hamilton-lab', label: 'Hamilton Lab' }
  ];

  const getFileType = (file: File): 'image' | 'model' | 'unknown' => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'webp'].includes(extension || '')) return 'image';
    if (['glb', 'gltf'].includes(extension || '')) return 'model';
    return 'unknown';
  };

  const generateTargetPath = (file: UploadFile): string => {
    const extension = file.file.name.split('.').pop()?.toLowerCase();
    if (file.fileType === 'image') {
      return `products/${file.productId}/${file.productId}.${extension}`;
    } else if (file.fileType === 'model') {
      return `products/${file.productId}/${file.productId}.${extension}`;
    }
    return `products/${file.productId}/${file.file.name}`;
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map((file) => {
      const fileType = getFileType(file);
      const baseFileName = file.name.replace(/\.[^/.]+$/, "");
      
      return {
        file,
        brand: 'innosin-lab', // Default to Innosin Lab
        productId: baseFileName,
        fileType,
        progress: 0,
        status: 'pending' as const
      };
    });
    
    setUploadFiles(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.webp'],
      'model/gltf-binary': ['.glb'],
      'model/gltf+json': ['.gltf']
    },
    multiple: true
  });

  const updateFileField = (index: number, field: keyof UploadFile, value: any) => {
    setUploadFiles(prev => prev.map((file, i) => {
      if (i === index) {
        const updated = { ...file, [field]: value };
        if (field === 'productId' || field === 'brand') {
          updated.targetPath = generateTargetPath(updated);
        }
        return updated;
      }
      return file;
    }));
  };

  const removeFile = (index: number) => {
    setUploadFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFile = async (fileData: UploadFile, index: number) => {
    if (!fileData.brand || !fileData.productId) {
      toast({
        title: "Missing Information",
        description: "Please select brand and enter product ID",
        variant: "destructive",
      });
      return;
    }

    updateFileField(index, 'status', 'uploading');
    updateFileField(index, 'progress', 10);

    try {
      const targetPath = generateTargetPath(fileData);
      updateFileField(index, 'targetPath', targetPath);
      updateFileField(index, 'progress', 30);

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(targetPath, fileData.file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      updateFileField(index, 'progress', 100);
      updateFileField(index, 'status', 'complete');
      
      toast({
        title: "Upload Successful",
        description: `${fileData.file.name} uploaded to ${targetPath}`,
      });

      // Refresh uploaded products list
      await loadUploadedProducts();

    } catch (error) {
      console.error('Upload error:', error);
      updateFileField(index, 'status', 'error');
      updateFileField(index, 'error', error.message);
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const uploadAll = async () => {
    const pendingFiles = uploadFiles.filter(f => f.status === 'pending' && f.brand && f.productId);
    
    for (let i = 0; i < uploadFiles.length; i++) {
      const file = uploadFiles[i];
      if (file.status === 'pending' && file.brand && file.productId) {
        await uploadFile(file, i);
        // Small delay between uploads
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  };

  const loadUploadedProducts = async () => {
    try {
      const { data: files, error } = await supabase.storage
        .from('documents')
        .list('products', {
          limit: 1000,
          offset: 0,
        });

      if (error) {
        console.error('Error loading products:', error);
        return;
      }

      // Group files by product folder
      const productMap = new Map<string, UploadedProduct>();

      if (files) {
        for (const folder of files) {
          if (folder.name && folder.name !== '.emptyFolderPlaceholder') {
            const { data: productFiles } = await supabase.storage
              .from('documents')
              .list(`products/${folder.name}`, { limit: 100 });

            if (productFiles) {
              const productId = folder.name;
              const [brand, ...rest] = productId.split('-');
              
              const hasModel = productFiles.some(file => file.name && file.name.endsWith('.glb'));
              const hasImage = productFiles.some(file => file.name && 
                ['.jpg', '.jpeg', '.png'].some(ext => file.name!.endsWith(ext)));
              const hasDescription = productFiles.some(file => file.name && file.name.endsWith('.txt'));

              productMap.set(productId, {
                productId,
                brand: brand || 'unknown',
                hasModel,
                hasImage,
                hasDescription,
                modelPath: hasModel ? `products/${productId}` : undefined,
                imagePath: hasImage ? `products/${productId}` : undefined,
                descriptionPath: hasDescription ? `products/${productId}` : undefined,
                uploadDate: folder.updated_at || folder.created_at || new Date().toISOString()
              });
            }
          }
        }
      }

      setUploadedProducts(Array.from(productMap.values()).sort((a, b) => 
        new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
      ));
    } catch (error) {
      console.error('Error loading uploaded products:', error);
      toast({
        title: "Error",
        description: "Failed to load uploaded products",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadUploadedProducts();
  }, []);

  // Group files by product ID for better organization
  const groupedFiles = uploadFiles.reduce((groups: { [key: string]: ProductGroup }, file, index) => {
    const key = `${file.brand}-${file.productId}`;
    if (!groups[key]) {
      groups[key] = {
        productId: file.productId,
        files: [],
        hasModel: false,
        hasImage: false
      };
    }
    
    groups[key].files.push({ ...file, index } as UploadFileWithIndex);
    if (file.fileType === 'model') groups[key].hasModel = true;
    if (file.fileType === 'image') groups[key].hasImage = true;
    
    return groups;
  }, {});

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'image': return <Image className="h-5 w-5 text-blue-600" />;
      case 'model': return <Box className="h-5 w-5 text-green-600" />;
      default: return <Package className="h-5 w-5 text-gray-600" />;
    }
  };

  const getProductCompletionStatus = (product: UploadedProduct) => {
    const total = 3; // model, image, description
    const completed = [product.hasModel, product.hasImage, product.hasDescription].filter(Boolean).length;
    return { completed, total, percentage: (completed / total) * 100 };
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="enhanced">Asset Manager</TabsTrigger>
          <TabsTrigger value="upload">Bulk Upload</TabsTrigger>
          <TabsTrigger value="dashboard">Storage Dashboard</TabsTrigger>
        </TabsList>

        <TabsContent value="enhanced">
          <EnhancedAssetManager />
        </TabsContent>

        <TabsContent value="upload">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Product Asset Upload Manager
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <input {...getInputProps()} />
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  {isDragActive ? (
                    <p className="text-blue-600">Drop files here...</p>
                  ) : (
                    <div>
                      <p className="text-gray-600 mb-2">Drag & drop product files here, or click to select</p>
                      <p className="text-sm text-gray-500">
                        Supports: .jpg, .png, .webp, .glb, .gltf
                      </p>
                      <div className="flex justify-center gap-2 mt-3">
                        <Badge variant="outline">Images</Badge>
                        <Badge variant="outline">3D Models</Badge>
                      </div>
                    </div>
                  )}
                </div>

                {uploadFiles.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Files to Upload ({uploadFiles.length})</span>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => setUploadFiles([])}>
                          Clear All
                        </Button>
                        <Button size="sm" onClick={uploadAll}>
                          Upload All
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {Object.entries(groupedFiles).map(([groupKey, group]) => (
                        <div key={groupKey} className="border rounded-lg p-4 space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Package className="h-5 w-5 text-gray-600" />
                              <div>
                                <h3 className="font-medium">{group.productId}</h3>
                                <div className="flex gap-2 mt-1">
                                  {group.hasModel && <Badge variant="outline" className="text-xs">3D Model</Badge>}
                                  {group.hasImage && <Badge variant="outline" className="text-xs">Image</Badge>}
                                </div>
                              </div>
                            </div>
                            <Badge variant={group.hasModel && group.hasImage ? 'default' : 'secondary'}>
                              {group.files.length} file{group.files.length !== 1 ? 's' : ''}
                            </Badge>
                          </div>

                          <div className="space-y-3">
                            {group.files.map((fileData) => (
                              <div key={fileData.index} className="border rounded p-3 space-y-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2">
                                    {getFileIcon(fileData.fileType)}
                                    <span className="font-medium text-sm">{fileData.file.name}</span>
                                    <Badge variant="outline" className="text-xs">
                                      {fileData.fileType}
                                    </Badge>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeFile(fileData.index)}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  <div>
                                    <Label className="text-xs">Brand</Label>
                                    <Select
                                      value={fileData.brand}
                                      onValueChange={(value) => updateFileField(fileData.index, 'brand', value)}
                                    >
                                      <SelectTrigger className="h-8">
                                        <SelectValue placeholder="Select brand" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {brands.map((brand) => (
                                          <SelectItem key={brand.value} value={brand.value}>
                                            {brand.label}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <div>
                                    <Label className="text-xs">Product ID</Label>
                                    <Input
                                      className="h-8"
                                      value={fileData.productId}
                                      onChange={(e) => updateFileField(fileData.index, 'productId', e.target.value)}
                                      placeholder="e.g., innosin-ks-1000"
                                    />
                                  </div>
                                </div>

                                {fileData.targetPath && (
                                  <div className="text-xs text-gray-500">
                                    Target: {fileData.targetPath}
                                  </div>
                                )}

                                {fileData.status !== 'pending' && (
                                  <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                      <span>Status: {fileData.status}</span>
                                      <span>{fileData.progress}%</span>
                                    </div>
                                    <Progress value={fileData.progress} className="h-2" />
                                    {fileData.error && (
                                      <p className="text-sm text-red-600">{fileData.error}</p>
                                    )}
                                  </div>
                                )}

                                <Button
                                  size="sm"
                                  onClick={() => uploadFile(fileData, fileData.index)}
                                  disabled={fileData.status !== 'pending' || !fileData.brand || !fileData.productId}
                                  className="w-full"
                                >
                                  Upload {fileData.fileType.toUpperCase()}
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dashboard">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Uploaded Products Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {uploadedProducts.length === 0 ? (
                  <div className="text-center p-8 text-gray-500">
                    <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>No products uploaded yet</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-600">Total Products</p>
                              <p className="text-2xl font-bold">{uploadedProducts.length}</p>
                            </div>
                            <Package className="w-8 h-8 text-blue-500" />
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-600">Complete Products</p>
                              <p className="text-2xl font-bold text-green-600">
                                {uploadedProducts.filter(p => p.hasModel && p.hasImage && p.hasDescription).length}
                              </p>
                            </div>
                            <CheckCircle className="w-8 h-8 text-green-500" />
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-600">Incomplete Products</p>
                              <p className="text-2xl font-bold text-amber-600">
                                {uploadedProducts.filter(p => !(p.hasModel && p.hasImage && p.hasDescription)).length}
                              </p>
                            </div>
                            <AlertCircle className="w-8 h-8 text-amber-500" />
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {uploadedProducts.map((product) => {
                        const status = getProductCompletionStatus(product);
                        return (
                          <Card key={product.productId} className="relative">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <h3 className="font-medium text-sm mb-1">{product.productId}</h3>
                                  <Badge variant="outline" className="text-xs">
                                    {product.brand}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-1">
                                  {product.hasModel && <Box className="w-4 h-4 text-green-500" />}
                                  {product.hasImage && <Image className="w-4 h-4 text-blue-500" />}
                                  {product.hasDescription && <FileText className="w-4 h-4 text-purple-500" />}
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-xs">
                                  <span>Completion</span>
                                  <span>{status.completed}/{status.total}</span>
                                </div>
                                <Progress value={status.percentage} className="h-2" />
                                
                                 <div className="flex justify-between items-center text-xs text-gray-500">
                                   <span>
                                     {new Date(product.uploadDate).toLocaleDateString()}
                                   </span>
                                   {status.percentage === 100 ? (
                                     <Badge variant="default" className="bg-green-100 text-green-800">
                                       Complete
                                     </Badge>
                                   ) : (
                                     <Badge variant="outline" className="text-amber-600">
                                       Incomplete
                                     </Badge>
                                   )}
                                 </div>
                                 
                                 <div className="mt-3 flex gap-2">
                                   <Button variant="outline" size="sm" className="text-xs flex-1" asChild>
                                     <a href="/products" target="_blank" rel="noopener noreferrer">
                                       View in Catalog
                                     </a>
                                   </Button>
                                 </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProductAssetUploadManager;