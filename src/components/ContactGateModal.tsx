import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Building2, Mail, Phone, User, Briefcase } from 'lucide-react';
import { useHubSpotIntegration } from '@/hooks/useHubSpotIntegration';
import { toast } from 'sonner';

interface ContactGateModalProps {
  isOpen: boolean;
  onSuccess: () => void;
  onCancel: () => void;
}

export const ContactGateModal: React.FC<ContactGateModalProps> = ({
  isOpen,
  onSuccess,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    jobTitle: '',
    phone: '',
    message: '',
    createInquiry: false,
    inquirySubject: '',
    inquiryContent: ''
  });
  
  const { createContact, createTicket, loading } = useHubSpotIntegration();

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      toast.error('Name and email are required');
      return;
    }

    try {
      const sessionId = crypto.randomUUID();
      
      // Create contact in HubSpot
      const contactResult = await createContact({
        sessionId,
        name: formData.name,
        email: formData.email,
        company: formData.company,
        jobTitle: formData.jobTitle,
        phone: formData.phone
      });

      // Create inquiry ticket if requested
      if (formData.createInquiry && formData.inquirySubject) {
        await createTicket({
          sessionId,
          subject: formData.inquirySubject,
          content: formData.inquiryContent || `Inquiry from ${formData.name} (${formData.email}) regarding floor planner access.`,
          contactId: contactResult.contactId,
          priority: 'MEDIUM'
        });
        toast.success('Inquiry submitted successfully');
      }

      // Store contact info for session
      sessionStorage.setItem('contactInfo', JSON.stringify({
        name: formData.name,
        email: formData.email,
        company: formData.company,
        contactId: contactResult.contactId,
        sessionId
      }));

      toast.success('Welcome to the Floor Planner!');
      onSuccess();
    } catch (error) {
      console.error('Error submitting contact form:', error);
      toast.error('Failed to submit contact information. Please try again.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => !loading && onCancel()}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Welcome to Innosin Lab Floor Planner
          </DialogTitle>
          <DialogDescription>
            Please provide your contact details to access our professional floor planning tool.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Card>
            <CardContent className="pt-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Full Name *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Address *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter your email address"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company" className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Company
                </Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                  placeholder="Enter your company name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="jobTitle" className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Job Title
                </Label>
                <Input
                  id="jobTitle"
                  value={formData.jobTitle}
                  onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                  placeholder="Enter your job title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Enter your phone number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message (Optional)</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  placeholder="Tell us about your project or inquiry..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4 space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="createInquiry"
                  checked={formData.createInquiry}
                  onCheckedChange={(checked) => handleInputChange('createInquiry', checked as boolean)}
                />
                <Label htmlFor="createInquiry" className="text-sm">
                  I have a specific inquiry about laboratory equipment
                </Label>
              </div>

              {formData.createInquiry && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="inquirySubject">Inquiry Subject</Label>
                    <Input
                      id="inquirySubject"
                      value={formData.inquirySubject}
                      onChange={(e) => handleInputChange('inquirySubject', e.target.value)}
                      placeholder="Brief description of your inquiry"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="inquiryContent">Details (Optional)</Label>
                    <Textarea
                      id="inquiryContent"
                      value={formData.inquiryContent}
                      onChange={(e) => handleInputChange('inquiryContent', e.target.value)}
                      placeholder="Provide more details about your inquiry..."
                      rows={3}
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <div className="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.name || !formData.email}
              className="flex-1"
            >
              {loading ? 'Submitting...' : 'Access Floor Planner'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};