import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, FileText, X, Package, Image, Box, Archive } from 'lucide-react';

interface UploadFile {
  file: File;
  brand: string;
  productId: string;
  fileType: 'pdf' | 'image' | 'model' | 'unknown';
  progress: number;
  status: 'pending' | 'uploading' | 'complete' | 'error';
  error?: string;
  targetPath?: string;
}

interface UploadFileWithIndex extends UploadFile {
  index: number;
}

interface ProductGroup {
  productId: string;
  files: UploadFileWithIndex[];
  hasModel: boolean;
  hasImage: boolean;
  hasDescription: boolean;
}

const ProductAssetUploadManager = () => {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [activeTab, setActiveTab] = useState<string>('individual');
  const { toast } = useToast();

  const brands = [
    { value: 'broen-lab', label: 'Broen Lab' },
    { value: 'oriental-giken', label: 'Oriental Giken' },
    { value: 'innosin-lab', label: 'Innosin Lab' },
    { value: 'hamilton-lab', label: 'Hamilton Lab' }
  ];

  const getFileType = (file: File): 'pdf' | 'image' | 'model' | 'unknown' => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (extension === 'pdf') return 'pdf';
    if (['jpg', 'jpeg', 'png', 'webp'].includes(extension || '')) return 'image';
    if (['glb', 'gltf'].includes(extension || '')) return 'model';
    return 'unknown';
  };

  const generateTargetPath = (file: UploadFile): string => {
    const extension = file.file.name.split('.').pop()?.toLowerCase();
    
    if (file.fileType === 'pdf') {
      return `pdfs/${file.brand}/${file.productId}.pdf`;
    } else if (file.fileType === 'image') {
      return `products/${file.productId}/${file.productId}.${extension}`;
    } else if (file.fileType === 'model') {
      return `products/${file.productId}/${file.productId}.${extension}`;
    }
    
    return `products/${file.productId}/${file.file.name}`;
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map((file) => {
      const fileType = getFileType(file);
      const baseFileName = file.name.replace(/\.[^/.]+$/, "");
      
      return {
        file,
        brand: 'innosin-lab', // Default to Innosin Lab
        productId: baseFileName,
        fileType,
        progress: 0,
        status: 'pending' as const
      };
    });
    
    setUploadFiles(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.jpg', '.jpeg', '.png', '.webp'],
      'model/gltf-binary': ['.glb'],
      'model/gltf+json': ['.gltf']
    },
    multiple: true
  });

  const updateFileField = (index: number, field: keyof UploadFile, value: any) => {
    setUploadFiles(prev => prev.map((file, i) => {
      if (i === index) {
        const updated = { ...file, [field]: value };
        if (field === 'productId' || field === 'brand') {
          updated.targetPath = generateTargetPath(updated);
        }
        return updated;
      }
      return file;
    }));
  };

  const removeFile = (index: number) => {
    setUploadFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFile = async (fileData: UploadFile, index: number) => {
    if (!fileData.brand || !fileData.productId) {
      toast({
        title: "Missing Information",
        description: "Please select brand and enter product ID",
        variant: "destructive",
      });
      return;
    }

    updateFileField(index, 'status', 'uploading');
    updateFileField(index, 'progress', 10);

    try {
      const targetPath = generateTargetPath(fileData);
      updateFileField(index, 'targetPath', targetPath);

      // Determine storage bucket based on file type
      const bucket = fileData.fileType === 'pdf' ? 'documents' : 'documents';
      
      updateFileField(index, 'progress', 30);

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(targetPath, fileData.file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      updateFileField(index, 'progress', 70);

      // For PDFs, also create database record
      if (fileData.fileType === 'pdf') {
        const { data: { publicUrl } } = supabase.storage
          .from(bucket)
          .getPublicUrl(targetPath);

        const { error: dbError } = await supabase
          .from('pdf_documents')
          .upsert({
            filename: `${fileData.productId}.pdf`,
            brand: fileData.brand,
            product_type: fileData.productId,
            file_path: targetPath,
            file_url: publicUrl,
            file_size: fileData.file.size,
            processing_status: 'pending'
          });

        if (dbError) console.error('Database error:', dbError);

        // Trigger processing
        const { error: processError } = await supabase.functions.invoke('process-pdf', {
          body: { fileUrl: publicUrl }
        });

        if (processError) console.error('Processing error:', processError);
      }

      updateFileField(index, 'progress', 100);
      updateFileField(index, 'status', 'complete');
      
      toast({
        title: "Upload Successful",
        description: `${fileData.file.name} uploaded to ${targetPath}`,
      });

    } catch (error) {
      console.error('Upload error:', error);
      updateFileField(index, 'status', 'error');
      updateFileField(index, 'error', error.message);
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const uploadAll = async () => {
    const pendingFiles = uploadFiles.filter(f => f.status === 'pending' && f.brand && f.productId);
    
    for (let i = 0; i < uploadFiles.length; i++) {
      const file = uploadFiles[i];
      if (file.status === 'pending' && file.brand && file.productId) {
        await uploadFile(file, i);
        // Small delay between uploads
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  };

  // Group files by product ID for better organization
  const groupedFiles = uploadFiles.reduce((groups: { [key: string]: ProductGroup }, file, index) => {
    const key = `${file.brand}-${file.productId}`;
    if (!groups[key]) {
      groups[key] = {
        productId: file.productId,
        files: [],
        hasModel: false,
        hasImage: false,
        hasDescription: false
      };
    }
    
    groups[key].files.push({ ...file, index } as UploadFileWithIndex);
    if (file.fileType === 'model') groups[key].hasModel = true;
    if (file.fileType === 'image') groups[key].hasImage = true;
    if (file.fileType === 'pdf') groups[key].hasDescription = true;
    
    return groups;
  }, {});

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'pdf': return <FileText className="h-5 w-5 text-red-600" />;
      case 'image': return <Image className="h-5 w-5 text-blue-600" />;
      case 'model': return <Box className="h-5 w-5 text-green-600" />;
      default: return <Package className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Product Asset Upload Manager
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="individual">Individual Upload</TabsTrigger>
              <TabsTrigger value="bulk">Bulk Operations</TabsTrigger>
            </TabsList>
            
            <TabsContent value="individual" className="space-y-4">
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                {isDragActive ? (
                  <p className="text-blue-600">Drop files here...</p>
                ) : (
                  <div>
                    <p className="text-gray-600 mb-2">Drag & drop product files here, or click to select</p>
                    <p className="text-sm text-gray-500">
                      Supports: .pdf, .jpg, .png, .webp, .glb, .gltf
                    </p>
                    <div className="flex justify-center gap-2 mt-3">
                      <Badge variant="outline">PDF Docs</Badge>
                      <Badge variant="outline">Images</Badge>
                      <Badge variant="outline">3D Models</Badge>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="bulk" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <Archive className="h-8 w-8 mx-auto text-gray-600 mb-2" />
                  <h3 className="font-medium">ZIP Upload</h3>
                  <p className="text-sm text-gray-500">Upload entire product folders</p>
                  <Button variant="outline" size="sm" className="mt-2" disabled>
                    Coming Soon
                  </Button>
                </div>
                <div className="text-center">
                  <FileText className="h-8 w-8 mx-auto text-gray-600 mb-2" />
                  <h3 className="font-medium">CSV Import</h3>
                  <p className="text-sm text-gray-500">Import metadata from CSV</p>
                  <Button variant="outline" size="sm" className="mt-2" disabled>
                    Coming Soon
                  </Button>
                </div>
                <div className="text-center">
                  <Package className="h-8 w-8 mx-auto text-gray-600 mb-2" />
                  <h3 className="font-medium">Batch Process</h3>
                  <p className="text-sm text-gray-500">Process multiple products</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={uploadAll}
                    disabled={uploadFiles.length === 0}
                  >
                    Upload All
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {uploadFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Files to Upload ({uploadFiles.length})</span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setUploadFiles([])}>
                  Clear All
                </Button>
                <Button size="sm" onClick={uploadAll}>
                  Upload All
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {Object.entries(groupedFiles).map(([groupKey, group]) => (
              <div key={groupKey} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Package className="h-5 w-5 text-gray-600" />
                    <div>
                      <h3 className="font-medium">{group.productId}</h3>
                      <div className="flex gap-2 mt-1">
                        {group.hasModel && <Badge variant="outline" className="text-xs">3D Model</Badge>}
                        {group.hasImage && <Badge variant="outline" className="text-xs">Image</Badge>}
                        {group.hasDescription && <Badge variant="outline" className="text-xs">Documentation</Badge>}
                      </div>
                    </div>
                  </div>
                  <Badge variant={group.hasModel && group.hasImage ? 'default' : 'secondary'}>
                    {group.files.length} file{group.files.length !== 1 ? 's' : ''}
                  </Badge>
                </div>

                <div className="space-y-3">
                  {group.files.map((fileData) => (
                    <div key={fileData.index} className="border rounded p-3 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getFileIcon(fileData.fileType)}
                          <span className="font-medium text-sm">{fileData.file.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {fileData.fileType}
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(fileData.index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs">Brand</Label>
                          <Select
                            value={fileData.brand}
                            onValueChange={(value) => updateFileField(fileData.index, 'brand', value)}
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue placeholder="Select brand" />
                            </SelectTrigger>
                            <SelectContent>
                              {brands.map((brand) => (
                                <SelectItem key={brand.value} value={brand.value}>
                                  {brand.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label className="text-xs">Product ID</Label>
                          <Input
                            className="h-8"
                            value={fileData.productId}
                            onChange={(e) => updateFileField(fileData.index, 'productId', e.target.value)}
                            placeholder="e.g., innosin-ks-1000"
                          />
                        </div>
                      </div>

                      {fileData.targetPath && (
                        <div className="text-xs text-gray-500">
                          Target: {fileData.targetPath}
                        </div>
                      )}

                      {fileData.status !== 'pending' && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Status: {fileData.status}</span>
                            <span>{fileData.progress}%</span>
                          </div>
                          <Progress value={fileData.progress} className="h-2" />
                          {fileData.error && (
                            <p className="text-sm text-red-600">{fileData.error}</p>
                          )}
                        </div>
                      )}

                      <Button
                        size="sm"
                        onClick={() => uploadFile(fileData, fileData.index)}
                        disabled={fileData.status !== 'pending' || !fileData.brand || !fileData.productId}
                        className="w-full"
                      >
                        Upload {fileData.fileType.toUpperCase()}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProductAssetUploadManager;