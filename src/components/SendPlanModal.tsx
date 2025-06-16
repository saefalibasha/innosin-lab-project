
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Send, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';

interface SendPlanModalProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  roomPoints: any[];
  placedProducts: any[];
  children: React.ReactNode;
}

interface FormData {
  name: string;
  email: string;
  company: string;
  notes: string;
}

const SendPlanModal: React.FC<SendPlanModalProps> = ({
  canvasRef,
  roomPoints,
  placedProducts,
  children
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    company: '',
    notes: ''
  });

  const handleInputChange = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const generatePlanData = async () => {
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

    let imageData = null;
    if (canvasRef.current) {
      try {
        const canvas = await html2canvas(canvasRef.current, {
          backgroundColor: '#ffffff',
          scale: 1,
          useCORS: true
        });
        imageData = canvas.toDataURL('image/png');
      } catch (error) {
        console.error('Failed to capture floor plan image:', error);
      }
    }

    return { planData, imageData };
  };

  const submitToHubSpot = async () => {
    setIsSending(true);

    try {
      const { planData, imageData } = await generatePlanData();

      // Simulate HubSpot API call (replace with actual HubSpot integration)
      const submissionData = {
        ...formData,
        floorPlanData: planData,
        floorPlanImage: imageData ? 'Attached' : 'Not available',
        submittedAt: new Date().toISOString(),
        source: 'Floor Planner Tool'
      };

      console.log('Submitting to HubSpot:', submissionData);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      setIsSuccess(true);
      toast.success('Floor plan sent successfully!');
      
      // Reset form after success
      setTimeout(() => {
        setIsOpen(false);
        setIsSuccess(false);
        setFormData({ name: '', email: '', company: '', notes: '' });
      }, 2000);

    } catch (error) {
      console.error('Error submitting floor plan:', error);
      toast.error('Failed to send floor plan. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const isFormValid = formData.name && formData.email;

  if (isSuccess) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <div className="text-center space-y-4 py-6">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            <div>
              <h3 className="text-lg font-medium">Floor Plan Sent!</h3>
              <p className="text-gray-600 mt-2">
                Your floor plan has been sent to our team. We'll get back to you soon.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Send className="w-5 h-5" />
            <span>Send Floor Plan</span>
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={(e) => { e.preventDefault(); submitToHubSpot(); }} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
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
              value={formData.email}
              onChange={handleInputChange('email')}
              placeholder="your@email.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              value={formData.company}
              onChange={handleInputChange('company')}
              placeholder="Your company name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={handleInputChange('notes')}
              placeholder="Any specific requirements or questions..."
              rows={3}
            />
          </div>

          <div className="bg-blue-50 rounded-lg p-3 text-sm">
            <p className="text-blue-800">
              Your floor plan will be attached and sent to our design team for review.
            </p>
          </div>

          <Button
            type="submit"
            disabled={!isFormValid || isSending}
            className="w-full"
          >
            {isSending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send Floor Plan
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SendPlanModal;
