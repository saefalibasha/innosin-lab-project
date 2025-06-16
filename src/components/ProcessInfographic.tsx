
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight, Lightbulb, Wrench, Truck, CheckCircle } from 'lucide-react';

interface ProcessStep {
  id: number;
  title: string;
  description: string;
  details: string;
  icon: React.ReactNode;
  duration: string;
}

const ProcessInfographic = () => {
  const [selectedStep, setSelectedStep] = useState<number | null>(null);

  const processSteps: ProcessStep[] = [
    {
      id: 1,
      title: 'Design & Planning',
      description: 'Custom laboratory design based on your specific requirements',
      details: 'Our expert design team works closely with you to understand your laboratory needs, space constraints, and workflow requirements. We create detailed 3D models and technical drawings to ensure every aspect meets your specifications.',
      icon: <Lightbulb className="w-8 h-8" />,
      duration: '1-2 weeks'
    },
    {
      id: 2,
      title: 'Manufacturing',
      description: 'Precision fabrication using state-of-the-art equipment',
      details: 'All products are manufactured in our ISO-certified facility using premium materials and advanced manufacturing techniques. Each piece undergoes rigorous quality control testing before proceeding to the next stage.',
      icon: <Wrench className="w-8 h-8" />,
      duration: '3-6 weeks'
    },
    {
      id: 3,
      title: 'Delivery & Logistics',
      description: 'Secure packaging and reliable transportation',
      details: 'Products are carefully packaged with protective materials and shipped using trusted logistics partners. We provide tracking information and coordinate delivery schedules to minimize disruption to your operations.',
      icon: <Truck className="w-8 h-8" />,
      duration: '1-2 weeks'
    },
    {
      id: 4,
      title: 'Installation & Testing',
      description: 'Professional installation and comprehensive testing',
      details: 'Our certified technicians handle the complete installation process, including utility connections, safety testing, and performance verification. We ensure everything meets industry standards and your specifications.',
      icon: <CheckCircle className="w-8 h-8" />,
      duration: '1-3 days'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Process</h2>
        <p className="text-xl text-gray-600">From concept to completion</p>
      </div>

      {/* Process Flow */}
      <div className="flex flex-col lg:flex-row items-center justify-between space-y-8 lg:space-y-0 lg:space-x-4 mb-12">
        {processSteps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center">
              <Card 
                className={`w-64 h-48 cursor-pointer transition-all hover:shadow-lg ${
                  selectedStep === step.id ? 'ring-2 ring-black shadow-lg' : ''
                }`}
                onClick={() => setSelectedStep(selectedStep === step.id ? null : step.id)}
              >
                <CardHeader className="text-center pb-2">
                  <div className="mx-auto mb-2 p-3 bg-black text-white rounded-full w-fit">
                    {step.icon}
                  </div>
                  <CardTitle className="text-lg">{step.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-sm text-gray-600 mb-2">{step.description}</p>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">{step.duration}</span>
                </CardContent>
              </Card>
              
              <div className="mt-4 text-center">
                <span className="bg-black text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                  {step.id}
                </span>
              </div>
            </div>

            {index < processSteps.length - 1 && (
              <div className="hidden lg:block">
                <ChevronRight className="w-8 h-8 text-gray-400" />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step Details */}
      {selectedStep && (
        <Card className="max-w-4xl mx-auto">
          <CardContent className="p-8">
            {processSteps.map(step => (
              step.id === selectedStep && (
                <div key={step.id}>
                  <div className="flex items-center mb-6">
                    <div className="p-3 bg-black text-white rounded-full mr-4">
                      {step.icon}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{step.title}</h3>
                      <p className="text-gray-600">Timeline: {step.duration}</p>
                    </div>
                  </div>
                  <p className="text-gray-700 text-lg leading-relaxed">{step.details}</p>
                  <Button 
                    className="mt-6 bg-black hover:bg-gray-800"
                    onClick={() => setSelectedStep(null)}
                  >
                    Close Details
                  </Button>
                </div>
              )
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProcessInfographic;
