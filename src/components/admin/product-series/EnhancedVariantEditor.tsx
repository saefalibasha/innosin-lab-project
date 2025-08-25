import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Product } from '@/types/product';
import { FileUploadManager } from '../FileUploadManager';
import { AssetStatusIndicator } from './AssetStatusIndicator';
import { 
  Edit, 
  ChevronDown, 
  ChevronRight, 
  Image, 
  Box, 
  Settings,
  Info,
  Upload,
  Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface EnhancedVariantEditorProps {
  variant: Product;
  onVariantUpdated: () => void;
  seriesName?: string;
}

export const EnhancedVariantEditor: React.FC<EnhancedVariantEditorProps> = ({
  variant,
  onVariantUpdated,
  seriesName
}) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [sectionsOpen, setSectionsOpen] = useState({
    basic: true,
    configurator: true,
    assets: true,
    advanced: false
  });

  const [formData, setFormData] = useState({
    name: variant.name || '',
    product_code: variant.product_code || '',
    description: variant.description || '',
    editable_title: variant.editable_title || '',
    editable_description: variant.editable_description || '',
    dimensions: variant.dimensions || '',
    finish_type: variant.finish_type || '',
    orientation: variant.orientation || '',
    door_type: variant.door_type || '',
    drawer_count: variant.drawer_count || 0,
    mounting_type: variant.mounting_type || '',
    mixing_type: variant.mixing_type || '',
    handle_type: variant.handle_type || '',
    emergency_shower_type: variant.emergency_shower_type || '',
    is_active: variant.is_active || false
  });

  const toggleSection = (section: keyof typeof sectionsOpen) => {
    setSectionsOpen(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('products')
        .update({
          ...formData,
          updated_at: new Date().toISOString()
        })
        .eq('id', variant.id);

      if (error) throw error;
      
      toast.success('Variant updated successfully');
      onVariantUpdated();
      setOpen(false);
    } catch (error) {
      console.error('Error updating variant:', error);
      toast.error('Failed to update variant');
    } finally {
      setLoading(false);
    }
  };

  const hasImage = Boolean(variant.thumbnail || variant.thumbnail_path);
  const hasModel = Boolean(variant.modelPath || variant.model_path);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Edit className="w-4 h-4" />
          Edit Details
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Edit className="w-5 h-5" />
            Edit Variant: {variant.name}
            {seriesName && <Badge variant="outline">{seriesName}</Badge>}
          </DialogTitle>
          <div className="flex items-center gap-4 pt-2">
            <AssetStatusIndicator 
              hasImage={hasImage} 
              hasModel={hasModel}
              productCode={variant.product_code}
            />
            <Badge variant={variant.is_active ? "default" : "secondary"}>
              {variant.is_active ? "Active" : "Inactive"}
            </Badge>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-3 flex-shrink-0">
            <TabsTrigger value="details" className="gap-2">
              <Info className="w-4 h-4" />
              Details
            </TabsTrigger>
            <TabsTrigger value="configurator" className="gap-2">
              <Settings className="w-4 h-4" />
              Configurator
            </TabsTrigger>
            <TabsTrigger value="assets" className="gap-2">
              <Upload className="w-4 h-4" />
              Assets
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto">
            <form onSubmit={handleSubmit} className="space-y-6 p-1">
              <TabsContent value="details" className="space-y-6 mt-0">
                {/* Basic Information */}
                <Collapsible open={sectionsOpen.basic} onOpenChange={() => toggleSection('basic')}>
                  <CollapsibleTrigger className="flex items-center gap-2 w-full p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors">
                    {sectionsOpen.basic ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    <h3 className="font-medium">Basic Information</h3>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-4 pt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="product_code">Product Code</Label>
                        <Input
                          id="product_code"
                          value={formData.product_code}
                          onChange={(e) => setFormData({ ...formData, product_code: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="editable_title">Display Title</Label>
                      <Input
                        id="editable_title"
                        value={formData.editable_title}
                        onChange={(e) => setFormData({ ...formData, editable_title: e.target.value })}
                        placeholder="Optional custom title for display"
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="editable_description">Display Description</Label>
                      <Textarea
                        id="editable_description"
                        value={formData.editable_description}
                        onChange={(e) => setFormData({ ...formData, editable_description: e.target.value })}
                        rows={3}
                        placeholder="Optional custom description for display"
                      />
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </TabsContent>

              <TabsContent value="configurator" className="space-y-6 mt-0">
                {/* Product Configurator Fields */}
                <Collapsible open={sectionsOpen.configurator} onOpenChange={() => toggleSection('configurator')}>
                  <CollapsibleTrigger className="flex items-center gap-2 w-full p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors">
                    {sectionsOpen.configurator ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    <h3 className="font-medium">Configurator Properties</h3>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-4 pt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="dimensions">Dimensions</Label>
                        <Input
                          id="dimensions"
                          value={formData.dimensions}
                          onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                          placeholder="e.g., 24W x 24D x 36H"
                        />
                      </div>
                      <div>
                        <Label htmlFor="finish_type">Finish Type</Label>
                        <Select
                          value={formData.finish_type}
                          onValueChange={(value) => setFormData({ ...formData, finish_type: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select finish" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="powder_coated">Powder Coated</SelectItem>
                            <SelectItem value="stainless_steel">Stainless Steel</SelectItem>
                            <SelectItem value="phenolic_resin">Phenolic Resin</SelectItem>
                            <SelectItem value="epoxy_resin">Epoxy Resin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="orientation">Orientation</Label>
                        <Select
                          value={formData.orientation}
                          onValueChange={(value) => setFormData({ ...formData, orientation: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select orientation" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="left">Left</SelectItem>
                            <SelectItem value="right">Right</SelectItem>
                            <SelectItem value="center">Center</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="door_type">Door Type</Label>
                        <Select
                          value={formData.door_type}
                          onValueChange={(value) => setFormData({ ...formData, door_type: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select door type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="hinged">Hinged</SelectItem>
                            <SelectItem value="sliding">Sliding</SelectItem>
                            <SelectItem value="folding">Folding</SelectItem>
                            <SelectItem value="none">No Door</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="drawer_count">Drawer Count</Label>
                        <Input
                          id="drawer_count"
                          type="number"
                          min="0"
                          value={formData.drawer_count}
                          onChange={(e) => setFormData({ ...formData, drawer_count: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="mounting_type">Mounting Type</Label>
                        <Select
                          value={formData.mounting_type}
                          onValueChange={(value) => setFormData({ ...formData, mounting_type: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select mounting type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="wall">Wall Mount</SelectItem>
                            <SelectItem value="floor">Floor Mount</SelectItem>
                            <SelectItem value="ceiling">Ceiling Mount</SelectItem>
                            <SelectItem value="mobile">Mobile</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="handle_type">Handle Type</Label>
                        <Select
                          value={formData.handle_type}
                          onValueChange={(value) => setFormData({ ...formData, handle_type: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select handle type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="standard">Standard</SelectItem>
                            <SelectItem value="ergonomic">Ergonomic</SelectItem>
                            <SelectItem value="recessed">Recessed</SelectItem>
                            <SelectItem value="push_pull">Push/Pull</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {/* Advanced Properties */}
                <Collapsible open={sectionsOpen.advanced} onOpenChange={() => toggleSection('advanced')}>
                  <CollapsibleTrigger className="flex items-center gap-2 w-full p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors">
                    {sectionsOpen.advanced ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    <h3 className="font-medium">Advanced Properties</h3>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-4 pt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="mixing_type">Mixing Type</Label>
                        <Select
                          value={formData.mixing_type}
                          onValueChange={(value) => setFormData({ ...formData, mixing_type: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select mixing type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="manual">Manual</SelectItem>
                            <SelectItem value="electric">Electric</SelectItem>
                            <SelectItem value="pneumatic">Pneumatic</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="emergency_shower_type">Emergency Shower Type</Label>
                        <Select
                          value={formData.emergency_shower_type}
                          onValueChange={(value) => setFormData({ ...formData, emergency_shower_type: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select shower type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="overhead">Overhead</SelectItem>
                            <SelectItem value="drench_hose">Drench Hose</SelectItem>
                            <SelectItem value="eyewash">Eyewash</SelectItem>
                            <SelectItem value="combination">Combination</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </TabsContent>

              <TabsContent value="assets" className="space-y-6 mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Upload className="w-5 h-5" />
                      Asset Management
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FileUploadManager
                      productCode={formData.product_code}
                      allowedTypes={['.glb', '.jpg', '.jpeg', '.png']}
                      maxFiles={5}
                      onFilesUploaded={(files) => {
                        console.log('Files uploaded for product:', formData.product_code, files);
                        toast.success(`${files.filter(f => f.status === 'success').length} files uploaded successfully`);
                        onVariantUpdated(); // Refresh parent to show updated asset status
                      }}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <div className="flex justify-end gap-2 pt-4 border-t flex-shrink-0">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};