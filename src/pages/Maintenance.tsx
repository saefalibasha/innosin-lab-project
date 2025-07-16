
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useHubSpotIntegration } from "@/hooks/useHubSpotIntegration";
import { toast } from "sonner";
import { Mail, Phone, MapPin, Clock, Construction, CheckCircle } from "lucide-react";

const Maintenance = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    jobTitle: "",
    phone: "",
    inquiryType: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createContact, createTicket, loading } = useHubSpotIntegration();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Generate session ID for tracking
      const sessionId = `maintenance-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Create contact in HubSpot
      const contactResult = await createContact({
        sessionId,
        email: formData.email,
        name: formData.name,
        company: formData.company,
        jobTitle: formData.jobTitle,
        phone: formData.phone
      });

      // Create support ticket for the inquiry
      await createTicket({
        sessionId,
        subject: `${formData.inquiryType} - ${formData.name} from ${formData.company}`,
        content: formData.message,
        contactId: contactResult?.contactId,
        priority: 'MEDIUM'
      });

      toast.success("Thank you! Your inquiry has been submitted successfully. We'll get back to you soon.");
      
      // Reset form
      setFormData({
        name: "",
        email: "",
        company: "",
        jobTitle: "",
        phone: "",
        inquiryType: "",
        message: ""
      });
    } catch (error) {
      console.error("Error submitting inquiry:", error);
      toast.error("There was an error submitting your inquiry. Please try again or contact us directly.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inquiryTypes = [
    "General Information",
    "Product Inquiry",
    "Custom Laboratory Design",
    "Technical Support",
    "Partnership Opportunity",
    "Quote Request",
    "Other"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <img 
            src="/branding/hero-logo.png" 
            alt="Innosin Lab" 
            className="h-16 w-auto mx-auto mb-6"
          />
          <div className="flex items-center justify-center gap-2 mb-4">
            <Construction className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">Website Under Construction</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            We're building something amazing! Our new website will be launching soon with enhanced features and improved user experience.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Inquiry Form */}
          <Card className="order-2 lg:order-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                Send Us an Inquiry
              </CardTitle>
              <CardDescription>
                Have questions about our laboratory solutions? Send us your inquiry and we'll get back to you promptly.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      required
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      type="text"
                      value={formData.company}
                      onChange={(e) => handleInputChange("company", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="jobTitle">Job Title</Label>
                    <Input
                      id="jobTitle"
                      type="text"
                      value={formData.jobTitle}
                      onChange={(e) => handleInputChange("jobTitle", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="inquiryType">Inquiry Type *</Label>
                    <Select
                      value={formData.inquiryType}
                      onValueChange={(value) => handleInputChange("inquiryType", value)}
                      required
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select inquiry type" />
                      </SelectTrigger>
                      <SelectContent>
                        {inquiryTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => handleInputChange("message", e.target.value)}
                    required
                    rows={4}
                    className="mt-1"
                    placeholder="Please provide details about your inquiry..."
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isSubmitting || loading}
                >
                  {isSubmitting || loading ? "Submitting..." : "Submit Inquiry"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Company Information */}
          <div className="order-1 lg:order-2 space-y-6">
            {/* About Innosin Lab */}
            <Card>
              <CardHeader>
                <CardTitle>About Innosin Lab</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Leading provider of innovative laboratory furniture and equipment solutions. 
                  We specialize in custom laboratory design, high-quality furniture, and 
                  comprehensive laboratory setups for research institutions, hospitals, 
                  and industrial facilities.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Custom Laboratory Design</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Premium Laboratory Furniture</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Complete Laboratory Solutions</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Professional Installation</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-primary" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-muted-foreground">info@innosinlab.com</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Phone</p>
                    <p className="text-muted-foreground">Available upon request</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Location</p>
                    <p className="text-muted-foreground">Serving clients worldwide</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Response Time</p>
                    <p className="text-muted-foreground">Within 24 hours</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Progress Update */}
            <Card>
              <CardHeader>
                <CardTitle>Development Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Website Design</span>
                    <span className="text-sm text-green-500 font-medium">100%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full w-full"></div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Content Development</span>
                    <span className="text-sm text-primary font-medium">85%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full w-[85%]"></div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Testing & Optimization</span>
                    <span className="text-sm text-yellow-500 font-medium">60%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full w-[60%]"></div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  Expected launch: Q1 2025
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t border-border">
          <p className="text-muted-foreground">
            © 2024 Innosin Lab. All rights reserved. | Building the future of laboratory solutions.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Maintenance;
