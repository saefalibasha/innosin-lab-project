
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
  onProductDrag: (product: any) => void;
  currentTool: string;
  placedProducts: PlacedProduct[];
  onRoomCreate: (room: any) => void;
  onStartRoomCreation: () => void;
}

const TabbedSidebar: React.FC<TabbedSidebarProps> = ({
  onProductDrag,
  currentTool,
  placedProducts,
  onRoomCreate,
  onStartRoomCreation
}) => {
  const [activeTab, setActiveTab] = useState('products');

  return (
    <Card className="w-full">
      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="products" className="flex items-center gap-1">
              <Package className="h-3 w-3" />
              <span className="hidden sm:inline">Products</span>
            </TabsTrigger>
            <TabsTrigger value="statistics" className="flex items-center gap-1">
              <BarChart3 className="h-3 w-3" />
              <span className="hidden sm:inline">Stats</span>
            </TabsTrigger>
            <TabsTrigger value="rooms" className="flex items-center gap-1">
              <Home className="h-3 w-3" />
              <span className="hidden sm:inline">Rooms</span>
            </TabsTrigger>
            <TabsTrigger value="help" className="flex items-center gap-1">
              <HelpCircle className="h-3 w-3" />
              <span className="hidden sm:inline">Help</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="mt-0">
            <EnhancedSeriesSelector
              onProductDrag={onProductDrag}
              currentTool={currentTool}
            />
          </TabsContent>

          <TabsContent value="statistics" className="mt-0">
            <ProductStatistics placedProducts={placedProducts} />
          </TabsContent>

          <TabsContent value="rooms" className="mt-0">
            <RoomTools
              onRoomCreate={onRoomCreate}
              onStartRoomCreation={onStartRoomCreation}
            />
          </TabsContent>

          <TabsContent value="help" className="mt-0">
            <QuickHelp />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TabbedSidebar;
