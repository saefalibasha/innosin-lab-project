
import React, { useState } from 'react';
import GoogleMapsLocation from '@/components/GoogleMapsLocation';
import NewsletterSubscription from '@/components/NewsletterSubscription';
import AnimatedSection from '@/components/AnimatedSection';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { contactPageContent } from '@/data/contactPageContent';
import { Calendar, MessageCircle, Briefcase } from 'lucide-react';
import { useHubSpotIntegration } from '@/hooks/useHubSpotIntegration';
import { supabase } from '@/integrations/supabase/client';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    jobTitle: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createContact } = useHubSpotIntegration();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Generate session ID for tracking
      const sessionId = `contact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Store in Supabase
      const { error: supabaseError } = await supabase
        .from('chat_sessions')
        .insert({
          session_id: sessionId,
          name: formData.name,
          email: formData.email,
          company: formData.company,
          job_title: formData.jobTitle,
          status: 'contact_form_submitted',
          context: {
            source: 'contact_page',
            subject: formData.subject,
            message: formData.message
          }
        });

      if (supabaseError) {
        console.error('Supabase error:', supabaseError);
        throw supabaseError;
      }

      // Create HubSpot contact
      await createContact({
        sessionId,
        name: formData.name,
        email: formData.email,
        company: formData.company,
        jobTitle: formData.jobTitle,
        subject: formData.subject,
        content: formData.message
      });

      toast.success(contactPageContent.form.successMessage);
      setFormData({ name: '', email: '', company: '', jobTitle: '', subject: '', message: '' });
    } catch (error) {
      console.error('Contact form submission error:', error);
      toast.error('Failed to submit contact form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'calendar':
        return <Calendar className="w-6 h-6" />;
      case 'message-circle':
        return <MessageCircle className="w-6 h-6" />;
      case 'briefcase':
        return <Briefcase className="w-6 h-6" />;
      default:
        return <MessageCircle className="w-6 h-6" />;
    }
  };

  return (
    <div className="container-custom py-12 pt-20">
      {/* Header */}
      <div className="text-center mb-16">
        <AnimatedSection animation="fade-in" delay={100}>
          <h1 className="text-4xl font-serif font-bold text-primary mb-4">{contactPageContent.header.title}</h1>
        </AnimatedSection>
        <AnimatedSection animation="fade-in" delay={300}>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {contactPageContent.header.description}
          </p>
        </AnimatedSection>
      </div>

      {/* Google Maps Location */}
      <div className="mb-16">
        <AnimatedSection animation="scale-in" delay={200}>
          <GoogleMapsLocation />
        </AnimatedSection>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16 lg:items-end">
        {/* Contact Form */}
        <AnimatedSection animation="fade-in-left" delay={300}>
          <Card className="glass-card hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-2xl font-serif text-primary">{contactPageContent.form.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                      {contactPageContent.form.nameLabel}
                    </label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder={contactPageContent.form.namePlaceholder}
                      className="transition-all duration-300 focus:border-sea"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                      {contactPageContent.form.emailLabel}
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder={contactPageContent.form.emailPlaceholder}
                      className="transition-all duration-300 focus:border-sea"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="company" className="block text-sm font-medium text-foreground mb-2">
                      {contactPageContent.form.companyLabel}
                    </label>
                    <Input
                      id="company"
                      name="company"
                      type="text"
                      required
                      value={formData.company}
                      onChange={handleInputChange}
                      placeholder={contactPageContent.form.companyPlaceholder}
                      className="transition-all duration-300 focus:border-sea"
                    />
                  </div>
                  <div>
                    <label htmlFor="jobTitle" className="block text-sm font-medium text-foreground mb-2">
                      {contactPageContent.form.jobTitleLabel}
                    </label>
                    <Input
                      id="jobTitle"
                      name="jobTitle"
                      type="text"
                      required
                      value={formData.jobTitle}
                      onChange={handleInputChange}
                      placeholder={contactPageContent.form.jobTitlePlaceholder}
                      className="transition-all duration-300 focus:border-sea"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-foreground mb-2">
                    {contactPageContent.form.subjectLabel}
                  </label>
                  <Input
                    id="subject"
                    name="subject"
                    type="text"
                    required
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder={contactPageContent.form.subjectPlaceholder}
                    className="transition-all duration-300 focus:border-sea"
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                    {contactPageContent.form.messageLabel}
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    rows={6}
                    required
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder={contactPageContent.form.messagePlaceholder}
                    className="transition-all duration-300 focus:border-sea"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full bg-sea hover:bg-sea-dark"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : contactPageContent.form.submitButton}
                </Button>
              </form>
            </CardContent>
          </Card>
        </AnimatedSection>

        {/* Enhanced Get in Touch Info */}
        <AnimatedSection animation="fade-in-right" delay={400}>
          <Card className="glass-card hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-sea/5 to-sea/10 border-sea/20">
            <CardHeader className="bg-gradient-to-r from-sea/10 to-sea/20 rounded-t-lg">
              <CardTitle className="text-2xl font-serif text-primary flex items-center space-x-2">
                <MessageCircle className="w-6 h-6 text-sea" />
                <span>{contactPageContent.quickContact.title}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8 pt-6 pb-12">
              {contactPageContent.quickContact.sections.map((section, index) => (
                <AnimatedSection key={index} animation="slide-up" delay={500 + index * 100}>
                  <div className="group relative">
                    <div className="flex items-start space-x-4 p-4 rounded-xl bg-white/50 backdrop-blur-sm border border-sea/10 hover:border-sea/50 hover:bg-white/80 transition-all duration-300 hover:shadow-lg relative overflow-hidden">
                      {/* Enhanced headlight effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out opacity-0 group-hover:opacity-100"></div>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-sea/30 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out opacity-0 group-hover:opacity-100 delay-100"></div>
                      
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-sea to-sea-dark rounded-lg flex items-center justify-center text-white shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-300 relative z-10">
                        {getIcon(section.icon)}
                      </div>
                      <div className="flex-1 relative z-10">
                        <h3 className="font-semibold text-lg mb-2 text-sea group-hover:text-sea-dark transition-colors duration-300">
                          {section.title}
                        </h3>
                        <p className="text-muted-foreground leading-relaxed text-sm">
                          {section.description}
                        </p>
                      </div>
                    </div>
                    
                    {/* Enhanced decorative accent */}
                    <div className="absolute -left-1 top-4 w-1 h-16 bg-gradient-to-b from-sea/50 to-sea/20 rounded-full opacity-0 group-hover:opacity-100 group-hover:shadow-lg transition-all duration-300" />
                    <div className="absolute -left-2 top-6 w-2 h-12 bg-gradient-to-b from-sea/30 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 blur-sm" />
                  </div>
                </AnimatedSection>
              ))}
            </CardContent>
          </Card>
        </AnimatedSection>
      </div>

      {/* Newsletter Subscription */}
      <div className="mb-8">
        <AnimatedSection animation="bounce-in" delay={300}>
          <NewsletterSubscription />
        </AnimatedSection>
      </div>
    </div>
  );
};

export default Contact;
