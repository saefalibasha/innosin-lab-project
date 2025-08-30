
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Minus, FileDown, Send, ShoppingCart } from 'lucide-react';
import { useRFQ } from '@/contexts/RFQContext';
import { toast } from 'sonner';
import AnimatedSection from '@/components/AnimatedSection';
import { useHubSpotIntegration } from '@/hooks/useHubSpotIntegration';
import { supabase } from '@/integrations/supabase/client';

const RFQCart = () => {
  const { items, removeItem, updateItem, clearCart, itemCount } = useRFQ();
  const [contactInfo, setContactInfo] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createContact, createDeal } = useHubSpotIntegration();

  const handleContactChange = (field: string, value: string) => {
    setContactInfo(prev => ({ ...prev, [field]: value }));
  };

  const updateQuantity = (id: string, quantity: number) => {
    updateItem(id, { quantity });
  };

  const handleSubmitRFQ = async () => {
    if (items.length === 0) {
      toast.error('Please add items to your cart before submitting');
      return;
    }
    
    if (!contactInfo.name || !contactInfo.email) {
      toast.error('Please provide your name and email');
      return;
    }

    setIsSubmitting(true);

    try {
      // Generate session ID for tracking
      const sessionId = `rfq_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Store RFQ in Supabase
      const { error: supabaseError } = await supabase
        .from('chat_sessions')
        .insert({
          session_id: sessionId,
          name: contactInfo.name,
          email: contactInfo.email,
          company: contactInfo.company,
          phone: contactInfo.phone,
          status: 'rfq_submitted',
          context: {
            source: 'rfq_cart',
            message: contactInfo.message,
            items: items.map(item => ({
              id: item.id,
              name: item.name,
              category: item.category,
              quantity: item.quantity,
              dimensions: item.dimensions
            })),
            total_items: items.length,
            total_quantity: items.reduce((sum, item) => sum + item.quantity, 0)
          }
        });

      if (supabaseError) {
        console.error('Supabase error:', supabaseError);
        throw supabaseError;
      }

      // Create HubSpot contact
      const contactResult = await createContact({
        sessionId,
        name: contactInfo.name,
        email: contactInfo.email,
        company: contactInfo.company,
        phone: contactInfo.phone
      });

      // Create HubSpot deal for the RFQ
      if (contactResult?.data?.hubspot_contact_id) {
        await createDeal({
          sessionId,
          dealName: `RFQ - ${contactInfo.name} - ${items.length} items`,
          contactId: contactResult.data.hubspot_contact_id,
          amount: 0 // Amount TBD for RFQ
        });
      }

      toast.success('Request for Quote submitted successfully!');
      clearCart();
      setContactInfo({ name: '', email: '', company: '', phone: '', message: '' });
    } catch (error) {
      console.error('RFQ submission error:', error);
      toast.error('Failed to submit RFQ. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportPDF = () => {
    // Implementation would go here
    toast.success('Quote exported as PDF');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-background">
      <div className="container-custom py-12 pt-20">
        {/* Header */}
        <div className="text-center mb-12">
          <AnimatedSection animation="fade-in" delay={100}>
            <h1 className="text-4xl font-bold text-primary mb-4 animate-fade-in">
              Request for Quote
            </h1>
          </AnimatedSection>
          <AnimatedSection animation="fade-in" delay={300}>
            <p className="text-xl text-muted-foreground animate-fade-in animate-delay-300">
              Review your selected items and submit your quote request
            </p>
          </AnimatedSection>
          <AnimatedSection animation="fade-in" delay={400}>
            <Badge variant="outline" className="mt-4 text-lg px-4 py-2 border-sea text-sea animate-bounce-in animate-delay-500">
              {itemCount} items in cart
            </Badge>
          </AnimatedSection>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            <AnimatedSection animation="fade-in-left" delay={200}>
              <Card className="glass-card hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-2xl font-bold text-primary">
                    <ShoppingCart className="w-6 h-6 text-sea" />
                    <span>Selected Items</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {items.length === 0 ? (
                    <div className="text-center py-12 animate-fade-in">
                      <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4 animate-float" />
                      <p className="text-lg text-muted-foreground mb-4">Your cart is empty</p>
                      <Button asChild variant="heroSolid" className="animate-scale-in">
                        <a href="/products">Browse Products</a>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {items.map((item, index) => (
                        <div
                          key={item.id}
                          className="flex items-center space-x-4 p-4 glass-card rounded-lg hover:shadow-md transition-all duration-300 animate-fade-in hover:scale-105"
                          style={{animationDelay: `${index * 100}ms`}}
                        >
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded-md bg-sea/10"
                          />
                          <div className="flex-1">
                            <h3 className="font-semibold text-primary">{item.name}</h3>
                            <p className="text-sm text-muted-foreground">{item.category}</p>
                            <p className="text-xs text-muted-foreground">{item.dimensions}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                              className="glass-card border-sea/20 hover:bg-sea/10"
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="glass-card border-sea/20 hover:bg-sea/10"
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeItem(item.id)}
                            className="text-destructive hover:bg-destructive/10 transition-colors duration-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      
                      {items.length > 0 && (
                        <div className="flex justify-end space-x-2 pt-4 border-t border-sea/10 animate-slide-up">
                          <Button
                            variant="outline"
                            onClick={clearCart}
                            className="glass-card border-sea/20 hover:bg-destructive/10 hover:border-destructive transition-all duration-300"
                          >
                            Clear Cart
                          </Button>
                          <Button
                            variant="outline"
                            onClick={handleExportPDF}
                            className="glass-card border-sea/20 hover:bg-sea/10 hover:border-sea transition-all duration-300"
                          >
                            <FileDown className="w-4 h-4 mr-2" />
                            Export PDF
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </AnimatedSection>
          </div>

          {/* Contact Form - Fixed sticky positioning to avoid header conflict */}
          <div className="lg:col-span-1">
            <AnimatedSection animation="fade-in-right" delay={400}>
              <Card className="glass-card hover:shadow-xl transition-all duration-300 sticky" style={{ top: '6rem' }}>
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-primary">Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Full Name *
                    </label>
                    <Input
                      type="text"
                      value={contactInfo.name}
                      onChange={(e) => handleContactChange('name', e.target.value)}
                      placeholder="John Doe"
                      className="glass-card border-sea/20 focus:border-sea transition-all duration-300"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Email Address *
                    </label>
                    <Input
                      type="email"
                      value={contactInfo.email}
                      onChange={(e) => handleContactChange('email', e.target.value)}
                      placeholder="john@company.com"
                      className="glass-card border-sea/20 focus:border-sea transition-all duration-300"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Company/Organization
                    </label>
                    <Input
                      type="text"
                      value={contactInfo.company}
                      onChange={(e) => handleContactChange('company', e.target.value)}
                      placeholder="Company Name"
                      className="glass-card border-sea/20 focus:border-sea transition-all duration-300"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Phone Number
                    </label>
                    <Input
                      type="tel"
                      value={contactInfo.phone}
                      onChange={(e) => handleContactChange('phone', e.target.value)}
                      placeholder="+65 1234 5678"
                      className="glass-card border-sea/20 focus:border-sea transition-all duration-300"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Additional Message
                    </label>
                    <Textarea
                      value={contactInfo.message}
                      onChange={(e) => handleContactChange('message', e.target.value)}
                      placeholder="Tell us about your project requirements..."
                      rows={4}
                      className="glass-card border-sea/20 focus:border-sea transition-all duration-300"
                    />
                  </div>
                  
                  <Button
                    onClick={handleSubmitRFQ}
                    disabled={items.length === 0 || isSubmitting}
                    className="w-full bg-sea hover:bg-sea-dark disabled:opacity-50 transition-all duration-300 hover:scale-105 animate-float"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {isSubmitting ? 'Submitting...' : 'Submit Quote Request'}
                  </Button>
                  
                  <p className="text-xs text-muted-foreground text-center">
                    We'll respond to your quote request within 24 hours
                  </p>
                </CardContent>
              </Card>
            </AnimatedSection>
          </div>
        </div>

        {/* Additional Information */}
        <AnimatedSection animation="fade-in" delay={600}>
          <Card className="mt-12 glass-card hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-primary mb-4">
                What happens next?
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center animate-fade-in animate-delay-700">
                  <div className="w-12 h-12 bg-sea/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-sea font-bold">1</span>
                  </div>
                  <h4 className="font-medium text-foreground mb-2">Review</h4>
                  <p className="text-sm text-muted-foreground">
                    Our team reviews your requirements and selected items
                  </p>
                </div>
                <div className="text-center animate-fade-in animate-delay-800">
                  <div className="w-12 h-12 bg-sea/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-sea font-bold">2</span>
                  </div>
                  <h4 className="font-medium text-foreground mb-2">Quote</h4>
                  <p className="text-sm text-muted-foreground">
                    We prepare a detailed quote with pricing and specifications
                  </p>
                </div>
                <div className="text-center animate-fade-in animate-delay-900">
                  <div className="w-12 h-12 bg-sea/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-sea font-bold">3</span>
                  </div>
                  <h4 className="font-medium text-foreground mb-2">Follow-up</h4>
                  <p className="text-sm text-muted-foreground">
                    Our sales team contacts you to discuss next steps
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </AnimatedSection>
      </div>
    </div>
  );
};

export default RFQCart;
