import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/TCCC-system/',
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/@react-google-maps/api')) return 'google-maps';
          if (id.includes('node_modules/@tensorflow/tfjs')) return 'tfjs';
          if (id.includes('node_modules')) return 'vendor';
          return undefined;
        },
      },
    },
  },
})
