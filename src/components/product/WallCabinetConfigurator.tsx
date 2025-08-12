import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { ProductVariant, WallCabinetConfiguration } from '@/types/product';

interface WallCabinetConfiguratorProps {
  variants: ProductVariant[];
  onConfigurationSelect: (configuration: WallCabinetConfiguration) => void;
}

const WallCabinetConfigurator: React.FC<WallCabinetConfiguratorProps> = ({
  variants,
  onConfigurationSelect,
}) => {
  const [selectedDoorType, setSelectedDoorType] = useState<string>('Right Hinged');
  const [selectedFinish, setSelectedFinish] = useState<string>('PC');
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [configurations, setConfigurations] = useState<WallCabinetConfiguration[]>([]);

  useEffect(() => {
    if (variants && variants.length > 0) {
      // Pre-select the first variant
      setSelectedVariant(variants[0]);

      // Generate configurations based on variants
      const generatedConfigurations = variants.flatMap(variant => {
        // Create configuration objects
        const rightHingeDoor = {
          id: `${variant.id}-right`,
          name: `${variant.name} - Right Hinged Door`,
          dimensions: variant.dimensions, // Fixed: was 'dimension'
          type: variant.door_type || 'Right Hinged',
          finish: variant.finish_type || 'PC',
          variants: [variant],
          availableFinishes: ['PC', 'SS'] // Added missing property
        };

        const leftHingeDoor = {
          id: `${variant.id}-left`,
          name: `${variant.name} - Left Hinged Door`,
          dimensions: variant.dimensions, // Fixed: was 'dimension'
          type: variant.door_type || 'Left Hinged',
          finish: variant.finish_type || 'PC',
          variants: [variant],
          availableFinishes: ['PC', 'SS'] // Added missing property
        };

        return [rightHingeDoor, leftHingeDoor];
      });

      setConfigurations(generatedConfigurations);
      onConfigurationSelect(generatedConfigurations[0]);
    }
  }, [variants, onConfigurationSelect]);

  const handleDoorTypeChange = (doorType: string) => {
    setSelectedDoorType(doorType);
  };

  const handleFinishChange = (finish: string) => {
    setSelectedFinish(finish);
  };

  const handleVariantChange = (variant: ProductVariant) => {
    setSelectedVariant(variant);
  };

  const handleConfigurationSelect = (config: WallCabinetConfiguration) => {
    onConfigurationSelect(config);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Select Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {configurations.map((config) => (
            <div key={config.id} className="border rounded-md p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">{config.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {config.dimensions} - {config.type}
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => handleConfigurationSelect(config)}>
                  Select
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {selectedVariant && (
        <Card>
          <CardHeader>
            <CardTitle>Selected Variant Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">Door Type</h4>
              <Select value={selectedDoorType} onValueChange={handleDoorTypeChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select door type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Right Hinged">Right Hinged</SelectItem>
                  <SelectItem value="Left Hinged">Left Hinged</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Available Finishes</h4>
              <div className="flex gap-2">
                {configurations[0]?.availableFinishes.map((finish) => (
                  <Badge key={finish} variant="outline">
                    {finish === 'PC' ? 'Powder Coat' : 'Stainless Steel'}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WallCabinetConfigurator;
