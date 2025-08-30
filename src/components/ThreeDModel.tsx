
import React, { useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';

interface ThreeDModelProps {
  modelPath?: string;
}

const ThreeDModel = ({ modelPath }: ThreeDModelProps) => {
  const meshRef = useRef<THREE.Group>(null);

  // If no model path, show a simple placeholder cube
  if (!modelPath) {
    return (
      <mesh ref={meshRef}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#cccccc" />
      </mesh>
    );
  }

  try {
    const gltf = useLoader(GLTFLoader, modelPath);
    
    useFrame(() => {
      if (meshRef.current) {
        meshRef.current.rotation.y += 0.01;
      }
    });

    return <primitive ref={meshRef} object={gltf.scene} scale={[1, 1, 1]} />;
  } catch (error) {
    // Fallback to a simple cube if model fails to load
    return (
      <mesh ref={meshRef}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#cccccc" />
      </mesh>
    );
  }
};

export default ThreeDModel;
