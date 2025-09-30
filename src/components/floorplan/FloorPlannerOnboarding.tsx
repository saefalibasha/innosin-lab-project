import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronRight, ChevronLeft, CheckCircle2, MousePointer2, Grid3x3, Maximize2, Box } from 'lucide-react';

interface FloorPlannerOnboardingProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FloorPlannerOnboarding: React.FC<FloorPlannerOnboardingProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const steps = [
    {
      icon: MousePointer2,
      title: 'Welcome to the Floor Planner',
      description: 'A powerful conceptual design tool for early-stage laboratory planning.',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            This interactive floor planner helps you visualize and arrange laboratory furniture to explore layout possibilities.
          </p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <span>Drag and drop products from the library</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <span>Automatic snapping for precise alignment</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <span>Switch between 2D and 3D views</span>
            </li>
          </ul>
        </div>
      ),
    },
    {
      icon: Box,
      title: 'Placing Products',
      description: 'Learn how to add and position laboratory furniture.',
      content: (
        <div className="space-y-4">
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-semibold text-primary">1</span>
              </div>
              <div>
                <strong>Select a product</strong> from the left sidebar by browsing categories
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-semibold text-primary">2</span>
              </div>
              <div>
                <strong>Drag onto the canvas</strong> – products will snap edge-to-edge automatically
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-semibold text-primary">3</span>
              </div>
              <div>
                <strong>Rotate with 'R'</strong> key or rotation controls when selected
              </div>
            </li>
          </ul>
          <div className="bg-muted/50 p-3 rounded-md text-xs">
            <strong>Tip:</strong> Products automatically avoid overlapping. Green guides indicate valid snapping positions.
          </div>
        </div>
      ),
    },
    {
      icon: Grid3x3,
      title: 'Canvas Controls',
      description: 'Navigate and customize your workspace.',
      content: (
        <div className="space-y-4">
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Grid3x3 className="h-3 w-3 text-primary" />
              </div>
              <div>
                <strong>Grid & Measurements:</strong> Toggle visibility for cleaner views or precise alignment
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-semibold text-primary">+/-</span>
              </div>
              <div>
                <strong>Zoom:</strong> Use toolbar buttons or mouse wheel to zoom in/out
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <MousePointer2 className="h-3 w-3 text-primary" />
              </div>
              <div>
                <strong>Selection:</strong> Click products to select, press Delete to remove
              </div>
            </li>
          </ul>
        </div>
      ),
    },
    {
      icon: Maximize2,
      title: '3D Visualization',
      description: 'Experience your layout in three dimensions.',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Switch to 3D mode using the toolbar toggle to explore your design from all angles.
          </p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <span><strong>Click & drag</strong> to rotate the camera view</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <span><strong>Scroll</strong> to zoom in and out</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <span><strong>Products remain interactive</strong> in 3D view</span>
            </li>
          </ul>
        </div>
      ),
    },
    {
      icon: CheckCircle2,
      title: 'Important Disclaimer',
      description: 'Understanding the purpose of this tool.',
      content: (
        <div className="space-y-4">
          <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg">
            <p className="text-sm leading-relaxed">
              This floor planner is designed as a <strong>conceptual visualization tool</strong> for early-stage design exploration. 
              It enables you to quickly experiment with layout ideas and spatial arrangements.
            </p>
          </div>
          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <h4 className="font-semibold text-sm">Professional Deliverables</h4>
            <p className="text-sm text-muted-foreground">
              Upon project approval, our experienced design team will translate your concept into professional-grade 2D floor plans, 
              complete with precise measurements, technical specifications, and compliance considerations tailored to your specific requirements.
            </p>
          </div>
          <p className="text-xs text-muted-foreground italic">
            Think of this tool as your creative sandbox – we'll handle the engineering precision.
          </p>
        </div>
      ),
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    if (dontShowAgain) {
      sessionStorage.setItem('floorPlannerOnboardingShown', 'true');
    }
    onClose();
  };

  const currentStepData = steps[currentStep];
  const Icon = currentStepData.icon;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle>{currentStepData.title}</DialogTitle>
              <DialogDescription>{currentStepData.description}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-6">
          {currentStepData.content}
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2">
            {currentStep === steps.length - 1 && (
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <Checkbox 
                  checked={dontShowAgain} 
                  onCheckedChange={(checked) => setDontShowAgain(checked as boolean)}
                />
                <span>Don't show again</span>
              </label>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex gap-1 mr-4">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-1.5 w-1.5 rounded-full transition-colors ${
                    index === currentStep ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>

            {currentStep > 0 && (
              <Button variant="outline" size="sm" onClick={handleBack}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            )}

            <Button size="sm" onClick={handleNext}>
              {currentStep === steps.length - 1 ? (
                'Get Started'
              ) : (
                <>
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
