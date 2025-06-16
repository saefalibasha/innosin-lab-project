
import { ArrowRight, CheckCircle, Users, Award, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import VideoHero from "@/components/VideoHero";
import BeforeAfterComparison from "@/components/BeforeAfterComparison";
import NewsletterSubscription from "@/components/NewsletterSubscription";
import { Link } from "react-router-dom";

const Index = () => {
  const features = [
    "Advanced laboratory furniture and equipment",
    "Custom design and installation services",
    "Compliance with international safety standards",
    "24/7 technical support and maintenance",
    "Sustainable and eco-friendly solutions",
    "Training and certification programs"
  ];

  const stats = [
    { icon: <Users className="w-8 h-8" />, value: "500+", label: "Projects Completed" },
    { icon: <Award className="w-8 h-8" />, value: "15+", label: "Years Experience" },
    { icon: <Globe className="w-8 h-8" />, value: "25+", label: "Countries Served" },
    { icon: <CheckCircle className="w-8 h-8" />, value: "99%", label: "Client Satisfaction" }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Video Hero Section */}
      <VideoHero />

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-black mb-4">
              Why Choose Innosin Lab?
            </h2>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              We provide comprehensive laboratory solutions with unmatched quality and expertise.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start space-x-3 p-4">
                <CheckCircle className="w-6 h-6 text-black flex-shrink-0 mt-1" />
                <span className="text-gray-800">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Before-After Comparison Section */}
      <section className="py-16 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-black mb-4">
              Project Transformations
            </h2>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              See how we've transformed laboratories across Singapore and beyond. 
              Slide to reveal the complete transformation.
            </p>
          </div>
          
          <BeforeAfterComparison />
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center text-white">
                <div className="flex justify-center mb-4 text-gray-300">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold mb-2">{stat.value}</div>
                <div className="text-gray-300">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <NewsletterSubscription />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your Laboratory?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Let's discuss your project requirements and create a laboratory solution 
            that exceeds your expectations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-white text-black hover:bg-gray-200">
              <Link to="/floor-planner">
                Try Floor Planner <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-gray-300 text-gray-300 hover:bg-gray-800">
              <Link to="/contact">
                Get Quote
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
