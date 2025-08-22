
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Image, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import ExportFormModal from './ExportFormModal';
import { useHubSpotIntegration } from '@/hooks/useHubSpotIntegration';
import { supabase } from '@/integrations/supabase/client';

interface ExportModalProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  roomPoints: any[];
  placedProducts: any[];
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
  const [exportFormat, setExportFormat] = useState<'png' | 'jpg'>('png');
  const [showForm, setShowForm] = useState(false);
  const [mainDialogOpen, setMainDialogOpen] = useState(false);
  const { createContact, createDeal } = useHubSpotIntegration();

  const syncToHubSpot = async (formData: ExportFormData, exportFormat: string) => {
    try {
      // Generate session ID for tracking
      const sessionId = `export_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Store in Supabase
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
            export_format: exportFormat,
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

      // Create HubSpot contact
      const contactResult = await createContact({
        sessionId,
        name: formData.fullName,
        email: formData.email,
        company: formData.companyName,
        phone: formData.contactNumber
      });

      // Create HubSpot deal for floor plan project
      if (contactResult?.data?.hubspot_contact_id) {
        await createDeal({
          sessionId,
          dealName: `Floor Plan Export - ${formData.fullName}`,
          contactId: contactResult.data.hubspot_contact_id,
          amount: 0 // Amount TBD
        });
      }

      toast.success('Contact information synced to HubSpot successfully');
    } catch (error) {
      console.error('HubSpot sync error:', error);
      throw error;
    }
  };

  const calculateRoomArea = (): number => {
    if (roomPoints.length < 3) return 0;
    
    let area = 0;
    const scale = 40; // Assuming scale value
    for (let i = 0; i < roomPoints.length; i++) {
      const j = (i + 1) % roomPoints.length;
      area += roomPoints[i].x * roomPoints[j].y;
      area -= roomPoints[j].x * roomPoints[i].y;
    }
    area = Math.abs(area) / 2;
    
    return area / (scale * scale);
  };

  const exportAsImage = async (format: 'png' | 'jpg') => {
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
      } else if (format === 'jpg') {
        const link = document.createElement('a');
        link.download = `floor-plan-${new Date().toISOString().split('T')[0]}.jpg`;
        link.href = canvas.toDataURL('image/jpeg', 0.9);
        link.click();
        toast.success('Floor plan exported as JPG');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export floor plan');
    } finally {
      setIsExporting(false);
    }
  };

  const exportAsPDF = async () => {
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

  const handleExportRequest = (format: 'png' | 'jpg') => {
    // Check if contact info already exists from floor planner entry
    const existingContactInfo = sessionStorage.getItem('contactInfo');
    
    if (existingContactInfo) {
      // Use existing contact info and export directly
      setExportFormat(format);
      exportAsImage(format);
      setMainDialogOpen(false);
    } else {
      // Show form for contact info
      setExportFormat(format);
      setMainDialogOpen(false);
      setShowForm(true);
    }
  };

  const handleFormSubmit = async (formData: ExportFormData) => {
    try {
      // Determine if this is a PDF export (check if we came from PDF button)
      if (exportFormat === 'png' && showForm) {
        // Check if this was triggered by PDF export
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('pdf') === 'true') {
          await handleFormSubmitWithPDF(formData);
          return;
        }
      }
      
      // Sync to HubSpot first
      await syncToHubSpot(formData, exportFormat);
      
      // Then perform the export
      if (exportFormat === 'png' || exportFormat === 'jpg') {
        await exportAsImage(exportFormat);
      }
      
      toast.success(`Export completed! Contact information has been saved.`);
    } catch (error) {
      console.error('Export process error:', error);
      toast.error('Export process failed');
      throw error;
    }
  };

  const handlePDFExport = () => {
    // Check if contact info already exists from floor planner entry
    const existingContactInfo = sessionStorage.getItem('contactInfo');
    
    if (existingContactInfo) {
      // Use existing contact info and export directly
      exportAsPDF();
      setMainDialogOpen(false);
    } else {
      // Show form for contact info
      setExportFormat('png'); // Set format for form
      setMainDialogOpen(false);
      setShowForm(true);
    }
  };

  const handleFormSubmitWithPDF = async (formData: ExportFormData) => {
    try {
      // Sync to HubSpot first
      await syncToHubSpot(formData, 'pdf');
      
      // Then perform PDF export
      await exportAsPDF();
      
      toast.success(`PDF export completed! Contact information has been saved.`);
    } catch (error) {
      console.error('PDF export process error:', error);
      toast.error('PDF export process failed');
      throw error;
    }
  };

  const calculateStats = () => {
    const roomArea = roomPoints.length >= 3 ? calculateRoomArea().toFixed(2) + ' m²' : 'Not available';
    return {
      roomPoints: roomPoints.length,
      products: placedProducts.length,
      roomArea
    };
  };

  const stats = calculateStats();

  return (
    <>
      <Dialog open={mainDialogOpen} onOpenChange={setMainDialogOpen}>
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
              
              {/* Image Exports - Require Form */}
              <div className="space-y-2">
                <p className="text-xs text-gray-600 mb-2">Image exports require contact information:</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    className="flex items-center space-x-2"
                    onClick={() => handleExportRequest('png')}
                    disabled={isExporting}
                  >
                    <Image className="w-4 h-4" />
                    <span>PNG Image</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex items-center space-x-2"
                    onClick={() => handleExportRequest('jpg')}
                    disabled={isExporting}
                  >
                    <Image className="w-4 h-4" />
                    <span>JPG Image</span>
                  </Button>
                </div>
              </div>

              {/* PDF Export - Also requires form */}
              <div className="pt-2 border-t">
                <p className="text-xs text-gray-600 mb-2">PDF export (contact information required):</p>
                <Button
                  onClick={handlePDFExport}
                  disabled={isExporting}
                  className="w-full"
                  variant="outline"
                >
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

            <div className="text-xs text-gray-500 p-3 bg-blue-50 rounded">
              <p className="font-semibold mb-1">Why do we need your information?</p>
              <p>Contact details help us provide better support and follow up on your project needs. All export formats require contact information for professional service.</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ExportFormModal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={handleFormSubmit}
        exportFormat={exportFormat}
      />
    </>
  );
};

export default ExportModal;
