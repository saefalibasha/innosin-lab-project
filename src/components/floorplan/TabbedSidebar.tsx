import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, BarChart3, HelpCircle, Home } from 'lucide-react';
import EnhancedSeriesSelector from './EnhancedSeriesSelector';
import ProductStatistics from './ProductStatistics';
import QuickHelp from './QuickHelp';
import RoomTools from './RoomTools';
import { PlacedProduct } from '@/types/floorPlanTypes';

interface TabbedSidebarProps {
  onProductDrag?: (product: any) => void;                 // optional: for drag previews
  onProductSelect: (product: PlacedProduct) => void;      // NEW: add to canvas when clicked
  currentTool: string;
  placedProducts: PlacedProduct[];
  onRoomCreate: (room: any) => void;
  onStartRoomCreation: () => void;
  scale?: number;                                         // optional: forward to selector
}

const TabbedSidebar: React.FC<TabbedSidebarProps> = ({
  onProductDrag,
  onProductSelect,
  currentTool,
  placedProducts,
  onRoomCreate,
  onStartRoomCreation,
  scale
}) => {
  const [activeTab, setActiveTab] = useState('products');

  return (
    <Card className="w-full h-full">
      <CardContent className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="products" className="flex items-center gap-2 px-4 py-3">
              <Package className="h-4 w-4" />
              <span>Products</span>
            </TabsTrigger>
            <TabsTrigger value="rooms" className="flex items-center gap-2 px-4 py-3">
              <Home className="h-4 w-4" />
              <span>Rooms</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2 px-4 py-3">
              <BarChart3 className="h-4 w-4" />
              <span>Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="help" className="flex items-center gap-2 px-4 py-3">
              <HelpCircle className="h-4 w-4" />
              <span>Help</span>
            </TabsTrigger>
          </TabsList>

          <div className="h-[calc(100%-4rem)]">
            <TabsContent value="products" className="mt-0 h-full">
              <EnhancedSeriesSelector
                onProductDrag={onProductDrag}
                onProductSelect={onProductSelect}   // ← wire up add-to-canvas
                currentTool={currentTool}
                scale={scale}
              />
            </TabsContent>

            <TabsContent value="rooms" className="mt-0 h-full">
              <RoomTools
                onRoomCreate={onRoomCreate}
                onStartRoomCreation={onStartRoomCreation}
              />
            </TabsContent>

            <TabsContent value="analytics" className="mt-0 h-full">
              <ProductStatistics products={placedProducts} />
            </TabsContent>

            <TabsContent value="help" className="mt-0 h-full">
              <QuickHelp />
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TabbedSidebar;
