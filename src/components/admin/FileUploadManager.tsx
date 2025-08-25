import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, X, CheckCircle, AlertCircle } from 'lucide-react';

interface FileUploadManagerProps {
  productId?: string;
  variantCode?: string;
  onUploadSuccess?: (file: any) => void;
  allowedTypes?: string[];
  maxFiles?: number;
}

export const FileUploadManager: React.FC<FileUploadManagerProps> = ({
  productId,
  variantCode,
  onUploadSuccess,
  allowedTypes = ['.glb', '.jpg', '.jpeg', '.png'],
  maxFiles = 10
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const { toast } = useToast();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    setUploading(true);
    
    try {
      for (const file of acceptedFiles) {
        console.log('Starting upload for:', file.name, 'Size:', file.size, 'Type:', file.type);
        
        // Generate a unique filename with timestamp
        const timestamp = Date.now();
        const fileExtension = file.name.split('.').pop();
        const baseFileName = file.name.replace(/\.[^/.]+$/, "");
        let fileName = `${baseFileName}_${timestamp}.${fileExtension}`;
        
        // Create the file path in the documents bucket
        let filePath = productId && variantCode 
          ? `products/${variantCode}/${fileName}`
          : `uploads/${fileName}`;

        console.log('Uploading to path:', filePath);

        // Upload to Supabase Storage with no auth required
        let { data, error } = await supabase.storage
          .from('documents')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) {
          console.error('Upload error:', error);
          
          // Handle specific error types
          if (error.message?.includes('duplicate')) {
            // If duplicate, try with a different timestamp
            const newTimestamp = Date.now() + Math.random() * 1000;
            const newFileName = `${baseFileName}_${Math.floor(newTimestamp)}.${fileExtension}`;
            const newFilePath = productId && variantCode 
              ? `products/${variantCode}/${newFileName}`
              : `uploads/${newFileName}`;
            
            console.log('Retrying upload with new filename:', newFilePath);
            
            const { data: retryData, error: retryError } = await supabase.storage
              .from('documents')
              .upload(newFilePath, file, {
                cacheControl: '3600',
                upsert: true // Allow upsert on retry
              });
              
            if (retryError) {
              throw retryError;
            }
            
            // Update variables for success handling
            data = retryData;
            filePath = newFilePath;
            fileName = newFileName;
          } else {
            throw error;
          }
        }

        console.log('Upload successful:', data);

        // Get the public URL
        const { data: urlData } = supabase.storage
          .from('documents')
          .getPublicUrl(filePath);

        const publicUrl = urlData.publicUrl;
        console.log('Public URL generated:', publicUrl);

        // Log the upload in our database (non-blocking) - Skip database logging for now
        try {
          // Get current user for RLS
          const { data: { user } } = await supabase.auth.getUser();
          
          if (user) {
            const uploadRecord: any = {
              file_path: filePath,
              file_type: file.type,
              file_size: file.size,
              upload_status: 'completed',
              uploaded_by: user.id // Use user ID instead of 'user' string
            };

            // Only include product_id if we have one
            if (productId) {
              uploadRecord.product_id = productId;
            }

            console.log('Logging upload record:', uploadRecord);

            const { error: logError } = await supabase
              .from('asset_uploads')
              .insert(uploadRecord);

            if (logError) {
              console.warn('Failed to log upload (but upload succeeded):', logError);
            } else {
              console.log('Upload logged successfully');
            }
          } else {
            console.warn('User not authenticated, skipping database logging');
          }
        } catch (logErr) {
          console.warn('Failed to log upload (but upload succeeded):', logErr);
        }

        const fileInfo = {
          name: fileName,
          path: filePath,
          url: publicUrl,
          type: file.type,
          size: file.size,
          productId,
          variantCode
        };

        setUploadedFiles(prev => [...prev, fileInfo]);

        // Call the success callback
        if (onUploadSuccess) {
          onUploadSuccess(fileInfo);
        }

        toast({
          title: "Upload Successful",
          description: `${fileName} has been uploaded successfully`,
        });
      }
    } catch (error: any) {
      console.error('Upload failed:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to upload file';
      
      if (error.message?.includes('row-level security')) {
        errorMessage = 'Authentication required for database logging. File uploaded to storage successfully.';
      } else if (error.message?.includes('policy')) {
        errorMessage = 'Storage policy restriction. Please check your permissions.';
      } else if (error.message?.includes('Duplicate')) {
        errorMessage = 'File with this name already exists. Please rename your file or try again.';
      } else if (error.message?.includes('size')) {
        errorMessage = 'File size exceeds the maximum allowed limit.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Upload Error", 
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  }, [productId, variantCode, onUploadSuccess, toast]);

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'model/gltf-binary': ['.glb'],
      'application/octet-stream': ['.glb'] // Fallback for GLB files
    },
    maxFiles,
    disabled: uploading,
    maxSize: 50 * 1024 * 1024 // 50MB max file size
  });

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-primary bg-primary/5'
            : 'border-gray-300 hover:border-gray-400'
        } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        {isDragActive ? (
          <p className="text-primary font-medium">Drop the files here...</p>
        ) : (
          <div>
            <p className="text-gray-600 mb-2">
              Drag & drop files here, or click to select files
            </p>
            <p className="text-sm text-gray-500">
              Supported formats: {allowedTypes.join(', ')} (Max {maxFiles} files, 50MB each)
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Files will be uploaded to public storage
            </p>
          </div>
        )}
      </div>

      {fileRejections.length > 0 && (
        <div className="text-red-600 text-sm space-y-1">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span className="font-medium">Some files were rejected:</span>
          </div>
          {fileRejections.map(({ file, errors }) => (
            <div key={file.name} className="ml-6">
              {file.name}: {errors.map(e => e.message).join(', ')}
            </div>
          ))}
        </div>
      )}

      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium">Uploaded Files:</h4>
          {uploadedFiles.map((file, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium">{file.name}</span>
                <span className="text-xs text-gray-500">
                  ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeFile(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {uploading && (
        <div className="text-center">
          <div className="inline-flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            <span className="text-sm text-gray-600">Uploading files...</span>
          </div>
        </div>
      )}
    </div>
  );
};
