import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useRFQ } from "@/contexts/RFQContext";
import AnimatedSection from "@/components/AnimatedSection";
import HeroNavigation from "@/components/HeroNavigation";
import Footer from "@/components/Footer";

const RFQCart = () => {
  const navigate = useNavigate();
  const { items, removeItem, clearCart } = useRFQ();

  return (
    <>
      <HeroNavigation />
      <div className="min-h-screen bg-background">
        <div className="container py-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)} 
            className="mb-6 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>

          <AnimatedSection animation="fade-in">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <div className="flex items-center justify-center mb-4">
                  <ShoppingCart className="w-8 h-8 text-primary mr-3" />
                  <h1 className="text-4xl font-bold">RFQ Cart</h1>
                </div>
                <p className="text-lg text-muted-foreground">
                  Request for Quote - Review your selected items
                </p>
              </div>

              {items.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                    <ShoppingCart className="w-12 h-12 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">Your cart is empty</h3>
                  <p className="text-muted-foreground mb-6">
                    Start exploring our products to add items to your RFQ.
                  </p>
                  <Button onClick={() => navigate('/products')}>
                    Browse Products
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {items.map((item, index) => (
                    <AnimatedSection key={index} animation="slide-in-up" delay={index * 100}>
                      <div className="bg-card border rounded-lg p-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold mb-2">{item.name}</h3>
                            <p className="text-muted-foreground mb-2">{item.description}</p>
                            <div className="text-sm text-muted-foreground">
                              Category: {item.category}
                            </div>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => removeItem(index)}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    </AnimatedSection>
                  ))}

                  <div className="flex justify-between items-center pt-6 border-t">
                    <Button variant="outline" onClick={clearCart}>
                      Clear Cart
                    </Button>
                    <div className="space-x-4">
                      <Button variant="outline" onClick={() => navigate('/products')}>
                        Continue Shopping
                      </Button>
                      <Button>
                        Submit RFQ ({items.length} items)
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </AnimatedSection>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default RFQCart;
