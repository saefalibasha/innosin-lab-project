
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
  onFilesUploaded?: (files: UploadedFile[]) => void;
  allowedTypes?: string[];
  maxFiles?: number;
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
  onFilesUploaded,
  allowedTypes = ['.glb', '.jpg', '.jpeg', '.png'],
  maxFiles = 10
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const uploadFile = async (file: File): Promise<UploadedFile> => {
    const fileId = `${Date.now()}-${file.name}`;
    const fileName = productCode ? `${productCode}-${file.name}` : file.name;
    const filePath = productCode 
      ? `products/${productCode.toLowerCase()}/${fileName}`
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

      return {
        ...uploadedFile,
        url: publicUrl,
        status: 'success',
        progress: 100
      };
    } catch (error) {
      console.error('Upload error:', error);
      return {
        ...uploadedFile,
        status: 'error',
        error: error instanceof Error ? error.message : 'Upload failed'
      };
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
