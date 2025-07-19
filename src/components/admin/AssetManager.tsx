
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  Upload, 
  Image, 
  Box, 
  FileText,
  Eye,
  Download,
  Trash2
} from 'lucide-react';

const AssetManager = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Mock data for now
  const assets = [
    {
      id: '1',
      name: 'MC-PC-755065.jpg',
      type: 'image',
      size: '1.2 MB',
      uploadDate: '2025-01-15',
      category: 'Product Images'
    },
    {
      id: '2',
      name: 'MC-PC-755065.glb',
      type: '3d-model',
      size: '3.4 MB',
      uploadDate: '2025-01-15',
      category: '3D Models'
    },
    {
      id: '3',
      name: 'Series-Overview.pdf',
      type: 'document',
      size: '892 KB',
      uploadDate: '2025-01-14',
      category: 'Documentation'
    }
  ];

  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <Image className="h-5 w-5 text-blue-500" />;
      case '3d-model':
        return <Box className="h-5 w-5 text-green-500" />;
      case 'document':
        return <FileText className="h-5 w-5 text-orange-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const getAssetBadge = (type: string) => {
    const variants = {
      image: 'default',
      '3d-model': 'secondary',
      document: 'outline'
    } as const;

    return (
      <Badge variant={variants[type as keyof typeof variants] || 'outline'}>
        {type.replace('-', ' ').toUpperCase()}
      </Badge>
    );
  };

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || asset.type === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Asset Manager</h2>
          <p className="text-muted-foreground">Manage your product assets and files</p>
        </div>
        <Button className="flex items-center gap-2">
          <Upload className="h-4 w-4" />
          Upload Assets
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search assets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="border rounded px-3 py-2 text-sm"
              >
                <option value="all">All Types</option>
                <option value="image">Images</option>
                <option value="3d-model">3D Models</option>
                <option value="document">Documents</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredAssets.map((asset) => (
          <Card key={asset.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getAssetIcon(asset.type)}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{asset.name}</p>
                    <p className="text-xs text-muted-foreground">{asset.category}</p>
                  </div>
                </div>
                {getAssetBadge(asset.type)}
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="text-xs text-muted-foreground">
                  <div>Size: {asset.size}</div>
                  <div>Uploaded: {asset.uploadDate}</div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </Button>
                  <Button size="sm" variant="outline">
                    <Download className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAssets.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">No assets found matching your criteria.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AssetManager;
