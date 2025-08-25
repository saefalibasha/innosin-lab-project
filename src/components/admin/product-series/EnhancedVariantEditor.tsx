import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ProductSeries } from '@/types';
import { FileUploadManager } from '@/components/admin/FileUploadManager';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "@/hooks/use-toast"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { updateProductSeries } from "@/lib/api/product-series"
import { createVariant } from "@/lib/api/variants"
import { deleteVariant } from "@/lib/api/variants"
import { useToast } from "@/hooks/use-toast"
import { Plus, Trash } from 'lucide-react';

interface EnhancedVariantEditorProps {
  productSeries: ProductSeries;
  onUpdate: (updatedSeries: ProductSeries) => void;
  onAddVariant: (newVariant: any) => void;
  onDeleteVariant: (variantId: string) => void;
}

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Variant name must be at least 2 characters.",
  }),
  variant_code: z.string().min(2, {
    message: "Variant code must be at least 2 characters.",
  }),
  description: z.string().optional(),
})

export const EnhancedVariantEditor = ({ 
  productSeries, 
  onUpdate, 
  onAddVariant,
  onDeleteVariant 
}: EnhancedVariantEditorProps) => {
  const [editingVariant, setEditingVariant] = useState<any>(null);
  const [newVariantName, setNewVariantName] = useState('');
  const [newVariantCode, setNewVariantCode] = useState('');
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      variant_code: "",
      description: "",
    },
  })

  const { mutate: updateSeries, isPending: isUpdating } = useMutation({
    mutationFn: updateProductSeries,
    onSuccess: () => {
      toast({
        title: "Successfully updated product series!",
      })
      queryClient.invalidateQueries({ queryKey: ['product-series', productSeries.id] })
    },
    onError: (error) => {
      toast({
        title: "Something went wrong!",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  const { mutate: addVariant, isPending: isCreating } = useMutation({
    mutationFn: createVariant,
    onSuccess: () => {
      toast({
        title: "Successfully created variant!",
      })
      queryClient.invalidateQueries({ queryKey: ['product-series', productSeries.id] })
    },
    onError: (error) => {
      toast({
        title: "Something went wrong!",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  const { mutate: removeVariant, isPending: isDeleting } = useMutation({
    mutationFn: deleteVariant,
    onSuccess: () => {
      toast({
        title: "Successfully deleted variant!",
      })
      queryClient.invalidateQueries({ queryKey: ['product-series', productSeries.id] })
    },
    onError: (error) => {
      toast({
        title: "Something went wrong!",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  const handleEdit = (variant: any) => {
    setEditingVariant(variant);
  };

  const handleCancelEdit = () => {
    setEditingVariant(null);
  };

  const handleSave = async (variant: any) => {
    // Here you would typically make an API call to save the changes
    // to the variant. For this example, we'll just update the local state.
    onUpdate({
      ...productSeries,
      variants: productSeries.variants?.map((v) =>
        v.id === variant.id ? { ...v, ...editingVariant } : v
      ),
    });
    setEditingVariant(null);
  };

  const handleAddVariant = async () => {
    if (newVariantName && newVariantCode) {
      // Here you would typically make an API call to add the new variant
      // to the product series. For this example, we'll just update the local state.
      const newVariant = {
        id: Date.now().toString(), // Temporary ID
        name: newVariantName,
        variant_code: newVariantCode,
        product_series_id: productSeries.id,
      };
      addVariant({
        ...newVariant,
      })
      onAddVariant(newVariant);
      setNewVariantName('');
      setNewVariantCode('');
    }
  };

  const handleDeleteVariant = async (variantId: string) => {
    removeVariant({
      id: variantId,
    })
    onDeleteVariant(variantId);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">{productSeries.name}</h2>
        <p className="text-gray-500">Series Code: {productSeries.series_code}</p>
      </div>

      <div className="grid gap-6">
        {productSeries.variants?.map((variant) => (
          <Card key={variant.id} className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{variant.name}</h3>
              <div>
                {editingVariant?.id === variant.id ? null : (
                  <Button variant="outline" size="sm" onClick={() => handleEdit(variant)}>
                    Edit
                  </Button>
                )}
                <Button variant="destructive" size="sm" onClick={() => handleDeleteVariant(variant.id)} disabled={isDeleting}>
                  <Trash className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>

            {editingVariant?.id === variant.id ? (
              <div className="space-y-4">
                <Input
                  type="text"
                  placeholder="Variant Name"
                  value={editingVariant?.name || ''}
                  onChange={(e) =>
                    setEditingVariant({ ...editingVariant, name: e.target.value })
                  }
                />
                <Input
                  type="text"
                  placeholder="Variant Code"
                  value={editingVariant?.variant_code || ''}
                  onChange={(e) =>
                    setEditingVariant({ ...editingVariant, variant_code: e.target.value })
                  }
                />

                <div className="space-y-4">
                  <Label>Upload Assets</Label>
                  <FileUploadManager
                    productId={productSeries.id}
                    variantCode={variant.variant_code}
                    allowedTypes={['.glb', '.jpg', '.jpeg', '.png']}
                    maxFiles={10}
                    onFilesUploaded={(files) => {
                      console.log('Files uploaded:', files);
                      // Handle uploaded files
                    }}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="ghost" onClick={handleCancelEdit}>
                    Cancel
                  </Button>
                  <Button onClick={() => handleSave(variant)}>Save</Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p>Variant Code: {variant.variant_code}</p>
                {/* Display other variant details here */}
              </div>
            )}
          </Card>
        ))}
      </div>

      <div className="border rounded-md p-4">
        <h3 className="text-lg font-semibold mb-2">Add New Variant</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            type="text"
            placeholder="New Variant Name"
            value={newVariantName}
            onChange={(e) => setNewVariantName(e.target.value)}
          />
          <Input
            type="text"
            placeholder="New Variant Code"
            value={newVariantCode}
            onChange={(e) => setNewVariantCode(e.target.value)}
          />
        </div>
        <Button className="mt-4" onClick={handleAddVariant} disabled={isCreating}>
          <Plus className="h-4 w-4 mr-2" />
          Add Variant
        </Button>
      </div>
    </div>
  );
};
