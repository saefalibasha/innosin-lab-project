
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';

interface Model3DViewerProps {
  modelPath: string;
}

function Model({ modelPath }: { modelPath: string }) {
  const { scene } = useGLTF(modelPath);
  return <primitive object={scene} />;
}

export const Model3DViewer: React.FC<Model3DViewerProps> = ({ modelPath }) => {
  return (
    <div className="w-full h-96 bg-gray-100 rounded-lg">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <Suspense fallback={null}>
          <Model modelPath={modelPath} />
        </Suspense>
        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
      </Canvas>
    </div>
  );
};
