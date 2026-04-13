import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    
    // Hot Module Replacement routing through Nginx
    hmr: {
      clientPort: 80,
    },
    
    // Docker File Watcher
    watch: {
      usePolling: true,
    },
     
    // Nginx is gateway and already routes /api/ to the backend container.
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})