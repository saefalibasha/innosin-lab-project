// src/main.tsx
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { MotionProvider } from './components/anim'
import { RFQProvider } from '@/contexts/RFQContext'   // 👈 add this

const container = document.getElementById("root");
if (!container) {
  throw new Error("Root element not found");
}

createRoot(container).render(
  <React.StrictMode>
    <RFQProvider>               {/* 👈 wrap everything */}
      <MotionProvider>
        <App />
      </MotionProvider>
    </RFQProvider>
  </React.StrictMode>
);
