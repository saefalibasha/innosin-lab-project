
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ProductSidebarProps {
  // Add props as needed
}

const ProductSidebar: React.FC<ProductSidebarProps> = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Products</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Product catalog will be displayed here
        </p>
      </CardContent>
    </Card>
  );
};

export default ProductSidebar;
