import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Save, Upload, FileImage, Box, X, Check, RotateCcw, Copy } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { useFormPersistence } from '@/hooks/useFormPersistence';

interface Product {
  id: string;
  name: string;
  product_code: string;
  category: string;
  product_series: string;
  finish_type: string;
  is_active: boolean;
  thumbnail_path?: string;
  model_path?: string;
  dimensions?: string;
  orientation?: string;
  door_type?: string;
  drawer_count?: number;
  description?: string;
}

interface ProductSeries {
  id: string;
  name: string;
  product_code: string;
  product_series: string;
  category: string;
  description: string;
  series_slug: string;
  is_active: boolean;
  variant_count: number;
  completion_rate: number;
  series_thumbnail_path?: string;
  series_model_path?: string;
}

interface VariantFormDialogProps {
  open: boolean;
  onClose: () => void;
  series: ProductSeries;
  variant: Product | null;
  onVariantSaved: () => void;
}

interface FileUploadState {
  thumbnail: {
    uploading: boolean;
    file: File | null;
    preview: string | null;
    uploaded: boolean;
  };
  model: {
    uploading: boolean;
    file: File | null;
    uploaded: boolean;
  };
}

export const VariantFormDialog = ({ 
  open, 
  onClose, 
  series, 
  variant, 
  onVariantSaved 
}: VariantFormDialogProps) => {
  const [formData, setFormData] = useState({
    name: '',
    product_code: '',
    dimensions: '',
    orientation: '',
    door_type: '',
    drawer_count: '',
    finish_type: 'PC',
    is_active: true,
    description: ''
  });
  
  const [fileUploadState, setFileUploadState] = useState<FileUploadState>({
    thumbnail: {
      uploading: false,
      file: null,
      preview: null,
      uploaded: false
    },
    model: {
      uploading: false,
      file: null,
      uploaded: false
    }
  });

  const { toast } = useToast();
  const { 
    previousEntries, 
    saveEntry, 
    clearEntries, 
    hasPreviousEntries 
  } = useFormPersistence({ 
    storageKey: 'variant_form_entries',
    maxEntries: 5 
  });

  useEffect(() => {
    if (variant) {
      // Editing existing variant
      setFormData({
        name: variant.name,
        product_code: variant.product_code,
        dimensions: variant.dimensions || '',
        orientation: variant.orientation || '',
        door_type: variant.door_type || '',
        drawer_count: variant.drawer_count?.toString() || '',
        finish_type: variant.finish_type,
        is_active: variant.is_active,
        description: variant.description || ''
      });
      
      setFileUploadState({
        thumbnail: {
          uploading: false,
          file: null,
          preview: variant.thumbnail_path || null,
          uploaded: !!variant.thumbnail_path
        },
        model: {
          uploading: false,
          file: null,
          uploaded: !!variant.model_path
        }
      });
    } else {
      // New variant - reset form
      setFormData({
        name: '',
        product_code: '',
        dimensions: '',
        orientation: '',
        door_type: '',
        drawer_count: '',
        finish_type: 'PC',
        is_active: true,
        description: ''
      });
      
      setFileUploadState({
        thumbnail: {
          uploading: false,
          file: null,
          preview: null,
          uploaded: false
        },
        model: {
          uploading: false,
          file: null,
          uploaded: false
        }
      });
    }
  }, [variant, open]);

  const loadPreviousData = () => {
    if (previousEntries.length > 0 && !variant) {
      const mostRecentEntry = previousEntries[0]; // Most recent is already first
      setFormData(prev => ({
        ...prev,
        // Only load common fields, not name/product_code which should be unique
        dimensions: mostRecentEntry.data.dimensions || '',
        orientation: mostRecentEntry.data.orientation || '',
        door_type: mostRecentEntry.data.door_type || '',
        drawer_count: mostRecentEntry.data.drawer_count || '',
        finish_type: mostRecentEntry.data.finish_type || 'PC',
        is_active: mostRecentEntry.data.is_active !== undefined ? mostRecentEntry.data.is_active : true,
        description: mostRecentEntry.data.description || ''
      }));
      toast({
        title: "Previous data loaded",
        description: "Form filled with your most recent entry data",
      });
    }
  };

  const uploadFile = async (file: File, type: 'thumbnail' | 'model', variantId: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${variantId}-${type}.${fileExt}`;
    const filePath = `product-assets/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSave = async () => {
    try {
      const variantData = {
        name: formData.name,
        product_code: formData.product_code,
        category: series.category,
        product_series: series.product_series,
        parent_series_id: series.id,
        is_series_parent: false,
        dimensions: formData.dimensions,
        orientation: formData.orientation,
        door_type: formData.door_type,
        drawer_count: formData.drawer_count ? parseInt(formData.drawer_count) : null,
        finish_type: formData.finish_type,
        is_active: formData.is_active,
        description: formData.description,
        updated_at: new Date().toISOString()
      };

      let variantId: string;

      if (variant) {
        // Update existing variant
        const { error } = await supabase
          .from('products')
          .update(variantData)
          .eq('id', variant.id);

        if (error) throw error;
        variantId = variant.id;
      } else {
        // Create new variant - save data for next time
        saveEntry({
          dimensions: formData.dimensions,
          orientation: formData.orientation,
          door_type: formData.door_type,
          drawer_count: formData.drawer_count,
          finish_type: formData.finish_type,
          is_active: formData.is_active,
          description: formData.description
        });
        
        const { data: newVariant, error } = await supabase
          .from('products')
          .insert([{
            ...variantData,
            created_at: new Date().toISOString()
          }])
          .select()
          .single();

        if (error) throw error;
        variantId = newVariant.id;
      }

      // Upload files if they exist
      const updates: any = {};

      if (fileUploadState.thumbnail.file) {
        setFileUploadState(prev => ({
          ...prev,
          thumbnail: { ...prev.thumbnail, uploading: true }
        }));

        try {
          const thumbnailUrl = await uploadFile(fileUploadState.thumbnail.file, 'thumbnail', variantId);
          updates.thumbnail_path = thumbnailUrl;
        } catch (error) {
          console.error('Error uploading thumbnail:', error);
          toast({
            title: "Warning",
            description: "Variant saved but thumbnail upload failed",
            variant: "destructive",
          });
        }

        setFileUploadState(prev => ({
          ...prev,
          thumbnail: { ...prev.thumbnail, uploading: false }
        }));
      }

      if (fileUploadState.model.file) {
        setFileUploadState(prev => ({
          ...prev,
          model: { ...prev.model, uploading: true }
        }));

        try {
          const modelUrl = await uploadFile(fileUploadState.model.file, 'model', variantId);
          updates.model_path = modelUrl;
        } catch (error) {
          console.error('Error uploading model:', error);
          toast({
            title: "Warning",
            description: "Variant saved but 3D model upload failed",
            variant: "destructive",
          });
        }

        setFileUploadState(prev => ({
          ...prev,
          model: { ...prev.model, uploading: false }
        }));
      }

      // Update with asset URLs if any were uploaded
      if (Object.keys(updates).length > 0) {
        const { error: updateError } = await supabase
          .from('products')
          .update(updates)
          .eq('id', variantId);

        if (updateError) throw updateError;
      }

      toast({
        title: "Success",
        description: variant ? "Variant updated successfully" : "Variant created successfully. Previous data saved for next entry.",
      });

      onVariantSaved();
    } catch (error) {
      console.error('Error saving variant:', error);
      toast({
        title: "Error",
        description: "Failed to save variant",
        variant: "destructive",
      });
    }
  };

  // Thumbnail dropzone
  const onThumbnailDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const preview = URL.createObjectURL(file);
      setFileUploadState(prev => ({
        ...prev,
        thumbnail: {
          ...prev.thumbnail,
          file,
          preview,
          uploaded: false
        }
      }));
    }
  };

  const { getRootProps: getThumbnailProps, getInputProps: getThumbnailInputProps, isDragActive: isThumbnailDragActive } = useDropzone({
    onDrop: onThumbnailDrop,
    accept: { 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'] },
    maxFiles: 1,
    disabled: fileUploadState.thumbnail.uploading
  });

  // Model dropzone
  const onModelDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setFileUploadState(prev => ({
        ...prev,
        model: {
          ...prev.model,
          file,
          uploaded: false
        }
      }));
    }
  };

  const { getRootProps: getModelProps, getInputProps: getModelInputProps, isDragActive: isModelDragActive } = useDropzone({
    onDrop: onModelDrop,
    accept: { 'model/gltf-binary': ['.glb'] },
    maxFiles: 1,
    disabled: fileUploadState.model.uploading
  });

  const clearThumbnail = () => {
    setFileUploadState(prev => ({
      ...prev,
      thumbnail: {
        uploading: false,
        file: null,
        preview: null,
        uploaded: false
      }
    }));
  };

  const clearModel = () => {
    setFileUploadState(prev => ({
      ...prev,
      model: {
        uploading: false,
        file: null,
        uploaded: false
      }
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>
              {variant ? 'Edit Variant' : 'Add New Variant'} - {series.product_series}
            </span>
            {!variant && hasPreviousEntries && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadPreviousData}
                  className="flex items-center gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Use Previous Data
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearEntries}
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Clear
                </Button>
              </div>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {!variant && hasPreviousEntries && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-700">
                💡 Previous entry data available. Click "Use Previous Data" to quickly fill common fields.
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Variant Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter variant name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="product_code">Product Code</Label>
              <Input
                id="product_code"
                value={formData.product_code}
                onChange={(e) => setFormData(prev => ({ ...prev, product_code: e.target.value }))}
                placeholder="Enter product code"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dimensions">Dimensions</Label>
              <Input
                id="dimensions"
                value={formData.dimensions}
                onChange={(e) => setFormData(prev => ({ ...prev, dimensions: e.target.value }))}
                placeholder="e.g., 500×500×650 mm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="finish_type">Finish Type</Label>
              <Input
                id="finish_type"
                value={formData.finish_type}
                onChange={(e) => setFormData(prev => ({ ...prev, finish_type: e.target.value }))}
                placeholder="e.g., PC, SS"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="orientation">Orientation</Label>
              <Input
                id="orientation"
                value={formData.orientation}
                onChange={(e) => setFormData(prev => ({ ...prev, orientation: e.target.value }))}
                placeholder="e.g., Left Hand, Right Hand"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="drawer_count">Drawer Count</Label>
              <Input
                id="drawer_count"
                type="number"
                value={formData.drawer_count}
                onChange={(e) => setFormData(prev => ({ ...prev, drawer_count: e.target.value }))}
                placeholder="Number of drawers"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="door_type">Door Type</Label>
            <Input
              id="door_type"
              value={formData.door_type}
              onChange={(e) => setFormData(prev => ({ ...prev, door_type: e.target.value }))}
              placeholder="e.g., Glass, Solid, Combination"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter variant description"
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Active Status</Label>
            <Switch
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
            />
          </div>

          {/* Asset Upload Section */}
          <div className="space-y-4 border-t pt-4">
            <h4 className="font-semibold">Asset Upload</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Thumbnail Upload */}
              <div className="space-y-3">
                <Label>Thumbnail Image (.jpg)</Label>
                <div
                  {...getThumbnailProps()}
                  className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                    isThumbnailDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'
                  }`}
                >
                  <input {...getThumbnailInputProps()} />
                  {fileUploadState.thumbnail.preview ? (
                    <div className="relative">
                      <img 
                        src={fileUploadState.thumbnail.preview} 
                        alt="Thumbnail preview"
                        className="w-full h-32 object-cover rounded"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          clearThumbnail();
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                      {fileUploadState.thumbnail.uploaded && (
                        <Check className="absolute top-2 left-2 h-4 w-4 text-green-600" />
                      )}
                    </div>
                  ) : (
                    <div className="py-4">
                      <FileImage className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        {isThumbnailDragActive ? 'Drop image here' : 'Drag & drop or click to select'}
                      </p>
                    </div>
                  )}
                </div>
                {fileUploadState.thumbnail.uploading && (
                  <p className="text-sm text-blue-600">Uploading thumbnail...</p>
                )}
              </div>

              {/* 3D Model Upload */}
              <div className="space-y-3">
                <Label>3D Model (.glb)</Label>
                <div
                  {...getModelProps()}
                  className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                    isModelDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'
                  }`}
                >
                  <input {...getModelInputProps()} />
                  {fileUploadState.model.file ? (
                    <div className="relative py-4">
                      <div className="flex items-center justify-center gap-2">
                        <Box className="h-8 w-8 text-blue-600" />
                        <div>
                          <p className="font-medium">{fileUploadState.model.file.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {(fileUploadState.model.file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            clearModel();
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      {fileUploadState.model.uploaded && (
                        <Check className="absolute top-2 right-2 h-4 w-4 text-green-600" />
                      )}
                    </div>
                  ) : (
                    <div className="py-4">
                      <Box className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        {isModelDragActive ? 'Drop GLB file here' : 'Drag & drop or click to select GLB'}
                      </p>
                    </div>
                  )}
                </div>
                {fileUploadState.model.uploading && (
                  <p className="text-sm text-blue-600">Uploading 3D model...</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            className="flex items-center gap-2"
            disabled={fileUploadState.thumbnail.uploading || fileUploadState.model.uploading}
          >
            <Save className="h-4 w-4" />
            {variant ? 'Update' : 'Create'} Variant
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
