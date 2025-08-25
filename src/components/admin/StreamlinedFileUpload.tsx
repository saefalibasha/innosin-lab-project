
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, CheckCircle, AlertCircle, X, Image, Box } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface StreamlinedFileUploadProps {
  productId: string;
  variantCode: string;
  onUploadSuccess?: () => void;
  className?: string;
}

interface UploadedFile {
  name: string;
  type: string;
  size: number;
  url: string;
  path: string;
  status: 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
}

export const StreamlinedFileUpload: React.FC<StreamlinedFileUploadProps> = ({
  productId,
  variantCode,
  onUploadSuccess,
  className = ""
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const updateFileStatus = (fileName: string, updates: Partial<UploadedFile>) => {
    setUploadedFiles(prev => prev.map(file => 
      file.name === fileName ? { ...file, ...updates } : file
    ));
  };

  const uploadSingleFile = async (file: File) => {
    const fileId = `${file.name}_${Date.now()}`;
    
    // Add file to state with uploading status
    const newFile: UploadedFile = {
      name: file.name,
      type: file.type,
      size: file.size,
      url: '',
      path: '',
      status: 'uploading',
      progress: 0
    };
    
    setUploadedFiles(prev => [...prev, newFile]);

    try {
      // Generate clean filename
      const fileExtension = file.name.split('.').pop();
      const baseFileName = file.name.replace(/\.[^/.]+$/, "");
      const cleanFileName = `${baseFileName.replace(/[^a-zA-Z0-9-_]/g, '_')}.${fileExtension}`;
      
      // Create organized file path
      const filePath = `products/${variantCode.toLowerCase()}/${cleanFileName}`;

      console.log('Uploading file:', { originalName: file.name, filePath, type: file.type });

      // Update progress to 25%
      updateFileStatus(file.name, { progress: 25 });

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        console.error('Storage upload error:', error);
        throw new Error(`Upload failed: ${error.message}`);
      }

      // Update progress to 50%
      updateFileStatus(file.name, { progress: 50 });

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;
      
      // Update progress to 75%
      updateFileStatus(file.name, { progress: 75 });

      // Process the uploaded asset automatically
      const { error: processError } = await supabase.rpc('process_uploaded_asset', {
        p_product_id: productId,
        p_file_path: filePath,
        p_file_type: file.type,
        p_public_url: publicUrl
      });

      if (processError) {
        console.warn('Asset processing warning:', processError);
        // Don't fail the upload for processing errors
      }

      // Log upload in database
      try {
        await supabase.from('asset_uploads').insert({
          product_id: productId,
          file_path: filePath,
          file_type: file.type,
          file_size: file.size,
          upload_status: 'completed',
          uploaded_by: user?.id
        });
      } catch (logError) {
        console.warn('Failed to log upload:', logError);
        // Don't fail upload for logging errors
      }

      // Update file status to success
      updateFileStatus(file.name, { 
        status: 'success', 
        progress: 100, 
        url: publicUrl, 
        path: filePath 
      });

      toast({
        title: "Upload Successful",
        description: `${file.name} uploaded and linked to product successfully`,
      });

    } catch (error: any) {
      console.error('Upload error:', error);
      
      let errorMessage = 'Upload failed';
      if (error.message?.includes('policy')) {
        errorMessage = 'Please ensure you are logged in and try again';
      } else if (error.message?.includes('size')) {
        errorMessage = 'File size too large (max 50MB)';
      } else if (error.message) {
        errorMessage = error.message;
      }

      updateFileStatus(file.name, { 
        status: 'error', 
        progress: 0, 
        error: errorMessage 
      });

      toast({
        title: "Upload Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to upload files",
        variant: "destructive",
      });
      return;
    }

    if (acceptedFiles.length === 0) return;

    setIsUploading(true);
    
    // Upload files sequentially to avoid overwhelming the system
    for (const file of acceptedFiles) {
      await uploadSingleFile(file);
    }
    
    setIsUploading(false);

    // Call success callback after all uploads complete
    if (onUploadSuccess) {
      onUploadSuccess();
    }
  }, [productId, variantCode, user, onUploadSuccess, toast]);

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'model/gltf-binary': ['.glb'],
      'application/octet-stream': ['.glb']
    },
    maxFiles: 10,
    disabled: isUploading,
    maxSize: 50 * 1024 * 1024 // 50MB
  });

  const removeFile = (fileName: string) => {
    setUploadedFiles(prev => prev.filter(file => file.name !== fileName));
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (type.includes('gltf') || type.includes('glb')) return <Box className="h-4 w-4" />;
    return <Upload className="h-4 w-4" />;
  };

  const getFileTypeLabel = (type: string) => {
    if (type.startsWith('image/')) return 'Image';
    if (type.includes('gltf') || type.includes('glb')) return '3D Model';
    return 'File';
  };

  if (!user) {
    return (
      <div className={`border-2 border-dashed border-border rounded-lg p-6 text-center ${className}`}>
        <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-foreground mb-2 font-medium">Authentication Required</p>
        <p className="text-sm text-muted-foreground">
          Please log in to upload files for {variantCode}
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200 ${
          isDragActive 
            ? 'border-primary bg-primary/5 scale-102' 
            : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-accent/20'
        } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        <div className="space-y-2">
          <Upload className={`mx-auto h-12 w-12 transition-colors ${
            isDragActive ? 'text-primary' : 'text-muted-foreground'
          }`} />
          {isDragActive ? (
            <p className="text-primary font-medium text-lg">Drop files here for {variantCode}...</p>
          ) : (
            <div className="space-y-1">
              <p className="text-foreground font-medium">
                Drag & drop files for {variantCode}
              </p>
              <p className="text-sm text-muted-foreground">
                or click to browse files
              </p>
              <p className="text-xs text-muted-foreground">
                Supports: JPG, PNG (images) • GLB (3D models) • Max 50MB each
              </p>
            </div>
          )}
        </div>
      </div>

      {/* File Rejections */}
      {fileRejections.length > 0 && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <div className="flex items-center gap-2 text-destructive mb-2">
            <AlertCircle className="h-4 w-4" />
            <span className="font-medium">Some files were rejected:</span>
          </div>
          <ul className="text-sm text-destructive/80 space-y-1">
            {fileRejections.map(({ file, errors }) => (
              <li key={file.name}>
                <strong>{file.name}:</strong> {errors.map(e => e.message).join(', ')}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-foreground">Files for {variantCode}:</h4>
          {uploadedFiles.map((file, index) => (
            <div key={`${file.name}_${index}`} className={`p-4 rounded-lg border transition-all ${
              file.status === 'success' 
                ? 'bg-success/10 border-success/20' 
                : file.status === 'error' 
                ? 'bg-destructive/10 border-destructive/20'
                : 'bg-muted/50 border-border'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="flex-shrink-0">
                    {file.status === 'success' && <CheckCircle className="h-5 w-5 text-success" />}
                    {file.status === 'error' && <AlertCircle className="h-5 w-5 text-destructive" />}
                    {file.status === 'uploading' && (
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent" />
                    )}
                  </div>
                  
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      {getFileIcon(file.type)}
                      <span className="font-medium text-sm truncate">{file.name}</span>
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                        {getFileTypeLabel(file.type)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                      {file.status === 'uploading' && ` • ${file.progress}%`}
                    </p>
                    {file.error && (
                      <p className="text-xs text-destructive mt-1">{file.error}</p>
                    )}
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(file.name)}
                  className="flex-shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              {file.status === 'uploading' && (
                <div className="w-full bg-muted rounded-full h-2 mt-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${file.progress}%` }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {isUploading && (
        <div className="text-center py-2">
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
            Processing uploads for {variantCode}...
          </div>
        </div>
      )}
    </div>
  );
};
