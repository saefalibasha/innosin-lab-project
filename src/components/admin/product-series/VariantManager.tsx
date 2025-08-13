
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
import { Product } from '@/types/product';
import { fetchProductsByParentSeriesId, updateProduct } from '@/api/products';
import { Plus, Edit, Trash2 } from 'lucide-react';
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
import { supabase } from '@/integrations/supabase/client';

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
  finish_type: z.string().optional(),
  orientation: z.string().optional(),
  door_type: z.string().optional(),
  mounting_type: z.string().optional(),
  mixing_type: z.string().optional(),
  handle_type: z.string().optional(),
  emergency_shower_type: z.string().optional(),
  drawer_count: z.number().optional(),
});

interface VariantManagerProps {
  seriesId: string;
  onVariantsUpdated?: () => void;
}

export const VariantManager: React.FC<VariantManagerProps> = ({ seriesId, onVariantsUpdated }) => {
  const [variants, setVariants] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<Product | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      product_code: "",
      dimensions: "",
      thumbnail_path: "",
      model_path: "",
      is_active: false,
      finish_type: "",
      orientation: "",
      door_type: "",
      mounting_type: "",
      mixing_type: "",
      handle_type: "",
      emergency_shower_type: "",
      drawer_count: 0,
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
      finish_type: variant.finish_type || "",
      orientation: variant.orientation || "",
      door_type: variant.door_type || "",
      mounting_type: variant.mounting_type || "",
      mixing_type: variant.mixing_type || "",
      handle_type: variant.handle_type || "",
      emergency_shower_type: variant.emergency_shower_type || "",
      drawer_count: variant.drawer_count || 0,
    });
    setIsEditDialogOpen(true);
  };

  const handleAddClick = () => {
    setSelectedVariant(null);
    form.reset({
      name: "",
      product_code: "",
      dimensions: "",
      thumbnail_path: "",
      model_path: "",
      is_active: true,
      finish_type: "",
      orientation: "",
      door_type: "",
      mounting_type: "",
      mixing_type: "",
      handle_type: "",
      emergency_shower_type: "",
      drawer_count: 0,
    });
    setIsAddDialogOpen(true);
  };

  const handleSaveVariant = async (values: z.infer<typeof formSchema>) => {
    try {
      const variantData = {
        name: values.name,
        product_code: values.product_code,
        dimensions: values.dimensions || null,
        thumbnail_path: values.thumbnail_path || null,
        model_path: values.model_path || null,
        is_active: values.is_active,
        finish_type: values.finish_type || null,
        orientation: values.orientation || null,
        door_type: values.door_type || null,
        mounting_type: values.mounting_type || null,
        mixing_type: values.mixing_type || null,
        handle_type: values.handle_type || null,
        emergency_shower_type: values.emergency_shower_type || null,
        drawer_count: values.drawer_count || null,
        parent_series_id: seriesId,
        is_series_parent: false,
      };

      if (selectedVariant) {
        // Update existing variant
        const updatedProduct = await updateProduct(selectedVariant.id, variantData);
        
        setVariants(prevVariants =>
          prevVariants.map(v =>
            v.id === selectedVariant.id
              ? transformDatabaseVariant(updatedProduct)
              : v
          )
        );

        toast.success("Variant updated successfully!");
        setIsEditDialogOpen(false);
      } else {
        // Create new variant
        const { data: newProduct, error } = await supabase
          .from('products')
          .insert([variantData])
          .select()
          .single();

        if (error) throw error;

        const transformedNewVariant = transformDatabaseVariant(newProduct);
        setVariants(prev => [...prev, transformedNewVariant]);

        toast.success("Variant created successfully!");
        setIsAddDialogOpen(false);
      }

      onVariantsUpdated?.();
    } catch (error) {
      console.error("Error saving variant:", error);
      toast.error("Failed to save variant.");
    }
  };

  const handleDeleteVariant = async (variantId: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', variantId);

      if (error) throw error;

      setVariants(prev => prev.filter(v => v.id !== variantId));
      toast.success("Variant deleted successfully!");
      onVariantsUpdated?.();
    } catch (error) {
      console.error("Error deleting variant:", error);
      toast.error("Failed to delete variant.");
    }
  };

  if (loading) {
    return <div>Loading variants...</div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Manage Variants</CardTitle>
        <Button onClick={handleAddClick}>
          <Plus className="h-4 w-4 mr-2" />
          Add Variant
        </Button>
      </CardHeader>
      <CardContent>
        <ScrollArea className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Dimensions</TableHead>
                <TableHead>Finish</TableHead>
                <TableHead>Active</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {variants.map((variant) => (
                <TableRow key={variant.id}>
                  <TableCell className="font-medium">{variant.name}</TableCell>
                  <TableCell>{variant.product_code}</TableCell>
                  <TableCell>{variant.dimensions}</TableCell>
                  <TableCell>{variant.finish_type}</TableCell>
                  <TableCell>{variant.is_active ? 'Yes' : 'No'}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleEditClick(variant)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
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
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>

        {/* Edit/Add Variant Dialog */}
        <AlertDialog open={isEditDialogOpen || isAddDialogOpen} onOpenChange={(open) => {
          setIsEditDialogOpen(false);
          setIsAddDialogOpen(false);
        }}>
          <AlertDialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <AlertDialogHeader>
              <AlertDialogTitle>
                {selectedVariant ? 'Edit Variant' : 'Add New Variant'}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {selectedVariant ? 'Make changes to the variant details here.' : 'Create a new variant for this product series.'}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSaveVariant)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
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
                </div>

                <div className="grid grid-cols-2 gap-4">
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
                    name="finish_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Finish Type</FormLabel>
                        <FormControl>
                          <Input placeholder="Finish Type" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="orientation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Orientation</FormLabel>
                        <FormControl>
                          <Input placeholder="Orientation" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="door_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Door Type</FormLabel>
                        <FormControl>
                          <Input placeholder="Door Type" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="mounting_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mounting Type</FormLabel>
                        <FormControl>
                          <Input placeholder="Mounting Type" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="mixing_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mixing Type</FormLabel>
                        <FormControl>
                          <Input placeholder="Mixing Type" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="handle_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Handle Type</FormLabel>
                        <FormControl>
                          <Input placeholder="Handle Type" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="emergency_shower_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Emergency Shower Type</FormLabel>
                        <FormControl>
                          <Input placeholder="Emergency Shower Type" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="drawer_count"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Drawers</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0" 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
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
                  <AlertDialogCancel onClick={() => {
                    setIsEditDialogOpen(false);
                    setIsAddDialogOpen(false);
                  }}>Cancel</AlertDialogCancel>
                  <Button type="submit">
                    {selectedVariant ? 'Save Changes' : 'Create Variant'}
                  </Button>
                </AlertDialogFooter>
              </form>
            </Form>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
};

export default VariantManager;
