
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Upload, Edit2, Trash2, Plus, Download, RefreshCw } from 'lucide-react';
import BulkProductUploader from '@/components/BulkProductUploader';

interface DatabaseProduct {
  id: string;
  product_code: string;
  name: string;
  category: string;
  description: string | null;
  full_description: string | null;
  dimensions: string | null;
  specifications: string[] | null;
  keywords: string[];
  thumbnail_path: string | null;
  model_path: string | null;
  additional_images: string[];
  overview_image_path: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const AdminProducts = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [products, setProducts] = useState<DatabaseProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<DatabaseProduct | null>(null);
  const [showBulkUploader, setShowBulkUploader] = useState(false);

  // Check if user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user?.email) {
        navigate('/auth');
        return;
      }

      const { data: adminRole, error } = await supabase
        .from('admin_roles')
        .select('*')
        .eq('user_email', user.email)
        .eq('is_active', true)
        .single();

      if (error || !adminRole) {
        toast({
          title: "Access Denied",
          description: "You don't have admin privileges.",
          variant: "destructive",
        });
        navigate('/');
        return;
      }

      loadProducts();
    };

    checkAdminStatus();
  }, [user, navigate, toast]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match our interface
      const transformedData: DatabaseProduct[] = (data || []).map(product => ({
        ...product,
        specifications: Array.isArray(product.specifications) ? product.specifications : []
      }));
      
      setProducts(transformedData);
    } catch (error) {
      console.error('Error loading products:', error);
      toast({
        title: "Error",
        description: "Failed to load products.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditProduct = (product: DatabaseProduct) => {
    setEditingProduct(product);
  };

  const handleUpdateProduct = async (updatedProduct: DatabaseProduct) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({
          name: updatedProduct.name,
          category: updatedProduct.category,
          description: updatedProduct.description,
          full_description: updatedProduct.full_description,
          dimensions: updatedProduct.dimensions,
          keywords: updatedProduct.keywords,
          specifications: updatedProduct.specifications,
          is_active: updatedProduct.is_active
        })
        .eq('id', updatedProduct.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Product updated successfully.",
      });
      
      setEditingProduct(null);
      loadProducts();
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: "Error",
        description: "Failed to update product.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Product deleted successfully.",
      });
      
      loadProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Error",
        description: "Failed to delete product.",
        variant: "destructive",
      });
    }
  };

  const handleClearAllProducts = async () => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all products

      if (error) throw error;

      toast({
        title: "Success",
        description: "All products cleared successfully.",
      });
      
      loadProducts();
    } catch (error) {
      console.error('Error clearing products:', error);
      toast({
        title: "Error",
        description: "Failed to clear products.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Product Management</h1>
          <p className="text-muted-foreground">Manage your product catalog</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowBulkUploader(true)} className="gap-2">
            <Upload className="h-4 w-4" />
            Bulk Upload
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="gap-2">
                <Trash2 className="h-4 w-4" />
                Clear All
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear All Products</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete all products from the database. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleClearAllProducts} className="bg-destructive hover:bg-destructive/90">
                  Clear All
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Product Statistics</CardTitle>
            <CardDescription>Overview of your product catalog</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{products.length}</div>
                <div className="text-sm text-muted-foreground">Total Products</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {products.filter(p => p.is_active).length}
                </div>
                <div className="text-sm text-muted-foreground">Active</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {products.filter(p => !p.is_active).length}
                </div>
                <div className="text-sm text-muted-foreground">Inactive</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {new Set(products.map(p => p.category)).size}
                </div>
                <div className="text-sm text-muted-foreground">Categories</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Products</CardTitle>
            <CardDescription>All products in your catalog</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-mono text-sm">{product.product_code}</TableCell>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>
                      <Badge variant={product.is_active ? "default" : "secondary"}>
                        {product.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(product.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditProduct(product)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Product</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{product.name}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeleteProduct(product.id)}
                                className="bg-destructive hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Bulk Upload Dialog */}
      <Dialog open={showBulkUploader} onOpenChange={setShowBulkUploader}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Bulk Product Upload</DialogTitle>
            <DialogDescription>
              Upload multiple .jpg and .glb files to create products automatically
            </DialogDescription>
          </DialogHeader>
          <BulkProductUploader 
            onComplete={() => {
              setShowBulkUploader(false);
              loadProducts();
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      {editingProduct && (
        <EditProductDialog
          product={editingProduct}
          onSave={handleUpdateProduct}
          onClose={() => setEditingProduct(null)}
        />
      )}
    </div>
  );
};

// Edit Product Dialog Component
const EditProductDialog: React.FC<{
  product: DatabaseProduct;
  onSave: (product: DatabaseProduct) => void;
  onClose: () => void;
}> = ({ product, onSave, onClose }) => {
  const [formData, setFormData] = useState<DatabaseProduct>(product);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
          <DialogDescription>
            Update product information and settings
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>
          
          <div>
            <Label htmlFor="full_description">Full Description</Label>
            <Textarea
              id="full_description"
              value={formData.full_description || ''}
              onChange={(e) => setFormData({ ...formData, full_description: e.target.value })}
              rows={5}
            />
          </div>
          
          <div>
            <Label htmlFor="dimensions">Dimensions</Label>
            <Input
              id="dimensions"
              value={formData.dimensions || ''}
              onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
              placeholder="e.g., 500×500×650 mm"
            />
          </div>
          
          <div>
            <Label htmlFor="keywords">Keywords (comma-separated)</Label>
            <Input
              id="keywords"
              value={formData.keywords?.join(', ') || ''}
              onChange={(e) => setFormData({ 
                ...formData, 
                keywords: e.target.value.split(',').map(k => k.trim()).filter(Boolean)
              })}
              placeholder="laboratory, cabinet, storage"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
            />
            <Label htmlFor="is_active">Active (visible to users)</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AdminProducts;
