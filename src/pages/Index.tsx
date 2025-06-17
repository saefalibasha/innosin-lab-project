
import { ArrowRight, CheckCircle, Users, Award, Globe, Star, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import VideoHero from "@/components/VideoHero";
import BeforeAfterComparison from "@/components/BeforeAfterComparison";
import NewsletterSubscription from "@/components/NewsletterSubscription";
import ProductPreview from "@/components/ProductPreview";
import { Link } from "react-router-dom";

const Index = () => {
  const features = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Advanced Laboratory Furniture",
      description: "Premium quality furniture designed for modern research environments with safety and durability in mind."
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Custom Design Solutions",
      description: "Tailored installation services that meet your specific laboratory requirements and workflow needs."
    },
    {
      icon: <CheckCircle className="w-8 h-8" />,
      title: "International Safety Standards",
      description: "Full compliance with global safety regulations and industry best practices for laboratory environments."
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "24/7 Technical Support",
      description: "Round-the-clock maintenance and technical assistance to keep your laboratory running smoothly."
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Sustainable Solutions",
      description: "Eco-friendly and sustainable laboratory solutions that reduce environmental impact."
    },
    {
      icon: <Star className="w-8 h-8" />,
      title: "Training & Certification",
      description: "Comprehensive training programs and certification courses for laboratory personnel."
    }
  ];

  const featuredProducts = [
    {
      name: "Laboratory Fume Hoods",
      image: "https://images.unsplash.com/photo-1567427018141-0584cfcbf1b8?w=400&h=300&fit=crop",
      description: "Advanced ventilation systems ensuring optimal safety and air quality in your laboratory environment."
    },
    {
      name: "Lab Benches & Workstations",
      image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&h=300&fit=crop",
      description: "Durable and versatile laboratory benches designed for various research applications and workflows."
    },
    {
      name: "Storage Solutions",
      image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop",
      description: "Comprehensive storage systems for chemicals, equipment, and research materials with enhanced security."
    }
  ];

  const stats = [
    { icon: <Users className="w-8 h-8" />, value: "500+", label: "Projects Completed" },
    { icon: <Award className="w-8 h-8" />, value: "15+", label: "Years Experience" },
    { icon: <Globe className="w-8 h-8" />, value: "25+", label: "Countries Served" },
    { icon: <CheckCircle className="w-8 h-8" />, value: "99%", label: "Client Satisfaction" }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-screen overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1920&h=1080&fit=crop)'
          }}
        />
        
        <div className="relative z-10 h-full flex items-center justify-center">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
            <div className="animate-fade-in">
              <h1 className="text-6xl md:text-8xl font-light mb-8 leading-tight tracking-tight">
                Laboratory
                <span className="block font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Excellence
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl mb-12 max-w-4xl mx-auto text-gray-200 font-light leading-relaxed">
                Transform your research environment with cutting-edge laboratory solutions. 
                From innovative furniture to complete facility design, we deliver unparalleled quality and precision.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <Button asChild size="lg" className="bg-white text-black hover:bg-gray-100 text-lg px-10 py-4 rounded-full font-medium shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                  <Link to="/products">
                    Explore Solutions <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                
                <Button asChild variant="outline" size="lg" className="border-2 border-white text-white hover:bg-white hover:text-black text-lg px-10 py-4 rounded-full font-medium backdrop-blur-sm transition-all duration-300">
                  <Link to="/contact">
                    Get Consultation
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white animate-bounce">
          <div className="flex flex-col items-center">
            <span className="text-sm mb-2 font-light">Discover More</span>
            <div className="w-0.5 h-8 bg-white opacity-75"></div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-light text-black mb-6 tracking-tight">
              Featured <span className="font-bold">Solutions</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto font-light leading-relaxed">
              Discover our most popular laboratory products designed to enhance your research capabilities and ensure optimal safety standards.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredProducts.map((product, index) => (
              <div key={index} className="transform hover:scale-105 transition-all duration-300">
                <ProductPreview {...product} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-light text-black mb-6 tracking-tight">
              Why Choose <span className="font-bold">Innosin Lab</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto font-light leading-relaxed">
              We provide comprehensive laboratory solutions with unmatched quality, expertise, and innovation that sets industry standards.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group p-8 bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-gray-200">
                <div className="flex items-center justify-center w-16 h-16 bg-black text-white rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-black mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Before-After Comparison Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-light text-black mb-6 tracking-tight">
              Project <span className="font-bold">Transformations</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto font-light leading-relaxed">
              Witness the remarkable transformations we've achieved across Singapore and beyond. 
              Slide to reveal the complete evolution of laboratory spaces.
            </p>
          </div>
          
          <BeforeAfterComparison />
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-gradient-to-r from-gray-900 to-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-light text-white mb-4 tracking-tight">
              Trusted by <span className="font-bold">Industry Leaders</span>
            </h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center text-white group">
                <div className="flex justify-center mb-6 text-gray-400 group-hover:text-white transition-colors duration-300">
                  {stat.icon}
                </div>
                <div className="text-4xl md:text-5xl font-light mb-3">{stat.value}</div>
                <div className="text-gray-400 font-light tracking-wide">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <NewsletterSubscription />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl font-light text-white mb-6 tracking-tight">
            Ready to Transform Your <span className="font-bold">Laboratory?</span>
          </h2>
          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto font-light leading-relaxed">
            Let's collaborate to create a laboratory solution that exceeds your expectations 
            and elevates your research capabilities to new heights.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button asChild size="lg" className="bg-white text-black hover:bg-gray-100 rounded-full px-10 py-4 font-medium shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <Link to="/floor-planner">
                Try Floor Planner <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-2 border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500 rounded-full px-10 py-4 font-medium transition-all duration-300">
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
