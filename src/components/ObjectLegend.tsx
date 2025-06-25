
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, Eye, RotateCw } from 'lucide-react';
import { PlacedProduct } from '@/types/floorPlanTypes';

interface ObjectLegendProps {
  placedProducts: PlacedProduct[];
  onObjectSelect: (objectId: string) => void;
  onObjectToggleVisibility?: (objectId: string) => void;
  selectedObjects: string[];
}

interface GroupedProduct {
  name: string;
  color: string;
  category: string;
  items: PlacedProduct[];
  totalCount: number;
}

const ObjectLegend: React.FC<ObjectLegendProps> = ({
  placedProducts,
  onObjectSelect,
  onObjectToggleVisibility,
  selectedObjects
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // Group products by name and category
  const groupedProducts = React.useMemo(() => {
    const groups: { [key: string]: GroupedProduct } = {};

    placedProducts.forEach(product => {
      const key = `${product.name}-${product.color}`;
      
      if (!groups[key]) {
        groups[key] = {
          name: product.name,
          color: product.color,
          category: product.category || 'Uncategorized',
          items: [],
          totalCount: 0
        };
      }
      
      groups[key].items.push(product);
      groups[key].totalCount++;
    });

    return Object.values(groups).sort((a, b) => a.category.localeCompare(b.category));
  }, [placedProducts]);

  const toggleGroup = (groupKey: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupKey)) {
      newExpanded.delete(groupKey);
    } else {
      newExpanded.add(groupKey);
    }
    setExpandedGroups(newExpanded);
  };

  const handleObjectClick = (objectId: string) => {
    onObjectSelect(objectId);
  };

  if (placedProducts.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-gray-500">Object Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-gray-400">No objects placed yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Object Legend</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-6 w-6 p-0"
          >
            {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </Button>
        </div>
        <div className="text-xs text-gray-500">
          {placedProducts.length} object{placedProducts.length !== 1 ? 's' : ''} total
        </div>
      </CardHeader>
      
      {!isCollapsed && (
        <CardContent className="pt-0">
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {groupedProducts.map((group) => {
              const groupKey = `${group.name}-${group.color}`;
              const isExpanded = expandedGroups.has(groupKey);
              
              return (
                <div key={groupKey} className="border rounded-lg p-2">
                  <div 
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => toggleGroup(groupKey)}
                  >
                    <div className="flex items-center space-x-2 flex-1">
                      <div 
                        className="w-3 h-3 rounded border"
                        style={{ backgroundColor: group.color }}
                      />
                      <span className="text-xs font-medium truncate">{group.name}</span>
                      <Badge variant="outline" className="text-xs h-4">
                        {group.totalCount}
                      </Badge>
                    </div>
                    {group.totalCount > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0"
                      >
                        {isExpanded ? <ChevronDown className="w-2 h-2" /> : <ChevronRight className="w-2 h-2" />}
                      </Button>
                    )}
                  </div>
                  
                  {isExpanded && group.totalCount > 1 && (
                    <div className="mt-2 ml-5 space-y-1">
                      {group.items.map((item, index) => (
                        <div
                          key={item.id}
                          className={`flex items-center justify-between p-1 rounded text-xs cursor-pointer transition-colors ${
                            selectedObjects.includes(item.id) 
                              ? 'bg-blue-100 border border-blue-300' 
                              : 'hover:bg-gray-50'
                          }`}
                          onClick={() => handleObjectClick(item.id)}
                        >
                          <span>#{index + 1}</span>
                          <div className="flex items-center space-x-1">
                            <span className="text-gray-500">
                              {item.dimensions.length}×{item.dimensions.width}m
                            </span>
                            {item.rotation !== 0 && (
                              <RotateCw className="w-2 h-2 text-gray-400" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {group.totalCount === 1 && (
                    <div className="text-xs text-gray-500 mt-1">
                      {group.items[0].dimensions.length}×{group.items[0].dimensions.width}m
                      {group.items[0].rotation !== 0 && (
                        <span className="ml-1">• Rotated {group.items[0].rotation}°</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default ObjectLegend;
