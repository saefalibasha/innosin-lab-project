
import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Trash2, Plus, Minus, Send, ShoppingCart } from 'lucide-react';
import { useRFQ } from '@/contexts/RFQContext';
import { toast } from 'sonner';

const RFQCart = () => {
  const { items, updateItem, removeItem, clearCart, itemCount } = useRFQ();
  const [contactForm, setContactForm] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    message: ''
  });

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity > 0) {
      updateItem(id, { quantity: newQuantity });
    }
  };

  const handleNotesChange = (id: string, notes: string) => {
    updateItem(id, { notes });
  };

  const handleContactFormChange = (field: string, value: string) => {
    setContactForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmitRFQ = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (items.length === 0) {
      toast.error('Please add some products to your quote request');
      return;
    }

    if (!contactForm.name || !contactForm.email || !contactForm.company) {
      toast.error('Please fill in all required fields');
      return;
    }

    // In a real application, this would integrate with HubSpot or send to a backend
    console.log('RFQ Submission:', {
      contact: contactForm,
      items: items
    });

    toast.success('Quote request submitted successfully! We will contact you within 24 hours.');
    
    // Clear the cart and form
    clearCart();
    setContactForm({
      name: '',
      company: '',
      email: '',
      phone: '',
      message: ''
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container-custom py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-serif font-bold text-primary mb-4 animate-fade-in">Request for Quotation</h1>
          <p className="text-xl text-muted-foreground animate-fade-in animate-delay-200">
            Review your selected products and submit your quote request
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 animate-fade-in-left animate-delay-300">
            <Card className="glass-card hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center font-serif">
                  <ShoppingCart className="w-5 h-5 mr-2 text-sea" />
                  Selected Products ({itemCount} items)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {items.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground text-lg mb-4">Your cart is empty</p>
                    <Button asChild variant="heroSolid">
                      <a href="/products">Browse Products</a>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {items.map((item, index) => (
                      <div key={item.id} className={`animate-fade-in`} style={{animationDelay: `${400 + index * 100}ms`}}>
                        <div className="flex items-start space-x-4">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-20 h-20 object-cover rounded-lg shadow-md"
                          />
                          
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h3 className="font-semibold text-lg text-primary">{item.name}</h3>
                                <Badge variant="outline" className="mt-1 border-sea text-sea">
                                  {item.category}
                                </Badge>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeItem(item.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                            
                            <p className="text-sm text-muted-foreground mb-3">
                              Dimensions: {item.dimensions}
                            </p>
                            
                            {/* Quantity Controls */}
                            <div className="flex items-center space-x-4 mb-3">
                              <Label className="text-sm font-medium">Quantity:</Label>
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                  disabled={item.quantity <= 1}
                                  className="hover:border-sea"
                                >
                                  <Minus className="w-3 h-3" />
                                </Button>
                                <span className="w-8 text-center font-medium">{item.quantity}</span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                  className="hover:border-sea"
                                >
                                  <Plus className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                            
                            {/* Notes */}
                            <div>
                              <Label className="text-sm font-medium">Notes (optional):</Label>
                              <Textarea
                                placeholder="Any specific requirements or customizations..."
                                value={item.notes}
                                onChange={(e) => handleNotesChange(item.id, e.target.value)}
                                className="mt-1 focus:border-sea transition-all duration-300"
                                rows={2}
                              />
                            </div>
                          </div>
                        </div>
                        
                        {index < items.length - 1 && <Separator className="mt-6" />}
                      </div>
                    ))}
                    
                    <div className="flex justify-end pt-4">
                      <Button
                        variant="outline"
                        onClick={clearCart}
                        className="text-red-600 border-red-600 hover:bg-red-50"
                      >
                        Clear All Items
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-1 animate-fade-in-right animate-delay-500">
            <Card className="glass-card hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="font-serif text-primary">Contact Information</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitRFQ} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      required
                      value={contactForm.name}
                      onChange={(e) => handleContactFormChange('name', e.target.value)}
                      placeholder="John Doe"
                      className="focus:border-sea transition-all duration-300"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="company">Company/Institution *</Label>
                    <Input
                      id="company"
                      required
                      value={contactForm.company}
                      onChange={(e) => handleContactFormChange('company', e.target.value)}
                      placeholder="Your Company Name"
                      className="focus:border-sea transition-all duration-300"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={contactForm.email}
                      onChange={(e) => handleContactFormChange('email', e.target.value)}
                      placeholder="john@company.com"
                      className="focus:border-sea transition-all duration-300"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={contactForm.phone}
                      onChange={(e) => handleContactFormChange('phone', e.target.value)}
                      placeholder="+65 XXXX XXXX"
                      className="focus:border-sea transition-all duration-300"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="message">Additional Message</Label>
                    <Textarea
                      id="message"
                      value={contactForm.message}
                      onChange={(e) => handleContactFormChange('message', e.target.value)}
                      placeholder="Tell us about your project requirements, timeline, or any specific needs..."
                      rows={4}
                      className="focus:border-sea transition-all duration-300"
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Total Items:</span>
                      <span className="font-medium">{itemCount}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Product Categories:</span>
                      <span className="font-medium">
                        {new Set(items.map(item => item.category)).size}
                      </span>
                    </div>
                  </div>
                  
                  <Button
                    type="submit"
                    className="w-full bg-sea hover:bg-sea-dark animate-float"
                    disabled={items.length === 0}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Submit Quote Request
                  </Button>
                  
                  <p className="text-xs text-muted-foreground text-center">
                    We'll respond to your quote request within 24 hours
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Information Section */}
        <div className="mt-12 animate-bounce-in animate-delay-700">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="font-serif text-primary">What happens next?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center animate-fade-in" style={{animationDelay: '800ms'}}>
                  <div className="w-12 h-12 bg-sea/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-sea font-bold">1</span>
                  </div>
                  <h3 className="font-semibold mb-2 text-primary">Review & Assessment</h3>
                  <p className="text-muted-foreground text-sm">
                    Our team will review your requirements and assess the best solutions for your laboratory needs.
                  </p>
                </div>
                
                <div className="text-center animate-fade-in" style={{animationDelay: '900ms'}}>
                  <div className="w-12 h-12 bg-sea/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-sea font-bold">2</span>
                  </div>
                  <h3 className="font-semibold mb-2 text-primary">Custom Quotation</h3>
                  <p className="text-muted-foreground text-sm">
                    We'll prepare a detailed quotation including pricing, specifications, and delivery timeline.
                  </p>
                </div>
                
                <div className="text-center animate-fade-in" style={{animationDelay: '1000ms'}}>
                  <div className="w-12 h-12 bg-sea/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-sea font-bold">3</span>
                  </div>
                  <h3 className="font-semibold mb-2 text-primary">Consultation</h3>
                  <p className="text-muted-foreground text-sm">
                    Our experts will schedule a consultation to discuss your project and finalize the details.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RFQCart;
