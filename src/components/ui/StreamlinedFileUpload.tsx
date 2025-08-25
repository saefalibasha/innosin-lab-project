
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, Image, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface StreamlinedFileUploadProps {
  onFileUploaded: (url: string) => void;
  acceptedTypes?: string;
  maxSizeMB?: number;
  className?: string;
  currentImage?: string;
}

const StreamlinedFileUpload = ({
  onFileUploaded,
  acceptedTypes = "image/*",
  maxSizeMB = 10,
  className = "",
  currentImage
}: StreamlinedFileUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (file.size > maxSizeMB * 1024 * 1024) {
      return `File size must be less than ${maxSizeMB}MB`;
    }
    
    if (!file.type.startsWith('image/')) {
      return 'Only image files are allowed';
    }
    
    return null;
  };

  const uploadFile = async (file: File) => {
    const validation = validateFile(file);
    if (validation) {
      toast.error(validation);
      return;
    }

    setUploading(true);
    
    try {
      // Create a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `shop-the-look/${fileName}`;

      const { data, error } = await supabase.storage
        .from('images')
        .upload(filePath, file);

      if (error) throw error;

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      onFileUploaded(publicUrl);
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      uploadFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragOver 
            ? 'border-primary bg-primary/5' 
            : 'border-muted-foreground/25 hover:border-muted-foreground/50'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {currentImage && !uploading ? (
          <div className="space-y-4">
            <div className="relative inline-block">
              <img
                src={currentImage}
                alt="Current background"
                className="max-h-32 rounded border"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder.svg';
                }}
              />
            </div>
            <p className="text-sm text-muted-foreground">Current background image</p>
          </div>
        ) : (
          <div className="space-y-2">
            {uploading ? (
              <Loader2 className="w-8 h-8 mx-auto animate-spin text-primary" />
            ) : (
              <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
            )}
            <div>
              <p className="font-medium">
                {uploading ? 'Uploading...' : 'Drop image here or click to browse'}
              </p>
              <p className="text-sm text-muted-foreground">
                JPG, PNG up to {maxSizeMB}MB
              </p>
            </div>
          </div>
        )}

        <div className="mt-4 space-y-2">
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full"
          >
            <Image className="w-4 h-4 mr-2" />
            {currentImage ? 'Change Background' : 'Select Image'}
          </Button>
        </div>
      </div>

      <Input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes}
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};

export default StreamlinedFileUpload;
