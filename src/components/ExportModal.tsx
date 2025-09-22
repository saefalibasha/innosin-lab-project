
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Download, Mail, Building2 } from 'lucide-react';
import { PlacedProduct, Point } from '@/types/floorPlanTypes';
import { useHubSpotIntegration } from '@/hooks/useHubSpotIntegration';

interface ExportModalProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  roomPoints: Point[];
  placedProducts: PlacedProduct[];
  children: React.ReactNode;
}

const ExportModal: React.FC<ExportModalProps> = ({
  canvasRef,
  roomPoints,
  placedProducts,
  children
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { createContact, createInquiry, loading: hubSpotLoading } = useHubSpotIntegration();

  const validateUserInfo = () => {
    if (!userInfo.name.trim()) {
      toast.error('Name is required');
      return false;
    }
    if (!userInfo.email.trim() || !/\S+@\S+\.\S+/.test(userInfo.email)) {
      toast.error('Valid email is required');
      return false;
    }
    if (!userInfo.company.trim()) {
      toast.error('Company name is required');
      return false;
    }
    return true;
  };

  const createHubSpotInquiry = async () => {
    try {
      const sessionId = Date.now().toString();
      
      // Create contact first
      const contactResult = await createContact({
        sessionId,
        email: userInfo.email,
        name: userInfo.name,
        company: userInfo.company,
        jobTitle: '', // Optional
        phone: userInfo.phone
      });

      // Create product summary for the inquiry
      const productSummary = placedProducts.map(p => 
        `${p.name} (${p.category}) - ${p.dimensions.length}x${p.dimensions.width}mm`
      ).join('\n');

      const inquiryContent = `
Floor Plan Export Request

User Information:
- Name: ${userInfo.name}
- Email: ${userInfo.email}
- Company: ${userInfo.company}
- Phone: ${userInfo.phone || 'Not provided'}

Floor Plan Details:
- Total Products: ${placedProducts.length}
- Room Points: ${roomPoints.length}

Products Placed:
${productSummary}

Additional Notes:
${userInfo.notes || 'None provided'}

Export Date: ${new Date().toLocaleString()}
      `;

      // Create inquiry ticket
      await createInquiry({
        sessionId,
        subject: `Floor Plan Export - ${userInfo.company}`,
        content: inquiryContent,
        contactId: contactResult?.contactId,
        priority: 'MEDIUM'
      });

      toast.success('Floor plan exported and inquiry sent to our team successfully!');
      return true;
    } catch (error) {
      console.error('Error creating HubSpot inquiry:', error);
      toast.error('Export completed but failed to send inquiry. Please contact us directly.');
      return false;
    }
  };

  const handleExport = async (format: 'pdf' | 'png' | 'json') => {
    if (!validateUserInfo()) return;

    setIsSubmitting(true);

    try {
      // Store minimal export session info (no PII)
      sessionStorage.setItem('lastExport', new Date().toISOString());

      // Export logic based on format
      if (format === 'pdf') {
        await exportToPDF();
      } else if (format === 'png') {
        await exportToPNG();
      } else if (format === 'json') {
        await exportToJSON();
      }

      // Create HubSpot inquiry after successful export
      await createHubSpotInquiry();

      setIsOpen(false);
    } catch (error) {
      toast.error(`Failed to export as ${format.toUpperCase()}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const exportToPDF = async () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const imgData = canvas.toDataURL('image/png');
    
    // Create PDF with user info and floor plan
    const { jsPDF } = await import('jspdf');
    const pdf = new jsPDF();
    
    // Add user information header
    pdf.setFontSize(16);
    pdf.text('Floor Plan Export', 20, 20);
    pdf.setFontSize(10);
    pdf.text(`Exported by: ${userInfo.name}`, 20, 35);
    pdf.text(`Company: ${userInfo.company}`, 20, 42);
    pdf.text(`Email: ${userInfo.email}`, 20, 49);
    pdf.text(`Date: ${new Date().toLocaleDateString()}`, 20, 56);
    
    if (userInfo.notes) {
      pdf.text(`Notes: ${userInfo.notes}`, 20, 63);
    }
    
    // Add floor plan image
    const imgWidth = 170;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 20, 75, imgWidth, imgHeight);
    
    // Add product summary
    const yPos = 75 + imgHeight + 20;
    pdf.text('Products Summary:', 20, yPos);
    placedProducts.forEach((product, index) => {
      pdf.text(`${index + 1}. ${product.name} - ${product.category}`, 25, yPos + 10 + (index * 7));
    });
    
    pdf.save(`floor-plan-${userInfo.company.replace(/\s+/g, '-')}-${Date.now()}.pdf`);
  };

  const exportToPNG = async () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = `floor-plan-${userInfo.company.replace(/\s+/g, '-')}-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const exportToJSON = async () => {
    const floorPlanData = {
      userInfo,
      exportDate: new Date().toISOString(),
      roomPoints,
      placedProducts,
      summary: {
        totalProducts: placedProducts.length,
        categories: [...new Set(placedProducts.map(p => p.category))],
        roomArea: calculateRoomArea()
      }
    };
    
    const dataStr = JSON.stringify(floorPlanData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `floor-plan-${userInfo.company.replace(/\s+/g, '-')}-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const calculateRoomArea = (): number => {
    if (roomPoints.length < 3) return 0;
    
    let area = 0;
    for (let i = 0; i < roomPoints.length; i++) {
      const j = (i + 1) % roomPoints.length;
      area += roomPoints[i].x * roomPoints[j].y;
      area -= roomPoints[j].x * roomPoints[i].y;
    }
    return Math.abs(area / 2);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Floor Plan
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-blue-50 p-3 rounded-md">
            <p className="text-sm text-blue-800">
              <Mail className="h-4 w-4 inline mr-1" />
              Your floor plan and contact details will be sent to our team for follow-up support.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={userInfo.name}
                onChange={(e) => setUserInfo(prev => ({ ...prev, name: e.target.value }))}
                placeholder="John Doe"
              />
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={userInfo.email}
                onChange={(e) => setUserInfo(prev => ({ ...prev, email: e.target.value }))}
                placeholder="john@company.com"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="company">Company *</Label>
              <Input
                id="company"
                value={userInfo.company}
                onChange={(e) => setUserInfo(prev => ({ ...prev, company: e.target.value }))}
                placeholder="Company Name"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={userInfo.phone}
                onChange={(e) => setUserInfo(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="Optional"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="notes">Project Notes</Label>
            <Textarea
              id="notes"
              value={userInfo.notes}
              onChange={(e) => setUserInfo(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Tell us about your project requirements or any questions you have"
              rows={3}
            />
          </div>
          
          <div className="flex flex-col gap-2 pt-4">
            <Button 
              onClick={() => handleExport('pdf')} 
              disabled={isSubmitting || hubSpotLoading}
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Exporting & Sending...' : 'Export PDF & Send Inquiry'}
            </Button>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => handleExport('png')} 
                disabled={isSubmitting || hubSpotLoading}
                className="flex-1"
              >
                Export PNG
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleExport('json')} 
                disabled={isSubmitting || hubSpotLoading}
                className="flex-1"
              >
                Export JSON
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExportModal;
