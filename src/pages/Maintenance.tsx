
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useHubSpotIntegration } from "@/hooks/useHubSpotIntegration";
import { toast } from "sonner";
import { Mail, Phone, MapPin, Clock, Construction, CheckCircle } from "lucide-react";
import { isLovableDevelopment } from "@/utils/environmentDetection";

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

  // SEO Meta Tags Setup
  useEffect(() => {
    // Update page title
    document.title = "Innosin Lab - Laboratory Solutions | Coming Soon";
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Innosin Lab - Leading provider of innovative laboratory furniture and equipment solutions. Custom laboratory design, premium furniture, and complete laboratory setups. Coming soon with enhanced features.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Innosin Lab - Leading provider of innovative laboratory furniture and equipment solutions. Custom laboratory design, premium furniture, and complete laboratory setups. Coming soon with enhanced features.';
      document.head.appendChild(meta);
    }

    // Add keywords meta tag
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      const meta = document.createElement('meta');
      meta.name = 'keywords';
      meta.content = 'laboratory furniture, lab equipment, laboratory design, lab cabinets, laboratory solutions, scientific furniture, lab safety, research equipment, laboratory installation';
      document.head.appendChild(meta);
    }

    // Add Open Graph tags
    const ogTags = [
      { property: 'og:title', content: 'Innosin Lab - Laboratory Solutions | Coming Soon' },
      { property: 'og:description', content: 'Leading provider of innovative laboratory furniture and equipment solutions. Custom laboratory design, premium furniture, and complete laboratory setups.' },
      { property: 'og:type', content: 'website' },
      { property: 'og:image', content: '/branding/hero-logo.png' },
      { property: 'og:site_name', content: 'Innosin Lab' }
    ];

    ogTags.forEach(tag => {
      const existing = document.querySelector(`meta[property="${tag.property}"]`);
      if (!existing) {
        const meta = document.createElement('meta');
        meta.setAttribute('property', tag.property);
        meta.setAttribute('content', tag.content);
        document.head.appendChild(meta);
      }
    });

    // Add Twitter Card tags
    const twitterTags = [
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: 'Innosin Lab - Laboratory Solutions | Coming Soon' },
      { name: 'twitter:description', content: 'Leading provider of innovative laboratory furniture and equipment solutions.' },
      { name: 'twitter:image', content: '/branding/hero-logo.png' }
    ];

    twitterTags.forEach(tag => {
      const existing = document.querySelector(`meta[name="${tag.name}"]`);
      if (!existing) {
        const meta = document.createElement('meta');
        meta.setAttribute('name', tag.name);
        meta.setAttribute('content', tag.content);
        document.head.appendChild(meta);
      }
    });

    // Add robots meta tag for maintenance
    const robotsMeta = document.querySelector('meta[name="robots"]');
    if (!robotsMeta) {
      const meta = document.createElement('meta');
      meta.name = 'robots';
      meta.content = 'index, follow, max-snippet:-1, max-image-preview:large';
      document.head.appendChild(meta);
    }

    // Add canonical URL
    const canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      const link = document.createElement('link');
      link.rel = 'canonical';
      link.href = window.location.origin;
      document.head.appendChild(link);
    }

    // Add structured data
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Innosin Lab",
      "description": "Leading provider of innovative laboratory furniture and equipment solutions",
      "url": window.location.origin,
      "logo": `${window.location.origin}/branding/hero-logo.png`,
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer service",
        "email": "info@innosinlab.com"
      },
      "sameAs": []
    };

    const existingScript = document.querySelector('script[type="application/ld+json"]');
    if (!existingScript) {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(structuredData);
      document.head.appendChild(script);
    }
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Generate session ID for tracking
      const sessionId = `maintenance-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      console.log('Submitting maintenance form with data:', formData);

      // Create contact in HubSpot
      const contactResult = await createContact({
        sessionId,
        email: formData.email,
        name: formData.name,
        company: formData.company,
        jobTitle: formData.jobTitle,
        phone: formData.phone
      });

      console.log('Contact creation result:', contactResult);

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

  const isDevelopment = isLovableDevelopment();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <img 
            src="/branding/hero-logo.png" 
            alt="Innosin Lab - Laboratory Solutions" 
            className="h-12 sm:h-16 w-auto mx-auto mb-4 sm:mb-6"
          />
          <div className="flex items-center justify-center gap-2 mb-4">
            <Construction className="h-6 sm:h-8 w-6 sm:w-8 text-primary" />
            <h1 className="text-2xl sm:text-4xl font-bold text-foreground">Website Under Construction</h1>
          </div>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            We're building something amazing! Our new website will be launching soon with enhanced features and improved user experience.
          </p>
          
          {/* Development Environment Notice */}
          {isDevelopment && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg max-w-md mx-auto">
              <p className="text-sm text-blue-800">
                <strong>Development Mode:</strong> All pages are accessible in this environment. 
                Production visitors will only see this maintenance page.
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 max-w-6xl mx-auto">
          {/* Inquiry Form */}
          <Card className="order-2 lg:order-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Mail className="h-5 w-5 text-primary" />
                Send Us an Inquiry
              </CardTitle>
              <CardDescription>
                Have questions about our laboratory solutions? Send us your inquiry and we'll get back to you promptly.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="text-sm sm:text-base">Name *</Label>
                    <Input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      required
                      className="mt-1"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-sm sm:text-base">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      required
                      className="mt-1"
                      placeholder="your.email@company.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="company" className="text-sm sm:text-base">Company</Label>
                    <Input
                      id="company"
                      type="text"
                      value={formData.company}
                      onChange={(e) => handleInputChange("company", e.target.value)}
                      className="mt-1"
                      placeholder="Your company name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="jobTitle" className="text-sm sm:text-base">Job Title</Label>
                    <Input
                      id="jobTitle"
                      type="text"
                      value={formData.jobTitle}
                      onChange={(e) => handleInputChange("jobTitle", e.target.value)}
                      className="mt-1"
                      placeholder="Your job title"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone" className="text-sm sm:text-base">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      className="mt-1"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <div>
                    <Label htmlFor="inquiryType" className="text-sm sm:text-base">Inquiry Type *</Label>
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
                  <Label htmlFor="message" className="text-sm sm:text-base">Message *</Label>
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
                <CardTitle className="text-lg sm:text-xl">About Innosin Lab</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4 text-sm sm:text-base">
                  Leading provider of innovative laboratory furniture and equipment solutions. 
                  We specialize in custom laboratory design, high-quality furniture, and 
                  comprehensive laboratory setups for research institutions, hospitals, 
                  and industrial facilities.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span>Custom Laboratory Design</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span>Premium Laboratory Furniture</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span>Complete Laboratory Solutions</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span>Professional Installation</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <Phone className="h-5 w-5 text-primary" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm sm:text-base">Email</p>
                    <p className="text-muted-foreground text-sm">info@innosinlab.com</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm sm:text-base">Phone</p>
                    <p className="text-muted-foreground text-sm">Available upon request</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm sm:text-base">Location</p>
                    <p className="text-muted-foreground text-sm">Serving clients worldwide</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm sm:text-base">Response Time</p>
                    <p className="text-muted-foreground text-sm">Within 24 hours</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Progress Update */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Development Progress</CardTitle>
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
                  Expected launch: Q2 2025
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-border">
          <p className="text-muted-foreground text-sm sm:text-base">
            © 2024 Innosin Lab. All rights reserved. | Building the future of laboratory solutions.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Maintenance;
