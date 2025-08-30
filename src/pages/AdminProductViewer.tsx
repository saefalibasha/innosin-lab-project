import React, { Suspense } from "react";

// Lazy-load and support both named and default exports without TS complaints
const ProductTableViewer = React.lazy(async () => {
  const mod: any = await import("@/components/admin/ProductTableViewer");
  const Comp = mod.ProductTableViewer ?? mod.default;

  if (!Comp) {
    const Missing: React.FC = () => (
      <div className="p-4 rounded border border-red-300 bg-red-50 text-red-700">
        <strong>ProductTableViewer</strong> not found. Ensure
        <code className="px-1"> @/components/admin/ProductTableViewer </code>
        exports either <code className="px-1">default</code> or a named
        <code className="px-1">ProductTableViewer</code>.
      </div>
    );
    return { default: Missing };
  }

  return { default: Comp };
});

const AdminProductViewer: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">Product Database Viewer</h1>

        <Suspense
          fallback={
            <div className="flex items-center gap-3 text-muted-foreground">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" />
              <span>Loading product table…</span>
            </div>
          }
        >
          <ProductTableViewer />
        </Suspense>
      </div>
    </div>
  );
};

export default AdminProductViewer;
