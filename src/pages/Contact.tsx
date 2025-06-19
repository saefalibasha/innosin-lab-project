
import React, { useState } from 'react';
import GoogleMapsLocation from '@/components/GoogleMapsLocation';
import NewsletterSubscription from '@/components/NewsletterSubscription';
import AnimatedSection from '@/components/AnimatedSection';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

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
    toast.success('Message sent successfully! We\'ll get back to you soon.');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="container-custom py-12 pt-20">
      {/* Header */}
      <div className="text-center mb-16">
        <AnimatedSection animation="fade-in" delay={100}>
          <h1 className="text-4xl font-serif font-bold text-primary mb-4">Contact Us</h1>
        </AnimatedSection>
        <AnimatedSection animation="fade-in" delay={300}>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Have questions about our products or need support? We'd love to hear from you. 
            Send us a message and we'll respond as soon as possible.
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
              <CardTitle className="text-2xl font-serif text-primary">Send us a message</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                      Full Name
                    </label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="John Doe"
                      className="transition-all duration-300 focus:border-sea"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                      Email Address
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="john@example.com"
                      className="transition-all duration-300 focus:border-sea"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-foreground mb-2">
                    Subject
                  </label>
                  <Input
                    id="subject"
                    name="subject"
                    type="text"
                    required
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder="How can we help you?"
                    className="transition-all duration-300 focus:border-sea"
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                    Message
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    rows={6}
                    required
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Tell us more about your inquiry..."
                    className="transition-all duration-300 focus:border-sea"
                  />
                </div>
                
                <Button type="submit" size="lg" className="w-full bg-sea hover:bg-sea-dark animate-float">
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>
        </AnimatedSection>

        {/* Quick Contact Info */}
        <AnimatedSection animation="fade-in-right" delay={400}>
          <Card className="glass-card hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-2xl font-serif text-primary">Get in Touch</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <AnimatedSection animation="slide-up" delay={500}>
                <div>
                  <h3 className="font-semibold text-lg mb-2 text-sea">Laboratory Consultation</h3>
                  <p className="text-muted-foreground">
                    Schedule a consultation with our experts to discuss your laboratory design and equipment needs.
                  </p>
                </div>
              </AnimatedSection>
              
              <AnimatedSection animation="slide-up" delay={600}>
                <div>
                  <h3 className="font-semibold text-lg mb-2 text-sea">Emergency Support</h3>
                  <p className="text-muted-foreground">
                    For urgent equipment issues or safety concerns, contact our 24/7 emergency support line.
                  </p>
                </div>
              </AnimatedSection>
              
              <AnimatedSection animation="slide-up" delay={700}>
                <div>
                  <h3 className="font-semibold text-lg mb-2 text-sea">Project Inquiries</h3>
                  <p className="text-muted-foreground">
                    Ready to start your laboratory project? Let's discuss your requirements and timeline.
                  </p>
                </div>
              </AnimatedSection>
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
