
import React, { useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';

interface ThreeDModelProps {
  modelPath?: string;
}

interface GLTF {
  scene: THREE.Group;
}

const ThreeDModel = ({ modelPath }: ThreeDModelProps) => {
  const meshRef = useRef<THREE.Group>(null);

  // If no model path, show a simple placeholder cube
  if (!modelPath) {
    const cubeRef = useRef<THREE.Mesh>(null);
    
    useFrame(() => {
      if (cubeRef.current) {
        cubeRef.current.rotation.x += 0.01;
        cubeRef.current.rotation.y += 0.01;
      }
    });

    return (
      <mesh ref={cubeRef}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#cccccc" />
      </mesh>
    );
  }

  try {
    const gltf = useLoader(GLTFLoader, modelPath) as GLTF;
    
    useFrame(() => {
      if (meshRef.current) {
        meshRef.current.rotation.y += 0.01;
      }
    });

    return <primitive ref={meshRef} object={gltf.scene} scale={[1, 1, 1]} />;
  } catch (error) {
    console.error('Error loading 3D model:', error);
    const fallbackRef = useRef<THREE.Mesh>(null);
    
    useFrame(() => {
      if (fallbackRef.current) {
        fallbackRef.current.rotation.x += 0.01;
        fallbackRef.current.rotation.y += 0.01;
      }
    });

    // Fallback to a simple cube if model fails to load
    return (
      <mesh ref={fallbackRef}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#cccccc" />
      </mesh>
    );
  }
};

export default ThreeDModel;
