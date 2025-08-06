
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Database, Loader2 } from 'lucide-react';

export const DataSeeder: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const sampleProducts = [
    {
      product_code: 'MC-PC-755065',
      name: 'Mobile Cabinet Series for 750mm Bench (Single Door)',
      product_series: 'Mobile Cabinet Series',
      category: 'Innosin Lab',
      dimensions: '750×500×650 mm',
      door_type: 'Single Door',
      orientation: 'None',
      finish_type: 'Powder Coat',
      drawer_count: 0,
      description: 'Mobile laboratory cabinet with single door storage designed for 750mm height benches.',
      is_active: true
    },
    {
      product_code: 'MC-PC-DWR2-505065',
      name: 'Mobile Cabinet Series for 750mm Bench (2 Drawers)',
      product_series: 'Mobile Cabinet Series',
      category: 'Innosin Lab',
      dimensions: '500×500×650 mm',
      door_type: 'None',
      orientation: 'None',
      finish_type: 'Powder Coat',
      drawer_count: 2,
      description: 'Mobile laboratory cabinet with 2 drawers designed for 750mm height benches.',
      is_active: true
    },
    {
      product_code: 'WCG-PC-753375',
      name: 'Wall Cabinet Glass Series',
      product_series: 'Wall Cabinet Series',
      category: 'Innosin Lab',
      dimensions: '750×330×750 mm',
      door_type: 'Glass Door',
      orientation: 'None',
      finish_type: 'Powder Coat',
      mounting_type: 'Wall',
      drawer_count: 0,
      description: 'Wall-mounted storage cabinet with glass door providing space-efficient storage.',
      is_active: true
    },
    {
      product_code: 'TCG-PC-754018',
      name: 'Tall Cabinet Glass Door Series',
      product_series: 'Tall Cabinet Series',
      category: 'Innosin Lab',
      dimensions: '750×400×1800 mm',
      door_type: 'Glass Door',
      orientation: 'None',
      finish_type: 'Powder Coat',
      drawer_count: 0,
      description: 'Tall storage cabinet with glass door providing secure storage with excellent visibility.',
      is_active: true
    }
  ];

  const seedData = async () => {
    try {
      setLoading(true);

      // Check if data already exists
      const { data: existingData } = await supabase
        .from('products')
        .select('product_code')
        .limit(1);

      if (existingData && existingData.length > 0) {
        toast({
          title: "Info",
          description: "Sample data already exists in the database",
        });
        return;
      }

      // Insert sample data
      const { error } = await supabase
        .from('products')
        .insert(sampleProducts);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Successfully added ${sampleProducts.length} sample products`,
      });

    } catch (error) {
      console.error('Error seeding data:', error);
      toast({
        title: "Error",
        description: "Failed to seed sample data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Database Seeder
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Add sample product data to test the product series manager and catalog functionality.
        </p>
        <Button onClick={seedData} disabled={loading} className="flex items-center gap-2">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Seed Sample Data
        </Button>
      </CardContent>
    </Card>
  );
};
