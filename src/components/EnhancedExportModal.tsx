
import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Download, Send, Loader2, Image as ImageIcon } from 'lucide-react';
import { PlacedProduct, Point } from '@/types/floorPlanTypes';
import { useHubSpotIntegration } from '@/hooks/useHubSpotIntegration';

interface EnhancedExportModalProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  roomPoints: Point[];
  placedProducts: PlacedProduct[];
  projectName: string;
  children: React.ReactNode;
}

export const EnhancedExportModal: React.FC<EnhancedExportModalProps> = ({
  canvasRef,
  roomPoints,
  placedProducts,
  projectName,
  children
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [exportType, setExportType] = useState<'download' | 'hubspot'>('download');
  const [isExporting, setIsExporting] = useState(false);
  const [contactInfo, setContactInfo] = useState({
    name: '',
    email: '',
    company: '',
    message: ''
  });

  const { createInquiry, loading: hubspotLoading } = useHubSpotIntegration();

  const generateHighQualityImage = async (): Promise<Blob> => {
    if (!canvasRef.current) {
      throw new Error('Canvas not available');
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Canvas context not available');
    }

    // Create a high-resolution canvas for export
    const exportCanvas = document.createElement('canvas');
    const exportCtx = exportCanvas.getContext('2d');
    if (!exportCtx) {
      throw new Error('Export canvas context not available');
    }

    // Set high resolution (2x for better quality)
    const scaleFactor = 2;
    exportCanvas.width = canvas.width * scaleFactor;
    exportCanvas.height = canvas.height * scaleFactor;
    
    // Scale the context
    exportCtx.scale(scaleFactor, scaleFactor);
    
    // Set white background
    exportCtx.fillStyle = '#ffffff';
    exportCtx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw the original canvas content
    exportCtx.drawImage(canvas, 0, 0);
    
    // Add project metadata overlay
    exportCtx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    exportCtx.fillRect(10, 10, 300, 80);
    
    exportCtx.fillStyle = '#333333';
    exportCtx.font = '14px Arial, sans-serif';
    exportCtx.fillText(`Project: ${projectName}`, 20, 30);
    exportCtx.fillText(`Products: ${placedProducts.length}`, 20, 50);
    exportCtx.fillText(`Date: ${new Date().toLocaleDateString()}`, 20, 70);

    return new Promise((resolve) => {
      exportCanvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          throw new Error('Failed to generate image blob');
        }
      }, 'image/jpeg', 0.95);
    });
  };

  const handleDownload = async () => {
    setIsExporting(true);
    try {
      const imageBlob = await generateHighQualityImage();
      const url = URL.createObjectURL(imageBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${projectName.replace(/\s+/g, '_')}_floorplan.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      toast.success('Floor plan downloaded successfully!');
      setIsOpen(false);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export floor plan');
    } finally {
      setIsExporting(false);
    }
  };

  const handleHubSpotSubmit = async () => {
    if (!contactInfo.name || !contactInfo.email) {
      toast.error('Please fill in your name and email');
      return;
    }

    setIsExporting(true);
    try {
      const imageBlob = await generateHighQualityImage();
      
      // Convert blob to base64 for HubSpot
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Image = reader.result as string;
        
        const sessionId = `floorplan_${Date.now()}`;
        
        // Create inquiry with floor plan attachment
        await createInquiry({
          sessionId,
          email: contactInfo.email,
          name: contactInfo.name,
          company: contactInfo.company,
          subject: `Floor Plan Inquiry - ${projectName}`,
          content: `
Floor Plan Details:
- Project Name: ${projectName}
- Number of Products: ${placedProducts.length}
- Room Points: ${roomPoints.length}
- Date Created: ${new Date().toLocaleDateString()}

Message: ${contactInfo.message}

Floor plan image attached as base64 data:
${base64Image}
          `,
          priority: 'MEDIUM'
        });
        
        toast.success('Floor plan sent to our team successfully!');
        setIsOpen(false);
        setContactInfo({ name: '', email: '', company: '', message: '' });
      };
      
      reader.readAsDataURL(imageBlob);
    } catch (error) {
      console.error('HubSpot submission error:', error);
      toast.error('Failed to send floor plan');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Export Floor Plan
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Export Type Selection */}
          <div className="flex gap-2">
            <Button
              variant={exportType === 'download' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setExportType('download')}
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button
              variant={exportType === 'hubspot' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setExportType('hubspot')}
              className="flex-1"
            >
              <Send className="h-4 w-4 mr-2" />
              Send to Team
            </Button>
          </div>

          {exportType === 'download' ? (
            <div className="text-center py-4">
              <p className="text-sm text-gray-600 mb-4">
                Download your floor plan as a high-quality JPG image
              </p>
              <Button 
                onClick={handleDownload} 
                disabled={isExporting}
                className="w-full"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Download JPG
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Send your floor plan to our team for consultation
              </p>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={contactInfo.name}
                    onChange={(e) => setContactInfo(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={contactInfo.email}
                    onChange={(e) => setContactInfo(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="your@email.com"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  value={contactInfo.company}
                  onChange={(e) => setContactInfo(prev => ({ ...prev, company: e.target.value }))}
                  placeholder="Your company"
                />
              </div>
              
              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={contactInfo.message}
                  onChange={(e) => setContactInfo(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Tell us about your project requirements..."
                  rows={3}
                />
              </div>
              
              <Button 
                onClick={handleHubSpotSubmit} 
                disabled={isExporting || hubspotLoading}
                className="w-full"
              >
                {isExporting || hubspotLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Floor Plan
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
