import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from "path"

// Optimized build configuration for bundle splitting
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React and routing
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          
          // UI library chunk  
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-tabs'],
          
          // Heavy libraries
          '3d-vendor': ['three', '@react-three/fiber', '@react-three/drei'],
          'query-vendor': ['@tanstack/react-query'],
          'form-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],
          'chart-vendor': ['recharts'],
          
          // Map components (only load when needed)
          'map-vendor': ['leaflet', 'react-leaflet'],
          
          // Admin functionality
          'admin': [
            './src/pages/admin/Dashboard',
            './src/pages/admin/AdminAuth',
            './src/components/AdminAuthGuard',
            './src/components/SecurityDashboard'
          ],
          
          // Chat functionality  
          'chat': [
            './src/components/EnhancedLiveChat',
            './src/components/ChatHistory',
            './src/components/ChatAdminDashboard'
          ],
          
          // Product pages
          'products': [
            './src/pages/ProductCatalog',
            './src/pages/EnhancedProductDetail',
            './src/components/ProductDetail'
          ]
        }
      }
    },
    // Chunk size warnings
    chunkSizeWarningLimit: 1000,
    
    // Enable gzip compression
    reportCompressedSize: true,
    
    // Source map for debugging
    sourcemap: false
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query'
    ],
    exclude: [
      'three',
      'leaflet',
      'react-leaflet'
    ]
  }
})