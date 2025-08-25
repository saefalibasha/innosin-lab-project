
import React from 'react';
import { StreamlinedFileUpload } from './StreamlinedFileUpload';

interface FileUploadManagerProps {
  productId?: string;
  variantCode?: string;
  onUploadSuccess?: (file: any) => void;
  allowedTypes?: string[];
  maxFiles?: number;
}

/**
 * @deprecated Use StreamlinedFileUpload directly for new implementations
 * This component is maintained for backwards compatibility
 */
export const FileUploadManager: React.FC<FileUploadManagerProps> = ({
  productId,
  variantCode,
  onUploadSuccess,
  allowedTypes,
  maxFiles
}) => {
  // If missing required props, show helpful message
  if (!productId || !variantCode) {
    return (
      <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
        <p className="text-muted-foreground">
          Product ID and Variant Code are required for file uploads
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
        <p className="text-sm text-amber-800">
          <strong>Note:</strong> This component has been replaced with a streamlined version. 
          All files are automatically processed and linked to products.
        </p>
      </div>
      
      <StreamlinedFileUpload
        productId={productId}
        variantCode={variantCode}
        onUploadSuccess={onUploadSuccess}
      />
    </div>
  );
};
