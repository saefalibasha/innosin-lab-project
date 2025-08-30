
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import HeroNavigation from "@/components/HeroNavigation";
import Footer from "@/components/Footer";

const ProductCatalog = () => {
  const navigate = useNavigate();

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

          <div className="text-center py-20">
            <h1 className="text-4xl font-bold mb-4">Product Catalog</h1>
            <p className="text-lg text-muted-foreground">
              Browse our complete range of laboratory furniture and equipment.
            </p>
            <div className="mt-8">
              <p className="text-muted-foreground">
                Product catalog page is under development.
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ProductCatalog;
