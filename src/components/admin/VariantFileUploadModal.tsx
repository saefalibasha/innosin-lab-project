
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, FileImage, Box, X, Check, AlertCircle } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

interface VariantFileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  variantCode: string;
  fileType: 'glb' | 'jpg';
  onUploadComplete: () => void;
}

interface UploadProgress {
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
}

export const VariantFileUploadModal: React.FC<VariantFileUploadModalProps> = ({
  isOpen,
  onClose,
  variantCode,
  fileType,
  onUploadComplete
}) => {
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const { toast } = useToast();

  const uploadFile = async (file: File) => {
    const fileName = `${variantCode}.${fileType}`;
    const filePath = `products/${variantCode.toLowerCase()}/${fileName}`;

    setUploadProgress({ progress: 0, status: 'uploading' });

    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) throw error;

      setUploadProgress({ progress: 100, status: 'success' });
      
      toast({
        title: "Upload Successful",
        description: `${fileName} uploaded successfully`,
      });

      setTimeout(() => {
        onUploadComplete();
        onClose();
        setUploadProgress(null);
      }, 1000);

    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      
      setUploadProgress({ 
        progress: 0, 
        status: 'error', 
        error: errorMessage 
      });

      toast({
        title: "Upload Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      uploadFile(acceptedFiles[0]);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: fileType === 'glb' 
      ? { 'model/gltf-binary': ['.glb'] }
      : { 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'] },
    maxFiles: 1,
    disabled: uploadProgress?.status === 'uploading'
  });

  const handleClose = () => {
    if (uploadProgress?.status !== 'uploading') {
      onClose();
      setUploadProgress(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {fileType === 'glb' ? <Box className="h-5 w-5" /> : <FileImage className="h-5 w-5" />}
            Upload {fileType.toUpperCase()} for {variantCode}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!uploadProgress && (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              {isDragActive ? (
                <p className="text-primary">Drop the {fileType.toUpperCase()} file here...</p>
              ) : (
                <div>
                  <p className="font-medium mb-1">
                    Drag & drop your {fileType.toUpperCase()} file here
                  </p>
                  <p className="text-sm text-muted-foreground mb-2">
                    File will be saved as: {variantCode}.{fileType}
                  </p>
                  <Button variant="outline" size="sm">
                    Choose File
                  </Button>
                </div>
              )}
            </div>
          )}

          {uploadProgress && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                {uploadProgress.status === 'uploading' && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                )}
                {uploadProgress.status === 'success' && (
                  <Check className="h-4 w-4 text-green-600" />
                )}
                {uploadProgress.status === 'error' && (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                <span className="font-medium">
                  {uploadProgress.status === 'uploading' && 'Uploading...'}
                  {uploadProgress.status === 'success' && 'Upload Complete!'}
                  {uploadProgress.status === 'error' && 'Upload Failed'}
                </span>
              </div>

              {uploadProgress.status === 'uploading' && (
                <Progress value={uploadProgress.progress} className="w-full" />
              )}

              {uploadProgress.error && (
                <p className="text-sm text-red-600">{uploadProgress.error}</p>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={handleClose}
              disabled={uploadProgress?.status === 'uploading'}
            >
              {uploadProgress?.status === 'success' ? 'Close' : 'Cancel'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
