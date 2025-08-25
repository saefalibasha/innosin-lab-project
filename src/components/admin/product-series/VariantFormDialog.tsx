
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
import { Label } from '@/components/ui/label';
import { FileUploadManager } from '@/components/admin/FileUploadManager';

const formSchema = z.object({
  variant_code: z.string().min(2, {
    message: "Variant code must be at least 2 characters.",
  }),
  description: z.string().optional(),
})

interface VariantFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  seriesId: string;
  seriesName: string;
  variant?: any;
  onVariantSaved: () => void;
}

export const VariantFormDialog = ({
  open,
  onOpenChange,
  seriesId,
  seriesName,
  variant,
  onVariantSaved
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
      product_series_id: seriesId,
      id: variant?.id,
    };
    onVariantSaved();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{variant ? "Edit Variant" : "Create Variant"}</DialogTitle>
          <DialogDescription>
            {variant ? "Edit details for this variant." : "Add a new variant to the product series."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                productId={seriesId}
                variantCode={form.getValues().variant_code}
                allowedTypes={['.glb', '.jpg', '.jpeg', '.png']}
                maxFiles={10}
                onUploadSuccess={(files) => {
                  console.log('Files uploaded for variant:', files);
                }}
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit">
                {variant ? "Update Variant" : "Create Variant"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
