
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Image, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface ExportModalProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  roomPoints: any[];
  placedProducts: any[];
  children: React.ReactNode;
}

const ExportModal: React.FC<ExportModalProps> = ({
  canvasRef,
  roomPoints,
  placedProducts,
  children
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<'png' | 'pdf'>('png');

  const exportAsImage = async (format: 'png' | 'pdf') => {
    if (!canvasRef.current) {
      toast.error('Canvas not found');
      return;
    }

    setIsExporting(true);
    
    try {
      const canvas = await html2canvas(canvasRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true
      });

      if (format === 'png') {
        const link = document.createElement('a');
        link.download = `floor-plan-${new Date().toISOString().split('T')[0]}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        toast.success('Floor plan exported as PNG');
      } else if (format === 'pdf') {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
          unit: 'px',
          format: [canvas.width, canvas.height]
        });
        
        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save(`floor-plan-${new Date().toISOString().split('T')[0]}.pdf`);
        toast.success('Floor plan exported as PDF');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export floor plan');
    } finally {
      setIsExporting(false);
    }
  };

  const calculateStats = () => {
    const roomArea = roomPoints.length >= 3 ? 'Calculated' : 'Not available';
    return {
      roomPoints: roomPoints.length,
      products: placedProducts.length,
      roomArea
    };
  };

  const stats = calculateStats();

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Download className="w-5 h-5" />
            <span>Export Floor Plan</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Plan Statistics */}
          <div className="bg-gray-50 rounded-lg p-3 space-y-2">
            <h4 className="font-medium text-sm">Plan Summary</h4>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{stats.roomPoints} Wall Points</Badge>
              <Badge variant="outline">{stats.products} Products</Badge>
              <Badge variant="outline">Area: {stats.roomArea}</Badge>
            </div>
          </div>

          {/* Export Format Selection */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Export Format</h4>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={exportFormat === 'png' ? 'default' : 'outline'}
                className="flex items-center space-x-2"
                onClick={() => setExportFormat('png')}
              >
                <Image className="w-4 h-4" />
                <span>PNG Image</span>
              </Button>
              <Button
                variant={exportFormat === 'pdf' ? 'default' : 'outline'}
                className="flex items-center space-x-2"
                onClick={() => setExportFormat('pdf')}
              >
                <FileText className="w-4 h-4" />
                <span>PDF Document</span>
              </Button>
            </div>
          </div>

          {/* Export Button */}
          <Button
            onClick={() => exportAsImage(exportFormat)}
            disabled={isExporting}
            className="w-full"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Export as {exportFormat.toUpperCase()}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExportModal;
