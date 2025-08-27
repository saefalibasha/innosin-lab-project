import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Image as ImageIcon, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useHubSpotIntegration } from '@/hooks/useHubSpotIntegration';
import { supabase } from '@/integrations/supabase/client';

type ExportFormat = 'png' | 'jpg';

interface ExportModalProps {
  canvasRef: React.RefObject<HTMLDivElement | HTMLCanvasElement>; // allow either
  roomPoints: Array<{ x: number; y: number }>;
  placedProducts: any[]; // keep as-is for now
  children: React.ReactNode;
}

interface ExportFormData {
  fullName: string;
  email: string;
  companyName: string;
  contactNumber: string;
  projectDescription: string;
}

const ExportModal: React.FC<ExportModalProps> = ({
  canvasRef,
  roomPoints,
  placedProducts,
  children
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>('png'); // images only
  const [mainDialogOpen, setMainDialogOpen] = useState(false);
  const { createContact, createDeal } = useHubSpotIntegration();

  const calculateRoomArea = (): number => {
    if (roomPoints.length < 3) return 0;

    // polygon area (shoelace). If your canvas uses a visual scale (px per meter),
    // adjust "scale" accordingly so the result is in m².
    const scale = 40; // px per meter (example – make sure this matches your canvas)
    let area = 0;
    for (let i = 0; i < roomPoints.length; i++) {
      const j = (i + 1) % roomPoints.length;
      area += roomPoints[i].x * roomPoints[j].y;
      area -= roomPoints[j].x * roomPoints[i].y;
    }
    area = Math.abs(area) / 2;
    return area / (scale * scale);
  };

  const syncToHubSpot = async (formData: ExportFormData, exportedAs: 'png' | 'jpg' | 'pdf') => {
    // This function can receive 'pdf' because it’s decoupled from image export types.
    const sessionId = `export_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

    const { error: supabaseError } = await supabase
      .from('chat_sessions')
      .insert({
        session_id: sessionId,
        name: formData.fullName,
        email: formData.email,
        company: formData.companyName,
        phone: formData.contactNumber,
        status: 'floor_plan_exported',
        context: {
          source: 'floor_planner_export',
          export_format: exportedAs,
          project_description: formData.projectDescription,
          floor_plan_data: {
            room_points: roomPoints.length,
            placed_products: placedProducts.length,
            room_area: calculateRoomArea()
          }
        }
      });

    if (supabaseError) {
      console.error('Supabase error:', supabaseError);
      throw supabaseError;
    }

    const contactResult = await createContact({
      sessionId,
      name: formData.fullName,
      email: formData.email,
      company: formData.companyName,
      phone: formData.contactNumber
    });

    if (contactResult?.data?.hubspot_contact_id) {
      await createDeal({
        sessionId,
        dealName: `Floor Plan Export - ${formData.fullName}`,
        contactId: contactResult.data.hubspot_contact_id,
        amount: 0
      });
    }

    toast.success('Contact information synced to HubSpot successfully');
  };

  const getCanvasElement = (): HTMLElement | null => {
    // Support either a wrapping DIV or a CANVAS element as the export target
    const node = canvasRef.current as unknown as HTMLElement | null;
    return node ?? null;
  };

  const exportAsImage = async (format: ExportFormat) => {
    const node = getCanvasElement();
    if (!node) {
      toast.error('Canvas not found');
      return;
    }

    setIsExporting(true);
    try {
      const canvas = await html2canvas(node, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true
      });

      const link = document.createElement('a');
      const date = new Date().toISOString().split('T')[0];
      if (format === 'png') {
        link.download = `floor-plan-${date}.png`;
        link.href = canvas.toDataURL('image/png');
      } else {
        link.download = `floor-plan-${date}.jpg`;
        link.href = canvas.toDataURL('image/jpeg', 0.9);
      }
      link.click();
      toast.success(`Floor plan exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export floor plan');
    } finally {
      setIsExporting(false);
    }
  };

  const exportAsPDF = async () => {
    const node = getCanvasElement();
    if (!node) {
      toast.error('Canvas not found');
      return;
    }

    setIsExporting(true);
    try {
      const canvas = await html2canvas(node, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`floor-plan-${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('Floor plan exported as PDF');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export floor plan');
    } finally {
      setIsExporting(false);
    }
  };

  // If/when you want to require a form before exporting, call this with the form data you collect elsewhere.
  const handleFormSubmit = async (formData: ExportFormData) => {
    try {
      await syncToHubSpot(formData, exportFormat); // 'png' | 'jpg'
      await exportAsImage(exportFormat);
      toast.success('Export completed! Contact information has been saved.');
    } catch (error) {
      console.error('Export process error:', error);
      toast.error('Export process failed');
      throw error;
    }
  };

  // Same idea for PDF path, but never send 'pdf' into exportAsImage:
  const handleFormSubmitPDF = async (formData: ExportFormData) => {
    try {
      await syncToHubSpot(formData, 'pdf');
      await exportAsPDF();
      toast.success('PDF export completed! Contact information has been saved.');
    } catch (error) {
      console.error('PDF export process error:', error);
      toast.error('PDF export process failed');
      throw error;
    }
  };

  const handleExportRequest = (format: ExportFormat) => {
    setExportFormat(format);
    exportAsImage(format); // direct export (no form)
    setMainDialogOpen(false);
  };

  const handlePDFExport = () => {
    exportAsPDF(); // direct export (no form)
    setMainDialogOpen(false);
  };

  const calculateStats = () => {
    const area =
      roomPoints.length >= 3 ? `${calculateRoomArea().toFixed(2)} m²` : 'Not available';
    return {
      roomPoints: roomPoints.length,
      products: placedProducts.length,
      roomArea: area
    };
  };

  const stats = calculateStats();

  return (
    <Dialog open={mainDialogOpen} onOpenChange={setMainDialogOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
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
                variant="outline"
                className="flex items-center space-x-2"
                onClick={() => handleExportRequest('png')}
                disabled={isExporting}
              >
                <ImageIcon className="w-4 h-4" />
                <span>PNG Image</span>
              </Button>
              <Button
                variant="outline"
                className="flex items-center space-x-2"
                onClick={() => handleExportRequest('jpg')}
                disabled={isExporting}
              >
                <ImageIcon className="w-4 h-4" />
                <span>JPG Image</span>
              </Button>
            </div>

            {/* PDF Export */}
            <div className="pt-2 border-t">
              <Button onClick={handlePDFExport} disabled={isExporting} className="w-full" variant="outline">
                {isExporting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 mr-2" />
                    Export as PDF
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExportModal;
