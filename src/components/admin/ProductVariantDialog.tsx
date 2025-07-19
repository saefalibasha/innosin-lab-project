
import React, { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image, Box, FileImage } from 'lucide-react';

interface ProductVariant {
  id?: string;
  variant_name: string;
  variant_code: string;
  variant_type: string;
  finish_type?: string;
  color?: string;
  size_dimensions?: string;
  thumbnail_path?: string;
  model_path?: string;
  additional_images: string[];
  additional_specs: Record<string, any>;
  is_active: boolean;
  sort_order: number;
}

interface ProductVariantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variant: ProductVariant | null;
  productId: string;
  productName: string;
  onSuccess: () => void;
}

const ProductVariantDialog = ({ 
  open, 
  onOpenChange, 
  variant, 
  productId, 
  productName, 
  onSuccess 
}: ProductVariantDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<string[]>([]);
  const [formData, setFormData] = useState<ProductVariant>({
    variant_name: variant?.variant_name || '',
    variant_code: variant?.variant_code || '',
    variant_type: variant?.variant_type || 'standard',
    finish_type: variant?.finish_type || '',
    color: variant?.color || '',
    size_dimensions: variant?.size_dimensions || '',
    thumbnail_path: variant?.thumbnail_path || '',
    model_path: variant?.model_path || '',
    additional_images: variant?.additional_images || [],
    additional_specs: variant?.additional_specs || {},
    is_active: variant?.is_active ?? true,
    sort_order: variant?.sort_order || 0,
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const variantData = {
        ...formData,
        product_id: productId,
      };

      if (variant?.id) {
        const { error } = await supabase
          .from('product_variants')
          .update(variantData)
          .eq('id', variant.id);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Product variant updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('product_variants')
          .insert([variantData]);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Product variant created successfully",
        });
      }

      onSuccess();
    } catch (error: any) {
      console.error('Error saving variant:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save product variant",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof ProductVariant, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const uploadFile = async (file: File, path: string) => {
    const { data, error } = await supabase.storage
      .from('documents')
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) throw error;
    
    const { data: urlData } = supabase.storage
      .from('documents')
      .getPublicUrl(path);

    return urlData.publicUrl;
  };

  const onImageDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploadingFiles(prev => [...prev, ...acceptedFiles.map(f => f.name)]);

    try {
      const uploadPromises = acceptedFiles.map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${productName}-${formData.variant_code}-${Date.now()}.${fileExt}`;
        const filePath = `products/${productName}/${fileName}`;
        
        return await uploadFile(file, filePath);
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      
      handleInputChange('additional_images', [
        ...formData.additional_images,
        ...uploadedUrls
      ]);

      toast({
        title: "Success",
        description: `${acceptedFiles.length} image(s) uploaded successfully`,
      });
    } catch (error: any) {
      console.error('Error uploading images:', error);
      toast({
        title: "Error",
        description: "Failed to upload images",
        variant: "destructive",
      });
    } finally {
      setUploadingFiles(prev => prev.filter(name => !acceptedFiles.some(f => f.name === name)));
    }
  }, [formData.additional_images, formData.variant_code, productName]);

  const onModelDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    setUploadingFiles(prev => [...prev, file.name]);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${productName}-${formData.variant_code}.${fileExt}`;
      const filePath = `products/${productName}/${fileName}`;
      
      const uploadedUrl = await uploadFile(file, filePath);
      handleInputChange('model_path', uploadedUrl);

      toast({
        title: "Success",
        description: "3D model uploaded successfully",
      });
    } catch (error: any) {
      console.error('Error uploading model:', error);
      toast({
        title: "Error",
        description: "Failed to upload 3D model",
        variant: "destructive",
      });
    } finally {
      setUploadingFiles(prev => prev.filter(name => name !== file.name));
    }
  }, [formData.variant_code, productName]);

  const {
    getRootProps: getImageRootProps,
    getInputProps: getImageInputProps,
    isDragActive: isImageDragActive
  } = useDropzone({
    onDrop: onImageDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.webp']
    },
    multiple: true
  });

  const {
    getRootProps: getModelRootProps,
    getInputProps: getModelInputProps,
    isDragActive: isModelDragActive
  } = useDropzone({
    onDrop: onModelDrop,
    accept: {
      'model/*': ['.glb', '.gltf']
    },
    multiple: false
  });

  const removeImage = (index: number) => {
    const newImages = [...formData.additional_images];
    newImages.splice(index, 1);
    handleInputChange('additional_images', newImages);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {variant ? 'Edit Product Variant' : 'Create New Product Variant'}
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="specs">Specifications</TabsTrigger>
            <TabsTrigger value="assets">Assets</TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit}>
            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="variant_name">Variant Name</Label>
                  <Input
                    id="variant_name"
                    value={formData.variant_name}
                    onChange={(e) => handleInputChange('variant_name', e.target.value)}
                    placeholder="Left Hand Configuration"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="variant_code">Variant Code</Label>
                  <Input
                    id="variant_code"
                    value={formData.variant_code}
                    onChange={(e) => handleInputChange('variant_code', e.target.value)}
                    placeholder="LH"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="variant_type">Variant Type</Label>
                  <Select value={formData.variant_type} onValueChange={(value) => handleInputChange('variant_type', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="finish_type">Finish Type</Label>
                  <Input
                    id="finish_type"
                    value={formData.finish_type}
                    onChange={(e) => handleInputChange('finish_type', e.target.value)}
                    placeholder="Powder Coat"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="color">Color</Label>
                  <Input
                    id="color"
                    value={formData.color}
                    onChange={(e) => handleInputChange('color', e.target.value)}
                    placeholder="White"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="specs" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="size_dimensions">Size/Dimensions</Label>
                <Input
                  id="size_dimensions"
                  value={formData.size_dimensions}
                  onChange={(e) => handleInputChange('size_dimensions', e.target.value)}
                  placeholder="500×500×650 mm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sort_order">Sort Order</Label>
                <Input
                  id="sort_order"
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => handleInputChange('sort_order', parseInt(e.target.value) || 0)}
                  placeholder="0"
                />
              </div>
            </TabsContent>

            <TabsContent value="assets" className="space-y-4 mt-4">
              <div className="space-y-4">
                {/* Image Upload */}
                <div className="space-y-2">
                  <Label>Product Images (.jpg, .png)</Label>
                  <div
                    {...getImageRootProps()}
                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                      isImageDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary'
                    }`}
                  >
                    <input {...getImageInputProps()} />
                    <Image className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    {isImageDragActive ? (
                      <p>Drop image files here...</p>
                    ) : (
                      <div>
                        <p>Drag & drop image files here, or click to select</p>
                        <p className="text-sm text-gray-500 mt-1">Supports JPG, PNG, WebP</p>
                      </div>
                    )}
                  </div>

                  {/* Image Preview */}
                  {formData.additional_images.length > 0 && (
                    <div className="grid grid-cols-4 gap-2 mt-4">
                      {formData.additional_images.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image}
                            alt={`Product image ${index + 1}`}
                            className="w-full h-20 object-cover rounded border"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 3D Model Upload */}
                <div className="space-y-2">
                  <Label>3D Model (.glb)</Label>
                  <div
                    {...getModelRootProps()}
                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                      isModelDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary'
                    }`}
                  >
                    <input {...getModelInputProps()} />
                    <Box className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    {isModelDragActive ? (
                      <p>Drop 3D model file here...</p>
                    ) : (
                      <div>
                        <p>Drag & drop 3D model file here, or click to select</p>
                        <p className="text-sm text-gray-500 mt-1">Supports GLB, GLTF</p>
                      </div>
                    )}
                  </div>

                  {formData.model_path && (
                    <div className="flex items-center gap-2 p-2 bg-green-50 rounded border">
                      <Box className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-800">3D model uploaded</span>
                    </div>
                  )}
                </div>

                {/* Upload Progress */}
                {uploadingFiles.length > 0 && (
                  <div className="space-y-2">
                    <Label>Uploading Files</Label>
                    {uploadingFiles.map((fileName, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                        <Upload className="h-4 w-4 text-blue-600 animate-pulse" />
                        <span className="text-sm text-blue-800">Uploading {fileName}...</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <div className="flex justify-end gap-2 pt-6 mt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={loading || uploadingFiles.length > 0}
              >
                {loading ? 'Saving...' : (variant ? 'Update Variant' : 'Create Variant')}
              </Button>
            </div>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ProductVariantDialog;
