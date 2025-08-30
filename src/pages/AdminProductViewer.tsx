import React, { Suspense } from "react";

// Lazy-load and support both named and default exports
const ProductTableViewer = React.lazy(async () => {
  const mod = await import("@/components/admin/ProductTableViewer");
  return { default: (mod as any).ProductTableViewer ?? mod.default };
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
