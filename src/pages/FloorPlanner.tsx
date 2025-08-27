
import React, { useState } from 'react';
import { FloorPlanner as FloorPlannerComponent } from '@/components/floor-planner/FloorPlanner';
import { EnhancedExportModal } from '@/components/EnhancedExportModal';

const FloorPlanner = () => {
  const [exportModalOpen, setExportModalOpen] = useState(false);

  return (
    <div className="h-screen bg-gray-50">
      <div className="flex items-center justify-between p-4 bg-white border-b">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Floor Planner</h1>
          <p className="text-sm text-gray-600">Design your laboratory layout</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setExportModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Export Floor Plan
          </button>
        </div>
      </div>
      
      <div className="h-[calc(100vh-80px)]">
        <FloorPlannerComponent />
      </div>

      <EnhancedExportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        projectName="Floor Plan"
        placedProducts={[]}
        roomPoints={[]}
      />
    </div>
  );
};

export default FloorPlanner;
