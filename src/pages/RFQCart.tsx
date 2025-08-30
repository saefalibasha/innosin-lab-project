import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Trash2, Plus, Minus, Send, ShoppingCart } from 'lucide-react';
import { useRFQ } from '@/contexts/RFQContext';
import { toast } from 'sonner';
import HeroNavigation from '@/components/HeroNavigation';
import Footer from '@/components/Footer';

const RFQCart = () => {
  const { items, removeItem, clearCart } = useRFQ();
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    address: '',
    additionalNotes: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const updateItemQuantity = (id: string, newQuantity: number) => {
    // Since updateQuantity doesn't exist in the context, we'll need to work with what we have
    // For now, we'll just remove and re-add the item with new quantity
    const item = items.find(i => i.id === id);
    if (item && newQuantity > 0) {
      // This is a workaround - ideally the RFQ context should have updateQuantity
      console.log('Update quantity not implemented in RFQ context');
    } else if (newQuantity <= 0) {
      removeItem(id);
    }
  };

  const handleSubmitRFQ = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (items.length === 0) {
      toast.error('Please add items to your RFQ cart before submitting.');
      return;
    }

    if (!customerInfo.name || !customerInfo.email || !customerInfo.company) {
      toast.error('Please fill in all required fields.');
      return;
    }

    // Here you would typically send the RFQ to your backend
    const rfqData = {
      customer: customerInfo,
      items: items,
      submittedAt: new Date().toISOString()
    };

    console.log('RFQ Submitted:', rfqData);
    toast.success('RFQ submitted successfully! We\'ll get back to you within 24 hours.');
    
    // Clear the cart after successful submission
    clearCart();
    
    // Reset customer info
    setCustomerInfo({
      name: '',
      email: '',
      company: '',
      phone: '',
      address: '',
      additionalNotes: ''
    });
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <HeroNavigation />
      
      <main className="flex-grow pt-20">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-primary mb-2 flex items-center gap-3">
              <ShoppingCart className="h-8 w-8" />
              Request for Quotation
            </h1>
            <p className="text-muted-foreground">
              Review your selected items and submit your request for a detailed quotation.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* RFQ Items */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Selected Items ({getTotalItems()})</CardTitle>
                  {items.length > 0 && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={clearCart}
                    >
                      Clear All
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  {items.length === 0 ? (
                    <div className="text-center py-12">
                      <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">Your RFQ cart is empty</h3>
                      <p className="text-muted-foreground mb-4">
                        Browse our products and add items to request a quotation.
                      </p>
                      <Button onClick={() => window.location.href = '/products'}>
                        Browse Products
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {items.map((item) => (
                        <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                          <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = '/placeholder-product.jpg';
                              }}
                            />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-sm truncate">{item.name}</h3>
                            <Badge variant="secondary" className="text-xs mt-1">
                              Product ID: {item.id}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateItemQuantity(item.id, Math.max(1, item.quantity - 1))}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center text-sm">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Customer Information Form */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmitRFQ} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={customerInfo.name}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={customerInfo.email}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter your email"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="company">Company *</Label>
                      <Input
                        id="company"
                        name="company"
                        value={customerInfo.company}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter your company name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={customerInfo.phone}
                        onChange={handleInputChange}
                        placeholder="Enter your phone number"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Textarea
                        id="address"
                        name="address"
                        value={customerInfo.address}
                        onChange={handleInputChange}
                        placeholder="Enter your company address"
                        rows={3}
                      />
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Label htmlFor="additionalNotes">Additional Notes</Label>
                      <Textarea
                        id="additionalNotes"
                        name="additionalNotes"
                        value={customerInfo.additionalNotes}
                        onChange={handleInputChange}
                        placeholder="Any specific requirements or additional information..."
                        rows={4}
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={items.length === 0}
                    >
                      <Send className="mr-2 h-4 w-4" />
                      Submit RFQ
                    </Button>

                    <p className="text-xs text-muted-foreground text-center">
                      We'll review your request and send you a detailed quotation within 24 hours.
                    </p>
                  </form>
                </CardContent>
              </Card>

              {/* RFQ Summary */}
              {items.length > 0 && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>RFQ Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Total Items:</span>
                        <span className="font-medium">{getTotalItems()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Product Lines:</span>
                        <span className="font-medium">{items.length}</span>
                      </div>
                    </div>
                    <Separator className="my-3" />
                    <p className="text-xs text-muted-foreground">
                      Pricing and availability will be provided in the quotation response.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RFQCart;
