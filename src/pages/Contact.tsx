
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

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    toast.success(contactPageContent.form.successMessage);
    setFormData({ name: '', email: '', subject: '', message: '' });
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
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
                
                <Button type="submit" size="lg" className="w-full bg-sea hover:bg-sea-dark animate-float">
                  {contactPageContent.form.submitButton}
                </Button>
              </form>
            </CardContent>
          </Card>
        </AnimatedSection>

        {/* Quick Contact Info */}
        <AnimatedSection animation="fade-in-right" delay={400}>
          <Card className="glass-card hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-2xl font-serif text-primary">{contactPageContent.quickContact.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {contactPageContent.quickContact.sections.map((section, index) => (
                <AnimatedSection key={index} animation="slide-up" delay={500 + index * 100}>
                  <div>
                    <h3 className="font-semibold text-lg mb-2 text-sea">{section.title}</h3>
                    <p className="text-muted-foreground">
                      {section.description}
                    </p>
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
