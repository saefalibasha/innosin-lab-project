
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
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
import { useToast } from "@/hooks/use-toast"
import { Plus, Trash, Edit } from 'lucide-react';
import { ProductSeries } from '@/types/product-series';
import { Variant } from '@/types';
import { updateProductSeries } from '@/lib/api/product-series';
import { createVariant, deleteVariant } from '@/lib/api/variants';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface EnhancedVariantEditorProps {
  variant: any;
  onVariantUpdated: () => void;
  seriesName: string;
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
  variant, 
  onVariantUpdated,
  seriesName 
}: EnhancedVariantEditorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: variant?.name || "",
      variant_code: variant?.product_code || "",
      description: variant?.description || "",
    },
  })

  const handleSave = async (values: z.infer<typeof formSchema>) => {
    try {
      // Update variant logic here
      await onVariantUpdated();
      setIsOpen(false);
      toast({
        title: "Success",
        description: "Variant updated successfully",
      });
    } catch (error) {
      console.error('Error updating variant:', error);
      toast({
        title: "Error",
        description: "Failed to update variant",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Variant - {variant?.name}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
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
              name="variant_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Variant Code</FormLabel>
                  <FormControl>
                    <Input placeholder="Variant Code" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <Label>Upload Assets</Label>
              <FileUploadManager
                productId={variant?.id}
                variantCode={form.getValues().variant_code}
                allowedTypes={['.glb', '.jpg', '.jpeg', '.png']}
                maxFiles={10}
                onUploadSuccess={(files) => {
                  console.log('Files uploaded:', files);
                }}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
