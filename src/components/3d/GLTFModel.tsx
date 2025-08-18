
import React, { useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface GLTFModelProps {
  url: string;
  onLoad?: () => void;
  onError?: (error: any) => void;
  scale?: number;
  autoRotate?: boolean;
}

export const GLTFModel = ({ url, onLoad, onError, scale = 1, autoRotate = false }: GLTFModelProps) => {
  const groupRef = useRef<THREE.Group>(null);
  
  try {
    const { scene } = useGLTF(url);
    
    React.useEffect(() => {
      if (onLoad) {
        onLoad();
      }
    }, [onLoad]);

    useFrame((state) => {
      if (autoRotate && groupRef.current) {
        groupRef.current.rotation.y += 0.01;
      }
    });

    return (
      <group ref={groupRef} scale={[scale, scale, scale]}>
        <primitive object={scene} />
      </group>
    );
  } catch (error) {
    React.useEffect(() => {
      if (onError) {
        onError(error);
      }
    }, [onError]);
    
    return null;
  }
};

// Preload the model
useGLTF.preload = (url: string) => {
  try {
    useGLTF(url);
  } catch (error) {
    console.warn('Failed to preload model:', url);
  }
};
