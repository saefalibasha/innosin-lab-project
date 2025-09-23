import React, { ReactNode } from 'react';
import { MotionConfig } from 'framer-motion';

interface MotionProviderProps {
  children: ReactNode;
}

export const MotionProvider = ({ children }: MotionProviderProps) => {
  return (
    <MotionConfig
      reducedMotion="user"
      transition={{
        duration: 0.6,
        ease: "easeOut"
      }}
    >
      {children}
    </MotionConfig>
  );
};