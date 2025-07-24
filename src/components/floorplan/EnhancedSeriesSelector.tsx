
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package, Search, Filter, Grid3X3 } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  category: string;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  thumbnail: string;
  modelPath: string;
  color: string;
  description: string;
  specifications: string[];
}

interface SeriesData {
  id: string;
  name: string;
  description: string;
  products: Product[];
  category: string;
  thumbnail: string;
}

interface EnhancedSeriesSelectorProps {
  onProductDrag: (product: Product) => void;
  currentTool: string;
}

const EnhancedSeriesSelector: React.FC<EnhancedSeriesSelectorProps> = ({
  onProductDrag,
  currentTool
}) => {
  const [selectedSeries, setSelectedSeries] = useState<SeriesData | null>(null);
  const [selectedDimension, setSelectedDimension] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  // Mock data for demonstration
  const seriesData: SeriesData[] = [
    {
      id: 'mobile-cabinets',
      name: 'Mobile Cabinets',
      description: 'Versatile mobile storage solutions',
      category: 'Storage',
      thumbnail: '/products/innosin-mc-pc-755065/MC-PC (755065).jpg',
      products: [
        {
          id: 'mc-pc-755065',
          name: 'MC-PC (755065)',
          category: 'Mobile Cabinet',
          dimensions: { length: 500, width: 500, height: 650 },
          thumbnail: '/products/innosin-mc-pc-755065/MC-PC (755065).jpg',
          modelPath: '/products/innosin-mc-pc-755065/MC-PC (755065).glb',
          color: '#e2e8f0',
          description: 'Standard mobile cabinet for 750mm benches',
          specifications: ['750mm bench height', 'Locking casters', 'Chemical resistant']
        },
        {
          id: 'mc-pc-755080',
          name: 'MC-PC (755080)',
          category: 'Mobile Cabinet',
          dimensions: { length: 500, width: 500, height: 800 },
          thumbnail: '/products/innosin-mc-pc-755080/MC-PC (755080).jpg',
          modelPath: '/products/innosin-mc-pc-755080/MC-PC (755080).glb',
          color: '#e2e8f0',
          description: 'Mobile cabinet for 900mm benches',
          specifications: ['900mm bench height', 'Locking casters', 'Chemical resistant']
        }
      ]
    },
    {
      id: 'tall-cabinets',
      name: 'Tall Cabinets',
      description: 'High-capacity storage solutions',
      category: 'Storage',
      thumbnail: '/products/innosin-tcg-pc-754018/TCG-PC (754018).jpg',
      products: [
        {
          id: 'tcg-pc-754018',
          name: 'TCG-PC (754018)',
          category: 'Tall Cabinet',
          dimensions: { length: 600, width: 600, height: 1800 },
          thumbnail: '/products/innosin-tcg-pc-754018/TCG-PC (754018).jpg',
          modelPath: '/products/innosin-tcg-pc-754018/TCG-PC (754018).glb',
          color: '#f1f5f9',
          description: 'Tall cabinet for maximum storage',
          specifications: ['1800mm height', 'Adjustable shelves', 'Powder coat finish']
        }
      ]
    }
  ];

  const filteredSeries = seriesData.filter(series => {
    const matchesSearch = series.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         series.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || series.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const availableDimensions = selectedSeries?.products.map(product => ({
    id: product.id,
    label: `${product.dimensions.length}×${product.dimensions.width}×${product.dimensions.height}mm`,
    dimensions: product.dimensions,
    product: product
  })) || [];

  const selectedProduct = selectedSeries?.products.find(p => p.id === selectedDimension);

  const handleDragStart = (e: React.DragEvent, product: Product) => {
    e.dataTransfer.setData('product', JSON.stringify(product));
    onProductDrag(product);
  };

  const categories = ['all', ...Array.from(new Set(seriesData.map(s => s.category)))];

  return (
    <div className="space-y-6 p-4">
      {/* Search and Filter */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search product series..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-10"
          />
        </div>
        
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="h-10">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(category => (
              <SelectItem key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Series Selection */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Package className="h-5 w-5" />
            Product Series
          </h3>
          
          <div className="space-y-3">
            {filteredSeries.map((series) => (
              <Card 
                key={series.id} 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedSeries?.id === series.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => {
                  setSelectedSeries(series);
                  setSelectedDimension('');
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <img 
                      src={series.thumbnail} 
                      alt={series.name}
                      className="w-16 h-16 object-contain rounded-md bg-gray-50"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{series.name}</h4>
                      <p className="text-sm text-muted-foreground truncate">{series.description}</p>
                      <Badge variant="outline" className="mt-1 text-xs">
                        {series.products.length} variants
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Right Column: Dimension Selection and Preview */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Grid3X3 className="h-5 w-5" />
            Dimensions & Preview
          </h3>
          
          {selectedSeries ? (
            <div className="space-y-4">
              {/* Prominent Dimension Selector */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Select Dimensions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Select value={selectedDimension} onValueChange={setSelectedDimension}>
                    <SelectTrigger className="h-12 text-base">
                      <SelectValue placeholder="Choose product dimensions..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableDimensions.map((dim) => (
                        <SelectItem key={dim.id} value={dim.id} className="h-12">
                          <div className="flex items-center justify-between w-full">
                            <span className="font-medium">{dim.product.name}</span>
                            <Badge variant="outline" className="ml-2">
                              {dim.label}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              {/* Enhanced Product Preview */}
              {selectedProduct && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Product Preview</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-col items-center space-y-4">
                      <img 
                        src={selectedProduct.thumbnail} 
                        alt={selectedProduct.name}
                        className="w-32 h-32 object-contain rounded-lg bg-gray-50 border-2 border-gray-200"
                      />
                      
                      <div className="text-center space-y-2">
                        <h4 className="font-semibold text-lg">{selectedProduct.name}</h4>
                        <Badge variant="secondary" className="text-sm">
                          {selectedProduct.dimensions.length} × {selectedProduct.dimensions.width} × {selectedProduct.dimensions.height} mm
                        </Badge>
                        <p className="text-sm text-muted-foreground">
                          {selectedProduct.description}
                        </p>
                      </div>

                      <Button
                        className="w-full h-12 text-base"
                        draggable
                        onDragStart={(e) => handleDragStart(e, selectedProduct)}
                        disabled={currentTool !== 'select'}
                      >
                        <Package className="h-5 w-5 mr-2" />
                        Drag to Canvas
                      </Button>
                    </div>

                    {/* Specifications */}
                    <div className="space-y-2">
                      <h5 className="font-medium text-sm">Specifications:</h5>
                      <div className="space-y-1">
                        {selectedProduct.specifications.map((spec, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {spec}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card className="h-48 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Select a product series to view dimensions</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedSeriesSelector;
