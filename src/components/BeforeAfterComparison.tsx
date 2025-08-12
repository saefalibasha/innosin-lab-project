
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Zap, Shield, Users } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const BeforeAfterComparison = () => {
  const { elementRef, isVisible } = useScrollAnimation();

  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div 
          ref={elementRef} 
          className={`text-center mb-16 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Transform Your Laboratory
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            See how our innovative solutions can revolutionize your workspace efficiency, 
            safety standards, and operational excellence.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Before */}
          <div className={`transition-all duration-1000 delay-300 ${
            isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
          }`}>
            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-8">
                <div className="text-red-600 mb-4">
                  <h3 className="text-2xl font-bold mb-4">Before: Traditional Labs</h3>
                </div>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                    Outdated equipment with frequent breakdowns
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                    Inefficient workspace layout
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                    Safety compliance challenges
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                    High maintenance costs
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* After */}
          <div className={`transition-all duration-1000 delay-500 ${
            isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
          }`}>
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-8">
                <div className="text-green-600 mb-4">
                  <h3 className="text-2xl font-bold mb-4">After: Innosin Lab Solutions</h3>
                </div>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-center">
                    <Zap className="w-5 h-5 text-green-500 mr-3" />
                    State-of-the-art equipment with 99.9% uptime
                  </li>
                  <li className="flex items-center">
                    <Users className="w-5 h-5 text-green-500 mr-3" />
                    Optimized workflow and productivity
                  </li>
                  <li className="flex items-center">
                    <Shield className="w-5 h-5 text-green-500 mr-3" />
                    Full safety compliance and certification
                  </li>
                  <li className="flex items-center">
                    <ArrowRight className="w-5 h-5 text-green-500 mr-3" />
                    Reduced operational costs by 40%
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA */}
        <div className={`text-center mt-12 transition-all duration-1000 delay-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
            Start Your Transformation
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default BeforeAfterComparison;
