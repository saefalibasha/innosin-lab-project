
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from 'sonner';
import { DatabaseProduct } from '@/types/supabase';
import { Product } from '@/types/product';
import { fetchProductsByParentSeriesId, updateProduct } from '@/api/products';
import { useParams } from 'react-router-dom';
import { Plus, Edit, Trash2, Image, Box, Eye } from 'lucide-react';
import { AssetStatusIndicator } from './AssetStatusIndicator';
import { EnhancedVariantEditor } from './EnhancedVariantEditor';
import { AssetPreviewModal } from './AssetPreviewModal';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Switch } from "@/components/ui/switch"

const transformDatabaseVariant = (dbVariant: any): Product => {
  return {
    id: dbVariant.id,
    name: dbVariant.name,
    category: dbVariant.category,
    dimensions: dbVariant.dimensions || '',
    modelPath: dbVariant.model_path || '',
    thumbnail: dbVariant.thumbnail_path || '',
    images: dbVariant.additional_images || [],
    description: dbVariant.description || '',
    fullDescription: dbVariant.full_description || dbVariant.description || '',
    specifications: Array.isArray(dbVariant.specifications) ? dbVariant.specifications : [],
    finishes: [],
    variants: [],
    baseProductId: dbVariant.parent_series_id,
    finish_type: dbVariant.finish_type,
    orientation: dbVariant.orientation,
    drawer_count: dbVariant.drawer_count || 0,
    door_type: dbVariant.door_type,
    product_code: dbVariant.product_code || '',
    thumbnail_path: dbVariant.thumbnail_path,
    model_path: dbVariant.model_path,
    mounting_type: dbVariant.mounting_type,
    mixing_type: dbVariant.mixing_type,
    handle_type: dbVariant.handle_type,
    emergency_shower_type: dbVariant.emergency_shower_type,
    company_tags: dbVariant.company_tags || [],
    product_series: dbVariant.product_series || '',
    parent_series_id: dbVariant.parent_series_id,
    created_at: dbVariant.created_at,
    updated_at: dbVariant.updated_at,
    is_active: dbVariant.is_active
  };
};

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Product name must be at least 2 characters.",
  }),
  product_code: z.string().min(2, {
    message: "Product code must be at least 2 characters.",
  }),
  dimensions: z.string().optional(),
  thumbnail_path: z.string().optional(),
  model_path: z.string().optional(),
  is_active: z.boolean().default(false),
});

interface VariantManagerProps {
  seriesId: string;
}

const VariantManager: React.FC<VariantManagerProps> = ({ seriesId }) => {
  const [variants, setVariants] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<Product | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [previewVariant, setPreviewVariant] = useState<Product | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      product_code: "",
      dimensions: "",
      thumbnail_path: "",
      model_path: "",
      is_active: false,
    },
  })

  useEffect(() => {
    if (seriesId) {
      fetchVariants(seriesId);
    }
  }, [seriesId]);

  const fetchVariants = async (seriesId: string) => {
    setLoading(true);
    try {
      const data = await fetchProductsByParentSeriesId(seriesId);
      const transformedVariants = data.map(transformDatabaseVariant);
      setVariants(transformedVariants);
    } catch (error) {
      console.error("Error fetching variants:", error);
      toast.error("Failed to load variants.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (variant: Product) => {
    setSelectedVariant(variant);
    form.reset({
      name: variant.name,
      product_code: variant.product_code,
      dimensions: variant.dimensions,
      thumbnail_path: variant.thumbnail,
      model_path: variant.modelPath,
      is_active: variant.is_active || false,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateVariant = async (values: z.infer<typeof formSchema>) => {
    if (!selectedVariant) return;

    try {
      const updatedVariantData: Partial<DatabaseProduct> = {
        name: values.name,
        product_code: values.product_code,
        dimensions: values.dimensions || null,
        thumbnail_path: values.thumbnail_path || null,
        model_path: values.model_path || null,
        is_active: values.is_active,
      };

      const updatedProduct = await updateProduct(selectedVariant.id, updatedVariantData);
      
      // Optimistically update the local state
      setVariants(prevVariants =>
        prevVariants.map(v =>
          v.id === selectedVariant.id
            ? transformDatabaseVariant(updatedProduct)
            : v
        )
      );

      toast.success("Variant updated successfully!");
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error("Error updating variant:", error);
      toast.error("Failed to update variant.");
    }
  };

  const handleDeleteVariant = async (variantId: string) => {
    // Implement delete logic here
    console.log(`Deleting variant with ID: ${variantId}`);
  };

  if (loading) {
    return <div>Loading variants...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Variants</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Assets</TableHead>
                <TableHead>Dimensions</TableHead>
                <TableHead>Active</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {variants.map((variant) => {
                const hasImage = Boolean(variant.thumbnail || variant.thumbnail_path);
                const hasModel = Boolean(variant.modelPath || variant.model_path);
                
                return (
                  <TableRow key={variant.id}>
                    <TableCell className="font-medium">{variant.name}</TableCell>
                    <TableCell>{variant.product_code}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <AssetStatusIndicator 
                          hasImage={hasImage}
                          hasModel={hasModel}
                          productCode={variant.product_code}
                        />
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setPreviewVariant(variant);
                            setIsPreviewOpen(true);
                          }}
                          className="gap-1"
                        >
                          <Eye className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>{variant.dimensions}</TableCell>
                    <TableCell>{variant.is_active ? 'Yes' : 'No'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <EnhancedVariantEditor
                          variant={variant}
                          onVariantUpdated={() => fetchVariants(seriesId)}
                          seriesName="Product Series"
                        />
                        <Button variant="ghost" size="sm" onClick={() => handleEditClick(variant)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Quick Edit
                        </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-red-500">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete this variant from our servers.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteVariant(variant.id)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </ScrollArea>

        {/* Edit Variant Dialog */}
        <AlertDialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Edit Variant</AlertDialogTitle>
              <AlertDialogDescription>
                Make changes to the variant details here. Click save when you're done.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleUpdateVariant)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Variant Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="product_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Code</FormLabel>
                      <FormControl>
                        <Input placeholder="Product Code" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dimensions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dimensions</FormLabel>
                      <FormControl>
                        <Input placeholder="Dimensions" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="thumbnail_path"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Thumbnail Path</FormLabel>
                      <FormControl>
                        <Input placeholder="Thumbnail Path" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="model_path"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Model Path</FormLabel>
                      <FormControl>
                        <Input placeholder="Model Path" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel>Active</FormLabel>
                        <FormDescription>
                          Set the variant as active or inactive.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setIsEditDialogOpen(false)}>Cancel</AlertDialogCancel>
                  <Button type="submit">Save Changes</Button>
                </AlertDialogFooter>
              </form>
            </Form>
          </AlertDialogContent>
        </AlertDialog>

        {/* Asset Preview Modal */}
        <AssetPreviewModal
          open={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          productCode={previewVariant?.product_code || ''}
          productName={previewVariant?.name || ''}
          thumbnailPath={previewVariant?.thumbnail || previewVariant?.thumbnail_path}
          modelPath={previewVariant?.modelPath || previewVariant?.model_path}
          additionalImages={previewVariant?.images || []}
        />
      </CardContent>
    </Card>
  );
};

export default VariantManager;
