
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { MotionProvider } from './components/anim'

const container = document.getElementById("root");
if (!container) {
  throw new Error("Root element not found");
}

const root = createRoot(container);
root.render(
  <React.StrictMode>
    <MotionProvider>
      <App />
    </MotionProvider>
  </React.StrictMode>
);
