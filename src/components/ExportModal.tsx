
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Download, Image, FileText, Loader2, CheckCircle, User } from 'lucide-react';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface ExportModalProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  roomPoints: any[];
  placedProducts: any[];
  children: React.ReactNode;
}

interface LeadData {
  name: string;
  email: string;
  contact: string;
  company: string;
  jobTitle: string;
  projectDescription: string;
}

const ExportModal: React.FC<ExportModalProps> = ({
  canvasRef,
  roomPoints,
  placedProducts,
  children
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [exportFormat, setExportFormat] = useState<'png' | 'pdf'>('png');
  const [step, setStep] = useState<'format' | 'form' | 'success'>('format');
  const [leadData, setLeadData] = useState<LeadData>({
    name: '',
    email: '',
    contact: '',
    company: '',
    jobTitle: '',
    projectDescription: ''
  });

  const handleInputChange = (field: keyof LeadData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setLeadData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const submitToHubSpot = async (leadData: LeadData, planData: any) => {
    // Simulate HubSpot API call (replace with actual HubSpot integration)
    const hubspotData = {
      ...leadData,
      floorPlanData: planData,
      submittedAt: new Date().toISOString(),
      source: 'Floor Planner Export',
      exportFormat: exportFormat.toUpperCase()
    };

    console.log('Submitting to HubSpot:', hubspotData);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return hubspotData;
  };

  const exportAsImage = async (format: 'png' | 'pdf') => {
    if (!canvasRef.current) {
      toast.error('Canvas not found');
      return;
    }

    setIsExporting(true);
    
    try {
      // Generate plan data for HubSpot
      const planData = {
        timestamp: new Date().toISOString(),
        roomPoints: roomPoints.length,
        placedProducts: placedProducts.length,
        products: placedProducts.map(p => ({
          name: p.name,
          position: p.position,
          rotation: p.rotation
        }))
      };

      // Submit to HubSpot first
      await submitToHubSpot(leadData, planData);

      // Then generate and download the file
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
        toast.success('Floor plan exported as PNG and lead captured!');
      } else if (format === 'pdf') {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
          unit: 'px',
          format: [canvas.width, canvas.height]
        });
        
        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save(`floor-plan-${new Date().toISOString().split('T')[0]}.pdf`);
        toast.success('Floor plan exported as PDF and lead captured!');
      }

      setStep('success');
      
      // Reset after success
      setTimeout(() => {
        setIsOpen(false);
        setStep('format');
        setLeadData({ name: '', email: '', contact: '', company: '', jobTitle: '', projectDescription: '' });
      }, 3000);

    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export floor plan');
    } finally {
      setIsExporting(false);
    }
  };

  const handleFormatSelection = (format: 'png' | 'pdf') => {
    setExportFormat(format);
    setStep('form');
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid) {
      exportAsImage(exportFormat);
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
  // Updated validation to require name, email, contact, and company
  const isFormValid = leadData.name && leadData.email && leadData.contact && leadData.company;

  const resetModal = () => {
    setStep('format');
    setLeadData({ name: '', email: '', contact: '', company: '', jobTitle: '', projectDescription: '' });
  };

  if (step === 'success') {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <div className="text-center space-y-4 py-6">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            <div>
              <h3 className="text-lg font-medium">Export Successful!</h3>
              <p className="text-gray-600 mt-2">
                Your floor plan has been downloaded and your information has been sent to our team.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetModal(); }}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Download className="w-5 h-5" />
            <span>Export Floor Plan</span>
          </DialogTitle>
        </DialogHeader>
        
        {step === 'format' && (
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
              <h4 className="font-medium text-sm">Select Export Format</h4>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  className="flex items-center space-x-2 h-16 border-2 hover:border-blue-500 hover:bg-blue-50"
                  onClick={() => handleFormatSelection('png')}
                >
                  <Image className="w-6 h-6" />
                  <span>PNG Image</span>
                </Button>
                <Button
                  variant="outline"
                  className="flex items-center space-x-2 h-16 border-2 hover:border-blue-500 hover:bg-blue-50"
                  onClick={() => handleFormatSelection('pdf')}
                >
                  <FileText className="w-6 h-6" />
                  <span>PDF Document</span>
                </Button>
              </div>
            </div>
          </div>
        )}

        {step === 'form' && (
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="bg-blue-50 rounded-lg p-3 text-sm">
              <div className="flex items-center space-x-2 mb-2">
                <User className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-blue-800">Contact Information Required</span>
              </div>
              <p className="text-blue-700 text-xs">
                Please provide your contact details to receive your {exportFormat.toUpperCase()} export.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={leadData.name}
                onChange={handleInputChange('name')}
                placeholder="Your full name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={leadData.email}
                onChange={handleInputChange('email')}
                placeholder="your@email.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact">Contact Number *</Label>
              <Input
                id="contact"
                value={leadData.contact}
                onChange={handleInputChange('contact')}
                placeholder="Your phone number"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Company/Organization *</Label>
              <Input
                id="company"
                value={leadData.company}
                onChange={handleInputChange('company')}
                placeholder="Your company name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="jobTitle">Job Title</Label>
              <Input
                id="jobTitle"
                value={leadData.jobTitle}
                onChange={handleInputChange('jobTitle')}
                placeholder="Your job title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="projectDescription">Project Description or Notes</Label>
              <Textarea
                id="projectDescription"
                value={leadData.projectDescription}
                onChange={handleInputChange('projectDescription')}
                placeholder="Tell us about your project requirements..."
                rows={3}
              />
            </div>

            <div className="flex space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep('format')}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                type="submit"
                disabled={!isFormValid || isExporting}
                className="flex-1"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Export {exportFormat.toUpperCase()}
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ExportModal;
