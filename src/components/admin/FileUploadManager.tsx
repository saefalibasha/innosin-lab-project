
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, FileImage, Box, X, Check, AlertCircle } from 'lucide-react';

interface FileUploadManagerProps {
  productId?: string;
  productCode?: string;
  variantCode?: string;
  onFilesUploaded?: (files: UploadedFile[]) => void;
  onUploadSuccess?: (file: UploadedFile) => void;
  allowedTypes?: string[];
  maxFiles?: number;
  autoUpdateProduct?: boolean;
}

interface UploadedFile {
  id: string;
  name: string;
  type: string;
  url: string;
  size: number;
  status: 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
}

export const FileUploadManager: React.FC<FileUploadManagerProps> = ({
  productId,
  productCode,
  variantCode,
  onFilesUploaded,
  onUploadSuccess,
  allowedTypes = ['.glb', '.jpg', '.jpeg', '.png'],
  maxFiles = 10,
  autoUpdateProduct = false
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const uploadFile = async (file: File): Promise<UploadedFile> => {
    const fileId = `${Date.now()}-${file.name}`;
    const codeToUse = variantCode || productCode;
    const fileName = codeToUse ? `${codeToUse}-${file.name}` : file.name;
    const filePath = codeToUse 
      ? `products/${codeToUse.toLowerCase()}/${fileName}`
      : `uploads/${fileName}`;

    const uploadedFile: UploadedFile = {
      id: fileId,
      name: file.name,
      type: file.type,
      url: '',
      size: file.size,
      status: 'uploading',
      progress: 0
    };

    try {
      // Upload with progress tracking for large files
      const { data, error } = await supabase.storage
        .from('documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      const successFile = {
        ...uploadedFile,
        url: publicUrl,
        status: 'success' as const,
        progress: 100
      };

      // Auto-update product record if enabled
      if (autoUpdateProduct && productId && publicUrl) {
        await updateProductWithAsset(productId, file.type, publicUrl);
      }

      return successFile;
    } catch (error) {
      console.error('Upload error:', error);
      return {
        ...uploadedFile,
        status: 'error',
        error: error instanceof Error ? error.message : 'Upload failed'
      };
    }
  };

  const updateProductWithAsset = async (productId: string, fileType: string, url: string) => {
    try {
      const updateData: any = {};
      
      if (fileType.startsWith('image/')) {
        updateData.thumbnail_path = url;
      } else if (fileType.includes('gltf') || fileType.includes('glb')) {
        updateData.model_path = url;
      }

      if (Object.keys(updateData).length > 0) {
        const { error } = await supabase
          .from('products')
          .update(updateData)
          .eq('id', productId);

        if (error) {
          console.error('Failed to update product with asset:', error);
          toast({
            title: "Upload Warning",
            description: "File uploaded but failed to link to product",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    setIsUploading(true);
    const newFiles: UploadedFile[] = [];

    for (const file of acceptedFiles) {
      const uploadedFile = await uploadFile(file);
      newFiles.push(uploadedFile);
      setUploadedFiles(prev => [...prev, uploadedFile]);
      
      // Trigger individual success callback
      if (uploadedFile.status === 'success') {
        onUploadSuccess?.(uploadedFile);
      }
    }

    setIsUploading(false);
    onFilesUploaded?.(newFiles);

    const successCount = newFiles.filter(f => f.status === 'success').length;
    const errorCount = newFiles.filter(f => f.status === 'error').length;

    if (successCount > 0) {
      toast({
        title: "Upload Complete",
        description: `${successCount} file(s) uploaded successfully${errorCount > 0 ? `, ${errorCount} failed` : ''}`,
      });
    }

    if (errorCount > 0 && successCount === 0) {
      toast({
        title: "Upload Failed",
        description: `${errorCount} file(s) failed to upload`,
        variant: "destructive",
      });
    }
  }, [productCode, onFilesUploaded, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'model/gltf-binary': ['.glb'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    maxFiles,
    disabled: isUploading
  });

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('model/')) return <Box className="h-4 w-4" />;
    if (type.startsWith('image/')) return <FileImage className="h-4 w-4" />;
    return <Upload className="h-4 w-4" />;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <Check className="h-4 w-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          File Upload Manager
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'
          } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input {...getInputProps()} />
          <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          {isDragActive ? (
            <p className="text-primary">Drop files here...</p>
          ) : (
            <div>
              <p className="text-lg font-medium mb-2">
                {isUploading ? 'Uploading...' : 'Drag & drop files here'}
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Supported formats: .glb, .jpg, .jpeg, .png
              </p>
              <Button variant="outline" disabled={isUploading}>
                Choose Files
              </Button>
            </div>
          )}
        </div>

        {uploadedFiles.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Uploaded Files</h4>
            {uploadedFiles.map((file) => (
              <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3 flex-1">
                  {getFileIcon(file.type)}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    {file.status === 'uploading' && (
                      <Progress value={file.progress} className="mt-1" />
                    )}
                    {file.status === 'error' && file.error && (
                      <p className="text-sm text-red-600 mt-1">{file.error}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={
                    file.status === 'success' ? 'default' :
                    file.status === 'error' ? 'destructive' : 'secondary'
                  }>
                    {file.status}
                  </Badge>
                  {getStatusIcon(file.status)}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(file.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
