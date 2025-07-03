
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Send, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';
import { useHubSpotIntegration } from '@/hooks/useHubSpotIntegration';
import { supabase } from '@/integrations/supabase/client';

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
  const { createContact, createTicket } = useHubSpotIntegration();

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
      
      // Generate session ID for tracking
      const sessionId = `send_plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Store in Supabase
      const { error: supabaseError } = await supabase
        .from('chat_sessions')
        .insert({
          session_id: sessionId,
          name: formData.name,
          email: formData.email,
          company: formData.company,
          status: 'floor_plan_sent',
          context: {
            source: 'floor_planner_send',
            notes: formData.notes,
            floor_plan_data: planData,
            has_image: !!imageData
          }
        });

      if (supabaseError) {
        console.error('Supabase error:', supabaseError);
        throw supabaseError;
      }

      // Create HubSpot contact
      const contactResult = await createContact({
        sessionId,
        name: formData.name,
        email: formData.email,
        company: formData.company
      });

      // Create HubSpot ticket for floor plan request
      if (contactResult?.data?.hubspot_contact_id) {
        await createTicket({
          sessionId,
          subject: `Floor Plan Request - ${formData.name}`,
          content: `Floor plan submission from ${formData.name} (${formData.company})\n\nNotes: ${formData.notes}\n\nFloor plan details:\n- Room points: ${planData.roomPoints}\n- Products: ${planData.placedProducts}\n- Submitted at: ${planData.timestamp}`,
          contactId: contactResult.data.hubspot_contact_id,
          priority: 'MEDIUM'
        });
      }

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
