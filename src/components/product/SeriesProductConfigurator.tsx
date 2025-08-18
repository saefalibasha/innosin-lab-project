import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Settings, Package } from 'lucide-react';
import { Product } from '@/types/product';

interface SeriesProductConfiguratorProps {
  series: any;
  variants: Product[];
  selectedVariantId: string;
  onVariantChange: (variantId: string) => void;
  selectedFinish: string;
  onFinishChange: (finish: string) => void;
  className?: string;
}

const SeriesProductConfigurator = ({
  series,
  variants,
  selectedVariantId,
  onVariantChange,
  selectedFinish,
  onFinishChange,
  className = ''
}: SeriesProductConfiguratorProps) => {
  const [configOptions, setConfigOptions] = useState<any>({});

  // Detect product series type for enhanced configuration
  const getSeriesType = () => {
    const seriesName = series?.product_series?.toLowerCase() || series?.name?.toLowerCase() || '';
    const category = series?.category?.toLowerCase() || '';
    
    if (seriesName.includes('mobile cabinet') || seriesName.includes('modular cabinet')) {
      return 'mobile_cabinet';
    }
    if (seriesName.includes('wall cabinet')) return 'wall_cabinet';
    if (seriesName.includes('tall cabinet')) return 'tall_cabinet';
    if (seriesName.includes('open rack')) return 'open_rack';
    if (seriesName.includes('uniflex') || seriesName.includes('tap')) return 'uniflex';
    if (seriesName.includes('emergency shower')) return 'emergency_shower';
    if (seriesName.includes('fume hood') || seriesName.includes('safe aire')) return 'fume_hood';
    if (category.includes('bio safety')) return 'bio_safety';
    
    return 'standard';
  };

  const seriesType = getSeriesType();

  // Get configurable attributes based on series type
  const getConfigurableAttributes = () => {
    const attributes = [];
    
    if (!variants || variants.length === 0) return attributes;
    
    const sampleVariant = variants[0];
    
    // Common attributes
    if (sampleVariant.dimensions) attributes.push('dimensions');
    
    // Drawer-related attributes
    if (sampleVariant.number_of_drawers || sampleVariant.drawer_count) {
      attributes.push(sampleVariant.number_of_drawers ? 'number_of_drawers' : 'drawer_count');
    }
    
    // Other attributes based on series type
    if (sampleVariant.door_type && sampleVariant.door_type !== 'None') attributes.push('door_type');
    if (sampleVariant.orientation && sampleVariant.orientation !== 'None') attributes.push('orientation');
    if (sampleVariant.mounting_type) attributes.push('mounting_type');
    if (sampleVariant.mixing_type) attributes.push('mixing_type');
    if (sampleVariant.handle_type) attributes.push('handle_type');
    if (sampleVariant.emergency_shower_type) attributes.push('emergency_shower_type');
    
    return attributes;
  };

  const configurableAttributes = getConfigurableAttributes();
  const selectedVariant = variants.find(v => v.id === selectedVariantId) || variants[0];

  // Create configuration groups
  const createConfigurationGroups = () => {
    const groups: { [key: string]: any[] } = {};
    
    configurableAttributes.forEach(attr => {
      const uniqueValues = [...new Set(variants.map(v => v[attr as keyof Product]).filter(Boolean))];
      groups[attr] = uniqueValues.map(value => ({
        value,
        variants: variants.filter(v => v[attr as keyof Product] === value)
      }));
    });

    return groups;
  };

  const configGroups = createConfigurationGroups();

  // Get attribute label
  const getAttributeLabel = (attr: string) => {
    const labels: { [key: string]: string } = {
      dimensions: 'Dimensions',
      door_type: 'Door Type',
      orientation: 'Orientation',
      drawer_count: 'Number of Drawers',
      number_of_drawers: 'Number of Drawers',
      mounting_type: 'Mounting Type',
      mixing_type: 'Mixing Type',
      handle_type: 'Handle Type',
      emergency_shower_type: 'Emergency Shower Type'
    };
    return labels[attr] || attr.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Get finish options based on series type
  const getFinishOptions = () => {
    if (seriesType === 'open_rack') {
      return [
        { value: 'PC', label: 'Powder Coat' },
        { value: 'SS304', label: 'SS304' }
      ];
    }
    
    return [
      { value: 'PC', label: 'Powder Coat' },
      { value: 'SS', label: 'Stainless Steel' }
    ];
  };

  // Handle attribute change
  const handleAttributeChange = (attr: string, value: string) => {
    let bestMatch = null;
    let bestScore = -1;

    variants.forEach(variant => {
      if (variant[attr as keyof Product]?.toString() !== value) return;

      let score = 0;
      configurableAttributes.forEach(checkAttr => {
        if (checkAttr === attr) return;
        if (selectedVariant[checkAttr as keyof Product] && 
            variant[checkAttr as keyof Product] === selectedVariant[checkAttr as keyof Product]) {
          score++;
        }
      });

      if (variant.finish_type === selectedFinish) {
        score++;
      }

      if (score > bestScore) {
        bestScore = score;
        bestMatch = variant;
      }
    });

    if (bestMatch) {
      onVariantChange(bestMatch.id);
    }
  };

  if (!variants || variants.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="py-6">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Package className="h-5 w-5" />
            <p>No configuration options available for this product.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Settings className="w-5 h-5 text-primary" />
          Product Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Configuration Options */}
        {configurableAttributes.length > 0 && (
          <div className="space-y-4">
            {configurableAttributes.map(attr => (
              <div key={attr} className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  {getAttributeLabel(attr)}
                </label>
                <Select
                  value={selectedVariant[attr as keyof Product]?.toString() || ''}
                  onValueChange={(value) => handleAttributeChange(attr, value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={`Select ${getAttributeLabel(attr).toLowerCase()}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {configGroups[attr]?.map(group => (
                      <SelectItem key={String(group.value)} value={String(group.value)}>
                        {attr === 'dimensions' ? String(group.value) :
                         attr === 'number_of_drawers' || attr === 'drawer_count' ? `${group.value} Drawers` :
                         String(group.value)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        )}

        <Separator />

        {/* Finish Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Finish</label>
          <div className="flex flex-wrap gap-2">
            {getFinishOptions().map(finish => (
              <Button
                key={finish.value}
                variant={selectedFinish === finish.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => onFinishChange(finish.value)}
                className="min-w-0"
              >
                {finish.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Series Summary */}
        <Card className="bg-muted/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                Series Products
              </span>
              <Badge variant="secondary">
                {variants.length} product{variants.length !== 1 ? 's' : ''}
              </Badge>
            </div>
            
            {/* Current Selection Details */}
            <div className="text-xs text-muted-foreground">
              <div className="flex flex-wrap gap-2">
                {selectedVariant.dimensions && (
                  <span className="bg-background px-2 py-1 rounded">
                    {selectedVariant.dimensions}
                  </span>
                )}
                {(selectedVariant.number_of_drawers || selectedVariant.drawer_count) && (
                  <span className="bg-background px-2 py-1 rounded">
                    {selectedVariant.number_of_drawers || selectedVariant.drawer_count} Drawers
                  </span>
                )}
                {selectedVariant.door_type && (
                  <span className="bg-background px-2 py-1 rounded">
                    {selectedVariant.door_type}
                  </span>
                )}
                {selectedVariant.orientation && (
                  <span className="bg-background px-2 py-1 rounded">
                    {selectedVariant.orientation}
                  </span>
                )}
                <span className="bg-background px-2 py-1 rounded">
                  {selectedFinish === 'PC' ? 'Powder Coat' : 
                   selectedFinish === 'SS' ? 'Stainless Steel' :
                   selectedFinish === 'SS304' ? 'SS304' : selectedFinish}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
};

export default SeriesProductConfigurator;
