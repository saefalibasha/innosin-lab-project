
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
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Request for Quotation</h1>
          <p className="text-xl text-gray-600">
            Review your selected products and submit your quote request
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Selected Products ({itemCount} items)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {items.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg mb-4">Your cart is empty</p>
                    <Button asChild>
                      <a href="/products">Browse Products</a>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {items.map((item, index) => (
                      <div key={item.id}>
                        <div className="flex items-start space-x-4">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                          
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h3 className="font-semibold text-lg">{item.name}</h3>
                                <Badge variant="outline" className="mt-1">
                                  {item.category}
                                </Badge>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeItem(item.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                            
                            <p className="text-sm text-gray-600 mb-3">
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
                                >
                                  <Minus className="w-3 h-3" />
                                </Button>
                                <span className="w-8 text-center">{item.quantity}</span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
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
                                className="mt-1"
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
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
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
                    className="w-full bg-black hover:bg-gray-800"
                    disabled={items.length === 0}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Submit Quote Request
                  </Button>
                  
                  <p className="text-xs text-gray-600 text-center">
                    We'll respond to your quote request within 24 hours
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Information Section */}
        <div className="mt-12">
          <Card>
            <CardHeader>
              <CardTitle>What happens next?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-blue-600 font-bold">1</span>
                  </div>
                  <h3 className="font-semibold mb-2">Review & Assessment</h3>
                  <p className="text-gray-600 text-sm">
                    Our team will review your requirements and assess the best solutions for your laboratory needs.
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-blue-600 font-bold">2</span>
                  </div>
                  <h3 className="font-semibold mb-2">Custom Quotation</h3>
                  <p className="text-gray-600 text-sm">
                    We'll prepare a detailed quotation including pricing, specifications, and delivery timeline.
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-blue-600 font-bold">3</span>
                  </div>
                  <h3 className="font-semibold mb-2">Consultation</h3>
                  <p className="text-gray-600 text-sm">
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
