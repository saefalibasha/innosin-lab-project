import React, { useState, useMemo } from 'react';
import { Product } from '@/types/product';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, Ruler, Grid, Palette } from 'lucide-react';

interface ConfiguratorOption {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  description: string;
  content: React.ReactNode;
}

interface InnosinLabConfiguratorProps {
  product: Product;
}

const InnosinLabConfigurator: React.FC<InnosinLabConfiguratorProps> = ({ product }) => {
  const [activeOption, setActiveOption] = useState<string>('details');

  const configuratorOptions: ConfiguratorOption[] = useMemo(() => [
    {
      id: 'details',
      name: 'Details',
      icon: Package,
      description: 'View product details',
      content: (
        <div>
          <p>{product.description}</p>
          {product.specifications && product.specifications.length > 0 && (
            <>
              <h4 className="text-md font-semibold mt-4">Specifications:</h4>
              <ul>
                {product.specifications.map((spec, index) => (
                  <li key={index}>{spec}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      ),
    },
    {
      id: 'dimensions',
      name: 'Dimensions',
      icon: Ruler,
      description: 'Explore product dimensions',
      content: (
        <div>
          <p>Dimensions: {product.dimensions}</p>
        </div>
      ),
    },
    {
      id: 'grid',
      name: 'Grid',
      icon: Grid,
      description: 'Explore product grid',
      content: (
        <div>
          <p>Grid: {product.dimensions}</p>
        </div>
      ),
    },
    {
      id: 'finishes',
      name: 'Finishes',
      icon: Palette,
      description: 'Explore product finishes',
      content: (
        <div>
          <p>Finishes: {product.dimensions}</p>
        </div>
      ),
    },
  ], [product]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Configurator</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-1">
          <nav className="flex flex-col space-y-2">
            {configuratorOptions.map((option) => (
              <button
                key={option.id}
                className={`flex items-center justify-start p-2 rounded-md text-sm font-medium hover:underline ${activeOption === option.id ? 'bg-secondary text-secondary-foreground' : 'bg-transparent'
                  }`}
                onClick={() => setActiveOption(option.id)}
              >
                <option.icon className="mr-2 h-4 w-4" />
                {option.name}
              </button>
            ))}
          </nav>
        </div>
        <div className="md:col-span-3">
          {configuratorOptions.find((option) => option.id === activeOption)?.content}
        </div>
      </CardContent>
    </Card>
  );
};

export default InnosinLabConfigurator;
