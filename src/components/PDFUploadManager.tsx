
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, FileText, X } from 'lucide-react';

interface UploadFile {
  file: File;
  brand: string;
  productType: string;
  progress: number;
  status: 'pending' | 'uploading' | 'processing' | 'complete' | 'error';
  error?: string;
}

const PDFUploadManager = () => {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const { toast } = useToast();

  const brands = [
    { value: 'broen-lab', label: 'Broen Lab' },
    { value: 'oriental-giken', label: 'Oriental Giken' },
    { value: 'innosin-lab', label: 'Innosin Lab' },
    { value: 'hamilton-lab', label: 'Hamilton Lab' }
  ];

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map((file) => ({
      file,
      brand: '',
      productType: '',
      progress: 0,
      status: 'pending' as const
    }));
    setUploadFiles(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: true
  });

  const updateFileField = (index: number, field: keyof UploadFile, value: any) => {
    setUploadFiles(prev => prev.map((file, i) => 
      i === index ? { ...file, [field]: value } : file
    ));
  };

  const removeFile = (index: number) => {
    setUploadFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFile = async (fileData: UploadFile, index: number) => {
    if (!fileData.brand || !fileData.productType) {
      toast({
        title: "Missing Information",
        description: "Please select brand and enter product type",
        variant: "destructive",
      });
      return;
    }

    updateFileField(index, 'status', 'uploading');

    try {
      // Create filename following the naming convention
      const filename = `${fileData.brand}-${fileData.productType}.pdf`;
      
      // Upload to Supabase Storage
      const filePath = `pdfs/${fileData.brand}/${filename}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, fileData.file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      updateFileField(index, 'progress', 50);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      // Insert document record
      const { data: docData, error: dbError } = await supabase
        .from('pdf_documents')
        .insert({
          filename,
          brand: fileData.brand,
          product_type: fileData.productType,
          file_path: filePath,
          file_url: publicUrl,
          file_size: fileData.file.size,
          processing_status: 'pending'
        })
        .select()
        .single();

      if (dbError) throw dbError;

      updateFileField(index, 'progress', 75);
      updateFileField(index, 'status', 'processing');

      // Call processing function
      const { error: processError } = await supabase.functions.invoke('process-pdf', {
        body: { documentId: docData.id, fileUrl: publicUrl }
      });

      if (processError) {
        console.error('Processing error:', processError);
        updateFileField(index, 'status', 'error');
        updateFileField(index, 'error', 'Processing failed');
      } else {
        updateFileField(index, 'progress', 100);
        updateFileField(index, 'status', 'complete');
        toast({
          title: "Upload Successful",
          description: `${filename} has been uploaded and is being processed`,
        });
      }
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload Product Documentation</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            {isDragActive ? (
              <p className="text-blue-600">Drop PDF files here...</p>
            ) : (
              <div>
                <p className="text-gray-600 mb-2">Drag & drop PDF files here, or click to select</p>
                <p className="text-sm text-gray-500">
                  Expected format: brand-product-type.pdf
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {uploadFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Files to Upload</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {uploadFiles.map((fileData, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <span className="font-medium">{fileData.file.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`brand-${index}`}>Brand</Label>
                    <Select
                      value={fileData.brand}
                      onValueChange={(value) => updateFileField(index, 'brand', value)}
                    >
                      <SelectTrigger>
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
                    <Label htmlFor={`product-${index}`}>Product Type</Label>
                    <Input
                      id={`product-${index}`}
                      value={fileData.productType}
                      onChange={(e) => updateFileField(index, 'productType', e.target.value)}
                      placeholder="e.g., emergency-shower, fumehood-1"
                    />
                  </div>
                </div>

                {fileData.status !== 'pending' && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Status: {fileData.status}</span>
                      <span>{fileData.progress}%</span>
                    </div>
                    <Progress value={fileData.progress} />
                    {fileData.error && (
                      <p className="text-sm text-red-600">{fileData.error}</p>
                    )}
                  </div>
                )}

                <Button
                  onClick={() => uploadFile(fileData, index)}
                  disabled={fileData.status !== 'pending' || !fileData.brand || !fileData.productType}
                  className="w-full"
                >
                  Upload & Process
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PDFUploadManager;
