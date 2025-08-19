
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';

interface ProductViewer3DProps {
  modelPath: string;
  productName: string;
}

const ProductViewer3D: React.FC<ProductViewer3DProps> = ({ modelPath, productName }) => {
  return (
    <div className="w-full h-full min-h-[400px] bg-muted">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        className="w-full h-full"
      >
        <Suspense fallback={null}>
          <Environment preset="studio" />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <OrbitControls 
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            maxDistance={10}
            minDistance={2}
          />
          
          {/* Placeholder for 3D model */}
          <mesh>
            <boxGeometry args={[2, 2, 2]} />
            <meshStandardMaterial color="#666" />
          </mesh>
          
          {/* Text overlay showing this is a placeholder */}
          <group position={[0, -3, 0]}>
            <mesh>
              <planeGeometry args={[6, 1]} />
              <meshBasicMaterial color="#333" transparent opacity={0.8} />
            </mesh>
          </group>
        </Suspense>
      </Canvas>
      
      {/* Overlay text for placeholder */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center text-muted-foreground bg-background/80 p-4 rounded-lg">
          <p className="text-lg font-medium">3D Model Preview</p>
          <p className="text-sm">{productName}</p>
          <p className="text-xs mt-2">Click and drag to rotate • Scroll to zoom</p>
        </div>
      </div>
    </div>
  );
};

export default ProductViewer3D;
