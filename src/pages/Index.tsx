
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import VideoHero from "@/components/VideoHero";
import { brandCollections } from "@/data/brandCollections";
import { homePageContent } from "@/data/homePageContent";
import { usePerformanceMonitoring, logComponentPerformance } from "@/hooks/usePerformanceMonitoring";
import { OptimizedImage } from "@/components/OptimizedImage";

// Lazy load heavy components with better error handling
const LazyBeforeAfterComparison = lazy(() => 
  import("@/components/BeforeAfterComparison").catch(() => ({
    default: () => <div className="h-96 bg-muted rounded-lg flex items-center justify-center">Failed to load comparison</div>
  }))
);

const LazyShopTheLook = lazy(() => 
  import("@/components/ShopTheLook").catch(() => ({
    default: () => <div className="h-80 bg-muted rounded-lg flex items-center justify-center">Failed to load shop component</div>
  }))
);

const LazyLabTransformCTA = lazy(() => 
  import("@/components/LabTransformCTA").catch(() => ({
    default: () => <div className="h-48 bg-muted rounded-lg flex items-center justify-center">Failed to load CTA</div>
  }))
);

const Index = () => {
  const { startMonitoring } = usePerformanceMonitoring();
  const startTime = performance.now();

  useEffect(() => {
    startMonitoring();
    
    // Log page load performance
    const endTime = performance.now();
    logComponentPerformance('Index', endTime - startTime);
  }, [startMonitoring, startTime]);

  const ComponentFallback = ({ height = "h-64" }: { height?: string }) => (
    <div className={`${height} bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg animate-pulse flex items-center justify-center`}>
      <div className="text-center">
        <div className="w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        <p className="text-gray-600 text-sm">Loading content...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Video Hero Section */}
      <VideoHero />

      {/* Product Collections Section */}
      <section className="section bg-background relative">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-primary mb-6 tracking-tight animate-fade-in">
              {homePageContent.productCollections.title} <span className="text-sea">{homePageContent.productCollections.titleHighlight}</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-light animate-fade-in animate-delay-200">
              {homePageContent.productCollections.description}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {brandCollections.map((collection, index) => (
              <Link key={index} to={`/products?category=${encodeURIComponent(collection.category)}`}>
                <Card className={`group hover:shadow-xl transition-all duration-500 border-2 border-transparent hover:border-sea/20 h-full glass-card hover:scale-105 animate-bounce-in`} style={{animationDelay: `${100 + index * 100}ms`}}>
                  <CardContent className="p-6 text-center flex flex-col items-center justify-center h-full">
                    {/* Brand Logo with optimized loading */}
                    <div className="flex justify-center mb-2 animate-float" style={{animationDelay: `${index * 0.5}s`}}>
                      <OptimizedImage
                        src={collection.logoPath}
                        alt={`${collection.title} Logo`}
                        className="w-36 h-36 object-contain object-center transition-transform duration-300 group-hover:scale-110"
                        priority={index < 2}
                        sizes="144px"
                      />
                    </div>
                    <p className="text-muted-foreground text-base leading-relaxed mb-4 font-light text-center">
                      {collection.description}
                    </p>
                    <div className="flex justify-center mt-auto">
                      <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-sea group-hover:translate-x-1 transition-all duration-300" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Button asChild variant="outline" size="lg" className="animate-pulse-subtle">
              <Link to="/products">
                {homePageContent.productCollections.viewAllButton}
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Before/After Comparison Section - Lazy Loaded */}
      <section className="section bg-gradient-to-b from-secondary/30 to-background">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-primary mb-6 tracking-tight animate-fade-in">
              {homePageContent.transformingLabs.title} <span className="text-sea">{homePageContent.transformingLabs.titleHighlight}</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-light animate-fade-in animate-delay-200">
              {homePageContent.transformingLabs.description}
            </p>
          </div>
          <div className="animate-scale-in animate-delay-300">
            <Suspense fallback={<ComponentFallback height="h-96" />}>
              <LazyBeforeAfterComparison />
            </Suspense>
          </div>
        </div>
      </section>

      {/* Build This Lab Section - Lazy Loaded */}
      <section className="section bg-background">
        <div className="container-custom">
          <div className="animate-fade-in-right animate-delay-300">
            <Suspense fallback={<ComponentFallback height="h-80" />}>
              <LazyShopTheLook />
            </Suspense>
          </div>
        </div>
      </section>

      {/* Ready to Transform Your Laboratory CTA Section - Lazy Loaded */}
      <Suspense fallback={<ComponentFallback height="h-48" />}>
        <LazyLabTransformCTA />
      </Suspense>
    </div>
  );
};

export default Index;
