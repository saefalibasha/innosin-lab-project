
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Download } from 'lucide-react';
import { toast } from 'sonner';

interface ExportFormData {
  fullName: string;
  email: string;
  companyName: string;
  contactNumber: string;
  projectDescription: string;
}

interface ExportFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ExportFormData) => Promise<void>;
  exportFormat: 'png' | 'jpg';
}

const ExportFormModal: React.FC<ExportFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  exportFormat
}) => {
  const [formData, setFormData] = useState<ExportFormData>({
    fullName: '',
    email: '',
    companyName: '',
    contactNumber: '',
    projectDescription: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<ExportFormData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<ExportFormData> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required';
    }

    if (!formData.contactNumber.trim()) {
      newErrors.contactNumber = 'Contact number is required';
    }

    if (!formData.projectDescription.trim()) {
      newErrors.projectDescription = 'Project description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(formData);
      
      // Reset form
      setFormData({
        fullName: '',
        email: '',
        companyName: '',
        contactNumber: '',
        projectDescription: ''
      });
      setErrors({});
      
      onClose();
    } catch (error) {
      console.error('Export form submission error:', error);
      toast.error('Failed to process export request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof ExportFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Download className="w-5 h-5" />
            <span>Export Floor Plan as {exportFormat.toUpperCase()}</span>
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name *</Label>
            <Input
              id="fullName"
              type="text"
              value={formData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              className={errors.fullName ? 'border-red-500' : ''}
              placeholder="Enter your full name"
            />
            {errors.fullName && (
              <p className="text-sm text-red-500">{errors.fullName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={errors.email ? 'border-red-500' : ''}
              placeholder="Enter your email address"
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name *</Label>
            <Input
              id="companyName"
              type="text"
              value={formData.companyName}
              onChange={(e) => handleInputChange('companyName', e.target.value)}
              className={errors.companyName ? 'border-red-500' : ''}
              placeholder="Enter your company name"
            />
            {errors.companyName && (
              <p className="text-sm text-red-500">{errors.companyName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactNumber">Contact Number *</Label>
            <Input
              id="contactNumber"
              type="tel"
              value={formData.contactNumber}
              onChange={(e) => handleInputChange('contactNumber', e.target.value)}
              className={errors.contactNumber ? 'border-red-500' : ''}
              placeholder="Enter your contact number"
            />
            {errors.contactNumber && (
              <p className="text-sm text-red-500">{errors.contactNumber}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="projectDescription">Project Description *</Label>
            <Textarea
              id="projectDescription"
              value={formData.projectDescription}
              onChange={(e) => handleInputChange('projectDescription', e.target.value)}
              className={errors.projectDescription ? 'border-red-500' : ''}
              placeholder="Describe your project requirements, purpose, and any specific details..."
              rows={4}
            />
            {errors.projectDescription && (
              <p className="text-sm text-red-500">{errors.projectDescription}</p>
            )}
          </div>

          <div className="flex space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
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

        <div className="text-xs text-gray-500 mt-4 p-3 bg-gray-50 rounded">
          <p className="font-semibold mb-1">Privacy Notice:</p>
          <p>Your information will be used to process your export request and may be shared with our sales team for follow-up. We respect your privacy and will not share your data with third parties.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExportFormModal;
