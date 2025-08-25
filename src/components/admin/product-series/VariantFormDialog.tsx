import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog"
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Variant } from '@/types';
import { Label } from '@/components/ui/label';
import { FileUploadManager } from '@/components/admin/FileUploadManager';
import { ProductSeries } from '@/types/product-series';

const formSchema = z.object({
  variant_code: z.string().min(2, {
    message: "Variant code must be at least 2 characters.",
  }),
  description: z.string().optional(),
})

interface VariantFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productSeries: ProductSeries;
  variant?: Variant;
  onSave: (variant: Variant) => void;
}

export const VariantFormDialog = ({
  open,
  onOpenChange,
  productSeries,
  variant,
  onSave
}: VariantFormDialogProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      variant_code: variant?.variant_code || "",
      description: variant?.description || "",
    },
  })

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const newVariant = {
      ...values,
      product_series_id: productSeries.id,
      id: variant?.id,
    };
    onSave(newVariant);
    onOpenChange(false);
  }

  const handleSubmit = form.handleSubmit(onSubmit);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{variant ? "Edit Variant" : "Create Variant"}</DialogTitle>
          <DialogDescription>
            {variant ? "Edit details for this variant." : "Add a new variant to the product series."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <FormField
            control={form.control}
            name="variant_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Variant Code</FormLabel>
                <FormControl>
                  <Input placeholder="VR01" {...field} />
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
                  <Input placeholder="A short description" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4">
            <Label>Upload Assets</Label>
            <FileUploadManager
              productId={productSeries.id}
              variantCode={form.getValues().variant_code}
              allowedTypes={['.glb', '.jpg', '.jpeg', '.png']}
              maxFiles={10}
              onUploadSuccess={(files) => {
                console.log('Files uploaded for variant:', files);
                // Handle uploaded files
              }}
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit">
              {variant ? "Update Variant" : "Create Variant"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
