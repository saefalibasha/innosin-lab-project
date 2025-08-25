import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, XCircle, Image, Box, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { validateAssetAccessibility } from '@/utils/assetValidator';

interface AssetStatusIndicatorProps {
  hasImage: boolean;
  hasModel: boolean;
  imagePath?: string;
  modelPath?: string;
  productCode?: string;
  className?: string;
  showValidation?: boolean;
}

export const AssetStatusIndicator: React.FC<AssetStatusIndicatorProps> = ({
  hasImage,
  hasModel,
  imagePath,
  modelPath,
  productCode,
  className,
  showValidation = false
}) => {
  const [validationState, setValidationState] = useState<{
    imageValid?: boolean;
    modelValid?: boolean;
    isValidating: boolean;
    imageError?: string;
    modelError?: string;
  }>({ isValidating: false });

  useEffect(() => {
    if (showValidation && (imagePath || modelPath)) {
      setValidationState(prev => ({ ...prev, isValidating: true }));
      
      validateAssetAccessibility(imagePath, modelPath)
        .then(results => {
          setValidationState({
            imageValid: results.imageValid,
            modelValid: results.modelValid,
            imageError: results.imageError,
            modelError: results.modelError,
            isValidating: false
          });
        })
        .catch(() => {
          setValidationState({
            imageValid: false,
            modelValid: false,
            imageError: 'Validation failed',
            modelError: 'Validation failed',
            isValidating: false
          });
        });
    }
  }, [imagePath, modelPath, showValidation]);

  const getStatus = () => {
    if (showValidation && !validationState.isValidating) {
      const imageOk = validationState.imageValid;
      const modelOk = validationState.modelValid;
      
      if (hasImage && hasModel) {
        if (imageOk && modelOk) return 'complete';
        if (imageOk || modelOk) return 'partial';
        return 'error';
      }
      if (hasImage && imageOk) return 'partial';
      if (hasModel && modelOk) return 'partial';
      if (hasImage || hasModel) return 'error';
      return 'missing';
    }
    
    if (hasImage && hasModel) return 'complete';
    if (hasImage || hasModel) return 'partial';
    return 'missing';
  };

  const status = getStatus();

  const statusConfig = {
    complete: {
      icon: CheckCircle,
      color: 'bg-green-100 text-green-800 hover:bg-green-200',
      text: 'Complete',
      description: 'Image and 3D model available and accessible'
    },
    partial: {
      icon: AlertTriangle,
      color: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
      text: 'Partial',
      description: showValidation 
        ? (validationState.imageValid ? 'Missing or broken 3D model' : 'Missing or broken image')
        : (hasImage ? 'Missing 3D model' : 'Missing image')
    },
    missing: {
      icon: XCircle,
      color: 'bg-red-100 text-red-800 hover:bg-red-200',
      text: 'Missing',
      description: 'No assets uploaded'
    },
    error: {
      icon: XCircle,
      color: 'bg-red-100 text-red-800 hover:bg-red-200',
      text: 'Error',
      description: 'Assets exist but are not accessible'
    }
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  const getImageIndicatorColor = () => {
    if (!hasImage) return "bg-gray-300";
    if (showValidation && !validationState.isValidating) {
      return validationState.imageValid ? "bg-green-500" : "bg-red-500";
    }
    return "bg-green-500";
  };

  const getModelIndicatorColor = () => {
    if (!hasModel) return "bg-gray-300";
    if (showValidation && !validationState.isValidating) {
      return validationState.modelValid ? "bg-blue-500" : "bg-red-500";
    }
    return "bg-blue-500";
  };

  const getImageTooltip = () => {
    if (!hasImage) return "Image missing";
    if (showValidation && !validationState.isValidating) {
      return validationState.imageValid ? "Image accessible" : `Image error: ${validationState.imageError}`;
    }
    return "Image available";
  };

  const getModelTooltip = () => {
    if (!hasModel) return "3D model missing";
    if (showValidation && !validationState.isValidating) {
      return validationState.modelValid ? "3D model accessible" : `Model error: ${validationState.modelError}`;
    }
    return "3D model available";
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Badge variant="outline" className={cn(config.color, "gap-1")} title={config.description}>
        {validationState.isValidating ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : (
          <Icon className="w-3 h-3" />
        )}
        {config.text}
      </Badge>
      <div className="flex gap-1">
        <div 
          className={cn("w-2 h-2 rounded-full", getImageIndicatorColor())} 
          title={getImageTooltip()}
        />
        <div 
          className={cn("w-2 h-2 rounded-full", getModelIndicatorColor())} 
          title={getModelTooltip()}
        />
      </div>
    </div>
  );
};