import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, HelpCircle, Home, BarChart3 } from 'lucide-react';
import EnhancedSeriesSelector from './EnhancedSeriesSelector';
import ProductStatistics from './ProductStatistics';
import QuickHelp from './QuickHelp';
import RoomTools from './RoomTools';
import { PlacedProduct } from '@/types/floorPlanTypes';

interface TabbedSidebarProps {
  onProductDrag: (product: any) => void;
  currentTool: string;
  placedProducts: PlacedProduct[];
  onRoomCreate: (room: any) => void;
  onStartRoomCreation: () => void;

  /** Add this so we can forward added items to canvas */
  onProductSelect: (product: PlacedProduct) => void;

  /** Optional: keep scale consistent */
  scale?: number;
}

const TabbedSidebar: React.FC<TabbedSidebarProps> = ({
  onProductDrag,
  currentTool,
  placedProducts,
  onRoomCreate,
  onStartRoomCreation,
  onProductSelect,
  scale = 0.08,
}) => {
  const [activeTab, setActiveTab] = useState('products');

  return (
    <Card className="w-full h-full">
      <CardContent className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="products" className="flex items-center gap-2 px-4 py-3">
              <Package className="h-4 w-4" />
              <span>Products</span>
            </TabsTrigger>
            <TabsTrigger value="rooms" className="flex items-center gap-2 px-4 py-3">
              <Home className="h-4 w-4" />
              <span>Rooms</span>
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
                onProductSelect={onProductSelect}   // <-- forward to canvas
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

            <TabsContent value="help" className="mt-0 h-full">
              <QuickHelp />
            </TabsContent>
          </div>

          {/* If you use a stats tab, pass what ProductStatistics expects. */}
          {/* Example: */}
          {/* <TabsTrigger value="stats" className="flex items-center gap-2 px-4 py-3">
              <BarChart3 className="h-4 w-4" />
              <span>Stats</span>
            </TabsTrigger>
            <TabsContent value="stats" className="mt-0 h-full">
              <ProductStatistics placedProducts={placedProducts} />
            </TabsContent> */}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TabbedSidebar;