import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import EnhancedSeriesSelector from './EnhancedSeriesSelector';
import { PlacedProduct } from '@/types/floorPlanTypes';

interface TabbedSidebarProps {
  onSelectProduct: (product: PlacedProduct) => void;
  scale: number;
}

const TabbedSidebar: React.FC<TabbedSidebarProps> = ({ onSelectProduct, scale }) => {
  const [activeTab, setActiveTab] = useState('products');

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
        <TabsList className="shrink-0 border-b">
          <TabsTrigger value="products" className="data-[state=active]:bg-muted data-[state=active]:text-foreground">
            Products
          </TabsTrigger>
          <TabsTrigger value="rooms" className="data-[state=active]:bg-muted data-[state=active]:text-foreground">
            Rooms
          </TabsTrigger>
          <TabsTrigger value="doors" className="data-[state=active]:bg-muted data-[state=active]:text-foreground">
            Doors
          </TabsTrigger>
          <TabsTrigger value="walls" className="data-[state=active]:bg-muted data-[state=active]:text-foreground">
            Walls
          </TabsTrigger>
          <TabsTrigger value="annotations" className="data-[state=active]:bg-muted data-[state=active]:text-foreground">
            Annotations
          </TabsTrigger>
        </TabsList>
      
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4">
            {activeTab === 'products' && (
              <EnhancedSeriesSelector 
                onProductSelect={onSelectProduct} 
                scale={scale}
              />
            )}
            {activeTab === 'rooms' && (
              <div>
                <h2>Rooms</h2>
                <p>Add and configure rooms here.</p>
              </div>
            )}
            {activeTab === 'doors' && (
              <div>
                <h2>Doors</h2>
                <p>Place and customize doors.</p>
              </div>
            )}
            {activeTab === 'walls' && (
              <div>
                <h2>Walls</h2>
                <p>Draw and adjust wall segments.</p>
              </div>
            )}
            {activeTab === 'annotations' && (
              <div>
                <h2>Annotations</h2>
                <p>Add text and notes to the floor plan.</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </Tabs>
    </div>
  );
};

export default TabbedSidebar;
