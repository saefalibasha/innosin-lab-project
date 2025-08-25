import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, XCircle, Image, Box } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AssetStatusIndicatorProps {
  hasImage: boolean;
  hasModel: boolean;
  productCode?: string;
  className?: string;
}

export const AssetStatusIndicator: React.FC<AssetStatusIndicatorProps> = ({
  hasImage,
  hasModel,
  productCode,
  className
}) => {
  const getStatus = () => {
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
      description: 'Image and 3D model available'
    },
    partial: {
      icon: AlertTriangle,
      color: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
      text: 'Partial',
      description: hasImage ? 'Missing 3D model' : 'Missing image'
    },
    missing: {
      icon: XCircle,
      color: 'bg-red-100 text-red-800 hover:bg-red-200',
      text: 'Missing',
      description: 'No assets uploaded'
    }
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Badge variant="outline" className={cn(config.color, "gap-1")}>
        <Icon className="w-3 h-3" />
        {config.text}
      </Badge>
      <div className="flex gap-1">
        <div className={cn(
          "w-2 h-2 rounded-full",
          hasImage ? "bg-green-500" : "bg-gray-300"
        )} title={hasImage ? "Image available" : "Image missing"} />
        <div className={cn(
          "w-2 h-2 rounded-full",
          hasModel ? "bg-blue-500" : "bg-gray-300"
        )} title={hasModel ? "3D model available" : "3D model missing"} />
      </div>
    </div>
  );
};